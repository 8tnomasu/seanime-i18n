# Seanime i18n

[繁體中文](./README.zh-TW.md)

Unofficial Seanime fork maintained at [8tnomasu/seanime-i18n](https://github.com/8tnomasu/seanime-i18n).

## About this fork

This repository is an unofficial fork of Seanime.

It started as an i18n and Traditional Chinese localization fork, and it now also carries fork-specific Docker packaging, mediastream playback fixes, playback continuity fixes, updater source changes, and release workflow adjustments.

This maintenance branch prepares the fork sync from upstream Seanime `v3.7.1` to `v3.8.2`, with the fork release target `v3.8.2-i18n.1`.

This fork is not affiliated with or endorsed by the upstream Seanime project.

## Current sync / release preparation

- Upstream base: `v3.8.2`
- Fork release target: `v3.8.2-i18n.1`
- This preparation stage does not create the release tag, GitHub Release, or Docker image yet

## Fork-specific behavior

- i18n infrastructure and Traditional Chinese localization
- `zh-TW` remains the primary maintained locale, with `en-US` kept as fallback
- Web UI and updater release checks stay on `8tnomasu/seanime-i18n`
- Denshi desktop updater feed stays on the fork release channel
- Fork version comparison continues to support tags such as `v3.8.2-i18n.1`
- GHCR Docker packaging stays fork-owned
- Docker runtime continues to include FFmpeg and FFprobe for browser transcoding playback
- Mediastream, transcoding, and playback continuity fixes remain preserved

For maintainer-facing details about fork-specific changes, see [`docs/fork-deltas.md`](docs/fork-deltas.md) and [`docs/upstream-sync.md`](docs/upstream-sync.md).

## Status / disclaimer

- This is an unofficial fork of Seanime.
- This project is maintained independently.
- This fork may behave differently from upstream Seanime.
- Update checks in this fork should follow [8tnomasu/seanime-i18n releases](https://github.com/8tnomasu/seanime-i18n/releases), not upstream Seanime releases.
- Seanime does not provide, host, or distribute media content.
- Users are responsible for ensuring that their media sources comply with applicable laws.
- This fork does not remove or weaken the original Seanime copyright, license, or legal disclaimers.

## Supported languages

| Locale | Language | Status |
| --- | --- | --- |
| `en-US` | English | Default / fallback |
| `zh-TW` | Traditional Chinese | Primary maintained locale |

## Installation / usage

- Clone this fork.
- Follow the original Seanime development and build instructions in [DEVELOPMENT_AND_BUILD.md](./DEVELOPMENT_AND_BUILD.md).
- Launch the app and select the preferred language from the UI settings.
- For Docker deployment, see [docs/docker.md](./docs/docker.md).
- For release flow details, see [docs/release.md](./docs/release.md).

## Docker deployment

This fork publishes Docker images to GHCR. The fixed tag prepared for this sync is:

```yaml
image: ghcr.io/8tnomasu/seanime-i18n:v3.8.2-i18n.1
```

For production deployments, prefer a fixed version tag instead of `latest`.

The official image includes FFmpeg and FFprobe in the runtime image for browser transcoding playback.

Note: during this release-preparation PR, the tag above is the intended release tag and may not be available on GHCR until the release stage is completed.

## i18n notes

Relevant i18n files live under:

- `seanime-web/src/i18n/`
- `seanime-web/src/i18n/locales/en-US.json`
- `seanime-web/src/i18n/locales/zh-TW.json`
- `seanime-web/src/i18n/labels.ts`

Additional localization notes are documented in [docs/i18n.md](./docs/i18n.md).

## Upstream

This fork is based on Seanime by 5rahim.

Upstream repository: [5rahim/seanime](https://github.com/5rahim/seanime)

## License

- This fork continues to follow the original GPL-3.0 license.
- Original copyright and license notices must be preserved.
- See [LICENSE](./LICENSE).
