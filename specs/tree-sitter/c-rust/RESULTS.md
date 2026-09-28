# C and Rust follow-up results

Published PR #27 (1493eaa), unchanged, versus upstream 2dc1d3c. Three fresh processes per case; medians of cold time and per-process median warm time. Synthetic fixtures, not real-world search-quality measurements.

| Language | Functions | Cold before → after (ms) | Warm before → after (ms) | Named functions before → after | Candidate worker RSS (MiB) |
|---|---:|---:|---:|---:|---:|
| rust | 100 | 441.5 → 531.0 | 0.26 → 5.80 | 0 → 100 | 70.3 |
| rust | 1500 | 423.1 → 618.1 | 1.94 → 65.17 | 0 → 1500 | 105.9 |
| c | 100 | 414.5 → 412.6 | 0.24 → 0.25 | 0 → 0 | no worker |
| c | 1500 | 417.2 → 428.0 | 1.70 → 1.74 | 0 → 0 | no worker |

Rust gains structural output: every expected function name and exact original CRLF/Unicode source slice passed. Its baseline is plain-text splitting, so these costs are not an apples-to-apples parser speed comparison. C remains unsupported structurally; both versions returned lossless plain-text fallback. Timing differences for C are control noise, not evidence of a parser improvement.

The existing six language regression tests also passed, covering Rust impl ownership, attributes, modules, traits, foreign declarations, raw names, syntax fallback and size fallback (plus Go coverage). These tests do not establish improved end-to-end search recall or exhaustive Rust language support.

Cold time includes module import and first inspection, but excludes container/Node launch. Warm time is ten inspections with fresh snapshot objects and an already initialized worker. RSS is sampled worker memory, not total application memory or peak worker usage. No C grammar was installed, no production files changed, no GitHub updates, and no Jev/provider calls occurred. Raw measurements and runnable scripts are alongside this report.
