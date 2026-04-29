# Fork Deltas

This document tracks fork-specific changes in `8tnomasu/seanime-i18n` compared with upstream `5rahim/seanime`.

It is intended for maintainers when merging upstream changes.

Release notes describe user-visible changes. This document records why fork-specific changes exist, how they are implemented, and how to decide whether to keep, update, or retire them when upstream changes overlap.

Baseline for the initial audit:

- Upstream baseline: `v3.7.0`
- Fork baseline: `main` at `0293faa2` when this document was created

## FD-0001: i18n infrastructure and Traditional Chinese localization

### Category

Localization

### Status

Active

### Introduced in

Introduced before `v3.7.0-i18n.1`; expanded through `v3.7.0-i18n.3`

### Upstream status

- Not present in upstream `v3.7.0`

### Problem

Upstream Seanime `v3.7.0` does not ship a maintained Traditional Chinese UI or a fork-specific localization framework for user-visible strings.

### Fork behavior

The fork provides a shared i18n layer, Traditional Chinese translations, locale-aware labels, and UI wiring for frontend text and shared display mappings.

### Implementation summary

- bootstrap `i18next` and `react-i18next`
- keep `en-US` as fallback and `zh-TW` as the primary maintained fork locale
- route shared labels through `seanime-web/src/i18n/labels.ts`
- persist language choice in frontend state and provider wiring

### Main files

- `seanime-web/src/i18n/index.ts`
- `seanime-web/src/i18n/provider.tsx`
- `seanime-web/src/i18n/labels.ts`
- `seanime-web/src/i18n/locales/en-US.json`
- `seanime-web/src/i18n/locales/zh-TW.json`
- `seanime-web/src/app/client-providers.tsx`
- `seanime-web/src/main.tsx`

### Tests / validation

- frontend build
- frontend typecheck
- i18n key parity check between `en-US` and `zh-TW`
- manual zh-TW UI verification

### Upstream sync decision

Keep the fork patch unless upstream introduces an equivalent localization system that satisfies:

- shared frontend i18n infrastructure
- maintained `zh-TW` coverage
- key parity discipline
- equivalent fallback behavior

## FD-0002: GHCR Docker packaging and FFmpeg / FFprobe runtime

### Category

Docker / runtime packaging

### Status

Active

### Introduced in

Introduced before `v3.7.0-i18n.2`; expanded through `v3.7.0-i18n.3`

### Upstream status

- Not present in upstream `v3.7.0`

### Problem

The fork publishes its own GHCR image and needs browser transcoding playback to work in container deployments without depending on host-level FFmpeg binaries.

### Fork behavior

The official fork image is built and published from this repository, includes FFmpeg / FFprobe in the final runtime image, and documents fixed-version deployment for GHCR users.

### Implementation summary

- build a fork-owned Docker image from fork releases
- install `ffmpeg` in the final runtime image
- publish `ghcr.io/8tnomasu/seanime-i18n`
- document fixed version tags and runtime FFmpeg expectations

### Main files

- `Dockerfile`
- `.dockerignore`
- `docker-compose.example.yml`
- `.github/workflows/docker-publish.yml`
- `docs/docker.md`

### Tests / validation

- released Docker image smoke tests
- manual FFmpeg / FFprobe checks in the runtime image
- homelab browser transcoding verification

### Upstream sync decision

Keep the fork patch unless upstream adds equivalent fork-owned container packaging and runtime FFmpeg guarantees for the maintained deployment path.

## FD-0003: Release workflow and i18n asset naming

### Category

Release workflow / assets

### Status

Active

### Introduced in

Introduced before `v3.7.0-i18n.2`; revised in the release workflow automation follow-up before `v3.7.0-i18n.3`

### Upstream status

- Similar release automation exists upstream, but fork release naming and publication requirements differ

### Problem

Fork tags use `vX.Y.Z-i18n.N`, so asset names and Docker publish expectations must preserve the full suffix. The fork also needs release notes lookup and direct publication behavior that match its release flow.

### Fork behavior

Release assets keep the full `-i18n.N` suffix, release notes can come from version-specific files, and Docker publish waits for matching fork asset names after release publication.

### Implementation summary

- preserve `vX.Y.Z-i18n.N` in asset names
- publish releases with `name:` instead of the invalid `release_name`
- trigger Docker publish on `release.published`
- look up version-specific release notes before falling back to generated notes

### Main files

- `.github/workflows/release-draft-new.yml`
- `.github/workflows/docker-publish.yml`
- `docs/release.md`
- `RELEASE_NOTES_v3.7.0-i18n.2_DRAFT.md`
- `RELEASE_NOTES_v3.7.0-i18n.3.md`

### Tests / validation

- successful `v3.7.0-i18n.2` release after workflow fixes
- asset naming review for Linux / macOS / Windows outputs
- manual release note verification

### Upstream sync decision

Prefer upstream only if it can preserve fork versioned asset naming and release publication behavior. Otherwise keep or adapt the fork workflow.

## FD-0004: Web UI / Denshi updater source uses seanime-i18n releases

### Category

Updater / release source

### Status

Active

### Introduced in

Introduced before `v3.7.0-i18n.3`

### Upstream status

- Not present in upstream `v3.7.0`

### Problem

If in-app update checks follow upstream Seanime releases, users can be offered builds that do not include fork localization, Docker packaging, playback fixes, continuity fixes, or release workflow behavior.

### Fork behavior

The Web UI updater and Denshi desktop updater follow `8tnomasu/seanime-i18n` GitHub Releases. Release notes and changelog fetching also follow the fork. Version comparison supports fork tags like `v3.7.0-i18n.3`.

### Implementation summary

- set fork GitHub owner / repo constants
- normalize legacy update channels to the fork GitHub release channel
- compare `vX.Y.Z-i18n.N` tags by upstream version plus i18n suffix
- validate release asset URLs against allowed fork release hosts
- point Denshi auto-update feed to fork release downloads

### Main files

- `internal/constants/constants.go`
- `internal/updater/check.go`
- `internal/updater/updater.go`
- `internal/updater/selfupdate.go`
- `internal/util/version.go`
- `internal/handlers/releases.go`
- `internal/handlers/status.go`
- `internal/core/app.go`
- `internal/core/modules.go`
- `seanime-denshi/src/main.js`
- `seanime-denshi/package.json`
- `seanime-web/src/app/(main)/settings/page.tsx`
- `seanime-web/src/app/(main)/settings/_containers/server-settings.tsx`

### Tests / validation

- `go test ./internal/updater`
- `go test ./internal/util`
- `go test ./internal/handlers`
- frontend build / typecheck
- manual update UI wording review

### Upstream sync decision

Do not retire this patch unless upstream adds an equivalent and safe way to keep users on the fork release channel, including fork tag comparison and changelog source control.

## FD-0005: Continue Watching uses the latest local playback record

### Category

Playback continuity

### Status

Active

### Introduced in

Introduced before `v3.7.0-i18n.3`

### Upstream status

- Similar continuity features exist upstream, but the fork home selection behavior differs

### Problem

The home Continue Watching section could show the wrong episode because it favored AniList progress or episode ordering instead of the latest meaningful local playback record.

### Fork behavior

Home Continue Watching prefers the latest resumable local playback record for a media entry. AniList progress is only used as a fallback when no local resume record exists.

### Implementation summary

- read continuity history timestamps from `TimeUpdated` / `TimeAdded`
- select the latest resumable episode for each media entry
- ignore completed history items for Continue Watching
- use AniList progress only as fallback

### Main files

- `internal/continuity/history.go`
- `internal/handlers/continuity.go`
- `internal/handlers/continuity_helpers.go`
- `internal/library/anime/collection.go`
- `internal/library/anime/entry_helper.go`
- `internal/handlers/anime_collection.go`

### Tests / validation

- `go test ./internal/continuity`
- `go test ./internal/library/anime -run TestSelectContinueWatchingEpisode -v`
- manual home / entry page resume validation

### Upstream sync decision

Retire this patch only if upstream home selection satisfies all of the following:

- latest local record wins
- AniList progress is fallback only
- completed episodes do not get stuck in Continue Watching

## FD-0006: Per-episode resume progress preservation

### Category

Playback continuity

### Status

Active

### Introduced in

Introduced before `v3.7.0-i18n.3`

### Upstream status

- Similar watch history exists upstream, but fork resume preservation requirements differ

### Problem

Multiple episode resume points for the same media could collapse into one record, which breaks expected per-episode resume behavior.

### Fork behavior

Resume progress is stored independently per episode, while Continue Watching chooses the latest local resumable episode without deleting the others.

### Implementation summary

- store watch history entries using a `mediaId:episodeNumber` key
- migrate legacy single-key entries when needed
- keep exact-episode resume lookup separate from latest-per-media lookup

### Main files

- `internal/continuity/history.go`
- `internal/continuity/manager_test.go`
- `internal/handlers/continuity.go`
- `seanime-web/src/api/hooks/continuity.hooks.ts`
- `seanime-web/src/app/(main)/_features/video-core/video-core.tsx`

### Tests / validation

- `go test ./internal/continuity`
- manual validation across home and entry episode lists

### Upstream sync decision

Keep or adapt this patch unless upstream guarantees per-episode resume storage and lookup without regressing home selection behavior.

## FD-0007: ffprobe child process reaping

### Category

Process lifecycle

### Status

Active

### Introduced in

Introduced before `v3.7.0-i18n.3`

### Upstream status

- Unknown; re-check on the next upstream sync

### Problem

Completed `ffprobe` child processes could remain as defunct zombies if the parent path started them but did not consistently reap them.

### Fork behavior

The fork ensures `ffprobe` invocations are waited on correctly, including failure and kill paths, instead of relying on container init behavior.

### Implementation summary

- call `Wait()` after successful `Start()`
- kill and then wait on error / cancellation paths
- preserve stderr context for diagnostics

### Main files

- `internal/mediastream/cassette/keyframe.go`
- `internal/mediastream/transcoder/keyframes.go`
- `docs/playback.md`

### Tests / validation

- `go test ./internal/mediastream/...`
- manual zombie process checks with `ps`

### Upstream sync decision

Retire only if upstream process lifecycle guarantees no `ffprobe` zombies across all active probe paths.

## FD-0008: Mediastream / HLS stale playback asset isolation

### Category

Mediastream / HLS session isolation

### Status

Active

### Introduced in

Introduced before `v3.7.0-i18n.3`

### Upstream status

- Not present in upstream `v3.7.0`

### Problem

Stale playlist or segment requests could be mixed into the currently playing transcode session, especially around playback switches and HLS asset reuse.

### Fork behavior

Playback-specific HLS asset requests are isolated from stale sessions. The backend can ignore stale playback requests and transcode responses are marked `no-store`.

### Implementation summary

- add playback-specific query parameters to HLS playlists
- validate playback identity on transcode asset requests
- return `Cache-Control: no-store`
- keep playback-specific shutdown handling aligned with current playback identity

### Main files

- `internal/mediastream/transcode.go`
- `internal/handlers/mediastream.go`
- `internal/mediastream/repository.go`
- `internal/mediastream/cassette/playlist.go`
- `seanime-web/src/app/(main)/mediastream/page.tsx`

### Tests / validation

- `go test ./internal/mediastream ./internal/handlers`
- `go test ./internal/mediastream/...`
- manual next-episode and stale playback validation

### Upstream sync decision

Keep this patch unless upstream fully prevents stale playback assets from crossing session boundaries and preserves the fork's current validation behavior.

## FD-0009: Audio pipeline normalization for browser HLS transcoding

### Category

Mediastream / transcoding

### Status

Active

### Introduced in

Introduced before `v3.7.0-i18n.3`

### Upstream status

- Unknown; needs re-check on next upstream sync

### Problem

Browser HLS playback could drift into audio / video desynchronization when the audio path depended on less stable source timing behavior.

### Fork behavior

The audio pipeline is normalized for browser HLS playback instead of depending on opportunistic copy behavior.

### Implementation summary

- transcode audio to AAC
- use `aresample=async=1:first_pts=0`
- keep segment generation aligned with the browser-oriented HLS path

### Main files

- `internal/mediastream/cassette/session.go`
- `internal/mediastream/cassette/pipeline.go`
- `internal/mediastream/cassette/quality_test.go`

### Tests / validation

- `go test ./internal/mediastream/...`
- manual homelab playback verification around mid-episode sync points

### Upstream sync decision

Retire only if upstream provides equivalent browser HLS audio stability without reintroducing sync regressions or significantly worse resource usage.

## FD-0010: Long-distance seek behavior improvement

### Category

Mediastream / seek behavior

### Status

Active

### Introduced in

Introduced before `v3.7.0-i18n.3`

### Upstream status

- Not present in upstream `v3.7.0`

### Problem

Large seek jumps during transcoded browser playback could stay in loading too long because the running ffmpeg head was reused even when it was far from the requested segment.

### Fork behavior

The fork detects large seek jumps and restarts transcoding work closer to the requested segment so the player is less likely to stall on long-distance seeks.

### Implementation summary

- detect seek-like segment jumps
- reduce max head reuse distance
- kill distant heads when rebuilding near a target segment
- prefer new work close to the requested segment

### Main files

- `internal/mediastream/cassette/pipeline.go`
- `internal/mediastream/cassette/playlist.go`
- `internal/mediastream/transcode.go`
- `internal/mediastream/cassette/pipeline_test.go`
- `internal/mediastream/cassette/playlist_test.go`
- `internal/mediastream/transcode_test.go`
- `seanime-web/src/app/(main)/mediastream/page.tsx`

### Tests / validation

- `go test ./internal/mediastream ./internal/handlers`
- `go test ./internal/mediastream/...`
- manual short / medium / long seek testing

### Upstream sync decision

Retire only if upstream achieves comparable large-seek responsiveness without breaking A/V sync or session isolation.

## FD-0011: Cross-platform path normalization and archive safety

### Category

Compatibility / filesystem behavior

### Status

Active

### Introduced in

Introduced before `v3.7.0-i18n.3`; exact version to verify

### Upstream status

- Unknown; needs re-check on next upstream sync

### Problem

Fork validation exposed Windows and cross-platform path issues around archive entry handling and media path normalization. These fixes should not be silently lost in future upstream merges.

### Fork behavior

The fork keeps stricter and more consistent path normalization for archive safety and media path parsing without relaxing traversal protections.

### Implementation summary

- normalize Windows slash-style paths more carefully
- preserve traversal rejection for archive entries
- adjust media path parsing to avoid malformed folder-title behavior

### Main files

- `internal/util/fs.go`
- `internal/library/filesystem/mediapath.go`
- `internal/plugin/system_test.go`
- `internal/handlers/local_security_test.go`

### Tests / validation

- `go test ./internal/util`
- `go test ./internal/library/anime -run "TestLocalFile_GetTitleVariations|TestLocalFile_GetTitleVariations_Includes|TestLocalFile_GetParsedTitle|TestLocalFile_GetFolderTitle|TestNewLocalFile" -v`

### Upstream sync decision

Retire only if upstream matches both safety requirements and cross-platform parsing behavior verified by the current fork tests.
