# Filament-saving guide

For the user's X2D, 0.4 mm nozzle and PLA/PETG, the released improvement is the opt-in **economy candidate**. Hollow underside feet remain a developer research prototype because four tested designs failed the additional-material-saving gate.

## Configure economy

1. Choose the model and dimensions needed for the contents.
2. Press **Apply economy candidate to this mode**. Walls reduce to at most 1.2 mm and floor thickness to at most 1.0 mm. Bin scoop radius reduces to at most 3 mm; wipe fillet radius reduces to at most 3 mm. Tray has no scoop/fillet change.
3. Already thinner values and zero scoops/fillets stay unchanged. The action preserves dimensions, labels, snap/lip settings and other modes. Standard defaults remain unchanged; Reset restores the active mode's defaults.
4. Resolve any validation errors, export the standard body/lid, and slice a trial in your intended profile. Check stiffness, floor integrity and actual fit before a batch.

## Measured reference comparison

These are **offline slicer estimates**, not weighed prints. Reference: Bambu Studio 02.08.04.57, official bundled X2D 0.4 mm machine, 0.20 mm Standard process, Generic PLA/PETG, Textured PEI, 2 wall loops/classic, 15% grid infill, top 5 layers/1 mm and bottom 3 layers. Actual outer/inner line widths are 0.42/0.45 mm; nozzle diameter alone does not define extrusion width. Supports were disabled by the reference preset; absent support paths do not prove support-free printability.

The 2×1×6U bin retains its default label/window/snap configuration. Economy changes wall 1.5→1.2 mm, floor 1.5→1.0 mm and scoop 10→3 mm. The lid remains unchanged.

| Material | Standard body + lid | Economy body + lid | Estimated reduction |
| --- | ---: | ---: | ---: |
| PLA | 43.51 g | 39.07 g | 4.44 g / 10.2% |
| PETG | 43.19 g | 38.79 g | 4.40 g / 10.2% |

Exact settings, provenance and hashes are in [the initial comparison](../reviews/filament-slicing/comparison-v1.json). Values depend on settings and geometry; these percentages do not apply to every bin, tray or wipe box. The app's signed-volume estimate is a separate heuristic.

## Why hollow feet are withheld

The prototypes formed actual open-bottom cavities with sealed flat interiors and unchanged exterior mating surfaces. Independent software checks inspected exported topology, cavity occupancy, roof spans, retained floor and standard-mesh equality. Slicing nevertheless showed these body changes:

| Candidate | Added estimate over standard body, PLA/PETG | Effect over economy alone |
| --- | --- | --- |
| Small cavity | +0.12 / +0.12 g | +0.12 / +0.11 g |
| Nine tapered cavities | +0.81 / +0.81 g | +0.81 / +0.80 g |
| Wide square funnel | +0.08 / +0.08 g | +0.07 / +0.06 g |
| Circular funnel | +0.05 / +0.05 g | Equal at reported precision; longer model time |

Added internal perimeters and ceiling layers are the likely reason removed solid volume did not translate to lower consumption. This mechanism is an inference, not a measured feature decomposition. See [final candidate findings](../reviews/filament-slicing/v4-quick-findings.md).

The released checkbox is disabled in every mode. Its change handler refuses activation, and consumer export blocks injected prototype state. `hollowFeet:true` remains available only to explicit bin research builders/benchmark cases; tray and wipe requests reject. The final circular prototype uses an 18.6 mm mouth, 9.8 mm roof and 4.4 mm ceiling, with measured minimum floor cover of 1.15 mm in the checked matrix. None of this is physical strength or bridge validation.

## Reproduce and verify

From the project directory:

```sh
node --test tools/generator.test.mjs tools/test.mjs tools/filament.test.mjs
python3 tools/slice_metadata_test.py
node tools/review.mjs source/gridfinity_generator_4.html
node tools/check-docs.mjs
python3 tools/slice-benchmark.py --cases reviews/filament-slicing/current-cases.json --summary reviews/filament-slicing/current-summary.json
```

The benchmark requires Bambu Studio and bundled X2D profiles. `--executable` and `--profiles` override their paths; `--cases` supplies versioned inputs and patches. It sends no print jobs and keeps temporary settings isolated. [Replay cases](../reviews/filament-prototypes/README.md) reproduce three exact historical snapshots. No successful slice is invented when a prerequisite or parser check fails.

Benchmark G-code has unresolved official end-macro warnings and is not approved printer-ready output. Browser/canvas, visual bridge layers, physical load/seating, material-specific snap calibration and weighed prints remain unperformed. Five-cycle conclusions and reviewer substitution are recorded in [Round 5](../reviews/filament-rounds/round-5.md).
