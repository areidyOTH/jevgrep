# C and Rust follow-up

Test published PR #27 (1493eaa) against upstream 2dc1d3c using the exact previously built Docker image IDs recorded in results.jsonl. No production changes or GitHub updates.

Hypothesis: Rust gains named function boundaries, at additional cost versus the old plain-text fallback. C remains unsupported and should preserve lossless text fallback; no C speedup is expected. This is an open-ended characterization, not a search-quality or provider-speed claim.

Fixed synthetic fixtures: 100 and 1500 independent functions, Unicode comments and CRLF. Assert every Rust name and its exact source bytes in the candidate; require lossless fallback for C and the baseline. Measure import plus first inspection, warm inspection, and worker RSS. Three alternating fresh-process trials per arm, ten warm iterations. Network disabled, two CPUs, 2 GiB, 45-second timeout per process. Stop on any correctness failure; retain failures. No paid provider calls. No parser modifications or promotion planned.

Reproduce: python3 run.py > results.jsonl (requires recorded Docker images). Raw timing measures inspection only, not full search or recall. Existing Rust ownership/attribute/syntax fallback tests provide separate structural coverage.
