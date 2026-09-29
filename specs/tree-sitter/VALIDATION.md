# Verification

The release gate is `bun run verify`: source tests, provider-protocol tests,
parser differential tests, evaluation-harness tests, and installed Node-only
journeys run alongside type and lint checks. Provider requests use local fixtures.
No paid-provider or coding-agent task-quality claim follows from these checks.

`node scripts/test-native.mjs` exercises a fresh npm installation on Apple Silicon
with only Node on its runtime PATH. It complements Linux Docker verification;
neither environment silently supplies a Python executable or native compiler.

Archive validation must also run from a clean checkout after locked dependency
installation and grammar preparation, matching the registry-verification job.
Without preparation, canonical grammar comparison must fail; with preparation,
the archive identity, bytes, notices, and integrity must match.

The frozen Python helpers are differential oracles. Real-source comparisons must
distinguish retrieval regressions from documented syntax-version and class-header
boundaries in the [parser contracts](../../test/parser/README.md). Golden fixtures
cover each corrected regression and must fail when its fix is removed.
