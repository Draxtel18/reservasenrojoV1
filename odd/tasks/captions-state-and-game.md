# Caption state detection and the project game

Objective: make the subtitles button reflect the provider's real caption state, and replace the
quiz in `/participa` with the project's actual game. Branch: `feat/reader-experience` (baseline
`fad904b`).

## Requirements

- **R1. The captions toggle must start from the truth.** The user reports that YouTube plays the
  film with subtitles already on, so the button showed "Activar subtítulos" while they were active
  and the first click did nothing visible.
- **R2. `/participa` is a game, not a quiz.** Embed
  `https://yeicotjj.github.io/gamificacion-donar-sangre/` ("Donación de sangre · Salva vidas, decide
  bien").

## Root cause of R1

`readCaptionTracks()` reads `getOption('captions', 'tracklist')`, which reports which tracks
**exist**. It never reads `getOption('captions', 'track')`, which reports which track is
**currently active** (`{}` when captions are off). With `cc_load_policy` unset the embed honours the
viewer's YouTube preference, so captions can already be on before the button is ever pressed. The
component therefore initialised `captionsOn` to `false` and the first click attempted to turn
captions *on* — a no-op.

## Decisions

- **D1. Detect, never force.** Read the active track after ready and again when playback starts, and
  only ever *raise* `captionsOn` from the provider. A deliberate user disable is never overwritten by
  a later read that reports nothing.
- **D2. No `cc_load_policy`.** Setting it would force captions on and contradict the toggle.
- **D3. The game is embedded, not rebuilt.** The embed is verified safe: HTTP 200 and no
  `X-Frame-Options` from GitHub Pages. It runs `loading="lazy"` with a real `title`, and the section
  states plainly that the content lives on an external site so nobody mistakes it for editorial
  material.
- **D4. Honest copy only.** The section heading comes from the game's own `<title>`
  ("Salva vidas, decide bien"). No mechanic is described that was not verified — the page could not
  be read server-side, only its title.
- **D5. Quiz retired from the page, data kept.** `components/interactions.tsx` and
  `content/editorial.ts`'s `questions` export stay in the tree unused; removing them is separate
  cleanup.

## Requirements (second round, user feedback)

- **R3. The game must be the protagonist of its section.** The side photograph competed with it; it had to go and the two-column grid with it.
- **R4. Enlarge control and an adaptive frame.** The game must be enlargeable, and in normal view it must not force scrolling: the size adapts to the viewport.

## Tasks

- T1 [R1] Read the active caption track and initialise the toggle from it. Evidence: RED observed
  (the button was never reachable as "Desactivar subtítulos"), then GREEN. The new test asserts both
  halves: detecting an active track must NOT call `setOption` again, and turning it off must call
  `unloadModule('captions')` with `aria-pressed` back to `false`.
- T2 [R2,R3,R4] Replace the quiz with the game, drop the side photo, add the enlarge control.
  Evidence: `components/game-embed.tsx` is a client component with a `fullscreenchange`
  subscription and a try/catch that never fakes success; `#participa img` count is 0.
- T3 [R1,R2,R3] Verification. Evidence: `tsc --noEmit` exit 0; `next build` exit 0 on the second
  attempt (the first aborts on the Next 16.4.3 advisory only); 18/18 focused Playwright tests green
  across `special`, `demo` and `portal`.
- T4 Visual verification in headless Edge. Evidence: the game fits with **no internal scrollbars**
  at every size probed — inline 1377×684 at 1440×900, 350×608 at 390×844, and fullscreen where the
  whole title screen including the "Empezar" button is visible and `document.fullscreenElement` is
  non-null. `scrollWidth <= innerWidth` at 390 and 1440.
- T5 Commits. Evidence: pending, pending the user's instruction.

## Foreign edits found in the tree (not mine, not reverted)

`app/[section]/page.tsx` had its `detail-deck` copy changed to "Un proyecto transmedia sobre el
acceso a la sangre en Piura, Perú.", and the chronology intro lost its trailing ", según la línea de
tiempo proporcionada para el proyecto.". Neither string exists in `stash@{0}` or `stash@{1}`, and the
tree was clean at `fad904b` before this work. They appeared outside this session. The rule applied:
the test follows the copy, so `tests/demo.spec.ts` now asserts `Diecisiete hitos` instead of the
removed sentence.

## Test surfaces to reconcile

- `tests/special.spec.ts` — the quiz test becomes a game-embed test.
- `tests/portal.spec.ts` — the motion test interacts with the quiz; keep the motion assertions, drop
  the quiz interaction, rename the test.
- `tests/video-player.spec.ts` — the fixture must answer `getOption('captions','track')` and a new
  test must cover "already active, then disabled".
