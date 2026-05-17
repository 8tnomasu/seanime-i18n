# Seanime i18n v3.8.2-i18n.1

This draft release prepares the fork update to upstream Seanime `v3.8.2` while preserving the long-term fork behavior maintained in `8tnomasu/seanime-i18n`.

## Upstream base

- Based on upstream Seanime `v3.8.2`
- Upstream release: [5rahim/seanime v3.8.2](https://github.com/5rahim/seanime/releases/tag/v3.8.2)

## Upstream v3.8.x highlights

- Torrent Search can aggregate results from multiple providers
- Subtitle Translator adds OpenAI-compatible local LLM support
- UI route preloading and faster transitions improve page navigation
- Denshi remembers window size and position
- VideoCore auto-imports local subtitle files
- External Player Link adds the `{subtitleUrl}` placeholder
- Hide spoilers UI and command support were added
- Online streaming adds an HTTP/1-based proxy and automatic provider cycling
- Extension disable support, secure mode, and plugin API changes were added
- qBittorrent 5.2.x support and multiple VideoCore fixes landed upstream

## Fork behavior preserved

- Traditional Chinese and the fork i18n framework remain included
- `zh-TW` remains the primary maintained locale and `en-US` remains fallback
- Web UI and updater release checks remain pointed at `8tnomasu/seanime-i18n`
- Denshi desktop updater feed remains pointed at the fork release channel
- Fork version comparison logic for tags such as `v3.8.2-i18n.1` remains preserved
- Docker and GHCR packaging remain fork-owned
- The official Docker image continues to include FFmpeg and FFprobe
- Mediastream, transcoding, and playback continuity fixes remain preserved

## i18n notes

- New `v3.8.x` UI strings were localized for both `en-US` and `zh-TW`
- Locale leaf keys remain aligned between `en-US.json` and `zh-TW.json`
- New settings and commands introduced upstream were adapted to the fork i18n layer

## Deployment note

For production or homelab deployment, prefer the fixed tag below instead of `latest`:

```yaml
image: ghcr.io/8tnomasu/seanime-i18n:v3.8.2-i18n.1
```

## Release status

- Release tag not created yet
- GitHub Release not published yet
- Docker image not published yet
