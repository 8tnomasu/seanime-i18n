# Seanime i18n v3.7.0-i18n.3

This patch release focuses on playback stability, resume consistency, and release workflow reliability.

## Highlights

- Continue Watching now uses the actual latest meaningful local playback record.
- Resume progress is preserved independently for each episode.
- Watched / completed threshold behavior was reviewed and is unchanged.
- ffprobe child processes are now reaped correctly to avoid zombie / defunct processes.
- FFmpeg / mediastream browser transcoding playback was adjusted to improve audio/video sync stability.
- Long-distance seek behavior during transcoded browser playback was improved to avoid prolonged loading on large jumps.
- Release workflow automation improvements remain in place.

## Playback behavior

- Home Continue Watching prefers the latest local playback record instead of episode number or AniList progress.
- Episode resume points remain independent per episode.
- Watched / completed threshold behavior was documented but not changed in this release.

## Mediastream

- Transcoded HLS playback now isolates playback-specific asset requests more clearly.
- Long-distance seek requests now restart transcoding work closer to the requested segment when needed.
- Browser transcoding audio handling was normalized for more stable playback.

## Process cleanup

- Completed ffprobe child processes are now waited on correctly.

## Release workflow

- Release workflow automation improvements from the previous patch remain preserved.

## Fork and updater source

- README and docs now clarify that `seanime-i18n` is an unofficial fork of Seanime rather than a localization-only mirror.
- This fork includes i18n, Traditional Chinese localization, Docker packaging, playback fixes, continuity fixes, updater source changes, and release workflow adjustments.
- The in-app update checker and Denshi desktop updater now use `8tnomasu/seanime-i18n` GitHub Releases instead of upstream Seanime releases.
- Version comparison supports fork tags such as `v3.7.0-i18n.3`.

## Maintainer documentation

This release adds maintainer-facing fork delta documentation for future upstream syncs. `docs/fork-deltas.md` records fork-specific behavior, implementation notes, validation, and upstream sync decisions. `docs/upstream-sync.md` describes how to compare upstream changes and decide whether to keep, adapt, or retire fork patches.

## Cross-platform path handling

This release also documents and preserves fork-specific cross-platform path normalization and archive safety fixes. These changes are tracked in `docs/fork-deltas.md` as FD-0011 for future upstream sync decisions.

## Notes

- This is an unofficial i18n fork release.
- Upstream project: 5rahim/seanime
- i18n fork: 8tnomasu/seanime-i18n
