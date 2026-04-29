# Upstream Sync Guide

This guide describes how to merge upstream Seanime changes into this fork while preserving fork-specific behavior.

## Before merging upstream

1. Read `docs/fork-deltas.md`.
2. Fetch upstream tags and branches.
3. Check upstream release notes and changed files.
4. Identify upstream changes that touch fork-delta areas:
   - i18n
   - Docker / release
   - updater
   - playback continuity
   - mediastream / transcoding
   - ffprobe / process handling
5. Create a sync branch.
6. Do not tag or release before validation.

## Diff audit commands

```bash
git fetch upstream --tags
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

## After merging upstream

Run relevant validation:

- i18n key parity
- frontend build / typecheck
- Go targeted tests
- Continue Watching tests
- updater version comparison tests
- mediastream tests
- Docker / release workflow review
- manual homelab playback tests when mediastream changes are involved

## Retiring a fork delta

When upstream fully replaces a fork-specific change:

1. Remove redundant fork code.
2. Keep or adapt tests.
3. Mark the entry in `docs/fork-deltas.md` as `Superseded by upstream`.
4. Record the upstream version / commit.
5. Explain the decision in the PR body.

## 繁中摘要

- 合 upstream 前，先讀 `docs/fork-deltas.md`，確認這次 upstream 變更有沒有碰到 fork 專屬區域。
- upstream 沒有完整實作 fork 行為時，先保留 fork patch。
- upstream 有相同修正且滿足 fork 需求時，優先改用 upstream，並把 fork delta 標成 `Superseded by upstream`。
- 若 upstream 只有相似功能但不完全符合 fork 需求，請把 fork patch 疊在 upstream 版本之上，而不是直接刪掉。
- 合完 upstream 後，一定要補跑 i18n parity、frontend build / typecheck、Go targeted tests、Continue Watching / updater / mediastream 測試，以及必要的 homelab 手動驗證。
