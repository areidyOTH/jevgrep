# Validation

Final source gate: **173 pass** (89 Bun, 18 provider protocol, 34 parser,
4 release, 28 Python evaluation-harness tests). Final installed gate:
**41 pass**, zero failures. Both ran against the final production source.

Logs: [source](assets/source-tests.log), [installed](assets/installed-tests.log).
The installed run has no Python/Bun/native compiler prerequisites in its runtime
image. All provider traffic stays on the local fixture server.

- Source gate: `bash scripts/test-docker.sh`.
- Installed gate: `bash scripts/test-installed.sh` (network-isolated runtime,
  local fake provider, no paid provider requests).
- Core/CLI TypeScript checks and oxlint pass; oxlint reports one pre-existing
  `no-control-regex` warning in filesystem binary detection on upstream main.
- Regression controls retained: Go extraction fails on the original text fallback;
  inherited-call attribute/keyword-rest tests fail before the fixes; grouped Go
  declarations fail before spec-list traversal. The first installed language
  test failed because its shared assertion assumed three Python-only files;
  it was corrected to assert the added fixture's actual six-file contract.
