# Filament implementation notes

## Round 1 cavity contract chosen before coding

Ordinary bin body only, experimental opt-in, default off. Each body foot receives one centered open-bottom rounded-rectangle cavity: 7×7 mm mouth, 1 mm corner radius, vertical inner wall and ceiling at z=3.4 mm. Maximum roof bounding-box diagonal is 9.90 mm, below the 10 mm prototype unsupported-span budget. The ceiling lies below the existing body shell underside z=4.45 mm; minimum floor top z=5.55 mm leaves at least 2.15 mm of geometric vertical cover. The lowest original foot envelope has a 17.8 mm half-width, leaving at least 14.3 mm from cavity side to exterior side. Exterior profile vertices and shoulder cap remain unchanged.

The foot bottom cap is replaced with a triangulated annulus connected to inward-facing inner cavity walls and a down-facing roof cap. No negative overlapping subtraction shell or positive intersecting rib is added. The substantial surrounding annulus carries the prototype load path; its strength is unverified. This deliberately small initial cavity may provide little or negative sliced savings due to added inner walls/roof layers. Geometry and positive signed-volume differences cannot establish useful savings; actual slicing and physical trials remain required.

Economy A changes only current mode wall=1.2 mm, floorT=1.0 mm and bin scoop=3.0 mm or wipe floor fillet=min(current,3.0 mm), where applicable. Tray keeps its slot/cradle parameters. It does not enable or disable B, change label/lip settings, or reset dimensions. Standard defaults remain unchanged; new hollow flag defaults false.

## Round 2 authorized redesign after actual material regression

The one-hole foundation remains historical: actual slicing showed +0.12 g in both material baselines. Reviewer reopened E02. The repair creates nine tapered square apertures per foot, centered at -10.8, 0, +10.8 mm on each local axis. Mouths are 9.6×9.6 mm; ceilings are 7×7 mm at z=3.4 mm. Minimum mouth webs are 1.2 mm and widen upward. Roof diagonals remain under 10 mm. A triangulated bottom grid and convex-ring zipper attach all openings/webs to the unchanged exterior profile without overlapping ribs or subtraction solids. Closest actual corner/side distances and component winding/topology are checked on serialized foot meshes, not just nominal dimensions.

The regression matrix includes 1×1 minimum-floor/coarse (lip off), 1×1 fine, 2×1 maximum floor (lip off), and 6×6 coarse/fine with label all/off; each foot and every cavity are checked. Independent vertical-ray occupancy is evaluated in isolated modified foot meshes outside ambiguous overlapping shell intervals. Material is present immediately above each roof and in intervening webs; every cavity is empty below its roof. Complete bodies and exact lid bytes remain checked. This candidate may still slice heavier because of extra cavity perimeters; actual benchmark results decide whether it meets the material objective.

## Round 3 authorized single-funnel candidate

Actual v2 slicing showed +0.81 g versus the baseline bodies in both materials and +0.81/+0.80 g over A. Reviewer again opened E02. Current candidate replaces the array with one square 15.6 mm mouth tapering to a 7 mm square roof at z=4.3 mm per foot. Each side moves inward 4.3 mm over 4.3 mm height (45-degree design slope); roof pairwise span remains under 10 mm. The ceiling is 0.15 mm below the shell underside and 1.25 mm below the actual minimum-floor plane. No support-free, mechanical-strength or filament-saving claim is made.

Tests measure retained floor separation from the actual upward horizontal shell triangles and sample the union of separately classified shell and foot components immediately below/above the interior floor. This avoids treating the foot shoulder as the interior floor or canceling overlapping material via aggregate ray parity. Failed single-hole and array artifacts remain historical and unchanged.

## Round 3 final bounded circular candidate

Square-funnel quick slicing also regressed material (+0.08 g versus baseline, +0.07/+0.06 g over A). Reviewer authorizes exactly one final attempt: a 64-vertex circular mouth diameter 18.6 mm tapering to a circular roof diameter 9.8 mm at z=4.4 mm. Radial change is 4.4 mm over 4.4 mm height. Actual longest roof chord is tested directly; the circle’s bounding-box diagonal is not its unsupported span. Roof-to-shell gap is 0.05 mm nominal and minimum actual floor cover is 1.15 mm. A convex-ring zipper retains the exterior vertices and joins the actual annular bottom to inward cone and roof cap. No new slicing-profile adjustment or extra geometry iteration is authorized if it fails; consumer activation will be withheld while keeping experimental research code/evidence.

## Round 4 consumer gate and reduction-only economy

The final circular benchmark failed its strict material gate: B added 0.05 g to each standard material body; A+B tied A at reported precision and took longer. Geometry remains unchanged for research only. The consumer hollow control is statically disabled and remains disabled in every mode; its status explains measured failure. A false validation gate blocks programmatic UI toggles and captured consumer exports with hidden B state, while direct core builders remain available for reproducible research benchmarks. Reset/reference defaults never activate B.

Economy now takes the minimum of current and candidate wall/floor/bin-scoop/wipe-fillet targets. Already thin values and zero scoops stay unchanged; current-mode isolation remains. Status lists changed fields or states no changes. Approximate 10.2% pair savings are linked only to the measured 2×1×6U X2D 0.4 mm / 0.20 mm Generic PLA/PETG reference; there is no live saving readout or universal strength claim.

`node --test tools/generator.test.mjs tools/test.mjs tools/filament.test.mjs`: 27/27 pass, including original captured handlers for withheld toggle/export states, defaults/reset/reference and thin-input economy behavior. Geometry/default-byte tests still pass; prototype geometry artifacts and unsuccessful slicing remain preserved.
