# Filament Round 1 — opt-in economy and experimental cavity foundation

Status: complete; E01–E02 foundation locked. Existing F01–F09 remain locked and unchanged.

## Scope

**E01 Economy A:** add an explicit opt-in preset with candidate wall 1.2 mm, floor 1.0 mm and scoop 3.0 mm where applicable. Preserve current DEFAULTS and initial behavior. Apply only current mode, using valid mode-appropriate changes; do not silently enable experimental B. Retain dimensions, label settings, lid/foot/snap interfaces and other unrelated edits. Explain thinner walls/floor require a trial print. A is a candidate economy configuration, not a measured saving until sliced.

**E02 experimental hollow underside B:** implement only ordinary bin body initially and default off. Construct actual open-bottom cavities by replacing affected foot caps with explicit rim, inner wall and cavity roof surfaces. Do not append a reversed overlapping shell to simulate subtraction. Keep the original exterior foot side profile, footprint, lip, groove, snap/lid and interior flat floor exactly unchanged. Place cavity roofs below every overlapping shell bottom so existing solid material does not fill the intended void. Unsupported modes reject an explicit B request or clearly disable it; do not silently claim hollow geometry for trays/wipes.

Before coding, executor records chosen cavity mouth, depth, roof and minimum wall/web dimensions in implementation notes. Fixed conservative prototype budgets are acceptable: cavity ceiling strictly below shell-bottom Z=4.45 mm; at least 1.0 mm material to interior floor and at least 1.2 mm radial foot wall; unsupported roof span at most 10 mm. These are engineering test constraints, not validated printer settings. If those constraints are infeasible, report evidence before relaxing them. Preserve every exterior foot-profile vertex. B stays visibly experimental and opt-in; successful slicing is necessary before calling it useful for saving filament, and physical strength/fit remain unverified afterward.

## Round 1 acceptance

- Existing 17 regression tests and old lock contracts pass; unchanged default meshes serialize identically to pre-change baselines for representative bin, lid, tray and wipe modes.
- A changes only documented mode-relevant fields and leaves B off/current state alone; switching modes preserves isolation. Reset restores original defaults.
- B off reproduces the baseline mesh exactly. B on changes only bin-body underside geometry; paired lid bytes and exterior profile/foot bounds are identical. Interior floor remains flat, sealed and unchanged.
- Independently inspect cross-sections or ray occupancy: cavity center is empty below its roof, material exists above roof, and ring wall remains material. Inspect exported STL, not just parameter derivation or source comments. Show no unchanged solid cap closes the cavity mouth/volume. Test roof/wall/span budgets against actual triangles.
- Measure topology, finite coordinates, bounds and signed volume for representative B outputs; no newly open boundary or winding defect in the tested modified foot components. Aggregate shells are not thereby proven unioned.
- Label B experimental; no fabricated savings, slicer success, physical strength or compatibility claims.

## Rubric

Correctness/interface preservation 35%, independent geometry/slicer evidence 30%, UI/state clarity 15%, documentation/reproducibility 20%. Rate each from 1–10 and calculate weighted total. A requested 10 is a target, not evidence; absent physical trials must stay explicit. Round 1 scoring occurs after inspection. Baseline for this new feature scope: not yet implemented, so no fabricated baseline score.

## Five-cycle sequence

1. Foundation A + restricted B implementation and structural evidence.
2. Geometry boundaries: supported sizes, roof/wall budgets, section occupancy, invalid parameter guards and legacy regression preservation.
3. Reproducible actual slicer benchmark: baseline/A/B/A+B where valid, identical X2D 0.4 mm PLA/PETG profiles, quantities and orientation; capture material/time/repair evidence and honest savings or lack thereof. Do not confuse solid mesh volume with sliced filament.
4. User integration: clear opt-in state, mode availability, preset/reset/export behavior and warnings based on evidence; no unsupported production claim.
5. Documentation and final regression closure: publish reproducible benchmark inputs/results/limits, reconcile claims, rerun contracts, and issue final weighted score/locks. No feature is locked before its scoped acceptance is actually verified.

## Independent result

Reviewer reran `node --test tools/filament.test.mjs tools/generator.test.mjs tools/test.mjs`: **22/22 pass**. The prior accessible-control fixture needed an authorized update from 13 to 14; explicit original-control name coverage is retained and the new checkbox is checked. No source geometry change accompanied that fixture update.

All five default builder STL hashes match the archived pre-filament source. A changes only documented fields in the current mode and preserves explicit B choice. B uses an actual bottom annulus, interior cavity wall and downward roof at3.4mm replacing the old cap; original exterior side triangles, body shell and lid bytes are unchanged. Independent exported ray checks find center air below roof, material above, preserved wall/floor; modified feet and tested aggregate mesh have no boundary/nonmanifold/inconsistent edges.7×7mm rounded roof fits the10mm diagonal budget. Lower signed volume alone is not a saving claim.

Source SHA256 `2b021e6fe9ccb9be6bd900ca61f0a646af114dd87d0f8ab475022885b7cde518`. Geometry artifact: `round-1-geometry.json`.

**Round1 score:7.4/10** (correctness8, evidence6.5, UI7, docs8; weighted7.40). E01/E02 lock only the demonstrated opt-in/structural foundation. Broader geometry coverage, actual B sliced material benefit, UI refinement and documentation remain later rounds. Zero/negative sliced B savings is explicit concrete evidence for reviewer reopeningE02 geometry; safety contracts continue to apply. No physical strength/fit trial has occurred.
