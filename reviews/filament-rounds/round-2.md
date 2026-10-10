# Filament Round 2 — cavity boundaries and geometry validation

Status: complete; E03 structural contract locked, E02 reopened for Round3 due measured material regression.

## E03 scope

Broaden independent exported-geometry evidence for experimental B while preserving the locked interface/safety contracts. E02 cavity arrangement is explicitly reopened below. Test representative 1×1, 2×1 and 6×6 bins, minimum/maximum floor, coarse/fine segmentation and corner counts, lip off/on and labels off/on with valid dimensions. Avoid an expensive Cartesian product: choose a bounded pairwise/extreme matrix, record each input/hash and failure.

For every tested foot, inspect exported triangles/sections: center void below ceiling, roof material above, wall/rim material, flat sealed interior floor, and equal exterior side profiles. Compute cavity roof Z/span and minimum separation to shell/floor from actual geometry where practical; do not merely assert the implementation constants equal themselves. Include a sample near the mouth/roof boundary and away from triangle seams. Confirm full-body and modified-component edge/winding diagnostics and unchanged lid STL. Test B rejects unsupported tray/wipe modes, nonboolean values, and formerly invalid floor/ramp cases. A must not bypass guard errors or silently change dimensions/interfaces.

Old default-byte and 17 safety/export/state/accessibility contracts must pass. If testing finds a locked-scope regression, send the failing reproduction to reviewer before repair. Section occupancy through overlapping shells requires care: odd/even parity alone is not a union proof. Choose rays outside overlapping Z intervals or classify individual components and document method.

## Acceptance and future evidence

Executor provides reproducible boundary tests/artifact, command, source hash and matrix. Reviewer independently reruns and inspects the actual values. No slicer/material savings or printability claim follows from lower triangle signed volume. Round 3 will compare actual sliced baseline/A/B/A+B. Zero or negative B sliced savings is concrete evidence to reopen E02 for optimization or withhold it as a saving feature; Round 1 locking protects demonstrated safety, not a fixed ineffective design.

## Independent result

Reviewer reran all suites: **23/23 pass**,8.57seconds. Inspected allfoot exportedtriangle roofgroups, rayoccupancy, actual exteriorsegment distances, mouthweb distance and topology comparisons. Source `9e3373ce77ed8fad60ccf3294115ffd8cd1a2f227a769e562d00a0376ad47334`; matrix evidence `round-2-geometry.json`. The nine-cavity geometry satisfies tested structural constraints; baseline defaultbytes and legacy contracts remain unchanged. Largecoarse wholebody65nonmanifold edges are present inBoff too; modified feet themselves remain clean. No Boolean/physical certification follows.

Actual slicing nevertheless finds v2 costs0.81g more for baselinePLA/PETG, and0.81/0.80g more withA. Therefore **Round2 score:7.2/10** (correctness/materialobjective6, evidence8, UI7, docs8; weighted7.15). Lower score reflects failed materialobjective despite stronger diagnostic evidence. E03 locks reusable structural assertions, not ninecavities or a fixedroofheight. E02 remains open for authorized Round3 repair; no savings claim is accepted.

## E02 reopening — actual material regression

Reviewer inspected `reviews/filament-slicing/round3-findings.md` and comparison JSON. Sixteen successful slices of source `2b021e6fe9ccb9be6bd900ca61f0a646af114dd87d0f8ab475022885b7cde518` show B increases baseline body mass by0.12g in PLA and PETG, and adds0.12/0.11g to A. This is the anticipated concrete basis to reopen geometry; reduced mesh volume did not produce filament savings. Round1 structural acceptance remains historical and does not approve a material-saving claim.

**Authorized Round2 repair:** replace the single small cavity with an array of real open-bottom cavities or a partitioned underside. A concrete bounded candidate is up to3×3 cavities perfoot with roof dimensions at most7×7mm (diagonal<10mm), optional tapered larger mouths, and sufficient retained webs. Preserve the original exterior profile/shell/lid bytes, sealedflatfloor, cavity ceiling<4.45mm, floor separation≥1mm, and minimum actualfootwall/intercavityweb≥1.2mm. Measure closest distances for rounded exteriorcorners; axis-only distance is insufficient there. Do not relax bridge/span constraints just to obtain material savings. Alternate topology is acceptable within these measured constraints.

Bottom triangulation must explicitly represent all holes and solid webs; no overlapping subtraction shells or solid cap across voids. Exported section/occupancy tests must sample each cavity and each interveningweb and demonstrate no cavity is refilled by old geometry. Reuse unchanged exterior side triangles exactly. Broad profile/Boolean rewrites remain outofscope. Regressiontests must generalize from singlecenter toactual cavity array.

Round3 repeats actual baseline/A/B/A+B slicing with identical unchanged profiles. Require positive B marginal savings against corresponding baseline AND A in PLA/PETG before presenting B as useful for tested materialobjective. If no measured improvement, withhold the material-saving claim and report the failure rather than artificially raise score. No physical-print/strength approval follows from slices. This repair is inside the planned fivecycles, not an added developmentround.
