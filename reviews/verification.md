# Verification record

## Current implementation checks

After rounds 1 and 2, all 17 reader/generator regression tests passed. These execute the actual five builders, independent binary STL bounds/topology reader, original numeric/export/mode handlers with explicit DOM/timer doubles, and full UI initialization with missing THREE or a throwing renderer. Exact static light/dark secondary-text token contrast exceeds 4.5:1; all 13 number/checkbox controls have explicit accessible names. These checks do not establish rendered contrast, browser downloads or screen-reader behavior.

The current source runner executes 31 cases and distinguishes known invalid settings as expected validation rejections. It preserves historical evidence and executes the changed mode/export handlers. The current finding disposition is recorded in [resolution](resolution.md). After the Round 3 F09 comment/printing-copy correction, the current source SHA-256 is `7fad9ed651b568bde8fb85c35e8a86cfb05d078e3f621b440915726c2bce2421`. The [current checks](runs/2026-10-10T15-54-23-299Z-7fad9ed651b5-2ngsC3/checks.json) contain 31 cases: 28 measured geometry results and three expected validation rejections (short/wide label, wide lid window, excessive round cradle). No unexpected case failure occurred. Tray topology limitations remain. This run used `node tools/review.mjs source/gridfinity_generator_4.html`; its automated handoff remains a historical pending agent step, distinct from the user-authorized executor/reviewer rounds. F09 copy was directly inspected for qualification; no geometry was redesigned.

Current remaining gates: canvas/font raised text, rendered preview/CDN/WebGL recovery, actual download completion, keyboard/touch/narrow screens, overlays and screen reader, WebGL memory/latency, slicer Boolean/repair/layer behavior and physical fit. Source startup-failure handling is tested using doubles; actual browser failure interaction remains unperformed. Aggregate tray nonmanifold topology remains an open risk.

## Baseline checks (historical)

Baseline source hash: `f5fe866df5e737c3d1d88da4f804652750f253419df869d93d3ddac60aad8c8b`; Downloads and workspace baseline hashes matched. Node.js 26.10.0, Python 3.9.6. First review cycle completed with dedicated documentation drafting and independent lead review. Later implementation checks belong to the numbered review rounds.

Executed baseline checks: three inline-script syntax checks; 31 model/build cases across all three modes, all 18 size presets, reference and pen presets, rotated tray, half-grid axes, fine segmentation, large bin and incompatible boundaries. Five binary STL samples were produced. An independent reader checked binary byte length/count, finite coordinates, triangle collapse, bounds, normal direction and edge incidence with 1e-5 mm welding. All sampled preview-position arrays matched serialized STL coordinates. Four reader/adapter tests passed, including deliberately truncated, open, collapsed and nonfinite fixtures.

The original numeric/mode/download handlers were exercised with explicit DOM/timer doubles. These reproduced integer-count mismatch, retained values for blank/nonfinite numeric input, clamping at typed bounds, shared mode mutations and delayed mixed-mode pair exports. Direct core probes reproduced orientation-fit contradiction and unchanged geometry for stackClear. This is not browser interaction testing.

Observed: reference tray had 371 aggregate nonmanifold edges without text; pen tray had 264. Sample bins/wipes had zero boundary/nonmanifold/inconsistent edges, but self-intersections and Boolean union were not tested. Incompatible round tray reached 27.5 mm versus reported 17.69 mm. Positive volume and matching preview/STL do not establish printable geometry.

Unperformed: actual canvas/font text, rendered browser preview, CDN/WebGL failure interaction, disk download completion, measured WebGL memory, keyboard/touch/narrow-screen/contrast/screen-reader checks, slicing and physical printing. Chrome automation was unavailable; the sandbox blocked a local server, and browser file protocol was blocked. No workaround was used to bypass browser policy. Manual instructions remain in [troubleshooting](../docs/troubleshooting.md).

Rerun from the workspace:

```sh
node --test tools/generator.test.mjs tools/test.mjs
node tools/review.mjs source/gridfinity_generator_4.html
node tools/check-docs.mjs
```

Read every run's checks.json and handoff.md. “checks-completed” means diagnostic execution completed, not a geometry-validity guarantee; agent handoff is explicitly pending on each automated run until a human/agent completes it. Human documentation is preserved across reruns.

## Final independent closure

All three rounds completed: 7.3 → 8.0 → 8.2 out of 10. The independent reviewer locked all nine feature scopes after 17 passing tests, 55 valid local documentation links, all 70 documented default parameters and a complete 31-case run (28 mesh builds and 3 expected safety rejections). Current machine-readable evidence is retained in [final-checks.json](final-checks.json). The [feature ledger](rounds/feature-locks.json) records acceptance scope and remaining manual limits.
