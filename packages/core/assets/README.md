# Parser assets

The build copies Python, Go and Rust grammar WASM from exact-version official
Tree-sitter packages into `tree-sitter/`. These generated assets ship in the CLI
archive, together with their license notices. They are never downloaded at search
time. The external `web-tree-sitter` runtime supplies its own WASM and license.
