# Reservas en rojo: game orientation and immersive exit
Objective: make the embedded Pulso Piura game usable on phones held sideways and stop overlaying controls on it while expanded.
Scope: `components/game-embed.tsx`, `components/game-embed.module.css`, `tests/special.spec.ts`, new mobile spec.
Runner: Playwright + TypeScript (dev server on 127.0.0.1:3000, Edge channel).

## Specs
S1. "Cuando estoy en movil, si giro el celular horizontalmente ... el juego queda cortado, aqui deberia ponerse en horizontal y a la vez abrirse como si abriera el 'ampliar el juego'." Rotating a phone to landscape must expand the game the same way the button does instead of showing a cropped frame.
S2. "En celular, cuando clickee sobre ampliar el juego, dentro del juego debe desaparecer el boton de reducir el juego, el usuario tendra que retroceder con sus botones nativos del celular si quiere salir." While the game is expanded on a touch device, the stage must not render the resize control; the native back gesture is the documented way out.
S3. Existing desktop behaviour stays: the control is visible in fullscreen, `aria-pressed` reflects the real state, and a refused Fullscreen API call never reports success it does not have.

## Decisions
D1. The landscape trigger is gated to touch pointers, short landscape viewports and a game stage that is at least half visible, so rotating while reading another section never hijacks the screen. Chosen over an unconditional orientation listener.
D2. Fullscreen is requested first and best effort. iOS Safari has no element fullscreen and rotation carries no user gesture, so a CSS overlay filling the viewport is the fallback; it is visually the same layout as native fullscreen.
D3. The overlay pushes one history entry and pops it on exit, so the native back button closes the game instead of leaving the page (S2).
D4. The reduce control and the external link are hidden only for `(hover: none) and (pointer: coarse)` while expanded, keeping the desktop escape hatch.

## Tasks
- T1 [S1,S2] inline | verified, uncommitted | landscape auto-expand, overlay fallback, hidden controls on touch, history exit, inline short-landscape sizing.
- T2 [S1,S2,S3] verify | verified, uncommitted | `rtk tsc` clean; `tests/game-mobile.spec.ts` (2/2) and `tests/special.spec.ts` (6/6) green on the dev server; full dev suite green except 3 load-flaky tests (WebP fetch, audio rejection, gamification teardown) that pass in isolation.

## Evidence
E1. Emulated Pixel 7, game in view, rotate to landscape: headless Edge enters native fullscreen, iframe box 915x412 (98% of viewport height), no reduce button and no external link in the accessibility tree; rotating back to portrait restores the inline stage and `aria-pressed="false"`.
E2. `requestFullscreen` stubbed to reject: expanding yields `[data-overlay="true"]`, the iframe fills the viewport, `page.goBack()` and `Escape` both close the overlay and keep the URL, `document.body.style.overflow` returns to empty.
E3. Screenshots: expanded landscape renders the game's menu at full size (no crop); landscape inline fallback renders the game unscaled inside a near viewport-height frame; portrait shows the game's own rotate prompt with both site controls visible.
E4. Not run: `next build`, because `next dev` is serving 127.0.0.1:3000 and a build would overwrite its `.next`. No commit or push performed.

## Log
L1. Request (verbatim):
1. Cuando estoy en movil, si giro el celular horizontalmente como se ve aqui mejora2.jfif el jeugo queda cortado, aqui deberia ponerse en horizontal y a la vez abrirse como si abriera el "ampliar el juego".
2. En celular, cuando clickee sobre ampliar el juego, dentro del juego debe desaparecer el boton de reducir el juego, el usuario tendra que retroceder con sus botones nativos del celular si quiere salir: mejora1.jfif.
