# Reader experience: partial extraction from stash@{1}

Objective: extract only the podcast, comic, documentary (reportaje) and reading/chronology
improvements from `stash@{1}` (commit `6a64461`, base `2ca9bd4`) onto `master`, deliberately
excluding the home redesign. Branch: `feat/reader-experience`; baseline: `2ca9bd4`.

## Scope decisions (user, this session)

- **D1. Home redesign excluded.** No `app/page.tsx` change: no compact `.editorial-directory`
  or `.editorial-trust` layer, no `portals` rewrite in `content/editorial.ts`.
- **D2. Contextual closings excluded.** `app/[section]/page.tsx` is not touched at all:
  no `.continuation-context` block and no "Elegir otro formato" link, therefore no
  `continuationReasons` export either.
- **D3. Footer credits excluded.** `components/site-shell.tsx` stays at baseline.
- **D4. `Lorem Ipsum` left in place.** `DemoPodcast` notice and `DemoComicCover` keep the
  placeholder string. `stash@{0}` owns that cleanup.
- **D5. Delivery.** New branch `feat/reader-experience`, one work-unit commit per feature.
- **D6. `stash@{1}` stays intact** as a backup; nothing is dropped.
- **D7. Documentation not extracted.** `AUDIT.md`, `README.md` and
  `odd/tasks/reader-experience.md` from the stash describe all seven proposals including the
  excluded home work, so they are not carried over.
- **D8. Team/equipo copy changes excluded.** The nine `profile-bio` replacements and the team
  intro rewrite remain out of scope. Only the two stale asserts were realigned, in T7, to the
  structure the page actually renders.

## Baseline reality (measured before any write)

Commit `2ca9bd4` removed the "ficticio" copy but left the tests asserting it. Six asserts were
already failing on `master`:

| Test | Assert | Fate |
| --- | --- | --- |
| `tests/demo.spec.ts` comic test | dialog contains `ficticio` | fixed by T2 |
| `tests/demo.spec.ts` editorial test | `#cronologia` contains `ficticio` | fixed by T5 |
| `tests/demo.spec.ts` editorial test | `article` contains `ficticio` + >300 words | fixed by T5 |
| `tests/demo.spec.ts` editorial test | `#equipo` contains `ficticios` | fixed by T7 |
| `tests/special.spec.ts` shell test | `.profile` contains `Perfil ficticio` | fixed by T7 |
| `tests/special.spec.ts` shell test | `#lectura` contains `Ficción editorial` | fixed by T5 |
| `tests/special.spec.ts` comic test | dialog contains `ficticio` | fixed by T2 |

The podcast assert on `sintética` still passes: the string lives in
`content/demo-podcast.json` (transcript), not in the replaced paragraph.

## Files

Carried whole from the stash:
`lib/playback-progress.ts` (new), `components/audio-player.tsx` + `.module.css` (new),
`components/demo-media.module.css`, `components/video-player.tsx` + `.module.css`,
`content/documentary-accessibility.ts` (new), `tests/media-experience.spec.ts` (new),
`tests/video-player.spec.ts` (3 appended tests).

Reconstructed by hand (mixed with excluded work):
`components/demo-media.tsx` (comic + podcast swap), `components/section-content.tsx`
(reading + chronology hunks only), `content/editorial.ts` (`readingNotes`, `timelineNotes`,
`readingMinutes` only), `app/globals.css` (7 of 68 lines), `tests/demo.spec.ts`,
`tests/special.spec.ts`, `tests/editorial-experience.spec.ts` (trimmed to reading/chronology).

Never touched: `app/page.tsx`, `app/[section]/page.tsx`, `components/site-shell.tsx`,
`.atl/*`, `AUDIT.md`, `README.md`, `odd/tasks/reader-experience.md`, `content/demo.ts`.

## Tasks

- T1 [D5] `feat(progress)`: device-local progress helper. Evidence: commit `6717ef9`.
- T2 [D4,D5] `feat(comic)`: fixed reader controls, swipe, local resume, no-JS story.
  Evidence: commit `9c09bd1`.
- T3 [D4,D5] `feat(podcast)`: real-event custom player replacing native controls.
  Evidence: commit `aa29501`.
- T4 [D5] `feat(reportaje)`: local video resume, restart, explicit pending chapters.
  Evidence: commit `7b6bf33`.
- T5 [D2,D5] `feat(editorial)`: real reading/chronology content, pending states, distinct
  layouts. Evidence: commit `87a86c2`.
- T6 [D5] Verification: production build, typecheck, focused Playwright on the touched specs,
  branch scope audit. Evidence on branch tip `87a86c2`: `next build` exit 0 (compiled 1.8s,
  TypeScript 8.4s, 8 prerendered paths); `tsc --noEmit` exit 0 with zero output; focused
  Playwright 25 tests on an isolated 3001 production server, 23 passed, 2 failed — both the
  team-scope asserts listed below. Branch scope: 16 files, +549/-34, and the three excluded
  files confirmed absent from the diff.
- T7 [D8] Realign the two stale team asserts without touching the copy. Evidence: 25/25 focused
  tests green on branch tip; the demo test now asserts nine distinct profile names with a real
  bio each instead of the removed `ficticios` string, and the shell test asserts nine
  `.profile-name` nodes instead of an array of `Perfil ficticio`.

## Reconciliation with the stash

Every carried file was byte-identical to its `stash@{1}` (tracked) or `stash@{1}^3` (untracked)
counterpart, checked with `git hash-object` before committing. The only intentional deltas are
`components/demo-media.tsx` (podcast lines held back until T3), `content/editorial.ts` (no
`continuationReasons`, `portals` untouched), `components/section-content.tsx` (equipo untouched)
and `app/globals.css` (7 of 68 lines).

## Known debt carried forward (not fixed here)

- `Lorem Ipsum` remains visible in the podcast notice and the comic cover (D4).
- The home keeps its eight stacked portal sections and placeholder portal descriptions (D1).
- The nine team bios keep the current copy (D8).
