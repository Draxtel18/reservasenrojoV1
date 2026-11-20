# Reservas en rojo: real comic integration

Objective: replace the fictional three-page demo comic with the real 10-page comic "Los vampiros" (provided as `COMIC LOS VAMPIROS.pdf`) and deliver a readable, responsive reader. Branch: `feat/comic-real-cover` (from `master`).
Delivery: ask-on-risk. Runner: Playwright (`msedge`) + TypeScript + Next production build + Chrome DevTools visual review.

## Specs
S1. "En el apartado del comic, necesito que incorpores el comic real ubicado en: COMIC LOS VAMPIROS.pdf. Abre chrome y verifica su correct visibilidades desde moviles, pc y otros dispositivos, asi como un buen UX/UI."
S2. Supplied asset is authoritative: 10 portrait pages, 476.22 x 734.17 pt, image-only (no text layer). Real title: "Los vampiros — Una red de sangre, impunidad y engaños en Piura". No invented credits; author/credit lines stay pending like the rest of the prototype.
S3. Previous S10 demo material stays a fallback for podcast/team/article only. Fictional comic story "La espera" is removed together with its SVG art.

## Decisions
D1. Pages rendered with mupdf at scale 4 (1905 x 2937 px) and encoded to WebP quality 80 (6.42 MB total across 10 pages). Per-page 20 px WebP LQIP stored in `content/comic.ts` for `placeholder="blur"`.
D2. Reader is a full-screen native `dialog` (dark chrome) with fit-to-viewport default, optional full-width reading mode on wide viewports, page rail, swipe, keyboard, resume progress and adjacent-page prefetch.
D3. `content/comic.ts` owns title, subtitle, page sources, dimensions, alt text and blur placeholders. Alt text describes each page's panels in Spanish.

## Tasks
- T1 [S2] assets | done | `public/comic/los-vampiros/01..10.webp` + `content/comic.ts` metadata.
- T2 [S1,D2] implementation | `components/comic-reader.tsx` + `components/comic-reader.module.css`; cover figure, reader dialog, page rail, zoom mode, gestures, keyboard, resume, prefetch, noscript fallback.
- T3 [S1,S3] wiring | replace demo comic in `components/section-content.tsx`, `app/page.tsx`, `content/editorial.ts`, remove `comicPages`/`ComicArt`/`DemoComic` from `content/demo.ts` and `components/demo-media.tsx`, retire legacy `.comic-cover` global rules.
- T4 [S1] tests | rewrite comic assertions in `tests/demo.spec.ts`, `tests/media-experience.spec.ts`, `tests/special.spec.ts`, `tests/video-player.spec.ts`, `tests/portal.spec.ts`, `tests/identity.spec.ts` against the real reader.
- T5 [S1] verification | typecheck, production build, full Playwright suite, Chrome DevTools review at 390x844, 768x1024, 1440x900, 1920x1080 with screenshots and no horizontal overflow.
