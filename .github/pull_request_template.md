## Summary

- Briefly describe what this PR changes.
- If relevant, mention whether this is an upstream sync, i18n change, runtime fix, Docker / release workflow change, or updater source change.

## Scope Checklist

- [ ] This PR targets `8tnomasu/seanime-i18n`, not upstream Seanime.
- [ ] Fork-specific behavior changes are explained clearly.
- [ ] If this PR changes playback / mediastream behavior, manual verification steps are included.
- [ ] If this PR changes Docker or release workflow behavior, release / publish impact is explained.
- [ ] If this PR changes updater or release source behavior, the affected repository / release feed is explained.

## Changed Areas Checklist

- [ ] i18n / locale files
- [ ] frontend UI
- [ ] backend runtime / handler logic
- [ ] playback / mediastream
- [ ] Docker / GHCR
- [ ] release workflow
- [ ] updater source
- [ ] documentation

## Validation Checklist

- [ ] Relevant Go tests
- [ ] `npm run build` when frontend changed
- [ ] `npx tsc --noEmit` when frontend changed
- [ ] i18n key parity checked when locale keys changed
- [ ] No generated files are included
- [ ] No build artifacts are included

## Notes

- Anything reviewers should pay special attention to
- Known limitations
- Manual verification steps
