import { test } from "node:test";
import assert from "node:assert/strict";
import { inspect, sourceForUnit } from "../../packages/core/src/source.ts";
test("Go declarations retain names and original Unicode source bytes", async () => {
  const snapshot = {
    path: "sample.go",
    contentHash: "fixture",
    source: 'package sample\n\n// documentation\nfunc Greet() string {\n return "🙂"\n}\n',
  };
  const result = await inspect(snapshot);
  assert.equal(result.mode, "go");
  const unit = result.units.find((u) => u.name === "Greet");
  assert.ok(unit);
  assert.equal(sourceForUnit(snapshot, unit), 'func Greet() string {\n return "🙂"\n}\n');
});
test("Rust impl methods retain owner context, attributes and CRLF byte spans", async () => {
  const snapshot = {
    path: "sample.rs",
    contentHash: "fixture",
    source:
      'struct Box {}\r\nimpl Box {\r\n #[inline]\r\n pub fn greet(&self) -> &str { "🙂" }\r\n}\r\n',
  };
  const result = await inspect(snapshot);
  assert.equal(result.mode, "rust");
  const unit = result.units.find((u) => u.name === "Box.greet");
  assert.ok(unit);
  assert.deepEqual(unit.ownerHeaders, [{ startLine: 2, endLine: 2 }]);
  assert.equal(
    sourceForUnit(snapshot, unit),
    ' #[inline]\r\n pub fn greet(&self) -> &str { "🙂" }\r\n',
  );
});
test("Go methods and Rust trait/module functions expose structural names", async () => {
  for (const [path, source, names] of [
    [
      "x.go",
      "package x\ntype Box struct { value int }\nfunc (b *Box) Read() int { return b.value }\n",
      ["Box", "Box.Read"],
    ],
    [
      "x.rs",
      "mod inner {\n pub fn read() {}\n}\ntrait View {\n fn show(&self);\n}\n",
      ["inner.context", "inner.read", "View.context", "View.show"],
    ],
  ]) {
    const result = await inspect({ path, source, contentHash: "fixture" });
    for (const name of names)
      assert.ok(
        result.units.some((u) => u.name === name),
        name,
      );
  }
});
test("invalid Go/Rust and parse-size limits fall back without dropping UTF-8 bytes", async () => {
  for (const [path, source] of [
    ["bad.go", "package x\nfunc broken( { 🙂\n"],
    ["bad.rs", "fn broken( { 🙂\n"],
  ]) {
    const snapshot = { path, source, contentHash: "fixture" },
      result = await inspect(snapshot, { maxUnitBytes: 8 });
    assert.equal(result.fallback, "syntax");
    assert.equal(result.units.map((u) => sourceForUnit(snapshot, u)).join(""), source);
  }
  for (const [path, source] of [
    ["big.go", "package x\nfunc Large() {}\n"],
    ["big.rs", "fn large() {}\n"],
  ]) {
    const snapshot = { path, source, contentHash: "fixture" },
      result = await inspect(snapshot, { maxParseBytes: 1, maxUnitBytes: 8 });
    assert.equal(result.fallback, "size");
    assert.equal(result.units.map((u) => sourceForUnit(snapshot, u)).join(""), source);
  }
});
test("Go variables/constants and Rust foreign declarations keep their symbol names", async () => {
  for (const [path, source, names] of [
    [
      "x.go",
      "package x\nvar Client = newClient()\nconst (\n Timeout = 3\n Retries = 2\n)\nvar First, Second int\nvar (\n Grouped = 1\n Other int\n)\n",
      ["Client", "Timeout", "Retries", "First, Second", "Grouped", "Other"],
    ],
    ["x.rs", 'extern "C" {\n fn foreign();\n static VALUE: u8;\n}\n', ["foreign", "VALUE"]],
  ]) {
    const result = await inspect({ path, source, contentHash: "fixture" });
    for (const name of names)
      assert.ok(
        result.units.some((u) => u.name === name),
        name,
      );
  }
});
test("non-Python declaration names are not NFKC-normalized", async () => {
  for (const [path, source] of [
    ["x.go", "package x\nfunc K() {}\nfunc K() {}\n"],
    ["x.rs", "fn K() {}\nfn K() {}\n"],
  ]) {
    assert.deepEqual(
      (await inspect({ path, source, contentHash: "fixture" })).units.map((u) => u.name),
      ["K", "K"],
    );
  }
});
