# Filament Round3 — net material repair and real slicing gate

Status: complete; E02 researchgeometry locked with consumerrelease withheld; E04 measurement contract locked.

## Authorized third candidate

Actual v2 sixteen-slice evidence in `reviews/filament-slicing/comparison-v2.json` shows +0.81gPLA/PETG baseline and +0.81/+0.80g withA. Reviewer authorizes replacing the highperimeter3×3array with ONE wider tapered cavity perfoot, candidate mouth15.6×15.6mm tapering to7×7mmroof atZ4.3mm. This is an engineering hypothesis to reduce bottomskin while limiting internalperimeter and bridge span; it is not a predicted measured saving.

Use true annularbottom, taperedinnerwalls and cavityroof, no subtraction shells. Preserve exactoriginal exteriorfoot sides, bodyshell/interiorfloor and lidSTL, standarddefaults/Boffbytes, mode/exportguards and old locks. Maintain roof below shellbottom4.45mm, actual roofpairwise span≤10mm, minimumradialwall≥1.2mm, and retained material to actual interiorfloor≥1mm. Atminimumfloor0.8mm, floorZ5.55 minusroof4.3 leaves1.25mm nominal separation; measure it. Adapt tests that formerly used isolatedfootshoulderZ5.05 as a surrogate for interiorfloor: it is not the actual retainedfloor measure. Verify isolatedfootroof plus union-aware shell/floor sections without erroneous odd/even cancellation in overlap. Cavity count/layout and roofZ were candidate-specific, not immutable contracts. No unsupported weakening of geometry constraints.

## E04 actual material acceptance

Benchmark baseline/A/B/A+B bodyandlid, PLAandPETG, same official X2D0.4mm/0.20mm profiles, same orientations/settings. Capture immutable source+STL hashes, exactcommand/profile provenance, successful exitstatus, material estimates, modeltime, warnings and repairs. Compare B marginally withbaseline and A+B withA, not just combinedagainstbaseline. Require positive marginal estimatedsavings inbothmaterials for the representative case before a usefulsaving claim. State absolute grams and percent with proper denominator; rounding-sized differences are weak evidence. Validate parser against actual outputheaders. Preserve prior failedcandidate evidence.

Repeat23test contracts including adapted everyfoot extremegeometry matrix. Independentreviewer inspects benchmarkmethod/results and reruns feasible checks. Actual successful slicing doesnot establish safeGcode, visualbridge quality, supportfreeprintability or strength; endmacro warnings remain disclosed. If this candidate stillfails, report evidence and withhold B materialclaim; do not disguise failure with a perfectscore or alteredprofiles.

## Independent result

Finalcircle structural regressions: **23/23 pass**, all76feet inspected by exportedgeometry matrix; source `c2f75a59193df0f5b021f92bfdda2d4d4dcdd54a1b2303b3dc9c7ebb074a8e99`. Actual eight-slice quick gate records standardB+0.05gPLA/PETG andA+B tiedA atreportedprecision withlongermodeltime. No furthercandidate authorized. E02 is locked as researchgeometry; consumerrelease/materialbenefit gate is **withheld/failed**.

Reviewer inspected unchangedprofile metadata/realheaders and reran **7/7 Pythonparser tests**. Independently invoked missingCLI: exit1,fatalFileNotFoundErrorJSON, emptyresults; no simulated evidence. E04 locks reproducible measurement integrity, not a positive B result. Earlier fullcomparisons and laterquickgate limits remain explicit; finalcandidate lids were not independentlyresliced inquickgate.

**Round3 score:7.4/10** (correctness/materialobjective6, evidence9, UI6, docs8.5; weighted7.40). UsefulA benefit is evidenced; B materialobjective failed. Physicalstrength, visualbridge layers and printerreadyGcode remain unverified.

## Bounded final refinement authorized

The eight-body-slice v3 quick evidence (`comparison-v3-quick.json`, `v3-quick-findings.md`) reports the wider square cavity still adds0.08g to baselinePLA/PETG and0.07/0.06g toA. Reviewer authorizes ONE final closedform circular tapered candidate in this same open E02/Round3 scope: roofdiameter≤9.8mm and mouthdiameter≤18.4mm atroofZ4.3mm (or≤18.6mm atZ4.4mm). Actual maximum pairwise roofvertex distance must stay≤10mm; circular boundingbox diagonal is not the bridge diameter. This is a bounded attempt to use more aperturearea within the unchanged longestspan budget, not an openended parameter search.

Preserve exactexterior/shell/lid/defaultbytes and measuredwall≥1.2mm, actualfloorcover≥1mm, roofZ<4.45mm. Actual exportedcomponent boundaries/sections/topology and all legacy tests must pass; triangulation needs seam alignment with originalfoot boundaries. Rerun identical official profile comparison. No profile modification, constraint relaxation or more geometry candidates are authorized after this attempt without a new explicit task decision.

If B still has no positive marginal saving, withhold consumer activation and savingclaims in Round4 while retaining clearly experimental code/evidence for research. Complete Round5 documentation with the negative result and approved useful A evidence. A measured failed hypothesis is acceptable evidence; calling that a successful savingfeature or10/10 would not be.
