# Reservas en rojo: podcast and reportaje escrito gated as "Proximamente"

Objective: temporarily close the Podcast and Reportaje escrito formats because their content is still mocked, and replace every entry point to them with a "Proximamente" marker plus an artistic 404 page. Branch: `feat/comic-real-cover` (working tree, uncommitted).

## Specs
S1. "Necesito que tanto la seccion de podcast como reportaje escrito, sus vistas individuales se bloqueen temporalmente. Desde el home, en vez de haber un boton para redirigir, debe existir un boton que diga proximamente. No puedo presentar datos mockeados."
S2. Decision D1: the cover keeps the card visible with a "Proximamente" pill. The card is not a link and is not focusable.
S3. Decision D2: the individual views answer with a real HTTP 404 rendered by an artistic, on-brand not-found page, not a redirect and not a 200 panel.
S4. Decision D3: the parent authors all user-facing copy.
S5. No route, navigation surface, or chapter link may reach a locked format. Mocked copy must not survive anywhere user-visible, including the home card for Reportaje escrito which still rendered Lorem Ipsum.

## Decisions
D1. A single source of truth in `content/editorial.ts` (`comingSoonFormats`, `isComingSoon`, `publishedSections`) drives the cover, the header, the footer, the format indexes, the chapter navigation and the route guard. Re-enabling a format is deleting one string.
D2. The locked routes leave `generateStaticParams` and also hit an explicit `notFound()` guard, so the 404 is server-rendered with a real 404 status.
D3. The 404 page is a format index of its own: live formats link, locked formats show the pill. A stale `/podcast` link therefore lands on a page that explains itself.
D4. Pending e2e coverage for the audio player stays in the suite as `test.fixme` (Playwright does not run it) with the reason recorded, so the coverage is restored, not rewritten, when the flag flips.

## Copy (authored by the parent, neutral Spanish, no en/em dashes)
C1. Pill: `Proximamente`.
C2. Podcast cover note: `Los episodios estan en produccion. La serie sonora se publica cuando las entrevistas esten editadas y su contenido verificado.`
C3. Lectura cover note: `El texto esta en verificacion de fuentes. El reportaje escrito se publica completo cuando el chequeo editorial este cerrado.`
C4. Lectura real description replacing Lorem Ipsum: `La investigacion completa en formato texto: el contexto de las emergencias, las familias que buscan sangre y el sistema que deberia garantizarla.`
C5. 404 eyebrow `Error 404`, heading `Pagina no encontrada`, lead `La direccion que buscas no existe o ya no esta disponible. La investigacion sigue abierta desde la portada.`, index heading `Formatos de la investigacion`, action `Volver a la portada`.
C6. C1 to C5 are verbatim, accents included. Keep the house rule of no en or em dashes in user-facing copy.

## Tasks
- T1 [S1,D1] content model | done | `content/editorial.ts`: `comingSoonFormats`, `isComingSoon`, `publishedSections`, `comingSoonNotes`, `comingSoonLabel`, `primarySections`; Lorem Ipsum description replaced permanently.
- T2 [S1,S2,D1] cover | done | `app/page.tsx`: locked portals render as static blocks with the pill and no anchor; `#formatos` index marks them instead of linking them.
- T3 [S1,S3,D2] route guard | done | `app/[section]/page.tsx`: locked sections call `notFound()`, `generateStaticParams` and the chapter navigation only use `publishedSections`.
- T4 [S1,S5,D1] navigation surfaces | done | `components/interactions.tsx` header, `components/site-shell.tsx` footer, reportaje format index in `components/section-content.tsx`.
- T5 [S3,D3] 404 page | done | `app/not-found.tsx` plus `app/globals.css`: dark editorial 404 with numeral watermark, live format index and locked pills.
- T6 [S1] tests | done | new `tests/coming-soon.spec.ts` contract plus updates in `tests/portal.spec.ts`, `tests/demo.spec.ts`, `tests/media-experience.spec.ts`, `tests/special.spec.ts`, `tests/editorial-experience.spec.ts`.
- T7 [S1] verification | done | typecheck, focused and remaining Playwright specs, production build, production 404 status, visual review at three widths.

## Evidence
- RED before implementation: `npx playwright test tests/coming-soon.spec.ts` -> 3 failed, 1 passed. Failures: locked routes answered 200, locked cards still rendered `a.portal-link`, and `/` plus every published route still carried 7 `a[href="/podcast"], a[href="/lectura"]` nodes.
- GREEN after implementation: `npx playwright test tests/coming-soon.spec.ts` -> 4 passed.
- `npm run typecheck` -> clean.
- `npx playwright test tests/coming-soon.spec.ts tests/portal.spec.ts tests/demo.spec.ts tests/special.spec.ts tests/editorial-experience.spec.ts tests/media-experience.spec.ts` -> 26 passed, 5 skipped, 0 failed (skipped = 1 `demo.spec.ts` and 4 `media-experience.spec.ts` podcast audio tests marked `test.fixme`).
- `/podcast` and `/lectura` served over HTTP -> 404 rendered by `app/not-found.tsx`.
- 404 page at 1440x900 and 390x844: `document.documentElement.scrollWidth <= innerWidth`, and the heading rect and the `404` numeral rect do not intersect (overlap area 0) at both widths.
- Header navigation while `lectura` is locked shows `Reportaje` and `Equipo` (the `Reportaje escrito` entry comes back only by removing it from `comingSoonFormats`).
- Post-merge re-run (the owner committed the comic work and fast-forwarded `master` during the task): `npx playwright test tests/coming-soon.spec.ts tests/portal.spec.ts` -> 12 passed against the current tree.
- Remaining specs not touched by the change: `npx playwright test tests/identity.spec.ts tests/motion.spec.ts tests/video-player.spec.ts tests/game-mobile.spec.ts` -> 16 passed.
- Production build (`next build`, isolated copy so the running `next dev` kept `.next`): compiled successfully, TypeScript clean, 8 static pages, and `/[section]` prerendered only `/reportaje`, `/comic`, `/participa` and 2 more paths. `podcast` and `lectura` are absent from the prerender list by design.
- Production server (`next start`): `/` 200, `/reportaje` 200, `/comic` 200, `/podcast` 404, `/lectura` 404, `/seccion-inexistente` 404. The `/podcast` response carries the not-found heading, zero `Lorem Ipsum` and zero `href="/podcast"` self links; the cover carries zero `Lorem Ipsum`.
- Visual review at 1440x900, 1920x1080 and 390x844: the `404` numeral rect ends at x=1408 inside a 1440 viewport (not clipped), the heading has `clip-path: none` once the entrance animation settles, and `scrollWidth == innerWidth` at every width.
- Commits: `55b1343` feat(formatos): bloquea podcast y reportaje escrito con aviso de proximamente y 404 editorial, delivered on `feat/coming-soon-formats`, fast-forwarded into `master` and pushed to `origin/master`. The two `git status` entries under `.atl/` are harness output and stay out of the commit.
