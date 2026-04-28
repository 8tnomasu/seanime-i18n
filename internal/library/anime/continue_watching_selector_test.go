package anime

import "testing"

func TestSelectContinueWatchingEpisode(t *testing.T) {
	entry := &Entry{
		MediaId: 154587,
		EntryListData: &EntryListData{
			Progress: 3,
		},
		Episodes: []*Episode{
			newContinueWatchingMainEpisode(1),
			newContinueWatchingMainEpisode(2),
			newContinueWatchingMainEpisode(3),
			newContinueWatchingMainEpisode(4),
			newContinueWatchingMainEpisode(5),
		},
	}

	t.Run("prefers local resume episode over AniList next episode", func(t *testing.T) {
		episode, ok := selectContinueWatchingEpisode(entry, map[int]int{
			154587: 4,
		})
		if !ok || episode == nil {
			t.Fatalf("expected episode to be selected")
		}
		if episode.EpisodeNumber != 4 {
			t.Fatalf("expected episode 4, got %d", episode.EpisodeNumber)
		}
	})

	t.Run("can point back to an older episode when that was watched last", func(t *testing.T) {
		episode, ok := selectContinueWatchingEpisode(entry, map[int]int{
			154587: 3,
		})
		if !ok || episode == nil {
			t.Fatalf("expected episode to be selected")
		}
		if episode.EpisodeNumber != 3 {
			t.Fatalf("expected episode 3, got %d", episode.EpisodeNumber)
		}
	})

	t.Run("falls back to AniList next episode when no local resume exists", func(t *testing.T) {
		episode, ok := selectContinueWatchingEpisode(entry, nil)
		if !ok || episode == nil {
			t.Fatalf("expected episode to be selected")
		}
		if episode.EpisodeNumber != 4 {
			t.Fatalf("expected episode 4, got %d", episode.EpisodeNumber)
		}
	})
}

func newContinueWatchingMainEpisode(episodeNumber int) *Episode {
	return &Episode{
		EpisodeNumber:  episodeNumber,
		ProgressNumber: episodeNumber,
		LocalFile: &LocalFile{
			Metadata: &LocalFileMetadata{
				Episode: episodeNumber,
				Type:    LocalFileTypeMain,
			},
		},
	}
}
