# Round 1 — export correctness and parameter consistency

Status: complete; F01–F05 locked after independent verification.

## Rating

Baseline **4.5/10**: correctness 4/10 × 40%, validation 5/10 × 25%, UX/accessibility 4/10 × 20%, documentation/workflow 6/10 × 15% = 4.55. This is a reviewer judgment of the supplied generator and current evidence, not print certification. Geometry/export issues C1–C4 materially constrain correctness. Existing reproducible review tools improve validation; browser, slicer and physical validation remain incomplete.

## Executor scope and acceptance

1. **F01 clearance semantics (C1):** either implement radial clearance in both relevant lid geometries and demonstrate positional changes, or clearly relabel the parameter as an estimate-only adjustment everywhere. Do not claim a geometry effect that is absent. Acceptance: parameter label/help and snap estimate explain the chosen behavior; if implemented, changing 0→0.4 alters the intended mating surfaces in bin and wipe lids without silently changing footprint dimensions.
2. **F02 invalid geometry/export guard (C2, C3, R3):** central validation must run before builders/export. Reject incompatible floor/cradle/rib height, inverted/out-of-envelope label ramps, and nonfinite/unbounded direct parameters. Validation must explain which settings to change and prevent downloading stale last-valid geometry as current output. Acceptance: 1×1×2U tray, floor=6, slots=40, width=40, round cradle cannot export; 1×1×2U bin, floor=6, labelH=40, labelW=240 cannot export. Normal reference presets continue building. seg=0 and NaN inputs return promptly with an error. Add measured exported-bounds checks where geometry is valid. Scope guard claims narrowly; do not claim self-intersection or Boolean union verification.
3. **F03 immutable export revision (C4, R2, C8):** serialize both files from parameters/model/geometry captured at the click; ensure pending UI rebuild cannot mismatch name and mesh. Catch serialization errors visibly. Say “Download requested,” since browser click cannot establish a saved file. Acceptance: click pair, change model before delayed second click; names and bytes still belong to original pair. Rapid parameter edit followed by export uses that edit or explicitly refuses pending export. Tray export uses tray geometry/name. Separate downloads remain available.
4. **F04 wipe orientation (C5):** use a single orientation policy in sizing, warnings and badges. Acceptance: 38×100 and 100×38 receive consistent fit results and dimensions; oversize packs still fail honestly.
5. **F05 integer sheet count (C6):** normalize sheetN at commit and use the same derived stack requirement during fitting. Acceptance: 1.5 becomes one documented integer value across input, displayed count, derived height and fit action. Do not round continuous physical dimensions.

## Verification protocol

Executor adds meaningful regression probes, runs existing checks, and reports changed files plus exact commands/results. Reviewer reruns checks and independently inspects changed paths before locking F01–F05. A failing acceptance criterion remains open. A lock records tested scope and limitations; it does not certify arbitrary geometry or physical compatibility. Features outside this round remain open. Rounds 2 and 3 cover remaining mode-state, startup/accessibility, documentation/tool consistency and regressions; new concrete evidence is required to reopen a lock.

## Verification result

Independent reviewer reran `node --test tools/generator.test.mjs tools/test.mjs`: **11/11 pass**. Inspected both lid-foot clearance changes, prebuild guards, immutable fully serialized export pairs, wipe orientation and integer handlers. Independently extracted actual REFERENCE, TREFERENCE, PENTRAY and WREFERENCE presets: guards accept all; exported bounds match footprint and nominal top (tray text disabled in this probe). Original incompatible cradle/ramp examples reject rather than exporting stale geometry. No saved-file completion claim remains.

Lead inspection caught a validator regression: scoop enum allowed `two/all` instead of actual UI `both/four`. Executor corrected it and added a test derived from markup covering all three real options before F02 lock. No remaining Round 1 acceptance failure identified.

**Post-fix rating: 7.3/10** (correctness 7.5, validation 7.5, UX/accessibility 6, documentation/workflow 8; weighted 7.275). F01–F05 locked in feature-locks.json. This score recognizes targeted defect fixes and reproducible tests; mode state, accessibility and startup remain Round 2 work. Tests use real geometry and original UI handlers with DOM/timer doubles; they do not verify browser download permission, rendered UI, canvas text, slicer behavior, Boolean unions or physical prints.
