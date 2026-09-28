# Tree-sitter replacement

Baseline: upstream 2dc1d3c. This PR is independent of the unsubmitted parsed-reuse/calibration branches.

Replace the Python WebAssembly interpreter with the official web-tree-sitter runtime and pinned Python, Go and Rust grammar WASM files. Keep the existing TypeScript/JavaScript compiler parser. Ship grammar assets with the CLI; no grammar downloads or native build on user machines. Preserve worker cancellation, byte coordinates, Python preview/neighborhood/call-lead behaviour, and setup-error handling. Tree-sitter syntax recognition is not CPython semantic validation; explicitly test and document changes in syntax support.

Measure five fresh-process repetitions per arm of Python cold first inspection and warm repeated inspections, with fixed synthetic small/large files and output comparisons. Record all runs, median times and RSS; no provider calls. Confirm Go/Rust named declaration extraction, byte coordinates, syntax fallback and packaged search results with a local fake provider. Passing speed claims require measured reduction on the named workload; report regressions rather than generalizing. Run full source and installed suites, type/lint checks and independent review before publishing.

## Development findings

The first five-trial cohort improved Python startup but regressed median warm
inspection by 10–18%. A separate prototype replaced a JavaScript walk of every
syntax node with a Tree-sitter query selecting only nodes relevant to syntax
policy. Its local helper median improved from 8.1 to 4.5 ms (100 declarations)
and 88.2 to 50.4 ms (1,500). Those are development diagnostics, not final claims.
Keep the unchanged baseline cohort and run five fresh-process confirmations of
the final candidate, with the same fixture and resource limits.
