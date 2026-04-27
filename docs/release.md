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

## Release notes

The release workflow looks for version-specific release notes in this order:

```text
RELEASE_NOTES_vX.Y.Z-i18n.N.md
RELEASE_NOTES_vX.Y.Z-i18n.N_DRAFT.md
RELEASE_NOTES_X.Y.Z-i18n.N.md
RELEASE_NOTES_X.Y.Z-i18n.N_DRAFT.md
```

If none of the files above exist, the workflow falls back to the generated `whats-new.md`.

For i18n fork releases, a version-specific release notes file is recommended so the published release uses fork-specific notes instead of upstream auto-generated notes.

## Recommended release flow

1. Merge the release preparation PR into `main`.
2. Prepare a version-specific release notes file.
3. Create and push a tag such as `v3.7.0-i18n.3`.
4. The release workflow publishes the GitHub Release automatically.
5. After the release is published, the Docker publish workflow starts automatically.

## Release workflow behavior

When a tag like `v3.7.0-i18n.3` is pushed:

- The release workflow publishes a non-draft release.
- The release title is set to `Seanime i18n v3.7.0-i18n.3`.
- The workflow uploads release assets with the full i18n version suffix preserved.

Expected server assets include:

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

The Docker publish workflow runs when a GitHub Release is published.

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

For production deployments, use a fixed version tag instead of `latest`.
