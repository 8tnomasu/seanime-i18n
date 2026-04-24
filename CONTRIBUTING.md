# Contributing to Seanime i18n

Thank you for contributing to this repository.

## Project Position

- This repository is an unofficial i18n fork of Seanime.
- It is maintained independently and is not affiliated with, endorsed by, or maintained by the original Seanime project.
- This fork is maintained for Seanime i18n work only.
- There is currently no plan to submit these changes upstream to the original Seanime repository.

Original project: [5rahim/seanime](https://github.com/5rahim/seanime)

## In Scope

Contributions are welcome when they stay within the fork's i18n-focused scope:

- translation improvements
- missing or incorrect i18n keys
- locale consistency fixes
- documentation updates related to i18n or translation workflow
- small and reviewable i18n structure improvements

Examples of acceptable work:

- fixing missing `t(...)` usage in user-facing UI
- improving `en-US.json` / `zh-TW.json` coverage
- updating `labels.ts` for shared display labels
- tightening translation guidelines or contributor documentation

## Out of Scope

This fork does not accept non-i18n feature work.

Do not submit changes for:

- core application features unrelated to i18n
- player / playback engine logic
- torrent / debrid / download logic
- backend / server / API behavior
- route changes unrelated to translation wiring
- unrelated refactors
- generated files
- build artifacts

If a change materially alters application behavior outside user-facing i18n display, it is likely out of scope.

## Translation Workflow

When adding or updating user-facing strings:

1. Add the key to `seanime-web/src/i18n/locales/en-US.json` first.
2. Add the same key to `seanime-web/src/i18n/locales/zh-TW.json`.
3. Keep both locale files in sync.
4. Preserve placeholders, interpolation keys, and variable formats.

Required rules:

- Do not hard-code translated strings inside components.
- Do not add a key to `zh-TW` without also adding it to `en-US`.
- Do not translate file names, paths, hashes, tokens, provider names, or external API content.

## Usage Rules

- React components should use `useTranslation()`.
- Hooks, utilities, toasts, and other non-React modules should use `i18n.t(...)`.
- Shared display labels should use `seanime-web/src/i18n/labels.ts` when appropriate instead of duplicating mapping logic.

## Branch and Upstream Policy

- Create branches from this fork's `main` branch.
- Open pull requests against this fork, not the original Seanime repository.
- Contributors should not rebase onto upstream.
- Upstream sync is handled manually by the maintainer.

## Validation

For UI or locale changes, contributors should run the relevant checks when possible:

- `.\node_modules\.bin\tsc.cmd --noEmit`
- `.\node_modules\.bin\tsgo.cmd`
- `.\node_modules\.bin\rsbuild.cmd build`

Before submitting, make sure:

- locale keys are synchronized between `en-US` and `zh-TW`
- no hard-coded translated strings were introduced
- no unrelated files are included
- no generated files or build artifacts are included

## Pull Request Expectations

Keep pull requests small, focused, and easy to review.

Good pull requests for this fork usually:

- touch a limited and clearly defined i18n area
- explain what locale keys were added or updated
- mention validation results
- avoid mixing translation work with unrelated cleanup

Pull requests that violate scope may be declined.
