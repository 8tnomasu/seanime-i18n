## Summary

This PR prepares the v3.7.0-i18n.2 patch release.

## Changes

- Fix release asset naming alignment between the release workflow and Docker publish workflow.
- Update Docker documentation and remove stale v3.6.1 examples.
- Add remaining Traditional Chinese translations for visible UI strings.
- Review production path normalization fixes.
- Verify mediastream transcoding fixes when switching episodes inside the player.
- Ensure Docker image includes FFmpeg / FFprobe for browser transcoding playback.

## Mediastream transcoding fix

This PR verifies and documents the fix for an issue where switching episodes inside the player could cause stale terminate events from the previous episode to shut down the newly-created transcoder.

The backend now uses actual client id / playback id and ignores stale playback terminate events that do not match the current playback.

## Docker

The Docker image now includes FFmpeg / FFprobe in the runtime image, ensuring browser transcoding playback works without requiring host-level FFmpeg installation.

## Validation

Frontend:

- `cd seanime-web && npm run build`
- `cd seanime-web && npx tsc --noEmit`

Go tests:

- `go test ./internal/mediastream ./internal/handlers`
- `go test ./internal/discordrpc/client`
- `go test ./internal/videocore`
- `go test ./internal/plugin`
- `go test ./internal/util`
- `go test ./internal/testutil`
- `go test ./internal/notifier`
- `go test ./internal/platforms/simulated_platform`
- `go test ./internal/continuity`
- `go test ./internal/customsource`
- `go test ./internal/playlist`
- `go test ./internal/torrentstream`
- `go test ./internal/library/anime -run "TestLocalFile_GetTitleVariations|TestLocalFile_GetTitleVariations_Includes|TestLocalFile_GetParsedTitle|TestLocalFile_GetFolderTitle|TestNewLocalFile" -v`

i18n:

- en-US / zh-TW key parity checked
- JSON parse checked

Docker:

- Dockerfile verified to install FFmpeg / FFprobe in the runtime image
- Local Docker smoke test was not run because Docker is not available in this environment

## Not included

This PR does not:

- create `v3.7.0-i18n.2`
- create a GitHub Release
- upload release assets
- publish Docker images
