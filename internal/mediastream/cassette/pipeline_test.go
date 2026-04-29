package cassette

import "testing"

import "github.com/stretchr/testify/assert"

func TestShouldSpawnHeadForSegmentRequest(t *testing.T) {
	assert.True(t, shouldSpawnHeadForSegmentRequest(true, 1, true), "seek should force a fresh head")
	assert.True(t, shouldSpawnHeadForSegmentRequest(false, 45, true), "large gap should spawn a head")
	assert.True(t, shouldSpawnHeadForSegmentRequest(false, 5, false), "unscheduled segment should spawn a head")
	assert.False(t, shouldSpawnHeadForSegmentRequest(false, 5, true), "nearby scheduled head should be reused")
}
