# Production performance audit

## Decision

The measured prototype does not justify a broad architectural rewrite. The clearest optimization opportunities are font delivery globally and audio encoding on the podcast route. This was a read-only audit: no dependency, font or audio-format changes were made.

## Method and limits

Fresh isolated Microsoft Edge contexts against the local webpack production build, cache disabled and network unthrottled. These are local diagnostic measurements, not Lighthouse scores, field Core Web Vitals or representative mobile timings. The seven format pages are statically generated; the cover is static.

## Measured payloads

| Resource | Observation | Priority |
| --- | --- | --- |
| Four Montserrat TTF files | 343,670 encoded / 724,860 decoded bytes per fresh sampled route | Highest global payload opportunity |
| Application JavaScript | 148,268 encoded bytes after the cover correction | No demonstrated major bundle problem |
| Shared demo chunk | 3,391 gzip bytes in the initial snapshot | Small optional server/client-boundary improvement |
| Podcast WAV | 3,779,178 bytes; metadata preload buffered 1MiB without playback | Highest route-specific opportunity |
| Initial optimized image bodies | Home 84,092; comic 12,252; podcast 34,218; team 12,252 bytes in initial snapshot | Existing Next Image/lazy loading are already useful |

The WAV was not requested on the sampled home, comic or team routes. Resource Timing reported zero body bytes for its suspended request; CDP network observations established the real 1MiB metadata buffering. Do not mistake the zero Resource Timing value for zero traffic.

## Recommended next changes and tradeoffs

1. **WOFF2 and language subsetting.** Preserve all requested font weights, the OFL license and Spanish glyphs. Measure actual savings and compare visual fidelity after conversion; no saving percentage is asserted before encoding.
2. **Compressed podcast playback source.** Retain WAV as the downloadable original, provide a browser-compatible compressed source and verify speech intelligibility/transcript alignment. Changing preload to none would avoid eager metadata buffering but delay duration display.
3. **Optional small boundary cleanup.** Static comic-cover/podcast markup can move out of the shared client module, but its measured demo chunk is only 3.4KB gzip. Team names and article fixtures were not found indiscriminately shipped in that chunk.
4. **Observer batching only if profiling warrants it.** Twenty synthetic separate DOM mutations caused twenty scans over34targets. No measured frame-drop or real workload bottleneck was established, so avoid an urgent speculative rewrite.
5. **No runtime rewrite for the JSX branch map.** SectionContent constructs all seven branches before selection, but those pages are SSG; the cost belongs primarily to prerender/build time, not repeated browser rendering.

Single-machine long-task samples ranged from60to169ms across sampled routes. They identify possible investigation points, not a proven field bottleneck. Measure real devices before setting production performance budgets.

## Verification and remaining limitation

The production build, typecheck and full19-test suite passed before the bounded CSS correction. The corrected build/typecheck and new cover regression also passed; the parent repeated that production regression. All sampled1440/768/390 views had no overflow, broken assets or page errors. Photo captions retain16pxseparation.

The corrected comic cover has5.722:1 text contrast and43.2/30/30px title sizes. The visual inspector still reports1FAIL/2WARN: it classifies the small cover masthead above the comic title as an eyebrow. No-footage-on-cover and transient animated-frame warnings remain. This result is not presented as a clean visual gate; removing the masthead or accepting the cover-art exception needs the user's decision after the bounded correction budget.

Raw evidence is retained under .taste-skill/completion-final/ (ignored generated reports/screenshots). The user-facing workspace remains on127.0.0.1:3002; the independently built production snapshot is on3003. No publication or commits were performed. Formal native review remains pending its intended-untracked inventory selection; no fresh native approval is claimed.

## S12 scope note

The owner subsequently approved restoring full default choreography; the automatic gentle variant was removed. Existing animation frames and durations were preserved. Production build/typecheck and20regressiontests passed for that restoration. Payload measurements above are the earlier read-only snapshot, not fresh post-S12 byte counts. No optimization refactor was performed.
