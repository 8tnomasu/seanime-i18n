## Summary

This PR fixes the release automation flow for seanime-i18n.

## Changes

- Fix invalid `softprops/action-gh-release` input usage.
- Ensure release title is correctly set to the fork release title.
- Prevent Docker publish from racing against draft releases.
- Fix Continue Watching episode selection to use the actual latest local playback record instead of episode number or AniList progress.
- Document the current watched / completed episode threshold behavior.
- Fix ffprobe child process reaping to avoid zombie / defunct processes after metadata probing.
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

During homelab testing, Continue Watching could keep showing an older playback record even though a later playback action had a valid saved resume position. This PR aligns the home Continue Watching selection with the latest meaningful local playback record.

During ffprobe metadata probing, completed ffprobe processes could remain as defunct children if the parent process did not consistently reap them. This PR ensures ffprobe invocations are waited on correctly.

## Validation

- `git diff --check`
- Continue Watching selection logic reviewed
- Watched / completed episode threshold behavior reviewed
- ffprobe process lifecycle reviewed
- ffprobe zombie smoke test instructions documented
- Workflow YAML reviewed
- YAML parse check if PyYAML is available

## Not included

This PR does not:

- create a tag
- create a GitHub Release
- upload release assets
- publish Docker images
