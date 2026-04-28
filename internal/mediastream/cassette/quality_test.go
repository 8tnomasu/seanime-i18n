package cassette

import (
	"testing"

	"seanime/internal/mediastream/videofile"

	"github.com/stretchr/testify/assert"
)

func TestDecideAudioTranscodeAlwaysNormalizesForHLS(t *testing.T) {
	decision := DecideAudioTranscode(&videofile.Audio{
		Codec:    "aac",
		Channels: 2,
	})

	assert.False(t, decision.Copy)
	assert.Equal(t, "aac", decision.Codec)
	assert.Equal(t, "128k", decision.Bitrate)
	assert.Equal(t, "2", decision.Channels)
}
