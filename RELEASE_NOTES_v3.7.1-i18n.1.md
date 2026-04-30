# Seanime i18n v3.7.1-i18n.1

This release updates the fork to upstream Seanime `v3.7.1` while preserving the long-term fork behavior maintained in `8tnomasu/seanime-i18n`.

## Upstream base

- Based on upstream Seanime `v3.7.1`
- Upstream release: [5rahim/seanime v3.7.1](https://github.com/5rahim/seanime/releases/tag/v3.7.1)

## Fork behavior preserved

- Traditional Chinese / i18n support remains included in the fork
- Web UI and updater release checks remain pointed at `8tnomasu/seanime-i18n`
- Docker / GHCR publishing workflow remains fork-owned
- FFmpeg / FFprobe runtime support remains included for the official Docker image
- Mediastream / transcoding / playback continuity fork fixes remain preserved
- Denshi updater feed remains pointed at the fork release channel
- Fork version comparison logic for tags such as `v3.7.1-i18n.1` remains preserved

## Upstream v3.7.1 highlights

- Cache mode can now update entries and sync progress later when AniList is back online
- VideoCore can now save screenshots to disk
- Plugin APIs were expanded, including `$shared`, `ctx.jobs`, `ctx.settings`, `ctx.cache`, and client-side `$debug` logs
- Cache layer request handling was fixed for queries that could bypass cache mode
- Home fixed `not authenticated` errors for local accounts
- Torrentstream fixed the `Disable IPV6` setting and HEAD request handling
- MPV launch handling was fixed for `--terminal=no --really-quiet`
- Auto-select and Settings forms fixed empty field rendering after save
- Additional UI and plugin stability fixes were included upstream

## Fork-specific notes for this release

- New upstream screenshot-save behavior was aligned with the fork i18n layer
- New upstream plugin debug log UI strings were localized for `en-US` and `zh-TW`
- Docker deployment examples were updated to the fixed image tag `ghcr.io/8tnomasu/seanime-i18n:v3.7.1-i18n.1`

## Deployment note

For production or homelab deployment, prefer the fixed tag below instead of `latest`:

```yaml
image: ghcr.io/8tnomasu/seanime-i18n:v3.7.1-i18n.1
```
