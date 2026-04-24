## Summary

- Briefly describe what this PR changes.
- If relevant, mention the affected locale groups or shared i18n areas.

## Scope Checklist

- [ ] This PR targets the Seanime i18n fork, not the original Seanime repository.
- [ ] This PR is limited to translation work, i18n keys, documentation, or a small i18n structure improvement.
- [ ] This PR does not change unrelated core logic, playback logic, torrent/debrid logic, backend logic, or API behavior.

## Changed Areas Checklist

- [ ] `en-US.json`
- [ ] `zh-TW.json`
- [ ] `labels.ts`
- [ ] React components using `useTranslation()`
- [ ] hooks / utilities / toasts using `i18n.t(...)`
- [ ] documentation

## Locale Checklist

- [ ] New keys were added to `en-US.json` first.
- [ ] Matching keys were added to `zh-TW.json`.
- [ ] `en-US` and `zh-TW` keys remain in sync.
- [ ] Placeholders / interpolation keys were preserved.
- [ ] No translated strings were hard-coded inside components.

## Validation Checklist

- [ ] `.\node_modules\.bin\tsc.cmd --noEmit`
- [ ] `.\node_modules\.bin\tsgo.cmd`
- [ ] `.\node_modules\.bin\rsbuild.cmd build`
- [ ] No generated files are included.
- [ ] No build artifacts are included.

## Notes

- Anything reviewers should pay special attention to
- Known limitations
- Follow-up translation work, if any
