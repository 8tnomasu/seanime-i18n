package mediastream

import (
	"io"
	"path/filepath"
	"seanime/internal/database/models"
	"seanime/internal/events"
	"seanime/internal/mediastream/cassette"
	"testing"

	"github.com/rs/zerolog"
	"github.com/samber/mo"
	"github.com/stretchr/testify/require"
)

func newShutdownTestRepository(t *testing.T) (*Repository, *cassette.Cassette) {
	t.Helper()

	logger := zerolog.New(io.Discard)
	repo := NewRepository(&NewRepositoryOptions{
		Logger:         &logger,
		WSEventManager: events.NewMockWSEventManager(&logger),
	})

	repo.settings = mo.Some(&models.MediastreamSettings{
		TranscodeEnabled: true,
		TranscodePreset:  "fast",
		FfmpegPath:       "ffmpeg",
		FfprobePath:      "ffprobe",
	})
	repo.transcodeDir = t.TempDir()

	transcoder, err := cassette.New(&cassette.NewCassetteOptions{
		Logger:      &logger,
		TempOutDir:  repo.transcodeDir,
		FfmpegPath:  "ffmpeg",
		FfprobePath: "ffprobe",
		Preset:      "fast",
	})
	require.NoError(t, err)

	repo.transcoder = mo.Some(transcoder)

	return repo, transcoder
}

func TestShutdownTranscodeStreamIgnoresStalePlaybackID(t *testing.T) {
	repo, transcoder := newShutdownTestRepository(t)
	currentPlaybackID := filepath.Join(t.TempDir(), "episode-2.mkv")
	repo.playbackManager.currentMediaContainer = mo.Some(&MediaContainer{
		Filepath:   currentPlaybackID,
		StreamType: StreamTypeTranscode,
	})

	repo.ShutdownTranscodeStream("client-1", filepath.Join(t.TempDir(), "episode-1.mkv"))

	currentMediaContainer, ok := repo.playbackManager.currentMediaContainer.Get()
	require.True(t, ok)
	require.Equal(t, currentPlaybackID, currentMediaContainer.Filepath)

	currentTranscoder, ok := repo.transcoder.Get()
	require.True(t, ok)
	require.Same(t, transcoder, currentTranscoder)
}

func TestShutdownTranscodeStreamStopsMatchingPlaybackID(t *testing.T) {
	repo, transcoder := newShutdownTestRepository(t)
	currentPlaybackID := filepath.Join(t.TempDir(), "episode-2.mkv")
	repo.playbackManager.currentMediaContainer = mo.Some(&MediaContainer{
		Filepath:   currentPlaybackID,
		StreamType: StreamTypeTranscode,
	})

	repo.ShutdownTranscodeStream("client-1", currentPlaybackID)

	require.True(t, repo.playbackManager.currentMediaContainer.IsAbsent())

	currentTranscoder, ok := repo.transcoder.Get()
	require.True(t, ok)
	require.NotSame(t, transcoder, currentTranscoder)
}

func TestShutdownTranscodeStreamStopsCurrentPlaybackWhenPlaybackIDMissing(t *testing.T) {
	repo, transcoder := newShutdownTestRepository(t)
	currentPlaybackID := filepath.Join(t.TempDir(), "episode-2.mkv")
	repo.playbackManager.currentMediaContainer = mo.Some(&MediaContainer{
		Filepath:   currentPlaybackID,
		StreamType: StreamTypeTranscode,
	})

	repo.ShutdownTranscodeStream("client-1", "")

	require.True(t, repo.playbackManager.currentMediaContainer.IsAbsent())

	currentTranscoder, ok := repo.transcoder.Get()
	require.True(t, ok)
	require.NotSame(t, transcoder, currentTranscoder)
}
