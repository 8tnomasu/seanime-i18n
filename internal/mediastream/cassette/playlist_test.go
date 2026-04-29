package cassette

import (
	"strings"
	"testing"

	"seanime/internal/mediastream/videofile"

	"github.com/stretchr/testify/require"
)

func TestGenerateMasterPlaylistIncludesPlaybackAndToken(t *testing.T) {
	codec := "avc1.640028"
	lang := "jpn"
	info := &videofile.MediaInfo{
		Video: &videofile.Video{
			Width:     1920,
			Height:    1080,
			Bitrate:   4_000_000,
			MimeCodec: &codec,
		},
		Audios: []videofile.Audio{{
			Index:    1,
			Language: &lang,
			Channels: 2,
		}},
	}

	playlist := GenerateMasterPlaylist(info, []QualityLadderEntry{{
		Quality:             Original,
		Width:               1920,
		Height:              1080,
		OriginalCanTransmux: true,
	}}, "hash-123", "token-456")

	require.Contains(t, playlist, "./original/index.m3u8?playback=hash-123&token=token-456")
	require.Contains(t, playlist, "./audio/1/index.m3u8?playback=hash-123&token=token-456")
}

func TestGenerateVariantPlaylistIncludesPlaybackAndToken(t *testing.T) {
	ki := &KeyframeIndex{
		Keyframes: []float64{0, 4, 8},
		IsDone:    true,
	}

	playlist := GenerateVariantPlaylist(ki, 12, "hash-123", "token-456")

	require.Contains(t, playlist, "segment-0.ts?playback=hash-123&token=token-456")
	require.Contains(t, playlist, "segment-1.ts?playback=hash-123&token=token-456")
	require.True(t, strings.HasSuffix(playlist, "#EXT-X-ENDLIST"))
}
