package handlers

func (h *Handler) getContinueWatchingEpisodeNumbers() map[int]int {
	if h == nil || h.App == nil || h.App.ContinuityManager == nil {
		return nil
	}

	history := h.App.ContinuityManager.GetWatchHistory()
	if len(history) == 0 {
		return nil
	}

	ret := make(map[int]int, len(history))
	for mediaId, item := range history {
		if item == nil {
			continue
		}
		ret[mediaId] = item.EpisodeNumber
	}

	if len(ret) == 0 {
		return nil
	}

	return ret
}
