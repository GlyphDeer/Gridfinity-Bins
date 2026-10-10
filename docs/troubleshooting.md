# Troubleshooting and developer verification

| Symptom | Check / action |
| --- | --- |
| Startup error / no preview | Read the startup message. Check the Three.js r128 CDN request or enable WebGL/hardware acceleration and reload. Exports are disabled when initialization cannot continue. |
| Settings need adjustment | Resolve the displayed validation error. Reduce an oversized label, increase body height, reduce slot count/width, or adjust the floor/cradle as directed. Export independently validates and rejects incompatible settings. |
| Controls differ from model | Read effective clamps in the parameter reference. Mode switches restore that mode's complete snapshot. Preview updates are queued; exports build from current settings independently. |
| Sheet count changes after entry | Sheet count intentionally rounds to a whole number on commit. Use measured stack height for fractional-thickness totals. |
| Packet does not fit | Check actual floor dimensions and usable depth. Either input orientation is supported; Fit to pack is limited to 6×6×20U and cannot guarantee arbitrary contents fit. |
| Missing second STL | Check the browser download list and multiple-download permission, then use separate bin/lid buttons. A “Download requested” toast is not proof of a completed download. |
| Text absent from automated STL | Node core checks lack browser canvas, so text is omitted. Generate and inspect a tray with text in the browser. |
| Slow rebuilding/export | Reduce grid size or text, or use coarser segmentation. Record a reproducible configuration before investigating; no timing guarantee is implied. Export constructs a fresh model or pair. |
| Slicer repair or unexpected walls | Inspect layers and raw mesh. Cleaning removes tiny triangles; it does not Boolean-union intersecting solids. |

Run from the workspace:

```sh
node --test tools/generator.test.mjs tools/test.mjs tools/filament.test.mjs
python3 tools/slice_metadata_test.py
node tools/review.mjs source/gridfinity_generator_4.html
node tools/check-docs.mjs
```

Pass another source path to the review script to review a revision; quote paths containing spaces. Inspect the timestamp/hash run under `reviews/runs/`, including source inventory, machine-readable checks, sample STLs, and documentation-agent handoff. This script does not run an agent itself. A compatible coding-agent session is required to complete the handoff: give it the source and evidence, then independently review its draft. Keep human-edited docs until changes are reviewed.

The focused regression suite currently has 27 tests, including three independent binary-STL reader checks and one source-adapter check. The review harness exercises 37 build cases, including five expected validation rejections in the current source. Consult the particular run's hash and results rather than assuming old results apply to a revision. Original handler tests use DOM doubles; these are not browser tests.

For a manual pass, record source hash, browser and OS, exact settings, and observations:

- Exercise each mode, reference preset, size chip, and relevant min/max controls. Edit each mode, switch away/back, and verify parameter and available-height restoration and isolated Reset behavior.
- Try blank and nonfinite typed inputs, dimensional values between slider steps, extremes, and fractional sheet counts. Confirm count rounding and compare effective values.
- Export immediately after an input change and change mode during a pair download. Compare names, dimensions, and contents with the captured configuration and verify both files arrived.
- Test keyboard traversal, range keys, visible focus, accessible names and pressed states, status announcements, light/dark contrast, narrow screens, touch rotation/pinch, and control access above the fixed download bar.
- Cover tray text and startup failure paths in a real browser. Check repeated rebuilds for errors and memory growth; Node checks do not exercise WebGL resources or fonts.
- Slice representative STLs, inspect layer continuity, and perform physical fit trials separately.

Real browser, screen-reader, visual slicer-layer and physical-print checks remain unperformed. Offline CLI consumption comparisons were completed in the later filament cycles. Source/static and DOM-double evidence supports the implemented safeguards, not comprehensive accessibility, mesh validity, or print certification. Preserved [baseline findings](../reviews/code-review.md) describe the original source; [Round 1](../reviews/rounds/round-1.md) and [Round 2](../reviews/rounds/round-2.md) record subsequent fixes.

Economy does nothing when values are already at or below its targets; this preserves thinner configurations and disabled features. Hollow-foot activation is intentionally unavailable because no additional saving was established. An injected prototype flag blocks consumer export; Reset clears it.

Optional offline slicing benchmark (requires installed Bambu Studio with the bundled X2D profiles):

```sh
python3 tools/slice-benchmark.py
```

Use `--help` for alternate executable/profile paths or custom cases. Missing prerequisites and failed slices are recorded as failures, never simulated successes. The [historical prototype replay](../reviews/filament-prototypes/README.md) preserves three exact failed-candidate source snapshots; the first candidate survives by hash and measurements only. See [benchmark limitations](../reviews/filament-slicing/README.md).
