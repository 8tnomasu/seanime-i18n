# Contributing to Seanime i18n

Thank you for contributing to this repository.

## Project position

- This repository is an unofficial Seanime fork.
- It started as an i18n / Traditional Chinese localization fork.
- It now also includes fork-specific runtime, playback, Docker, updater, and release workflow fixes.
- It is maintained independently and is not affiliated with, endorsed by, or maintained by the original Seanime project.

Original project: [5rahim/seanime](https://github.com/5rahim/seanime)

## What to explain in a PR

If a PR includes fork-specific runtime changes, explain them clearly in the PR body.

This is especially important for:

- playback / mediastream changes
- Docker or release workflow changes
- updater or release source changes
- continuity / resume behavior changes

## Validation expectations

When relevant, include:

- build / typecheck results
- Go test results for touched packages
- i18n key parity notes
- manual playback verification steps if playback / mediastream changed
- release / publish impact if Docker or workflow files changed

## Translation workflow

When adding or updating user-facing strings:

1. Add the key to `seanime-web/src/i18n/locales/en-US.json` first.
2. Add the same key to `seanime-web/src/i18n/locales/zh-TW.json`.
3. Keep both locale files in sync.
4. Preserve placeholders, interpolation keys, and variable formats.

Required rules:

- Do not hard-code translated strings inside components.
- Do not add a key to `zh-TW` without also adding it to `en-US`.
- Do not translate file names, paths, hashes, tokens, provider names, or external API content.

## Branch and upstream policy

- Create branches from this fork's `main`.
- Open pull requests against this fork, not the upstream Seanime repository.
- Do not submit PRs to upstream on behalf of this fork unless explicitly coordinated.
- Upstream sync is handled manually by the maintainer.
