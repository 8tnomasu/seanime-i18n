# ADR-0002: Track fork deltas for upstream sync

## Status

Accepted

## Context

This fork now includes changes beyond localization. Some fork-specific fixes may overlap with future upstream bug fixes or features. Without explicit records, upstream merges become harder and risk accidentally removing fork behavior.

## Decision

Maintain `docs/fork-deltas.md` and `docs/upstream-sync.md`.

Every non-trivial fork-specific runtime, Docker, updater, release, or data behavior change should be recorded with:

- problem
- fork behavior
- implementation summary
- main files
- tests / validation
- upstream sync decision

## Consequences

- Upstream merges require more documentation discipline.
- Fork-specific behavior is easier to preserve or retire intentionally.
- Release notes remain user-facing, while fork deltas remain maintainer-facing.

## 繁中摘要

本 fork 已經包含中文化以外的 runtime、Docker、updater、release workflow 等修正，因此必須用 fork delta 文件記錄與 upstream 的差異，避免未來同步 upstream 時誤刪 fork 行為。
