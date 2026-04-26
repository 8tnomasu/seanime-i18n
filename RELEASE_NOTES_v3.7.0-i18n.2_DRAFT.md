# Seanime i18n v3.7.0-i18n.2

This patch release focuses on Docker publishing reliability, remaining i18n cleanup, and mediastream transcoding stability.

## Highlights

- Fixed Docker release asset naming alignment between the release workflow and Docker publish workflow.
- Updated Docker documentation and removed stale v3.6.1 examples.
- Added remaining Traditional Chinese UI translations for visible English strings.
- Verified cross-platform path handling fixes.
- Fixed mediastream transcoding shutdown behavior when switching episodes inside the player.
- Fixed stale playback terminate events incorrectly shutting down the current transcoder.
- Fixed mediastream handlers to use the actual client id / playback id instead of a hardcoded client id.
- Docker image now includes FFmpeg / FFprobe for browser transcoding playback.

## Transcoding playback fix

This release fixes an issue where switching to the next episode inside the player could terminate the newly-created transcoder session.

The root cause was that stale terminate events from the previous episode could reach the backend after a new episode playback had already started. The backend now checks playback identity before shutting down a transcoder, so stale terminate events are ignored.

## Docker

The Docker image includes FFmpeg and FFprobe. Users deploying the official GHCR image do not need to install FFmpeg on the host for browser transcoding playback.

Recommended image:

```yaml
image: ghcr.io/8tnomasu/seanime-i18n:v3.7.0-i18n.2
```

Upgrade example:

```bash
cd /opt/seanime
docker compose pull
docker compose up -d
docker logs -f seanime
```

## Notes

- This is an unofficial i18n fork release.
- Upstream project: 5rahim/seanime
- i18n fork: 8tnomasu/seanime-i18n
