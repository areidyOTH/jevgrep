# Review disposition

Independent Codex review is retained in [assets/review.md](assets/review.md).

- Attribute/subscript writes no longer count as rebinding `self`; destructuring,
  loop targets and aliases do. Regression tests failed before the fix.
- Keyword-rest and starred parameters are excluded from instance-call inference;
  typed/default positional receivers and Unicode-normalized Python identifiers
  retain the expected behaviour.
- Go/Rust declaration indexes now reach truncated role previews. The installed
  fixture uses files larger than the preview budget and asserts their indexes,
  selection requests, and output locations.
- Go variable/constant specs (including grouped and multi-name declarations), and
  Rust foreign blocks now expose their names. Focused regression tests cover both.
- Bare-CR Python deliberately uses lossless text fallback, not normalization.
  This is a documented compatibility limitation: the rest of retrieval uses LF
  coordinates, and the old CPython physical-line ranges could produce empty or
  mislabelled source slices. CRLF structural parsing remains supported and tested.
- The benchmark rejects unsupported language labels and invalid sizes. It measures
  Python and unchanged TypeScript only; added Go/Rust support is a correctness claim.
- The final results report and runner accompany the PR. Development cohorts are
  retained separately from the final paired confirmation.

Self-review also replaced quadratic duplicate-name counting with maps, retained
raw Go/Rust symbol spelling, and checked Python helper parity using frozen,
test-only reference programs. Parser trees are deleted after every operation;
only immutable grammar/query objects remain for the worker lifetime.

Final review follow-up: [review](assets/final-review.md). Import aliases and
match captures now conservatively suppress inherited receiver leads; tests cover
exception aliases too. Keyword-only `self` was already excluded by the pinned
grammar's named keyword separator; the added regression confirms that behavior.
Parenthesized local base names now resolve like their unparenthesized forms.
`bun run dev` prepares grammar assets before running source, verified with the
generated assets deleted in a disposable container. These changes affect call
inference and source setup, not the inspection benchmark's operation.


Opus 5.5 reviewed `d74d3da` and recommended keeping the PR. Its additional
read-only probes matched inspection and inherited-call output on 135 Python
stdlib modules. Preview and neighbourhood each matched 134/135; preview differs
at a decorated first class member, and neighbourhood differs only in range
ordering. These are compatibility differences, not universal helper parity.
The reviewer reported no exceptions across 9,600 mutated-Python helper calls
and 621 real Go/Rust files; about 99% of the latter parsed structurally.
These probes used host Python 3.14 as the oracle and did not replace the Docker
release gates. A two-trial cold-start check supported the earlier result;
it does not establish general warm speedup or search recall.

Document the class-header difference rather than changing its cleaner boundary.
Do not add a blanket catch around helper logic without a triggering input:
that would hide implementation defects. Missing assets must continue to fail
visibly. No production-code changes result from this review.
