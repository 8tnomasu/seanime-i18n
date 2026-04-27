## Summary

This PR fixes the release automation flow for seanime-i18n.

## Changes

- Fix invalid `softprops/action-gh-release` input usage.
- Ensure release title is correctly set to the fork release title.
- Prevent Docker publish from racing against draft releases.
- Preserve i18n version suffixes in release asset names.
- Document the recommended release flow.
- Clarify release notes handling for future i18n releases.

## Why

The v3.7.0-i18n.2 release succeeded, but it required manual intervention:

- The release was created as draft first.
- Docker publish started before release assets were publicly downloadable.
- Docker publish had to be rerun after publishing the release.
- The release title and release notes had to be manually corrected.

This PR makes the next release flow more predictable.

## Validation

- `git diff --check`
- Workflow YAML reviewed
- YAML parse check if PyYAML is available

## Not included

This PR does not:

- create a tag
- create a GitHub Release
- upload release assets
- publish Docker images
