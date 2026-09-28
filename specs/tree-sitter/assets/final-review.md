The reviewed fixes and retained logs support most final claims, but inherited-call inference still mishandles valid receiver and rebinding forms, and clean source-mode development lacks generated grammar assets. This was a read-only review; no tests or build commands were run.

Full review comments:

- [P2] Exclude keyword-only `self` from instance receivers — packages/core/src/parser-helpers.mjs:383-386
  For `def target(*, self): return self.helper()`, the bare `*` is not a named child, so `params[0]` is the `self` identifier and this code incorrectly emits an inherited-method lead. Keyword-only parameters are not bound as method receivers; determine the first positional parameter rather than the first named syntax child.

- [P2] Detect all bindings that reassign `self` — packages/core/src/parser-helpers.mjs:393-401
  This whitelist misses valid bindings such as `except Error as self`, `import module as self`, and match-pattern captures. A selected `self.helper()` after such a binding is therefore reported as an inherited call on the original receiver even though `self` now denotes another value, contradicting the stated conservative rebinding policy.

- [P2] Generate parser assets for source-mode commands — .gitignore:22-23
  On a fresh checkout, these ignored WASM files do not exist after dependency installation and are only copied by `scripts/build-cli.ts`; the existing `bun run dev` command executes source directly without that build step, so the first Python/Go/Rust parse fails with a missing grammar asset. The recorded source gate does not expose this because `test/Dockerfile` runs the CLI build before the source tests.