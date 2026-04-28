package continuity

import (
	"fmt"
	"seanime/internal/database/db_bridge"
	"seanime/internal/hook"
	"seanime/internal/library/anime"
	"seanime/internal/util"
	"seanime/internal/util/filecache"
	"strconv"
	"strings"
	"time"
)

const (
	MaxWatchHistoryItems   = 100
	IgnoreRatioThreshold   = 0.9
	WatchHistoryBucketName = "watch_history"
)

type (
	// WatchHistory is a map of WatchHistoryItem.
	// The key is the WatchHistoryItem.MediaId and the value is the latest local playback record for that media.
	WatchHistory map[int]*WatchHistoryItem

	// WatchHistoryItem are stored in the file cache.
	// The history is used to resume playback from the last known position.
	// Item.MediaId and Item.EpisodeNumber are used to identify the media and episode.
	// Multiple episodes can exist for the same MediaId.
	WatchHistoryItem struct {
		Kind Kind `json:"kind"`
		// Used for MediastreamKind and ExternalPlayerKind.
		Filepath      string `json:"filepath"`
		MediaId       int    `json:"mediaId"`
		EpisodeNumber int    `json:"episodeNumber"`
		// The current playback time in seconds.
		// Used to determine when to remove the item from the history.
		CurrentTime float64 `json:"currentTime"`
		// The duration of the media in seconds.
		Duration float64 `json:"duration"`
		// Timestamp of when the item was added to the history.
		TimeAdded time.Time `json:"timeAdded"`
		// TimeAdded is used in conjunction with TimeUpdated
		// Timestamp of when the item was last updated.
		// Used to determine when to remove the item from the history (First in, first out).
		TimeUpdated time.Time `json:"timeUpdated"`
	}

	WatchHistoryItemResponse struct {
		Item  *WatchHistoryItem `json:"item"`
		Found bool              `json:"found"`
	}

	UpdateWatchHistoryItemOptions struct {
		CurrentTime   float64 `json:"currentTime"`
		Duration      float64 `json:"duration"`
		MediaId       int     `json:"mediaId"`
		EpisodeNumber int     `json:"episodeNumber"`
		Filepath      string  `json:"filepath,omitempty"`
		Kind          Kind    `json:"kind"`
	}

	storedWatchHistoryItem struct {
		key  string
		item *WatchHistoryItem
	}
)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (m *Manager) GetWatchHistory() WatchHistory {
	defer util.HandlePanicInModuleThen("continuity/GetWatchHistory", func() {})

	m.mu.RLock()
	defer m.mu.RUnlock()

	items, err := filecache.GetAll[*WatchHistoryItem](m.fileCacher, *m.watchHistoryFileCacheBucket)
	if err != nil {
		m.logger.Error().Err(err).Msg("continuity: Failed to get watch history")
		return nil
	}

	ret := make(WatchHistory)
	latestByMedia := make(map[int]storedWatchHistoryItem)
	for key, item := range items {
		if item == nil || item.MediaId == 0 {
			continue
		}

		latest, found := latestByMedia[item.MediaId]
		if !found || getWatchHistoryTimestamp(item).After(getWatchHistoryTimestamp(latest.item)) {
			latestByMedia[item.MediaId] = storedWatchHistoryItem{key: key, item: item}
		}
	}

	for mediaId, stored := range latestByMedia {
		if item, ok := m.getResumableWatchHistoryItem(stored.key, stored.item); ok {
			ret[mediaId] = item
		}
	}

	return ret
}

func (m *Manager) GetWatchHistoryItem(mediaId int, episodeNumbers ...int) *WatchHistoryItemResponse {
	defer util.HandlePanicInModuleThen("continuity/GetWatchHistoryItem", func() {})

	m.mu.RLock()
	defer m.mu.RUnlock()

	var (
		i     *WatchHistoryItem
		found bool
	)
	if len(episodeNumbers) > 0 {
		i, found = m.getWatchHistory(mediaId, episodeNumbers[0])
	} else {
		i, found = m.getWatchHistory(mediaId)
	}
	return &WatchHistoryItemResponse{
		Item:  i,
		Found: found,
	}
}

// UpdateWatchHistoryItem updates the WatchHistoryItem in the file cache.
func (m *Manager) UpdateWatchHistoryItem(opts *UpdateWatchHistoryItemOptions) (err error) {
	defer util.HandlePanicInModuleWithError("continuity/UpdateWatchHistoryItem", &err)

	m.mu.Lock()
	defer m.mu.Unlock()

	if err := m.migrateLegacyWatchHistoryItem(opts.MediaId); err != nil {
		return err
	}

	added := false
	key := watchHistoryStorageKey(opts.MediaId, opts.EpisodeNumber)

	var i *WatchHistoryItem
	found, _ := m.fileCacher.Get(*m.watchHistoryFileCacheBucket, key, &i)
	if !found {
		added = true
		i = &WatchHistoryItem{
			Kind:          opts.Kind,
			Filepath:      opts.Filepath,
			MediaId:       opts.MediaId,
			EpisodeNumber: opts.EpisodeNumber,
			CurrentTime:   opts.CurrentTime,
			Duration:      opts.Duration,
			TimeAdded:     time.Now(),
			TimeUpdated:   time.Now(),
		}
	} else {
		i.Kind = opts.Kind
		i.Filepath = opts.Filepath
		i.EpisodeNumber = opts.EpisodeNumber
		i.CurrentTime = opts.CurrentTime
		i.Duration = opts.Duration
		i.TimeUpdated = time.Now()
	}

	// Save the i
	err = m.fileCacher.Set(*m.watchHistoryFileCacheBucket, key, i)
	if err != nil {
		return fmt.Errorf("continuity: Failed to save watch history item: %w", err)
	}

	_ = hook.GlobalHookManager.OnWatchHistoryItemUpdated().Trigger(&WatchHistoryItemUpdatedEvent{
		WatchHistoryItem: i,
	})

	// If the item was added, check if we need to remove the oldest item
	if added {
		_ = m.trimWatchHistoryItems()
	}

	return nil
}

func (m *Manager) DeleteWatchHistoryItem(mediaId int) (err error) {
	defer util.HandlePanicInModuleWithError("continuity/DeleteWatchHistoryItem", &err)

	m.mu.Lock()
	defer m.mu.Unlock()

	err = m.deleteWatchHistoryItemsForMedia(mediaId)
	if err != nil {
		return fmt.Errorf("continuity: Failed to delete watch history item: %w", err)
	}

	return nil
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// GetExternalPlayerEpisodeWatchHistoryItem is called before launching the external player to get the last known position.
// Unlike GetWatchHistoryItem, this checks if the episode numbers match.
func (m *Manager) GetExternalPlayerEpisodeWatchHistoryItem(path string, isStream bool, episode, mediaId int) (ret *WatchHistoryItemResponse) {
	defer util.HandlePanicInModuleThen("continuity/GetExternalPlayerEpisodeWatchHistoryItem", func() {})

	m.mu.RLock()
	defer m.mu.RUnlock()

	if !m.settings.WatchContinuityEnabled {
		return &WatchHistoryItemResponse{
			Item:  nil,
			Found: false,
		}
	}

	ret = &WatchHistoryItemResponse{
		Item:  nil,
		Found: false,
	}

	m.logger.Debug().
		Str("path", path).
		Bool("isStream", isStream).
		Int("episode", episode).
		Int("mediaId", mediaId).
		Msg("continuity: Retrieving watch history item")

	// Normalize path
	path = util.NormalizePath(path)

	if isStream {

		event := &WatchHistoryStreamEpisodeItemRequestedEvent{
			WatchHistoryItem: &WatchHistoryItem{},
		}

		hook.GlobalHookManager.OnWatchHistoryStreamEpisodeItemRequested().Trigger(event)
		if event.DefaultPrevented {
			return &WatchHistoryItemResponse{
				Item:  event.WatchHistoryItem,
				Found: event.WatchHistoryItem != nil,
			}
		}

		if episode == 0 || mediaId == 0 {
			m.logger.Debug().
				Int("episode", episode).
				Int("mediaId", mediaId).
				Msg("continuity: No episode or media provided")
			return
		}

		i, found := m.getWatchHistory(mediaId, episode)
		if !found {
			m.logger.Trace().
				Interface("item", i).
				Msg("continuity: No watch history item found or episode number does not match")
			return
		}

		m.logger.Debug().
			Interface("item", i).
			Msg("continuity: Watch history item found")

		return &WatchHistoryItemResponse{
			Item:  i,
			Found: found,
		}

	} else {
		// Find the local file from the path
		lfs, _, err := db_bridge.GetLocalFiles(m.db)
		if err != nil {
			return ret
		}

		event := &WatchHistoryLocalFileEpisodeItemRequestedEvent{
			Path:             path,
			LocalFiles:       lfs,
			WatchHistoryItem: &WatchHistoryItem{},
		}
		hook.GlobalHookManager.OnWatchHistoryLocalFileEpisodeItemRequested().Trigger(event)
		if event.DefaultPrevented {
			return &WatchHistoryItemResponse{
				Item:  event.WatchHistoryItem,
				Found: event.WatchHistoryItem != nil,
			}
		}

		var lf *anime.LocalFile
		// Find the local file from the path
		for _, l := range lfs {
			if l.GetNormalizedPath() == path {
				lf = l
				m.logger.Trace().Msg("continuity: Local file found from path")
				break
			}
		}
		// If the local file is not found, the path might be a filename (in the case of VLC)
		if lf == nil {
			for _, l := range lfs {
				if strings.ToLower(l.Name) == path {
					lf = l
					m.logger.Trace().Msg("continuity: Local file found from filename")
					break
				}
			}
		}

		if lf == nil || lf.MediaId == 0 || !lf.IsMain() {
			m.logger.Trace().Msg("continuity: Local file not found or not main")
			return
		}

		i, found := m.getWatchHistory(lf.MediaId, lf.GetEpisodeNumber())
		if !found {
			m.logger.Trace().
				Interface("item", i).
				Msg("continuity: No watch history item found or episode number does not match")
			return
		}

		m.logger.Debug().
			Interface("item", i).
			Msg("continuity: Watch history item found")

		return &WatchHistoryItemResponse{
			Item:  i,
			Found: found,
		}
	}
}

func (m *Manager) UpdateExternalPlayerEpisodeWatchHistoryItem(currentTime, duration float64) {
	defer util.HandlePanicInModuleThen("continuity/UpdateWatchHistoryItem", func() {})

	m.mu.Lock()
	defer m.mu.Unlock()

	if !m.settings.WatchContinuityEnabled {
		return
	}

	if m.externalPlayerEpisodeDetails.IsAbsent() {
		return
	}

	added := false

	opts, ok := m.externalPlayerEpisodeDetails.Get()
	if !ok {
		return
	}

	if err := m.migrateLegacyWatchHistoryItem(opts.MediaId); err != nil {
		m.logger.Error().Err(err).Int("mediaId", opts.MediaId).Msg("continuity: Failed to migrate legacy watch history item")
		return
	}

	key := watchHistoryStorageKey(opts.MediaId, opts.EpisodeNumber)

	var i *WatchHistoryItem
	found, _ := m.fileCacher.Get(*m.watchHistoryFileCacheBucket, key, &i)
	if !found {
		added = true
		i = &WatchHistoryItem{
			Kind:          ExternalPlayerKind,
			Filepath:      opts.Filepath,
			MediaId:       opts.MediaId,
			EpisodeNumber: opts.EpisodeNumber,
			CurrentTime:   currentTime,
			Duration:      duration,
			TimeAdded:     time.Now(),
			TimeUpdated:   time.Now(),
		}
	} else {
		i.Kind = ExternalPlayerKind
		i.Filepath = opts.Filepath
		i.EpisodeNumber = opts.EpisodeNumber
		i.CurrentTime = currentTime
		i.Duration = duration
		i.TimeUpdated = time.Now()
	}

	// Save the i
	_ = m.fileCacher.Set(*m.watchHistoryFileCacheBucket, key, i)

	// If the item was added, check if we need to remove the oldest item
	if added {
		_ = m.trimWatchHistoryItems()
	}

	return
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (m *Manager) getWatchHistory(mediaId int, episodeNumbers ...int) (ret *WatchHistoryItem, exists bool) {
	defer util.HandlePanicInModuleThen("continuity/getWatchHistory", func() {
		ret = nil
		exists = false
	})

	if len(episodeNumbers) > 0 {
		stored, found := m.getExactStoredWatchHistoryItem(mediaId, episodeNumbers[0])
		if !found {
			return nil, false
		}
		return m.getResumableWatchHistoryItem(stored.key, stored.item)
	}

	reqEvent := &WatchHistoryItemRequestedEvent{
		MediaId:          mediaId,
		WatchHistoryItem: ret,
	}
	hook.GlobalHookManager.OnWatchHistoryItemRequested().Trigger(reqEvent)
	ret = reqEvent.WatchHistoryItem

	if reqEvent.DefaultPrevented {
		return reqEvent.WatchHistoryItem, reqEvent.WatchHistoryItem != nil
	}

	stored, found := m.getLatestStoredWatchHistoryItem(mediaId)
	if !found {
		return nil, false
	}

	return m.getResumableWatchHistoryItem(stored.key, stored.item)
}

// removes the oldest WatchHistoryItem from the file cache.
func (m *Manager) trimWatchHistoryItems() error {
	defer util.HandlePanicInModuleThen("continuity/TrimWatchHistoryItems", func() {})

	// Get all the items
	items, err := filecache.GetAll[*WatchHistoryItem](m.fileCacher, *m.watchHistoryFileCacheBucket)
	if err != nil {
		return fmt.Errorf("continuity: Failed to get watch history items: %w", err)
	}

	// If there are too many items, remove the oldest one
	if len(items) > MaxWatchHistoryItems {
		var oldestKey string
		for key := range items {
			if oldestKey == "" || items[key].TimeUpdated.Before(items[oldestKey].TimeUpdated) {
				oldestKey = key
			}
		}
		err = m.fileCacher.Delete(*m.watchHistoryFileCacheBucket, oldestKey)
		if err != nil {
			return fmt.Errorf("continuity: Failed to remove oldest watch history item: %w", err)
		}
	}

	return nil
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func watchHistoryStorageKey(mediaId int, episodeNumber int) string {
	return fmt.Sprintf("%d:%d", mediaId, episodeNumber)
}

func watchHistoryLegacyStorageKey(mediaId int) string {
	return strconv.Itoa(mediaId)
}

func getWatchHistoryTimestamp(item *WatchHistoryItem) time.Time {
	if item == nil {
		return time.Time{}
	}
	if !item.TimeUpdated.IsZero() {
		return item.TimeUpdated
	}
	return item.TimeAdded
}

func isWatchHistoryItemCompleted(item *WatchHistoryItem) bool {
	if item == nil || item.Duration <= 0 {
		return false
	}
	return (item.CurrentTime / item.Duration) >= IgnoreRatioThreshold
}

func (m *Manager) getResumableWatchHistoryItem(_ string, item *WatchHistoryItem) (*WatchHistoryItem, bool) {
	if item == nil {
		return nil, false
	}
	if isWatchHistoryItemCompleted(item) {
		return nil, false
	}
	return item, true
}

func (m *Manager) getStoredWatchHistoryItems(mediaId int) []storedWatchHistoryItem {
	items, err := filecache.GetAll[*WatchHistoryItem](m.fileCacher, *m.watchHistoryFileCacheBucket)
	if err != nil {
		m.logger.Error().Err(err).Int("mediaId", mediaId).Msg("continuity: Failed to get stored watch history items")
		return nil
	}

	ret := make([]storedWatchHistoryItem, 0)
	for key, item := range items {
		if item == nil {
			continue
		}
		if mediaId != 0 && item.MediaId != mediaId {
			continue
		}
		ret = append(ret, storedWatchHistoryItem{
			key:  key,
			item: item,
		})
	}

	return ret
}

func (m *Manager) getLatestStoredWatchHistoryItem(mediaId int) (*storedWatchHistoryItem, bool) {
	items := m.getStoredWatchHistoryItems(mediaId)
	if len(items) == 0 {
		return nil, false
	}

	latest := items[0]
	for _, item := range items[1:] {
		if getWatchHistoryTimestamp(item.item).After(getWatchHistoryTimestamp(latest.item)) {
			latest = item
		}
	}

	return &latest, true
}

func (m *Manager) getExactStoredWatchHistoryItem(mediaId int, episodeNumber int) (*storedWatchHistoryItem, bool) {
	items := m.getStoredWatchHistoryItems(mediaId)
	if len(items) == 0 {
		return nil, false
	}

	var (
		latest storedWatchHistoryItem
		found  bool
	)
	for _, item := range items {
		if item.item.EpisodeNumber != episodeNumber {
			continue
		}
		if !found || getWatchHistoryTimestamp(item.item).After(getWatchHistoryTimestamp(latest.item)) {
			latest = item
			found = true
		}
	}

	if !found {
		return nil, false
	}

	return &latest, true
}

func (m *Manager) deleteWatchHistoryItemsForMedia(mediaId int) error {
	items := m.getStoredWatchHistoryItems(mediaId)
	for _, item := range items {
		if err := m.fileCacher.Delete(*m.watchHistoryFileCacheBucket, item.key); err != nil {
			return err
		}
	}
	return nil
}

func (m *Manager) migrateLegacyWatchHistoryItem(mediaId int) error {
	legacyKey := watchHistoryLegacyStorageKey(mediaId)
	var legacyItem *WatchHistoryItem
	found, err := m.fileCacher.Get(*m.watchHistoryFileCacheBucket, legacyKey, &legacyItem)
	if err != nil {
		return fmt.Errorf("continuity: Failed to read legacy watch history item: %w", err)
	}
	if !found || legacyItem == nil {
		return nil
	}

	newKey := watchHistoryStorageKey(mediaId, legacyItem.EpisodeNumber)
	if newKey != legacyKey {
		var existing *WatchHistoryItem
		exists, err := m.fileCacher.Get(*m.watchHistoryFileCacheBucket, newKey, &existing)
		if err != nil {
			return fmt.Errorf("continuity: Failed to read migrated watch history item: %w", err)
		}
		if !exists {
			if err := m.fileCacher.Set(*m.watchHistoryFileCacheBucket, newKey, legacyItem); err != nil {
				return fmt.Errorf("continuity: Failed to migrate legacy watch history item: %w", err)
			}
		}
	}

	if err := m.fileCacher.Delete(*m.watchHistoryFileCacheBucket, legacyKey); err != nil {
		return fmt.Errorf("continuity: Failed to remove legacy watch history item: %w", err)
	}

	return nil
}
