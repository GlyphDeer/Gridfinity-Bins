# Parameter reference

This reference describes the supplied [source](../source/gridfinity_generator_4.html), not a general Gridfinity standard. References name exact symbols in the current source; use the generated review inventory to locate them after revisions. Defaults are the literal `DEFAULTS` object; `MODE_DEFAULTS`, mode snapshots, and presets can replace them. B = parts bin and its lid, T = tray, W = wipe box and its lid. Unless specified otherwise, numeric dimensions are millimetres. “Range / step” describes the slider, not a guarantee that the resulting mesh is valid. `validateParams` and `requireValid` check inputs before every public builder and export: all numeric keys in `PARAM_LIMITS` must be finite and within their UI ranges, discrete counts must be integers, wipe dimensions must use half cells, enums must match listed choices, labels must be text of at most 1000 characters, and `layerH` must be 0.05–1. Slider steps other than these discrete rules are not enforced for direct API input. The clamps below describe derivation within those bounds. Validation also rejects selected floor, ramp, cradle, and rib ordering failures; it is not a self-intersection or printability proof.

`H = 7 × height units`, `HX = (42 × X cells − 0.5)/2`, `HY = (42 × Y cells − 0.5)/2`, and `F = 4.75 + max(0.6, floorT)` (floor top). Tray X/Y below refer to its internal axes, swapped when `trayDir=x`. Derived wall thickness is `w = max(0.6, min(wall, 2.2))`. Constants: `GRID`, `HU`, `CLEAR`, `H_BASE`, `POCKET0`. These formulas describe requested body dimensions; lips and raised text can extend above H. Cradles whose derived top exceeds H−1 are rejected.

## Size, walls, lip, and mesh

| Key | Default | Range / step or choices | Modes and effective behavior | Source symbols |
| --- | --- | --- | --- | --- |
| `nx` | 2 | 1–6 / 1 cells | B,T footprint X; no additional derivation clamp | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `ny` | 1 | 1–6 / 1 cells | B,T footprint Y; no additional derivation clamp | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `hu` | 6 | 2–20 / 1 U | B,T nominal body H | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `wnx` | 2.5 | 1–6 / 0.5 cells | W; rounded to half cells, minimum 1 | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `wny` | 1 | 1–6 / 0.5 cells | W; rounded to half cells, minimum 1 | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `whu` | 8 | 3–20 / 1 U | W nominal body H | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `wall` | 1.5 | 0.8–2.2 / 0.05 | B,T,W; effective w above | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `floorT` | 1.5 | 0.8–6 / 0.05 | B,T,W; minimum 0.6; added above 4.75 mm base, not total base thickness | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `lip` | true | checkbox | B,T body lip toggle; W always builds its lip. Shared state | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `lipTipStyle` | round | round, flat, sharp | B,T,W body tip shape. Lid frame always uses rounded-tip construction, independent of this selector | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `lipRound` | 0.5 | 0.05–1 / 0.05 | Tip radius; derivation clamps 0–1.2; B,T set radius to 0 when lip off; W does not | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `lipTip` | 0.6 | 0.2–2 / 0.05 | Flat tip parameter, effective 0.2–2; applies to flat body tip | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `lineW` | 0.42 | 0.2–0.9 / 0.02 | Extrusion-width assumption for warnings and explanatory text; does not change mesh or slicer settings | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `layerH` | 0.2 | No control | No geometry effect; validator requires a finite value from 0.05 to 1 | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `seg` | 0.7 | 0.2–3 / 0.1 | B,T,W ring sampling distance. Foot sampling scales by `max(1,sqrt(nx×ny)/1.5)` in B,W | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |
| `cornerSegs` | 10 | 3–20 / 1 count | B,T,W samples per ring corner; not a smoothing or manifold guarantee | `DEFAULTS`, `validateParams`, `derive`, `deriveTray`, `deriveWipe` |

## Bin scoop, shelf, and window

These controls affect B. Shelf controls depend on `labelMode`; the UI can retain values even when their feature is disabled. Definitions: `openX=2HX−2w`, `openY=2HY−2w`, `padW=labelW+2labelClear`, `padH=labelH+2labelClear`.

| Key | Default | Range / step or choices | Effective behavior | Source symbols |
| --- | --- | --- | --- | --- |
| `scoop` | 10 | 0–20 / 0.5 | Zero at ≤0.05; otherwise limited to nonnegative minimum of requested value, `min(openX,openY)−2`, and `H−2.6−F−1` | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `scoopWalls` | one | one, both, four | Front; front/back; all four walls | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `labelMode` | one | off, one, all | Disables shelf, selects one column, or continuous shelf across columns | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `labelCol` | 1 | 1–nx / 1 index (markup maximum 6) | One-based column; UI maximum follows nx and reduces stored value when necessary; derivation also caps index | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `labelW` | 30 | 10–240 / 1 | Requested label width. Single-column shelf width capped at 35.9; all-column shelves with nx>1 use 42 mm ramp spans. Validator rejects padW > tabW−2×labelBorder+0.01 before construction, including all-column mode | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `labelH` | 12 | 3.5–40 / 0.5 | Label depth; shelf depth = padH + twice border | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `labelClear` | 0.3 | 0–1.5 / 0.05 | Added on each pad side | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `labelBorder` | 1 | 0.4–4 / 0.1 | Border around pad; also participates in clipping | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `padR` | 2.3 | 0.5–6 / 0.1 | `max(0.5,min(request,min(padW,padH)/2−0.2))` | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `padDepth` | 0.2 | 0–1.2 / 0.05 | Pad recess depth; no additional derivation clamp | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `tabDrop` | 1.5 | 0–8 / 0.1 | Shelf top = H−tabDrop | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `tabFace` | 2 | 0.6–6 / 0.1 | Shelf front face thickness; bottom = shelf top−tabFace | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `tabAngle` | 45 | 35–70 / 1 degrees | Initial clamp 30–80; recomputed if ramp would meet wall below F+0.5. Effective angle can differ from slider | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `window` | true | checkbox | Lid opening corresponding to shelf; useful only when shelf exists | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |
| `winLedge` | 0.4 | 0.2–2 / 0.1 | Window ledge clamps to 0.2–3.75 | `DEFAULTS`, `validateParams`, `derive`, `buildRamp`, `buildLid` |

## Lid and snap fit

These controls affect B,W, except where noted. Snap beads and receiving grooves have independent toggles. They are not a physical fit calibration.

| Key | Default | Range / step or choices | Effective behavior | Source symbols |
| --- | --- | --- | --- | --- |
| `snap` | true | checkbox | Lid-foot beads | `DEFAULTS`, `validateParams`, `derive`, `deriveWipe`, `buildLid`, `buildWipeLid` |
| `groove` | true | checkbox | Receiving groove in box lip | `DEFAULTS`, `validateParams`, `derive`, `deriveWipe`, `buildLid`, `buildWipeLid` |
| `beadR` | 0.9 | 0.3–0.9 / 0.05 | Effective 0.2–0.9; participates in groove vertical extent even when snap disabled | `DEFAULTS`, `validateParams`, `derive`, `deriveWipe`, `buildLid`, `buildWipeLid` |
| `beadLen` | 14 | 6–28 / 0.5 | B passes requested run length to mesh; W caps to flat lengths minus 2, minimum 3 | `DEFAULTS`, `validateParams`, `derive`, `deriveWipe`, `buildLid`, `buildWipeLid` |
| `grooveLen` | 17 | 8–32 / 0.5 | B passes requested run length; W `max(effective beadLen+1.5,min(request,min(flatX,flatY)−0.5))` | `DEFAULTS`, `validateParams`, `derive`, `deriveWipe`, `buildLid`, `buildWipeLid` |
| `grooveDepth` | 0.9 | 0.4–1.55 / 0.05 | Remaining groove wall = `max(0.35,1.9−request)` | `DEFAULTS`, `validateParams`, `derive`, `deriveWipe`, `buildLid`, `buildWipeLid` |
| `grooveClear` | 0.10 | 0–0.4 / 0.02 | Expands groove vertically above/below bead envelope | `DEFAULTS`, `validateParams`, `derive`, `deriveWipe`, `buildLid`, `buildWipeLid` |
| `stackClear` | 0 | 0–0.4 / 0.05 | Lid foot radial clearance: increases insets below H_BASE on both lid types, reducing mating-foot dimensions; also subtracts from `snapDeflect=beadR−0.25−stackClear`. Box mesh is unchanged | `DEFAULTS`, `validateParams`, `derive`, `deriveWipe`, `buildLid`, `buildWipeLid` |
| `lidBody` | 2.6 | 2.6–10 / 0.1 | Minimum 2.6; lid body top = 4.75 + effective value | `DEFAULTS`, `validateParams`, `derive`, `deriveWipe`, `buildLid`, `buildWipeLid` |
| `lidChamfer` | 0.8 | 0–2 / 0.1 | Nonnegative, capped at effective lidBody−0.9 | `DEFAULTS`, `validateParams`, `derive`, `deriveWipe`, `buildLid`, `buildWipeLid` |

## Tray slots, cutout, and text

All controls here affect T. Let `A=2HX−2side`, `yFront=−HY+front`, `yBack=HY−back`. Effective slot width is S; effective count is N; rib width `R=(A−N×S)/(N−1)` for N>1, otherwise 0.

| Key | Default | Range / step or choices | Effective behavior | Source symbols |
| --- | --- | --- | --- | --- |
| `trayDir` | y | y, x | Changes slot axis; x swaps internal nx/ny and rotates resulting geometry | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `sideBorder` | 4 | 1–20 / 0.25 | `max(w,min(request,HX−6))` | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `frontBorder` | 5 | 1–25 / 0.25 | `max(w,min(request,HY−6))`; carries labels | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `backBorder` | 1.5 | 1–25 / 0.25 | `max(w,min(request,HY−front−4))` | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `slotW` | 8 | 1–40 / 0.1 | `max(1,min(request,A))` | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `slots` | 10 | 1–40 / 1 count | Rounded integer, minimum 1, maximum `max(1,floor((A+0.001)/S))` | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `ribChamfer` | 1 | 0–4 / 0.05 | N>1: nonnegative minimum of request, `(R−0.4)/2`, `H−F−0.6`; otherwise 0 | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `slotBottom` | square | square, round | Enables circular cradle | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `cradleR` | 0 | 0–40 / 0.2 | Round only; 0 means S/2. Effective radius bounded by S/2 and 20S. Derived depth is `radius−sqrt(radius²−S²/4)`; validator rejects derived cradle top >H−1 | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `cut` | true | checkbox | Finger cutout additionally requires effective radius>0.5 and web clearance>0.2 | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `cutR` | 10 | 2–30 / 0.5 | Nonnegative minimum of request, A/2, `(yBack−yFront)/2−0.5` | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `cutY` | 0 | −60–60 / 0.5 | Clamped between front+radius+0.5 and back−radius−0.5 | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `cutWeb` | 1 | 0.4–8 / 0.1 | `max(0.4,min(request,H−F−1))` | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `trayText` | true | checkbox | Enables raised text; browser canvas required | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `textH` | 4.4 | 1.5–12 / 0.1 | Nominal text height; text can scale down to fit pitch minus 0.6 | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `textD` | 0.6 | 0.2–2 / 0.05 | Text above H; text generation requires >0.01 | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |
| `labels` | 4H, 3H, 2H, H, F, HB, B, 2B, 3B, 4B | Text, ≤1000 characters | Comma, semicolon, or vertical-bar separators; whitespace trimmed; one entry per slot, missing entries blank | `DEFAULTS`, `validateParams`, `deriveTray`, `buildTray` |

## Wipe packets and front notch

All controls here affect W. Packet measurements inform badges, warnings, and **Size the box to this pack**; entering them alone does not resize the box. Fit sorts footprint sides, adds a 1 mm allowance, then chooses half cells up to 6 and height up to 20U (`fitPack`). Fit badges, warnings, and automatic sizing use orientation-independent packet dimensions through `packOrientation` / `wipePackFits`. Either footprint input order is accepted.

| Key | Default | Range / slider step | Effective behavior | Source symbols |
| --- | --- | --- | --- | --- |
| `packL` | 100 | 20–240 / 0.5 | Packet length; typed input step 0.1 | `DEFAULTS`, `validateParams`, `deriveWipe`, `fitPack`, `NUMS` |
| `packW` | 38 | 20–240 / 0.5 | Packet width; typed input step 0.1 | `DEFAULTS`, `validateParams`, `deriveWipe`, `fitPack`, `NUMS` |
| `sheetT` | 2.9 | 0.3–12 / 0.1 | Thickness; typed step 0.01; derived minimum 0.2 | `DEFAULTS`, `validateParams`, `deriveWipe`, `fitPack`, `NUMS` |
| `sheetN` | 15 | 1–60 / 1 sheets | Typed input commits a rounded whole count; direct builder input must be integer. Fit uses the same derived stack requirement | `DEFAULTS`, `validateParams`, `deriveWipe`, `fitPack`, `NUMS` |
| `stackMode` | count | count, height | Uses derived count×thickness or stackH; switching converts current input with bounds | `DEFAULTS`, `validateParams`, `deriveWipe`, `fitPack`, `NUMS` |
| `stackH` | 43.5 | 2–140 / 0.5 | Measured stack; typed step 0.1; derived minimum 0.5; active in height mode | `DEFAULTS`, `validateParams`, `deriveWipe`, `fitPack`, `NUMS` |
| `wFillet` | 2.6 | 0–12 / 0.1 | Zero at ≤0.05; otherwise nonnegative minimum of request, `min(openX,openY)/2−1`, `H−2.6−F−1` | `DEFAULTS`, `validateParams`, `deriveWipe`, `fitPack`, `NUMS` |
| `notch` | true | checkbox | Also requires effective drop>0.3 and width>4 | `DEFAULTS`, `validateParams`, `deriveWipe`, `fitPack`, `NUMS` |
| `notchW` | 48 | 10–200 / 1 | Effective 4 to `max(4,2HX−23)`; reserves corner spans and 15 mm total front lip | `DEFAULTS`, `validateParams`, `deriveWipe`, `fitPack`, `NUMS` |
| `notchFlat` | 14 | 0–120 / 1 | Nonnegative, capped at effective width−8 | `DEFAULTS`, `validateParams`, `deriveWipe`, `fitPack`, `NUMS` |
| `notchDrop` | 26 | 0–80 / 0.5 | Nonnegative, capped at binTop−notchFloor | `DEFAULTS`, `validateParams`, `deriveWipe`, `fitPack`, `NUMS` |
| `notchKeep` | 12 | 2–40 / 0.5 | notchFloor = F+max(1,request) | `DEFAULTS`, `validateParams`, `deriveWipe`, `fitPack`, `NUMS` |

Typed packet inputs clamp to the matching slider's min/max without quantizing to its step, except sheet count, which rounds immediately; nonfinite input leaves previous state intact (`NUMS` handlers). Derived values usually do not replace the displayed requested value.

## UI state outside DEFAULTS

`AVAIL` starts at 60 mm for bin/tray and 90 mm on first wipe visit; its slider is 20–200 / 1. Each mode retains its own value in memory. Reset leaves its current available height intact. It affects the available-height check, not geometry. `MODEL` initially selects bin; `VIEW` initially selects assembly (`asm`). Theme is stored separately as `gf-theme`. These are not missing parameter keys. `switchModel` saves/restores complete parameter and available-height snapshots per mode and returns the view to assembly. Snapshots last only until reload; only theme persists. There is no saved user-configuration format in this version.

## Filament reduction and research gate

| Key / action | Default | Units / limits | Affected modes and behavior | Source symbols |
| --- | --- | --- | --- | --- |
| `hollowFeet` | false | Boolean, strictly validated | Research bin-body geometry only; tray/wipe requests reject. The released UI disables activation in all modes and blocks consumer exports with an injected true state because slicing did not establish additional savings. Direct research builders can still generate it. | `validateParams`, `hollowFootBottom`, `buildBin`, `HOLLOW_SAVINGS_VALIDATED`, `exportRevision` |
| Economy button | No automatic application | Targets: wall 1.2 mm, floor 1.0 mm, bin scoop 3 mm, wipe fillet 3 mm | Uses the smaller of current value and target. Preserves dimensions, already thinner values, disabled scoops/fillets, labels, lip/snap settings and prototype state. Applies only to the active mode; tray has no scoop/fillet mutation. | `economyCandidate`, `modeStates` |

There are 71 DEFAULTS keys. `HOLLOW_SAVINGS_VALIDATED` is a UI release gate, not a dimensional parameter or proof of printability. The final circular research cavity has an 18.6 mm mouth, a 9.8 mm roof and 4.4 mm ceiling; it is unavailable through normal exports. See [the filament guide](filament-saving.md) for evidence and research access.
