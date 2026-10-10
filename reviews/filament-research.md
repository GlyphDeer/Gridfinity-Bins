# Filament reduction research

Research date: 2026-10-10. Status: proposals for user approval; no generator changes, feature unlocks, physical validation, or GitHub publication performed by this research task.

## Recommendation

Start with an opt-in economy preset using the existing wall/floor controls and a repeatable slicing comparison. Then prototype hollow undersides of body feet while retaining a sealed, flat interior floor and the existing outside mating profile. Keep lids, stacking lips and snap geometry unchanged initially. These choices best preserve the present small-parts and wipe-storage functions. Add recessed interior floors only as a separately approved general-bin option; defer perforation and vase mode.

User context: X2D, 0.4 mm nozzle, PLA/PETG. Bambu's [official X2D announcement](https://blog.bambulab.com/xcellence-made-simple-bambu-lab-presents-the-x2d/) confirms the model exists; this research does not substitute an X1C. Slicer/version, extrusion width, layer height and filament brands are unspecified. A 0.4 mm nozzle does not establish a 0.4 mm extrusion width. Candidate geometry must be sliced in the user's selected X2D profile and tested separately in PLA and PETG.

## Current implementation evidence

The working [generator](../source/gridfinity_generator_4.html) has three modes: lidded bin, slotted tray and lens-wipe box. `wall` and `floorT` already expose 0.8–2.2 mm and 0.8–6.0 mm ranges; the ordinary defaults are 1.5 mm each, and wipe walls default to 1.2 mm. `floorTop = H_BASE + floorT`, with `H_BASE = 4.75` mm. Reducing `floorT` does not hollow the 4.75 mm feet.

`buildBin` and `buildTray` cap each foot at its bottom and shoulder, producing filled foot solids. `buildWipeBox` uses the same closed-foot pattern through `wipeFeet`. The body shell has an underside around z=4.45 mm and a capped interior floor above the base. Body and feet overlap. Lids also use mating feet, but those feet participate in the snap/clearance contract. There is no general Boolean union/subtraction stage.

The displayed mass is signed component volume with heuristic overlap subtraction and a fixed PLA density. It is not sliced filament use, does not account for sparse infill/solid layers/supports, and is not a PETG mass prediction. Thin walls can be almost entirely perimeters, so changing infill alone may affect the feet much more than the walls. See [printing limitations](../docs/printing.md) and [remaining risks](resolution.md).

## Verified external precedents

- [Gridfinity Rebuilt core](https://raw.githubusercontent.com/kennetek/gridfinity-rebuilt-openscad/main/src/core/bin.scad) documents `base_thickness` as a way to make a hollow lite base and calls a dedicated lite-base builder when reduced. Its [lite entry point](https://github.com/kennetek/gridfinity-rebuilt-openscad/blob/main/gridfinity-rebuilt-lite.scad) exposes a bottom-layer thickness. Inspection of [the actual base builder](https://raw.githubusercontent.com/kennetek/gridfinity-rebuilt-openscad/main/src/core/base.scad) shows `gridfinity_base_lite` and `base_outer_shell` retain bottom skin and sides, opening the interior above them. This supports recessed-interior option C; it does **not** verify the underside cavity with flat interior proposed in B. B is our engineering hypothesis and needs a prototype.
- [Gridfinity Extended's optimisation comparison](https://docs.ostat.com/docs/openscad/gridfinity-extended/cup-optimisations/) reports one 2×3×5 example without attachments at 58.03 g with a standard base and 32.82 g with an efficient base. Those are that author's historical PrusaSlicer 2.7/MK3S+ measurements, not predictions for this project or the X2D. The author explicitly identifies a nonflat interior and cleaning drawbacks. Ordinary flat-base variants can lose grid-plate compatibility.
- [Extended's current cup source](https://raw.githubusercontent.com/ostat/gridfinity_extended_openscad/main/gridfinity_basic_cup.scad) exposes independent wall thickness, efficient-floor modes, wall and floor patterns. These show available design approaches; copying parameter values does not establish mechanical fitness here.
- [Prusa's infill documentation](https://help.prusa3d.com/article/infill_42) identifies infill as support for top surfaces and a contributor to compression resistance and consumption; perimeter count is a major strength factor. Its generic density guidance is not a printer-specific prescription for these bins.
- [Prusa's layers/perimeters documentation](https://help.prusa3d.com/article/layers-and-perimeters_1748) explains that top/bottom solid thickness depends on layer height, low infill increases bridge sag, and Arachne varies extrusion width. This is why a nominal two-line wall is a starting geometry candidate, not a guaranteed slicer result.

## Options for approval

### Existing-control measurements

The lead agent measured the unchanged generator's default 2×1×6U bin/lid pair and selected parameter changes. These are **approximate solid-volume proxies, not sliced filament savings**: the existing overlap correction is heuristic, and no infill, solid-layer, bridge or support calculation was performed. Full precision, patches and source hash are recorded in [the comparison JSON](filament-model-comparison.json); [the replay script](filament-model-comparison.mjs) reproduces the method.

| Existing parameter change | Pair volume proxy (cm³) | Proxy reduction vs default |
| --- | ---: | ---: |
| Default | 56.08 | — |
| Wall 1.2 mm | 53.85 | 4.0% |
| Floor 1.0 mm | 54.54 | 2.8% |
| Scoop 3 mm | 54.56 | 2.7% |
| Wall 1.2 mm + floor 1.0 mm + scoop 3 mm | 50.73 | 9.5% |
| No label shelf | 53.32 | 4.9% |
| Height 4U, same footprint | 51.08 | 8.9% |

The shorter model sacrifices storage height and is suitable only when contents fit. Disabling the shelf reduces the bin proxy from 40.19 to 35.24 cm³ but closes its associated lid window, increasing the lid proxy from 15.89 to 18.08 cm³; compare complete pairs. The two raw body-foot components total 14.73 cm³ before overlap correction. This shows where geometry research might focus, but is neither a removable-volume budget nor actual foot filament use.

| Option | Modes and benefit | Risks and effort | Required evidence |
| --- | --- | --- | --- |
| **A. Economy preset and slicing comparison** | All body modes. Select thinner existing walls/floors for light contents; reduce oversized scoops or label shelves when unnecessary. Preserve existing defaults as the standard choice. Wall savings scale approximately with the thickness removed over ordinary straight wall area; floor changes remove roughly exposed floor area × thickness reduction. Actual grams are unknown. | Low implementation effort. Thin tall walls flex more; thin floors can sag, warp or resist loads less well. Floor-height changes alter capacity and tray envelopes, so existing guards remain active. | Compare original and candidate STL in the same slicer profile; inspect perimeters, gap fill, floor and lip layers. Test representative loaded body and lid pairs in both materials. |
| **B. Hollow underside feet, sealed flat interior** | Bin first, then tray and wipe bodies after validation. Remove material from foot interiors while preserving outer seat/profile, supporting annulus, floor, and connecting webs. Potentially worthwhile because current feet are filled. This is an experimental design inference, not the Rebuilt lite geometry. | Medium/high geometry effort. A cavity adds inner perimeters and ceiling layers; sparse-infill baseline may already be light, so net savings can be modest or negative. A 45° taper within the 4.75 mm base cannot close a wide foot cavity completely: the remaining roof requires bridging, narrower spans or ribs. No support-free claim is established. Load path, bed adhesion, wipe half-feet and floor sealing require attention. Merely appending a negative shell would not reliably subtract overlapping solids. | Independent section/mesh checks prove an actual cavity and retained floor/annulus. Compare sliced grams, added inner walls, ceiling layers and bridge/support costs. Print foot seating and loaded-floor samples, including half-grid wipe layout. |
| **C. Recessed efficient interior floor** | General bin only initially. A thinner skin follows the external foot shape into the base volume, with raised connecting regions. Upstream precedent suggests this deserves a prototype, but its published savings do not transfer. | High effort. Interior becomes uneven; small parts can catch, labels/scoops need new transitions. Wipe sheets need a flat bed and current tray cradles depend on a flat floor, so exclude them initially. Preserve external mating shape and height. | Measure floor thickness along slopes and joins; compare slices and cleanability. Test smallest intended parts and loaded floor. Explicit incompatibility guards for dependent features. |
| **D. Thin panels with local ribs** | General bin body sidewalls first. Concentrate material at corners, label attachments and floor joins while thinning broad panels. | High effort. Ribs themselves add material and may interfere with contents; stiffness gain/savings are untested. Avoid changing lip/groove/snap dimensions. | Compare equal-capacity designs under the same load and sliced profile. Check internal dimensions and access. |
| **E. Perforated walls or floor** | Optional open organiser only. Cutouts remove selected panels directly. | High effort and poor match for closed small-parts bins/wipe protection. Small items escape; holes catch debris; roofs may create unsupported spans. Additional perimeter length can reduce expected savings. | Slice representative holes, test smallest contents and load. Explicit opt-in product mode with clear containment limitations. |
| **F. Vase mode / detachable bases** | Separate simple open-bin family only. [Rebuilt's vase implementation](https://github.com/kennetek/gridfinity-rebuilt-openscad/blob/main/gridfinity-spiral-vase.scad) provides a precedent with separate bin/base selection and printer-width parameters. | Very high effort; existing multi-solid floors, labels, divided trays, lips and snap lids do not become spiral printable by switching a slicer checkbox. Assembly and one-wall stiffness introduce new requirements. | New geometry family, spiral-toolpath inspection, base connection/load/fit tests. Treat separately from current bin optimisation. |

No option has a validated filament-savings percentage for this project. A/B are the recommended first approval package: A is opt-in and keeps standard defaults unchanged; B is explicitly experimental and gated on a prototype that actually slices lighter. Existing snap/mating-foot/lip geometry stays unchanged in this initial package. C is a second experiment if an uneven interior is acceptable. D/E/F should remain outside the initial scope. Lid lightening deserves a separate investigation because the default lid is a significant part of the volume proxy; structural ribs or skin changes must preserve its mating foot, snap bead and lip contracts and prove net sliced savings.

## Three-round implementation plan after approval

1. Executor implements only approved A/B scope and records baseline/candidate comparisons. Reviewer rates correctness, material evidence, usability and compatibility 1–10; lists concrete defects and locks accepted scopes after fixes and checks.
2. Reviewer checks parameter extremes, body modes, half-grid feet and PLA/PETG slicing evidence. Executor fixes only open findings; accepted export, clearance and mode-isolation contracts stay locked.
3. Reviewer checks regressions and final documentation, including exactly what was sliced/printed and what remains untested. Lock accepted new features with evidence; publish the approved final project only after all authorised gates are met.

Existing [feature locks](rounds/feature-locks.json) cover F01–F09. New controls need to participate in full per-mode state snapshots and immutable export captures. New geometry guards must preserve prior rejected cases. A reviewer may reopen an old scope only with concrete new evidence recorded in its ledger. Research does not change these lock states.

Minimum comparison record: source hash, preset, exported STL checksum, slicer/version, X2D profile, material/brand, nozzle and actual line widths, layer height, wall generator/count, infill pattern/density, top/bottom thickness, supports, object grams and total grams/time. Compare body, lid and pair separately. Slicer results are estimated consumption; actual weighed prints provide a separate check. Physical floor, load and fit checks cannot be replaced by a positive triangle-volume result.
