# Architecture

The [current HTML](../source/gridfinity_generator_4.html) contains styles and markup, two geometry scripts, and a browser UI IIFE. Three.js r128 loads externally. The symbols below remain searchable when source line numbers change; each review run also generates a source inventory.

| Stage | Source symbols | Responsibility |
| --- | --- | --- |
| Dimensions and helpers | `GRID`, `HU`, `rectSpec`, `rrSpec`, `solid` | Coordinates, rounded rings, caps, stitching, solid orientation |
| State | `DEFAULTS`, `MODE_DEFAULTS`, `P`, `modeStates`, `switchModel` | Active mutable parameters plus complete per-mode snapshots; separate model/view/available-height state |
| Validation | `PARAM_LIMITS`, `validateParams`, `requireValid` | Finite/range/discrete/enum checks and selected geometry envelope/order checks |
| Derivation | `derive`, `deriveTray`, `deriveWipe`, `packOrientation`, `wipePackFits` | Effective dimensions, fit quantities, slot layout, notch and snap dimensions |
| Geometry | `buildTray`, `buildBin`, `buildLid`, `buildWipeBox`, `buildWipeLid` | Validate and construct triangle arrays from profiles and overlapping solids |
| Text | `textRects`, `addTextSolid` | Rasterize bold text to canvas, merge occupied pixels into rectangles, extrude solids |
| Serialization | `clean`, `toFloat32`, `toSTL`, `exportRevision` | Filter near-zero-area triangles; produce preview arrays or binary STL from a fresh parameter snapshot |
| Browser | `startupFailure`, `rebuild`, `queue`, `download`, `save` | Startup feedback, rendering, coalesced preview updates, and download requests |

The preview path is `control → P → validate → derive/build → mesh → preview`. `queue()` coalesces input changes into the next animation frame. Derivation generally leaves requested values intact, so controls and effective dimensions can differ. Invalid configurations clear current cached meshes, hide preview meshes and edges, and show adjustment messages. Each public builder independently calls `requireValid`, protecting direct calls as well as UI use. Validation does not prove the absence of intersecting geometry.

Export has its own path: `exportRevision` freezes a fresh copy of P, captures MODEL, validates it, builds the model's parts, and serializes the complete pair before requesting either download. Names and bytes belong to the same snapshot, even if the preview has not rebuilt or the user changes modes before the delayed second download. Export does not reuse preview caches.

`switchModel` saves all parameters and available height for the outgoing mode, restores the incoming mode's snapshot or defaults, and returns the view to assembly. Reset uses `MODE_DEFAULTS[MODEL]` and leaves available height intact. These snapshots are memory-only. Theme alone persists in localStorage (`gf-theme`).

Rebuilds dispose replaced mesh geometries; feature edges regenerate after a 160 ms delay and dispose old geometries. This does not establish a measured memory or performance bound. Missing Three.js or failure to create the WebGL renderer displays recovery guidance and disables exports; the app does not provide an offline export fallback.

`textRects` needs browser canvas and font support. Without `document`, it returns no rectangles: Node core checks omit raised text. Static accessible names, focus styles, pressed states, live status, and contrast-token checks are implemented; real browser rendering, keyboard traversal, and screen-reader behavior remain untested.

`clean()` is not a union or manifold repair. `toSTL()` writes an 80-byte header, triangle count, and 50 bytes per triangle, with computed normals. STL has no unit metadata; coordinates are intended as millimetres. `save` uses Blob, an object URL, and a temporary anchor, and revokes the URL after a delay. The second file is requested after 350 ms. A download request is not proof that the browser wrote a file.

Advisory warnings remain separate from blocking validation errors. Current behavior supersedes the preserved [baseline review](../reviews/code-review.md); see the [Round 1](../reviews/rounds/round-1.md) and [Round 2](../reviews/rounds/round-2.md) change records.

`economyCandidate` applies `min(current, target)` to the active mode's wall/floor and applicable scoop/fillet fields; full mode snapshots retain the result. `DEFAULTS.hollowFeet=false` preserves all five standard meshes byte-for-byte against the archived pre-filament source. The research `hollowFootBottom` replaces a foot's lower cap with a real annulus, conical inner wall and downward roof; it does not append a negative shell. Only the bin-body builder supports it.

`HOLLOW_SAVINGS_VALIDATED=false` disables the consumer checkbox, refuses its programmatic change handler, and makes `exportRevision` reject injected prototype state before generating files. Pure builders remain available to offline research. This gate reflects the failed net-material comparison, not failed mesh construction. The separate Python benchmark resolves bundled X2D profiles, freezes source snapshots, executes local CLI slicing, and strictly parses successful G-code consumption evidence. It never sends print jobs.
