# Compact fullscreen HUD and provider captions toggle

Objective: shrink the fullscreen control HUD so the film gets more room, and add a real subtitles
toggle to the documentary. Branch: `feat/reader-experience` (baseline `20062ad`). Origin: two user
requests.

## Requirements

- **R1. Compact fullscreen HUD.** In fullscreen the restart control, the status line and the control
  row currently eat vertical space the film needs. They must get visibly smaller while staying
  operable and readable.
- **R2. Subtitles toggle.** A control that turns the documentary's captions on and off.

## Decision on transcription (user question "can you transcribe the video?")

**No, not reliably, and the toggle must not pretend otherwise.** Measured:

| Probe | Result |
| --- | --- |
| fetch the YouTube page for a transcript | refused: needs a signed-in Chromium session or `GEMINI_API_KEY` |
| `api/timedtext` for `es`, `es-419`, `es-PE`, `en` | 0 bytes each |
| `api/timedtext?type=list` caption inventory | empty |
| oEmbed | resolves correctly to "Reportaje: Reservas en rojo" by `@Reservasenrojo` |

No audio file was ever supplied either, so there is no honest local transcription path. Inventing a
transcript would violate the rule this repo already enforces in
`content/documentary-accessibility.ts` (`reviewed: false`, empty chapters and cues, page states the
pending status).

**Therefore R2 drives the provider's own caption module through the IFrame API**, which is the only
real caption source: `getOption('captions','tracklist')` to discover tracks,
`setOption('captions','track',{languageCode})` to enable, `unloadModule('captions')` to disable. When
the video exposes no tracks the control reports that state instead of faking subtitles, and
`documentaryAccessibility` stays empty and unreviewed.

## Tasks

- T1 [R1] Compact the fullscreen HUD. Evidence: pending.
- T2 [R2] Captions toggle over the provider module, including the honest no-tracks path. Evidence:
  pending.
- T3 [R1,R2] Verification: typecheck, build, focused Playwright, and a real fullscreen screenshot.
  Evidence: pending.
- T4 Commits. Evidence: pending.

## Constraints

- `content/documentary-accessibility.ts` is NOT touched: it stays `reviewed: false` and empty. No
  invented timestamps or cue text.
- Caption calls are optional on the `VideoPlayer` interface so existing fixtures and the no-caption
  provider fixture keep typechecking.
