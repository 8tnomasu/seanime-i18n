# ADR-0001: Use fork release source for updater

## Status

Accepted

## Context

The upstream Seanime application checks GitHub Releases for updates. In this fork, using upstream releases would cause users to be offered versions that do not include seanime-i18n localization, Docker packaging, playback fixes, continuity fixes, and release workflow changes.

## Decision

The Web UI updater and Denshi desktop updater should check `8tnomasu/seanime-i18n` GitHub Releases instead of upstream `5rahim/seanime` releases.

Version comparison must support fork tags such as `v3.7.0-i18n.3`.

## Consequences

- Users stay on the fork release channel.
- Upstream attribution remains in documentation.
- Upstream release versions are not used directly for in-app update checks.
- During upstream sync, updater source changes must not be reverted accidentally.

## 繁中摘要

本 fork 的更新檢查必須追蹤 `8tnomasu/seanime-i18n` 的 GitHub Releases，而不是 upstream Seanime，避免使用者被更新到不含本 fork 修正的原版。
