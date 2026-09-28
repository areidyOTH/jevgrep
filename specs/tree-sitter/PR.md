## Performance Improvement

Replace the Pyodide interpreter with `web-tree-sitter` and pinned official Python, Go and Rust WASM grammars. A fresh Python search no longer boots CPython in WebAssembly. The grammar assets and licenses ship in the CLI archive; installation and searches need no Python, native compiler, grammar downloads or install scripts. TypeScript/JavaScript keep their existing compiler parser.

Go and Rust gain named declaration selection and declaration indexes in large-file role previews. Python retains query previews, structural neighbours and inherited-method reading leads; those extra analyses remain Python-specific. This adds two languages, not automatic support for every Tree-sitter grammar.

Go/Rust trade-off: their candidates now use the serial parser worker instead of plain-text splitting. In three fresh-process Rust trials, 1,500 functions took 618 ms cold / 65 ms warm versus 423 ms / 1.9 ms for the old text fallback, with about 106 MiB worker RSS (100 functions: 70 MiB). Every expected function name and exact source slice passed. This establishes richer structure, not improved search recall or a speedup over text chunking. C still uses plain-text fallback. [Raw results and reproduction scripts](https://github.com/areidyOTH/jevgrep/tree/perf/tree-sitter/specs/tree-sitter/c-rust).

Five paired fresh-process trials against upstream `2dc1d3c`, with identical output hashes:

| Python fixture | Cold inspection before → after | Warm inspection before → after |
|---|---:|---:|
| 100 declarations | 2809.2 → 541.3 ms | 7.98 → 6.94 ms |
| 1,500 declarations | 2403.2 → 740.6 ms | 89.55 → 81.93 ms |

Cold inspection includes source-module import and worker initialization, but excludes Node/container launch. These synthetic local measurements establish lower cold latency, not a universal warm-parsing or full-search speedup. Warm medians are workload-dependent and do not establish a general warm-parsing speedup. The unchanged TypeScript control, raw trials, worker memory measurements, image/source identities and reproduction command are in [the measurement report](https://github.com/areidyOTH/jevgrep/blob/perf/tree-sitter/specs/tree-sitter/RESULTS.md).

Validation: 173 source checks and all 41 installed-package scenarios pass in Docker, including real Go/Rust declaration requests and returned locations, large-file role previews, Python helper parity, cancellation/recovery, and missing/corrupt packaged assets. Core/CLI typechecks pass. Lint has no errors and one pre-existing filesystem control-regex warning. Tests use a local fake provider; no paid provider calls were made.

Compatibility: Tree-sitter recognizes syntax rather than validating CPython semantics, and accepts newer Python constructs. Bare-CR Python files use lossless text fallback because retrieval uses LF coordinates; CRLF structural parsing is tested. macOS/ARM and live-provider search quality were not evaluated. This PR is independent of the unsubmitted parser-cache/calibration work and overlaps #23's runtime-packaging changes; whichever lands second needs a rebase.

Independent review findings and their fixes are recorded in [the review disposition](https://github.com/areidyOTH/jevgrep/blob/perf/tree-sitter/specs/tree-sitter/REVIEW.md).

Fable-review follow-up validation: all nine retained proposals combined on upstream `2dc1d3c` passed 192 source checks, core/CLI typechecks, and all 41 installed scenarios. The local integration excludes superseded #18 and resolves the #23/#27 packaging conflicts; these totals describe that combined integration, not separate full-suite runs of every PR. No paid provider calls were made.

Written by gpt-6-astra and independently checked with Codex (gpt-5.6-sol).
