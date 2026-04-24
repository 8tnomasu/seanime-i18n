[繁體中文](./README.zh-TW.md)

# Seanime i18n

Unofficial internationalization fork of Seanime, with Traditional Chinese `zh-TW` as the first fully supported locale.

## Status / Disclaimer

- This is an unofficial fork of Seanime.
- This project is not affiliated with, endorsed by, or maintained by the original Seanime project.
- Original project: [5rahim/seanime](https://github.com/5rahim/seanime)
- This fork is maintained independently.
- Seanime does not provide, host, or distribute any media content.
- Users are responsible for ensuring that their media sources comply with applicable laws.
- This fork does not remove or weaken the original Seanime copyright, license, or legal disclaimers.

## What This Fork Changes

- Adds a maintainable frontend i18n architecture.
- Keeps `en-US` as the default and fallback language.
- Adds `zh-TW` as the first primary maintained locale.
- Adds language preference selection in the UI.
- Localizes major frontend areas, including:
  - App shell and navigation
  - Settings
  - Library and list pages
  - Media detail pages
  - Player UI
  - Download, Torrent, and Debrid UI
  - Integrations and offline sync
  - Common dialogs, toasts, empty states, and error states

## Supported Languages

| Locale | Language | Status |
| --- | --- | --- |
| `en-US` | English | Default / fallback |
| `zh-TW` | Traditional Chinese | Primary maintained locale |

## Installation / Usage

- Clone this fork.
- Follow the original Seanime development and build instructions in [DEVELOPMENT_AND_BUILD.md](./DEVELOPMENT_AND_BUILD.md).
- Launch the app and select the preferred language from the UI settings.

If you need broader upstream project context, refer to the original Seanime repository: [5rahim/seanime](https://github.com/5rahim/seanime).

## Development

Relevant i18n files live under:

- `seanime-web/src/i18n/`
- `seanime-web/src/i18n/locales/en-US.json`
- `seanime-web/src/i18n/locales/zh-TW.json`
- `seanime-web/src/i18n/labels.ts`

Development rules for this fork:

- React components should use `useTranslation()`.
- Non-React modules, hooks, and toast helpers can use `i18n.t(...)`.
- Add new keys to `en-US` first, then add the same keys to `zh-TW`.
- `en-US` and `zh-TW` keys should stay in sync.

Additional notes are documented in [docs/i18n.md](./docs/i18n.md).

## Translation Guidelines

- Use Traditional Chinese used in Taiwan for `zh-TW`.
- Keep product names and technical names unchanged when appropriate.
- Do not translate file names, paths, hashes, tokens, provider names, or external API content.
- Do not hard-code translated strings in components.

## License

- This fork follows the original GPL-3.0 license.
- Original copyright and license notices must be preserved.
- See [LICENSE](./LICENSE).

## Upstream

- This fork tracks the original Seanime project when possible.
- Changes in this repository are maintained independently.
- There is currently no plan to submit these i18n changes upstream.
