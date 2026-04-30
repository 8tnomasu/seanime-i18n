# Seanime i18n

[繁體中文](./README.zh-TW.md)

Unofficial Seanime fork maintained at [8tnomasu/seanime-i18n](https://github.com/8tnomasu/seanime-i18n).

## About this fork

This repository is an unofficial fork of Seanime.

It started as an i18n / Traditional Chinese localization fork, but it now also includes fork-specific Docker packaging, mediastream playback fixes, playback continuity fixes, updater source changes, and release workflow improvements.

This fork is not affiliated with or endorsed by the upstream Seanime project.

## Fork-specific changes

- i18n infrastructure and Traditional Chinese localization
- GHCR Docker image packaging
- Docker image includes FFmpeg / FFprobe for browser transcoding playback
- Mediastream transcoding stability fixes
- Long-distance seek / transcoding loading improvements
- Playback continuity / Continue Watching behavior fixes
- Per-episode resume progress preservation
- ffprobe child process cleanup to avoid zombie / defunct processes
- Web UI / updater release checks use this fork's GitHub Releases
- Release workflow adjustments for i18n versioned assets
- Docker publish workflow alignment with release publication

For maintainer-facing details about fork-specific changes, see [`docs/fork-deltas.md`](docs/fork-deltas.md) and [`docs/upstream-sync.md`](docs/upstream-sync.md).

## Status / Disclaimer

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

This fork publishes Docker images to GHCR:

```yaml
image: ghcr.io/8tnomasu/seanime-i18n:v3.7.1-i18n.1
```

For production deployments, prefer a fixed version tag instead of `latest`.

The official image includes FFmpeg and FFprobe in the runtime image for browser transcoding playback.

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
