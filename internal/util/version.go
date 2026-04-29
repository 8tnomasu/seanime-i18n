package util

import (
	"fmt"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"github.com/Masterminds/semver/v3"
)

// IsValidBasicSemver
// e.g. "1.2.3" but not "1.2.3-beta" or "1.2"
func IsValidBasicSemver(version string) bool {
	parts := strings.Split(version, ".")
	if len(parts) != 3 {
		return false
	}

	for _, part := range parts {
		if _, err := strconv.Atoi(part); err != nil {
			return false
		}
	}

	return true
}

var forkReleaseVersionPattern = regexp.MustCompile(`^v?(\d+)\.(\d+)\.(\d+)(?:-i18n\.(\d+))?$`)

type forkReleaseVersion struct {
	major int
	minor int
	patch int
	i18n  int
}

func parseForkReleaseVersion(version string) (forkReleaseVersion, bool) {
	matches := forkReleaseVersionPattern.FindStringSubmatch(strings.TrimSpace(version))
	if matches == nil {
		return forkReleaseVersion{}, false
	}

	major, err := strconv.Atoi(matches[1])
	if err != nil {
		return forkReleaseVersion{}, false
	}
	minor, err := strconv.Atoi(matches[2])
	if err != nil {
		return forkReleaseVersion{}, false
	}
	patch, err := strconv.Atoi(matches[3])
	if err != nil {
		return forkReleaseVersion{}, false
	}

	i18n := 0
	if matches[4] != "" {
		i18n, err = strconv.Atoi(matches[4])
		if err != nil {
			return forkReleaseVersion{}, false
		}
	}

	return forkReleaseVersion{
		major: major,
		minor: minor,
		patch: patch,
		i18n:  i18n,
	}, true
}

func compareForkReleaseVersions(current string, other string) (comp int, shouldUpdate bool, ok bool) {
	currV, ok := parseForkReleaseVersion(current)
	if !ok {
		return 0, false, false
	}

	otherV, ok := parseForkReleaseVersion(other)
	if !ok {
		return 0, false, false
	}

	switch {
	case currV.major != otherV.major:
		if currV.major < otherV.major {
			return -3, true, true
		}
		return 3, false, true
	case currV.minor != otherV.minor:
		if currV.minor < otherV.minor {
			return -2, true, true
		}
		return 2, false, true
	case currV.patch != otherV.patch:
		if currV.patch < otherV.patch {
			return -1, true, true
		}
		return 1, false, true
	case currV.i18n != otherV.i18n:
		if currV.i18n < otherV.i18n {
			return -1, true, true
		}
		return 1, false, true
	default:
		return 0, false, true
	}
}

// CompareVersion compares two versions and returns the difference between them.
//
//	 3: Current version is newer by major version.
//	 2: Current version is newer by minor version.
//	 1: Current version is newer by patch version.
//		-3: Current version is older by major version.
//		-2: Current version is older by minor version.
//		-1: Current version is older by patch version.
func CompareVersion(current string, b string) (comp int, shouldUpdate bool) {
	if comp, shouldUpdate, ok := compareForkReleaseVersions(current, b); ok {
		return comp, shouldUpdate
	}

	currV, err := semver.NewVersion(current)
	if err != nil {
		return 0, false
	}
	otherV, err := semver.NewVersion(b)
	if err != nil {
		return 0, false
	}

	comp = currV.Compare(otherV)
	if comp == 0 {
		return 0, false
	}

	if currV.GreaterThan(otherV) {
		shouldUpdate = false

		if currV.Major() > otherV.Major() {
			comp *= 3
		} else if currV.Minor() > otherV.Minor() {
			comp *= 2
		} else if currV.Patch() > otherV.Patch() {
			comp *= 1
		}
	} else if currV.LessThan(otherV) {
		shouldUpdate = true

		if currV.Major() < otherV.Major() {
			comp *= 3
		} else if currV.Minor() < otherV.Minor() {
			comp *= 2
		} else if currV.Patch() < otherV.Patch() {
			comp *= 1
		}
	}

	return comp, shouldUpdate
}

func VersionIsOlderThan(version string, compare string) bool {
	comp, shouldUpdate := CompareVersion(version, compare)
	// shouldUpdate is false means the current version is newer
	return comp < 0 && shouldUpdate
}

var allowedGitHubOwners = []string{"8tnomasu"}

// validateReleaseUrl checks that the URL points to a GitHub release asset
// from an allowed owner.
func ValidateReleaseUrl(rawURL string) error {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return fmt.Errorf("malformed URL")
	}

	if parsed.Scheme != "https" {
		return fmt.Errorf("only HTTPS URLs are allowed")
	}

	switch parsed.Host {
	case "github.com":
		// e.g. https://github.com/8tnomasu/seanime-i18n/releases/download/v3.7.0-i18n.3/file.zip
		parts := strings.Split(strings.TrimPrefix(parsed.Path, "/"), "/")
		if len(parts) < 6 || parts[2] != "releases" || parts[3] != "download" {
			return fmt.Errorf("URL must point to a GitHub release asset")
		}
		owner := parts[0]
		for _, allowed := range allowedGitHubOwners {
			if strings.EqualFold(owner, allowed) {
				return nil
			}
		}
		return fmt.Errorf("repository owner %q is not allowed", owner)

	default:
		return fmt.Errorf("host %q is not allowed", parsed.Host)
	}
}
