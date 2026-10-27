# Reservas en rojo

A Spanish multimedia editorial prototype built with Next.js App Router and TypeScript. The supplied documentary and six original photos remain distinct from the explicitly fictional demonstration content.

## Run locally

Use Node 22+. Install with `npm ci` only when dependencies are missing.

- Development: `npm run dev -- --port 3002 --webpack`.
- Production build: `npm run build -- --webpack`.
- Production preview: `npm start -- --port 3003`.
- Typecheck: `npm run typecheck`.
- Browser tests (PowerShell): `$env:TEST_URL='http://127.0.0.1:3003'; npm test -- --timeout=90000`.

Tests use installed Microsoft Edge. Port 3000 may belong to another project. No accounts, backend, environment variables or publication are required for the local prototype.

## Content and routes

The cover links to seven independent, reloadable routes:

| Route | Content |
| --- | --- |
| /reportaje | Original click-loaded privacy-enhanced YouTube embed; no autoplay |
| /comic | Fictional three-page SVG comic with page buttons, arrow keys, zoom and accessible modal |
| /podcast | Actual playable synthetic Spanish audio, download and exact transcript |
| /participa | Three-question quiz based on the supplied presentation |
| /cronologia | Five clearly fictional narrative milestones |
| /lectura | Five-part fictional editorial reading with an index |
| /equipo | Exactly nine fictional profiles with illustrated avatars, roles and sample bios |

All mocked stories, voices, profiles and events are labeled as demonstration material, not evidence or the real team. Original photos are not attributed to fictional people. Replace the fixtures with verified editorial material before publication; do not remove the disclosures prematurely.

- Original copy and quiz: `content/editorial.ts`.
- Fictional fixtures: `content/demo.ts`.
- Audio/transcript source: `content/demo-podcast.json`.
- Regenerate the WAV on Windows: `./scripts/create-demo-audio.ps1` (requires the already-installed Microsoft Helena Spanish voice). It uses no external voice service.

## Motion and accessibility

The owner explicitly approved the original full choreography as the automatic default, including in browsers reporting reduced motion. No automatic gentle replacement is applied. This is a site-specific prototype policy, not a device-setting change. The fully labeled footer control pauses/restarts all animation; an explicit pause choice is remembered for the current browser tab. Review this presentation policy before a public accessibility release.

Entrances distinguish title, photographs, text and rows. IntersectionObserver triggers each registered element once; MutationObserver catches content streamed after route changes. Pausing cancels active effects and reveals pending content. Without JavaScript, content stays readable. Native scroll timelines progressively add photo drift and reading progress without scroll hijacking.

The footer return link runs on every same-page activation, even with an unchanged hash, preserves cross-page and modified-click navigation, and uses instant scrolling in paused mode. Playwright enables native smooth scrolling explicitly for deterministic Edge tests.

## Assets and presentation

The official JPEG remains unchanged. `public/media/logo-transparent.png` is an owner-authorized deterministic alpha-mask extraction, preserving dimensions and all RGB samples. Reproduce it with `node scripts/remove-logo-background.cjs`. Its bag highlights and drop reflection are retained; exterior paper and letter counters are transparent. Both placements use light backgrounds.

Photographs use WebP derivatives and Next Image. A dedicated image-only clipping frame prevents parallax transforms from painting into captions, which retain a 16px gap and comfortable line height.

Montserrat is self-hosted under `public/fonts/OFL.txt`. TasteSkill direction: name-as-monument, seed 372704318; the official palette and type remain unchanged. Social icons are accessible but intentionally noninteractive until official Facebook/Instagram URLs are supplied.

## Publication boundary

Nothing is committed, pushed or published automatically. Search indexing stays disabled while the prototype contains fiction and real credits/sources remain incomplete. Set SITE_URL only for an explicitly authorized deployment. A brief real-provider smoke test confirmed playback from 0:01 to 0:03 of 6:49. Full-film playback has not been manually verified.

Current measured verification and performance findings belong in AUDIT.md and PERFORMANCE.md. Historical audit entries must not be mistaken for current results.

## Custom documentary controls

The original YouTube-hosted film now has site-styled playback/pause, seek, real elapsed/duration, mute/volume and fullscreen controls outside the provider viewport. The iframe and official API script are loaded only after an explicit poster click. The site requests playback only in response to that click; browser autoplay restrictions may require pressing the custom play button again. API state/error events drive the controls; polling runs only while playing or buffering and is cleaned up with the player on route departure.

The privacy-enhanced iframe uses controls=0, enablejsapi=1, playsinline and the actual page origin. No overlay, crop, deprecated modestbranding parameter or branding-removal trick is used. YouTube can still display provider marks, ads or notices. A fully independent native player would require an authorized original video file; none was supplied. Loading failures expose the original watch link rather than simulated playback.

Official references: https://developers.google.com/youtube/iframe_api_reference and https://developers.google.com/youtube/player_parameters and https://developers.google.com/youtube/terms/required-minimum-functionality. Deterministic API-contract tests prove custom controls, errors/fullscreen exit and cleanup; they are not evidence of actual YouTube delivery. The comic reader now replaces its final Next action with Close and restores trigger focus.
