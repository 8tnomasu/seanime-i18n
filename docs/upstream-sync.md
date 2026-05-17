# Upstream Sync Guide

This guide describes how to merge upstream Seanime changes into this fork while preserving fork-specific behavior.

## Current reference sync

- Upstream target reviewed in this cycle: `v3.8.2`
- Fork release preparation target: `v3.8.2-i18n.1`
- Preferred sync branch pattern: `chore/update-upstream-vX.Y.Z`
- Do not create release tags, publish GitHub Releases, or publish Docker images during the sync PR stage

## Before merging upstream

1. Read `docs/fork-deltas.md`.
2. Read `docs/release.md`.
3. Read the ADRs under `docs/adr/`.
4. Confirm updater source behavior still targets `8tnomasu/seanime-i18n`.
5. Fetch upstream tags and branches.
6. Check upstream release notes and changed files.
7. Identify upstream changes that touch fork-delta areas:
   - i18n
   - Docker and release
   - updater
   - Denshi feed and package metadata
   - version comparison
   - playback continuity
   - mediastream and transcoding
   - ffprobe and process handling
8. Create a dedicated sync branch from the latest `main`.
9. Do not tag or release before validation.

## Diff audit commands

```bash
git fetch origin --prune --tags
git fetch upstream --prune --tags
git diff --name-status <upstream-tag>...main
git diff --stat <upstream-tag>...main
git diff --dirstat=files,0 <upstream-tag>...main
```

## During conflict resolution

For each conflict, identify whether it overlaps a fork delta.

Decision rules:

- If upstream does not implement the fork behavior, keep the fork behavior.
- If upstream implements the same behavior and satisfies fork requirements, prefer upstream and retire the fork patch.
- If upstream implements a similar feature but does not satisfy fork requirements, adapt the fork patch on top of upstream.
- If unsure, keep the fork behavior and add tests before deciding.

## Fork-specific checkpoints

Always re-check these areas before accepting upstream changes:

- `internal/constants/constants.go`
- updater source and release owner / repo wiring
- `internal/util/version.go`
- Denshi update feed, package version, and package lock
- Dockerfile defaults and GHCR image names
- `docker-compose.example.yml`
- `README.md`, `README.zh-TW.md`, `docs/docker.md`, `docs/release.md`
- `seanime-web/src/i18n/**`
- `seanime-web/src/i18n/locales/en-US.json`
- `seanime-web/src/i18n/locales/zh-TW.json`
- `seanime-web/src/i18n/labels.ts`
- mediastream, transcoding, VideoCore, and playback continuity paths

## After merging upstream

Run relevant validation:

- i18n key parity
- frontend build and typecheck
- Go targeted tests
- Continue Watching tests
- updater version comparison tests
- mediastream tests
- Docker and release workflow review
- manual homelab playback tests when mediastream changes are involved

For this repository, the standard local validation baseline should follow `.codex/environments/environment.toml`.

## Retiring a fork delta

When upstream fully replaces a fork-specific change:

1. Remove redundant fork code.
2. Keep or adapt tests.
3. Mark the entry in `docs/fork-deltas.md` as `Superseded by upstream`.
4. Record the upstream version or commit.
5. Explain the decision in the PR body.

## Maintainer notes

- When upstream adds new UI, settings, modal, toast, command, or error strings, update both `en-US.json` and `zh-TW.json`.
- Keep `zh-TW` as the maintained locale and `en-US` as fallback.
- Keep updater checks on `8tnomasu/seanime-i18n` and do not revert them to upstream Seanime.
- Keep Docker examples on fixed tags such as `ghcr.io/8tnomasu/seanime-i18n:v3.8.2-i18n.1`.
- When mediastream or playback code changes upstream, re-check stale playback isolation, transcoder shutdown guards, and resume continuity behavior explicitly.
