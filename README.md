# Gridfinity desk-organizer generator

A single-file browser tool for custom lidded parts bins, slotted trays, and lens-wipe boxes. It builds triangle meshes and downloads binary STL files. The current working copy is [source/gridfinity_generator_4.html](source/gridfinity_generator_4.html); the original Downloads file is not the working copy.

Run from this workspace:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [the generator](http://127.0.0.1:8000/source/gridfinity_generator_4.html). Keep the server running while using it; stop with Ctrl+C. The app needs a browser with WebGL and canvas support, and network access to load Three.js **r128** from its CDN. There is no build or package-install step. Python 3 is only for serving the file; Node.js is required for the review tools. Missing Three.js or WebGL startup failure displays recovery guidance and disables exports; there is no offline export fallback.

Choose a model, configure its dimensions, inspect the preview and warnings, then download STL. Verify millimetres and inspect the result in your slicer before printing. Each mode retains its own settings and available height during the page session. Only theme persists across reloads; record your parameter choices before closing the page. Blocking validation errors must be resolved before export. Export rebuilds a fresh snapshot and prepares a complete pair before requesting downloads.

- [User guide](docs/user-guide.md): three desk-organizer examples and exports.
- [Parameter reference](docs/parameters.md): defaults, controls, and effective dimensions.
- [Architecture](docs/architecture.md): how state becomes meshes and downloads.
- [Geometry and printing](docs/printing.md): what the preview and checks cannot prove.
- [Troubleshooting and verification](docs/troubleshooting.md): rerun the review and perform manual checks.

Rerun the review after changing the source:

```sh
node --test tools/generator.test.mjs tools/test.mjs
node tools/review.mjs source/gridfinity_generator_4.html
node tools/check-docs.mjs
```

Each run records the source hash and writes evidence, a documentation-agent handoff, and a draft location under `reviews/runs/`. This does not autonomously run an agent or overwrite human documentation. Follow the handoff, review proposed documentation independently, and merge approved edits. Automated results are evidence about software behavior, not certification of printable geometry.

Review deliverables: [prioritized code findings](reviews/code-review.md), [UI improvements](reviews/ui-improvements.md), [independent documentation review](reviews/documentation-review.md), [verification record](reviews/verification.md), [current finding disposition](reviews/resolution.md), [three-round closure](reviews/rounds/round-3.md), [reviewer feature ledger](reviews/rounds/feature-locks.json), and [reusable agent instructions](tools/AGENT_WORKFLOW.md).

The quick-start path and Python command were inspected, but browser startup could not be completed in this sandbox. Core checks ran on Node.js 26.10.0; canvas text, browser downloads, slicing, and physical fit remain separate manual checks.

The original source and baseline findings remain preserved; current behavior includes the fixes recorded in [Round 1](reviews/rounds/round-1.md) and [Round 2](reviews/rounds/round-2.md). Automated verification uses Node geometry checks, an independent STL reader, static checks, and DOM doubles. No real browser, slicer, or physical-print verification was performed.
