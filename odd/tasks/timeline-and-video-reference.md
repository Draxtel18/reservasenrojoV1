# Documentary reference update and sourced chronology

Objective: point the documentary at the new video and replace the placeholder chronology entries with
the 17 milestones of the supplied timeline image. Branch: `feat/reader-experience` (baseline
`20062ad`). Origin: two user requests in one message.

## Requirements

- **R1. New video reference.** `https://www.youtube.com/watch?v=-KErtns1Jv0` replaces the previous
  id `w7axbt3LLbg`. The id lives only in `content/editorial.ts`; the embed, the external link and the
  progress key all derive from it.
- **R2. Sourced chronology.** `timelineNotes` carries the supplied timeline instead of the five
  project-navigation entries. The intro copy stops claiming the section is not a chronology of facts,
  because it now is one, and states where the data came from.

## Decisions

- **D1. Faithful transcription, no invention.** Every body text is copied from the supplied image.
  Row 1 carries its own bold heading in the image; rows 2 and 3 carry only a year and a sentence, so
  their `title` values are short editorial labels derived from that sentence, never new claims.
- **D2. Year becomes the label.** The component renders `label` in `.timeline-date`, so the year goes
  there and the heading goes in `title`.
- **D3. No commit.** The user has not authorized a commit for this task; the change stays in the
  working tree.
- **D4. Historical notes untouched.** `odd/tasks/multimedia-special.md` and
  `.taste-skill/custom-player-final/report.json` keep the old id as a record of past work.

## Supplied milestones (17)

| Year | Title | Text |
| --- | --- | --- |
| 1818 | Primera transfusión humana exitosa | El inglés James Blundell realizó la primera transfusión de sangre humana. |
| 1901 | Descubrimiento de los grupos sanguíneos | El austriaco Karl Landsteiner logró identificar los grupos A, B y O. |
| 1914 | Conservación de sangre | Se utiliza citrato de sodio para evitar la coagulación y facilitar el almacenamiento. |
| 1937 | Primeros bancos | Se crea uno de los primeros bancos de sangre en Chicago, Estados Unidos. |
| 1943 | Primer banco de sangre en el Perú | Se fundó el primer banco de sangre en Perú, en el hospital 2 de mayo. |
| 1948 | Donación voluntaria y organizada | Se impulsa la donación voluntaria y organizada de sangre globalmente. |
| 1952 | Bolsas plásticas | Se implementan las bolsas plásticas para almacenar la sangre. |
| 1975 | Del vidrio al plástico | Las bolsas de plástico se generalizan en lugar de las botellas de vidrio. |
| 1985 | Detección del VIH | Se inicia el análisis de sangre donada para detectar el VIH. |
| 1990 | Detección de hepatitis C | Se incorpora la detección de hepatitis C en las donaciones. |
| 2004 | Día mundial del donante | Se establece el 14 de junio como el día mundial del donante de sangre. |
| 2005 | Servicios de donación y transfusión | Se fortalecen los servicios de donación y transfusión. |
| 2017 | Veinte bancos de sangre en el Perú | Sistemas Analíticos instaló 20 bancos de sangre en Perú y tamizó más de 380 mil bolsas. |
| 2023 | Donantes aptos | Se registraron 1,100 donantes aptos para donaciones de sangre. |
| 2024 | Composición de las donaciones | De 2,514 donantes, el 19% fue voluntario y el 80.1% por reposición. |
| 2025 | Unidades recaudadas | Se recaudaron 382,586 unidades; faltan 242,162 para cubrir la demanda de 624,748. |
| 2026 | La donación voluntaria salva vidas | La donación voluntaria salva millones de vidas mediante bancos de sangre y campañas. |

## Tasks

- T1 [R1] Update the documentary id and every test that pins it. Evidence: `documentary.id` is
  `-KErtns1Jv0`; six storage-key sites, one href and one embed regex updated; no source file still
  contains `w7axbt3LLbg`.
- T2 [R2] Replace `timelineNotes` and the chronology intro with the supplied data. Evidence: 17
  entries verified by count and by reading against the image; every distinctive figure (`80.1%`,
  `382,586`, `242,162`, `624,748`, `1,100`, `380 mil`, `2,514`) appears exactly once.
- T3 [R1,R2] Verification. Evidence: `tsc --noEmit` exit 0; `next build` exit 0 on the second run
  (the first aborts on the Next 16.4.3 security advisory only, pre-existing and unrelated); 18/18
  focused Playwright tests green after a RED of 7 failures against the stale build. Visual check via
  headless Edge: all 17 `.demo-timeline-item` reach `data-motion-state="visible"` with opacity > 0.9,
  and at mid-scroll the figure sits at `y: 130` fully inside the 900px viewport, so the sticky column
  still works with 17 entries and produces no empty band.

## Orthographic normalizations

Three deliberate deviations from a literal transcription, all spelling rather than content: the image
writes `A, B, y O.` and Spanish drops the comma before `y`; it writes `14 de Junio` and months are
lowercase; and `(624,748)` became `de 624,748`. No figure, name, place or year was altered.

## Known side effect

The device-local video progress key is `video-${documentary.id}`, so it becomes
`reservas:progress:v1:video--KErtns1Jv0` (double hyphen). It is internal and harmless, and it resets
any saved position once, which is correct for a different film.
