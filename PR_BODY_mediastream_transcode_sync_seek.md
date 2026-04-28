## Summary

This PR stabilizes mediastream transcoding playback.

## Changes

- Investigate and fix transcoded playback audio/video desync around mid-playback.
- Improve long-distance seek behavior during browser transcoding playback.
- Preserve existing Continue Watching behavior based on the latest local playback record.
- Preserve ffprobe child process reaping fixes.
- Keep release workflow automation improvements.
- Isolate transcode HLS asset requests with playback-specific query parameters and no-store responses.

## Why

During homelab playback testing, transcoded playback could become audio/video desynchronized around mid-episode. Long-distance seeks could also remain loading for a long time or get stuck.

The original media files play correctly outside Seanime, so the issue is likely in the mediastream / FFmpeg / HLS transcoding path rather than the files themselves.

## Validation

- `go test ./internal/mediastream ./internal/handlers`
- `go test ./internal/mediastream/...`
- `go test ./internal/continuity`
- `go test ./internal/library/anime -run TestSelectContinueWatchingEpisode -v`
- `go test ./internal/discordrpc/client`
- `go test ./internal/videocore`
- `go test ./internal/plugin`
- `go test ./internal/util`
- `go test ./internal/testutil`
- `go test ./internal/notifier`
- `go test ./internal/platforms/simulated_platform`
- `go test ./internal/customsource`
- `go test ./internal/playlist`
- `go test ./internal/torrentstream`
- `cd seanime-web && npm run build`
- `cd seanime-web && npx tsc --noEmit`
- `git diff --check`
- Manual homelab validation required before release

## Not included

This PR does not:

- create a tag
- create a GitHub Release
- publish Docker images
