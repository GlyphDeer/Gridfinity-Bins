# Filament Round4 — useful economy controls and withheld prototype

Status: complete; E01 reduction-only repair and E05 consumerintegration locked. E02 remains research-only with failed/withheldreleasegate.

## E01 reduction-only repair

Concrete reproduction: current user wall0.8/floor0.8/scoop0 becomes1.2/1/3 on economyclick. That increases thickness and re-enables a disabledscoop. Reviewer authorizes `min(current,target)` for applicable wall/floor/bin-scoop/wipe-fillet instead. Preserve values already belowtargets, zero/disabled features, every unrelatedsetting, modeisolation and explicitBstate. Defaults remain unchanged. Test both ordinarydefaults and alreadythin/disabledcases acrossmodes. Explain actual changes and nochange cases honestly; no universal savingpercent.

## E05 consumer integration and material gate

Final circularprototype did not show positive B marginal savings: standardbody+0.05g PLA/PETG, A+B tiedA at reportedprecision withlongertime. Remove or disable B consumeractivation with visible explanation that benchmark didnot establish saving; ordinaryUI must not enable it. Retain developergeometry/tests/evidence as research, clearly documented. Reject consumerexport if an unsupported or withheldBstate somehow reaches the UI, while developerbenchmark builders may explicitly exerciseprototype. Reset/reference/modes must not accidentally activateB. Preserve separatelegacyexportcontracts and defaultSTLbytes.

A remains opt-in. Describe approximately10.2% estimatedpair saving ONLY for the verified2×1×6Ureference and namedprofiles, link evidence, qualify differentsettings/materials/strength. No fictitious live savings readout; source-volume estimates are not slicerconsumption. Explicit names/focus/status remain; no enabled control that pretends to change geometry whengated.

Acceptance: originalhandler tests for defaultandthininputs, disabledBcontrol plus consumerexportguard includingprogrammaticstate, model-switch/reset behavior; fullregressionspass; currenthelp and status match actions and evidence. Physicaltrials and realbrowserinteraction remain unverified. ## Independent result

Reviewer ran **27/27 Node tests passing**, inspected source min(current,target), changed/nochange status, disabledallmodes control, programmaticchange rejection and exportguard beforebuild. Researchbuildersremain usable; originaldefaultbytes andgeometrymatrix stay unchanged. Source `34258848f30adeb0d48972c93859ecf502f68102fb9b2ce280268ee342c14b8c`.

E01 andE05 locked. This protects ordinaryusers from the failed B savinghypothesis and avoids making alreadythin configurations thicker. A~10.2% claim is explicitly tied to the verifiedreference/profile; no universal saving claim.

**Round4 score:8.3/10** (correctness8, evidence9, UI8, docs8; weighted8.30). Static/handler testing doesnot establish realbrowser orphysical behavior; finalcanonicaldocs remain Round5 work.
