# Tree-sitter replacement results

Performance Improvement

Fixed baseline: upstream `2dc1d3c`. Five fresh processes per arm/workload,
interleaved before/after in Docker (Linux/amd64, Node 22, two CPUs, 2 GiB,
network disabled). Each process measures the first production `inspect()` call
and ten subsequent calls on new snapshots. No provider calls were made.

Cold time includes importing the source module and starting the parser worker;
it excludes container/Node process launch. Warm time is the median of ten calls,
then the median across five processes. These are local inspection measurements,
not end-to-end search latency. Output SHA-256 hashes match between arms for every
fixture. The source files contain Unicode comments and function bodies.

| Language | Declarations | Cold before → after (ms) | Cold reduction | Warm before → after (ms) | Warm change |
|---|---:|---:|---:|---:|---:|
| python | 100 | 2809.2 → 541.3 | 80.7% | 7.98 → 6.94 | -13.0% |
| python | 1,500 | 2403.2 → 740.6 | 69.2% | 89.55 → 81.93 | -8.5% |
| typescript | 100 | 463.6 → 470.8 | -1.6% | 7.42 → 7.56 | +1.9% |
| typescript | 1,500 | 637.8 → 652.5 | -2.3% | 32.10 → 36.73 | +14.4% |

Negative warm change means faster. TypeScript is unchanged and is included as a
noise/control workload; its fluctuations are not attributed to Tree-sitter.
The supported performance claim is lower cold Python inspection latency.
Earlier cohorts included warm regressions, and the unchanged TypeScript control
also fluctuates. Treat warm differences as noisy, not a general speedup.

| Python declarations | Worker RSS before → after (MiB) |
|---|---:|
| 100 | 150.0 → 71.0 |
| 1,500 | 176.9 → 101.8 |

Worker RSS is a Linux `/proc` snapshot after the repeated inspections, not peak
whole-search memory. Parent peak RSS is retained in the raw data separately.

## Language support and correctness

Python uses Tree-sitter; TypeScript/JavaScript retain their compiler parser.
Go and Rust now provide named declarations. Tests cover Go functions, receivers,
types, variables, constants and grouped specs; Rust functions, impls, traits,
modules, attributes and foreign declarations. Installed tests assert that large
Go/Rust files send named declarations in role previews and selection requests,
and return their locations. This proves structural coverage, not language-server
semantics, provider accuracy or support for every Tree-sitter grammar.

Python-specific preview, neighbourhood and inherited-call analyses remain
Python-specific. Frozen test-only Python helpers check compatible outputs.
Modern Python syntax is accepted; Tree-sitter is not a CPython semantic validator.
Bare-CR Python uses lossless text fallback; LF and CRLF structural parsing work.
Missing/corrupt packaged assets fail closed; no runtime parser downloads, Python
installation, native compiler or repository-source execution is required.

## Reproduction and evidence

Create a separate clean checkout at `2dc1d3c`, then from this branch run:

```sh
python3 test/parser/run-tree-sitter-bench.py /path/to/baseline > specs/tree-sitter/assets/confirmation.jsonl
python3 specs/tree-sitter/summarize.py
```

The runner builds both actual source images and records image identities and
candidate source hashes. Both use exactly the same benchmark script. It rejects
output mismatches and unsupported benchmark language labels.

[Final raw data](assets/confirmation.jsonl),
[initial cohort](assets/development.jsonl), and
[query-development confirmation](assets/query-confirmation.jsonl), and
[pre-review confirmation](assets/pre-review-confirmation.jsonl) retain all
recorded trials. The initial implementation improved startup but regressed warm
inspection; syntax-node filtering was revised before final confirmation.
See [review disposition](REVIEW.md) and [validation](VALIDATION.md).

Limits: synthetic inspection fixtures; no paid/live-provider evaluation, macOS,
ARM, full repository search-latency benchmark, or integration with the separate
unsubmitted calibration/parsed-reuse branches. Packaging changes overlap the
previous runtime-bundling PR and will need rebasing if that lands first.

## Go/Rust scope and cost

Go and Rust gain structural parsing through the serial parser worker, where the old version only split text. This is added work, not a parsing speedup over that fallback. In the [Rust/C follow-up](c-rust/RESULTS.md), 1,500 Rust functions took 65.17 ms warm versus 1.94 ms for text splitting; worker RSS was 105.9 MiB. All function names and exact source slices passed. C remains plain-text fallback. These fixtures do not measure search recall.
