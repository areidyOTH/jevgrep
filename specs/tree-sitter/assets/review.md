The replacement regresses inherited-call and valid Python declaration behavior, and Go/Rust declaration support is incomplete or not wired into large-file previews. Direct helper probes confirmed several failures; Bun was unavailable, and Docker/full suites were not run per the stated constraints.

Full review comments:

- [P1] Preserve inherited leads after attribute assignments — packages/core/src/parser-helpers.mjs:356-370
  When a method assigns `self.x`, `self[...]`, or another target containing `self`, this text-based check treats it as rebinding `self` and suppresses every inherited-call lead in the method. For example, `self.x = 1; return self.helper()` now returns no lead, while the frozen helper correctly returns `Base.helper`; inspect only assignments whose target is the `self` name itself.

- [P2] Expose Go and Rust declarations in truncated previews — packages/core/src/source.ts:170-179
  Although this branch adds Go/Rust inspection, `previewFile` in `packages/core/src/retrieve.ts:278-281` still invokes `inspect` only for Python and JS/TS extensions. Consequently, Go/Rust files larger than 16,384 bytes get no declaration index during admission, so the advertised named declarations cannot help select large files; the installed test uses tiny files and does not cover this path.

- [P2] Extract names from Go var and const declarations — packages/core/src/parser-helpers.mjs:234-237
  Valid top-level `var` and `const` declarations reach this generic branch because their names live in child specs, not on the declaration node. For example, `var Client = newClient()` is emitted as `var_declaration`, and grouped declarations likewise lose every declared name, preventing declaration selection by symbols such as `Client` or `Timeout`.

- [P2] Descend into Rust foreign declaration blocks — packages/core/src/parser-helpers.mjs:243-245
  A valid `extern "C" { fn foreign(); static VALUE: u8; }` block is not recognized as a container, so the parser emits one generic `foreign_mod_item` unit and loses the names `foreign` and `VALUE`. Rust FFI declarations therefore do not receive the named-declaration behavior advertised by this change.

- [P2] Preserve declarations in CR-only Python files — packages/core/src/parser-helpers.mjs:21-23
  Tree-sitter marks otherwise valid Python using bare `\r` line endings as erroneous here, so files such as `def a():\r pass\rdef b():\r pass\r` now fall back to generic text and lose both declaration names. CPython and the replaced helper parse this source successfully; the new CR-only test checks byte preservation but does not assert that declaration extraction remains available.

- [P2] Exclude `**self` functions from inherited-call leads — packages/core/src/parser-helpers.mjs:349-353
  For `def target(**self)`, Tree-sitter exposes an identifier named `self`, and this guard excludes only `list_splat_pattern`; the function is therefore mistaken for an instance method and `self.helper()` produces a false inherited-method lead. The previous helper correctly ignored this case because `**self` is not a positional first argument.

- [P2] Reject benchmark language labels that run TypeScript — test/parser/tree-sitter.bench.mjs:12-20
  Every language argument other than exactly `python` generates TypeScript source and uses `fixture.ts`, while the output reports the original argument. Running the benchmark with `go` or `rust` therefore produces results labeled as those new parsers while actually measuring TypeScript, invalidating any added-language measurements unless inputs are explicitly validated or implemented.

- [P2] Record the promised replacement measurements — docs/architecture.md:74-75
  This new link points to `specs/tree-sitter/RESULTS.md`, but that file is absent. The only added benchmark runs the replacement implementation and contains no upstream/Pyodide arm or recorded five-run comparison, so the requested parsing-speed improvement cannot currently be audited or reproduced from the change.