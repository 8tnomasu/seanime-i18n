# Release Flow

This document describes the recommended release flow for `seanime-i18n`.

## Tag naming

Fork releases should use the i18n tag format below:

```text
vX.Y.Z-i18n.N
```

Example:

```text
v3.7.0-i18n.3
```

## Recommended release flow

1. Merge the release preparation PR into `main`.
2. Prepare version-specific release notes.
3. Create and push a tag such as `v3.7.0-i18n.3`.
4. The release workflow publishes the GitHub Release automatically.
5. After the release is published, the release workflow triggers Docker publish automatically.

## Release notes

The release workflow looks for version-specific release notes in this order:

```text
RELEASE_NOTES_vX.Y.Z-i18n.N.md
RELEASE_NOTES_vX.Y.Z-i18n.N_DRAFT.md
RELEASE_NOTES_X.Y.Z-i18n.N.md
RELEASE_NOTES_X.Y.Z-i18n.N_DRAFT.md
```

If none of the files above exist, the workflow falls back to generated notes.

## Release notes policy

Release notes should clearly separate:

- upstream merge changes
- i18n / localization changes
- fork-specific runtime fixes
- Docker / release workflow changes
- updater source changes

This fork may include behavior changes that are not present in upstream Seanime, so release notes should make those differences explicit.

When a release includes fork-specific runtime or updater changes, update `docs/fork-deltas.md` if the change introduces or changes long-term fork behavior.

## Release workflow behavior

When a tag like `v3.7.0-i18n.3` is pushed:

- the release workflow publishes a non-draft release
- the release title is set to `Seanime i18n v3.7.0-i18n.3`
- release notes use the version-specific file when available
- release assets preserve the full i18n version suffix

Expected release assets include:

```text
seanime-3.7.0-i18n.3_Linux_x86_64.tar.gz
seanime-3.7.0-i18n.3_Linux_arm64.tar.gz
seanime-3.7.0-i18n.3_MacOS_x86_64.tar.gz
seanime-3.7.0-i18n.3_MacOS_arm64.tar.gz
seanime-3.7.0-i18n.3_Windows_x86_64.zip
```

Update metadata assets include:

```text
latest.yml
latest-linux.yml
latest-mac.yml
```

## Docker publish behavior

The Docker publish workflow supports multiple trigger paths:

- `release.published`
- `repository_dispatch`
- `workflow_dispatch`

Because releases created by GitHub Actions with `GITHUB_TOKEN` may not trigger downstream workflows reliably, this fork does not rely on `release.published` as the only Docker publish trigger. The release workflow sends a `repository_dispatch` event after the release and assets are published.

It waits for these release assets before building the image:

```text
seanime-3.7.0-i18n.3_Linux_x86_64.tar.gz
seanime-3.7.0-i18n.3_Linux_arm64.tar.gz
```

It publishes:

```text
ghcr.io/8tnomasu/seanime-i18n:vX.Y.Z-i18n.N
ghcr.io/8tnomasu/seanime-i18n:latest
```

For an existing release that already has assets, maintainers can manually trigger Docker publish with:

```bash
gh workflow run docker-publish.yml \
  --repo 8tnomasu/seanime-i18n \
  -f version=v3.7.0-i18n.3
```

## Updater source

Web UI and updater release checks in this fork should use GitHub Releases from:

- `8tnomasu/seanime-i18n`

They should not use upstream Seanime releases for fork-specific runtime or Docker fixes.

## Documentation expectations

If a release includes runtime bugfixes, updater source changes, Docker packaging changes, or playback fixes, update the relevant README / docs in the same PR.
