package updater

import (
	"seanime/internal/constants"
	"seanime/internal/events"
	"seanime/internal/util"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUpdater_getReleaseName(t *testing.T) {

	updater := Updater{}

	t.Log(updater.GetReleaseName(constants.ReleaseVersion))
}

func TestUpdater_FetchLatestRelease(t *testing.T) {
	fixture := newUpdaterTestFixture(t)

	updater := fixture.newUpdater(constants.ReleaseVersion, events.NewMockWSEventManager(util.NewLogger()))
	release, err := updater.fetchLatestRelease("github")
	require.NoError(t, err)
	require.NotNil(t, release)
	assert.Equal(t, fixture.release.TagName, release.TagName)
	assert.Len(t, release.Assets, len(fixture.release.Assets))
}

func TestUpdater_FetchLatestReleaseFromLegacyChannelAlias(t *testing.T) {
	fixture := newUpdaterTestFixture(t)

	updater := fixture.newUpdater(constants.ReleaseVersion, events.NewMockWSEventManager(util.NewLogger()))
	release, err := updater.fetchLatestRelease("seanime_nightly")
	require.NoError(t, err)
	require.NotNil(t, release)
	assert.Equal(t, fixture.release.TagName, release.TagName)
	assert.Len(t, release.Assets, len(fixture.release.Assets))
}

func TestUpdater_FetchLatestReleaseFromGitHub(t *testing.T) {
	fixture := newUpdaterTestFixture(t)

	updater := fixture.newUpdater(constants.ReleaseVersion, events.NewMockWSEventManager(util.NewLogger()))
	release, err := updater.fetchLatestReleaseFromGitHub()
	require.NoError(t, err)
	require.NotNil(t, release)
	assert.Equal(t, fixture.release.TagName, release.TagName)
	assert.Len(t, release.Assets, len(fixture.release.Assets))
}

func TestUpdater_CompareVersion(t *testing.T) {

	tests := []struct {
		currVersion   string
		latestVersion string
		shouldUpdate  bool
	}{
		{
			currVersion:   "0.2.2",
			latestVersion: "0.2.2",
			shouldUpdate:  false,
		},
		{
			currVersion:   "2.2.0-prerelease",
			latestVersion: "2.2.0",
			shouldUpdate:  true,
		},
		{
			currVersion:   "2.2.0",
			latestVersion: "2.2.0-prerelease",
			shouldUpdate:  false,
		},
		{
			currVersion:   "0.2.2",
			latestVersion: "0.2.3",
			shouldUpdate:  true,
		},
		{
			currVersion:   "0.2.2",
			latestVersion: "0.3.0",
			shouldUpdate:  true,
		},
		{
			currVersion:   "0.2.2",
			latestVersion: "1.0.0",
			shouldUpdate:  true,
		},
		{
			currVersion:   "0.2.2",
			latestVersion: "0.2.1",
			shouldUpdate:  false,
		},
		{
			currVersion:   "1.0.0",
			latestVersion: "0.2.1",
			shouldUpdate:  false,
		},
		{
			currVersion:   "3.7.0-i18n.2",
			latestVersion: "3.7.0-i18n.3",
			shouldUpdate:  true,
		},
		{
			currVersion:   "3.7.0-i18n.3",
			latestVersion: "3.7.0-i18n.2",
			shouldUpdate:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.latestVersion, func(t *testing.T) {
			updateType, shouldUpdate := util.CompareVersion(tt.currVersion, tt.latestVersion)
			assert.Equal(t, tt.shouldUpdate, shouldUpdate)
			t.Log(tt.latestVersion, updateType)
		})
	}

}

func TestUpdater(t *testing.T) {
	fixture := newUpdaterTestFixture(t)

	u := fixture.newUpdater("3.7.0-i18n.2", events.NewMockWSEventManager(util.NewLogger()))

	rl, err := u.GetLatestRelease("github")
	require.NoError(t, err)
	require.NotNil(t, rl)
	assert.Equal(t, fixture.release.TagName, rl.TagName)

	newV := strings.TrimPrefix(rl.TagName, "v")
	updateTypeI, shouldUpdate := util.CompareVersion(u.CurrentVersion, newV)
	isOlder := util.VersionIsOlderThan(u.CurrentVersion, newV)

	assert.True(t, isOlder)
	assert.True(t, shouldUpdate)
	assert.Equal(t, -1, updateTypeI)
}

func TestNormalizeUpdateChannel(t *testing.T) {
	assert.Equal(t, UpdateChannelGitHub, NormalizeUpdateChannel(""))
	assert.Equal(t, UpdateChannelGitHub, NormalizeUpdateChannel("github"))
	assert.Equal(t, UpdateChannelGitHub, NormalizeUpdateChannel("seanime"))
	assert.Equal(t, UpdateChannelGitHub, NormalizeUpdateChannel("seanime_nightly"))
	assert.Equal(t, UpdateChannelGitHub, NormalizeUpdateChannel("custom"))
}

func TestUpdater_FetchLatestReleaseFromGitHubRejectsInsecureURL(t *testing.T) {
	oldFallbackGithubURL := fallbackGithubUrl
	fallbackGithubUrl = "http://example.com/releases/latest"
	t.Cleanup(func() {
		fallbackGithubUrl = oldFallbackGithubURL
	})

	updater := New(constants.ReleaseVersion, util.NewLogger(), events.NewMockWSEventManager(util.NewLogger()))
	_, err := updater.fetchLatestReleaseFromGitHub()
	require.ErrorIs(t, err, ErrInsecureUpdateURL)
}
