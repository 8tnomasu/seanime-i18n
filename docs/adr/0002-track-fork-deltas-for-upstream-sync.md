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

## Maintainer note

Whenever an upstream sync touches fork-owned runtime, Docker, updater, release, or continuity behavior, update the fork delta inventory in the same branch so the next maintainer can see what must be preserved or can be retired.
