# Current finding disposition

The original [code review](code-review.md) and [interface recommendations](ui-improvements.md) describe the immutable supplied [baseline](../source/baseline/gridfinity_generator_4.html). This record describes the working source after all three implementation rounds. The [reviewer ledger](rounds/feature-locks.json) defines accepted scope; locks do not certify arbitrary geometry or physical prints. Round 3 reconciles evidence and documentation. F09 copy corrections are implemented and await the reviewer’s final acceptance and lock decision; they qualify geometry/support claims without changing the locked geometry contracts.

## Confirmed baseline findings

| Finding | Current disposition | Evidence and remaining limits |
| --- | --- | --- |
| C1 clearance | Fixed | Both lid builders shrink their mating feet and beads radially; outer footprint/frame stay unchanged. Regression measures changed positions and unchanged STL bounds. Physical fit remains untested. |
| C2 shallow cradle | Fixed for specified incompatibility | Central guard rejects cradle above usable slot/rib envelope before building or export. Regression reproduces the 1×1×2U, 6 mm floor, round wide-slot case. No general intersection proof. |
| C3 label ramp | Fixed for specified incompatibility | Guard rejects inverted/out-of-envelope ramps and pads wider than their shelf; oversized 1×1×2U case cannot export. Increase body size/height or reduce label dimensions. |
| C4 pair revision | Fixed | Actual handlers build and serialize the complete captured revision before requesting downloads. Switching mode during the second-file delay preserves original names and bytes. |
| C5 orientation | Fixed | Sizing, badge and warnings share rotation policy. Both 38×100 and 100×38 fit consistently; oversize packs fail. |
| C6 fractional count | Fixed | Typed 1.5 commits 2 sheets in controls, state and derived requirement; fitting reads the same derived requirement. Continuous measurements retain precision. |
| C7 shared mode edits | Fixed | Complete in-memory parameter snapshots and available-height values restore per mode. Reset affects current mode. No persistence after reload. |
| C8 Saved status | Fixed | Status says Download requested and catches serialization/download request errors. Browser click cannot confirm disk completion; check downloads. Separate buttons remain. |
| C9 startup | Fixed with explicit limitation | Missing THREE and throwing WebGLRenderer produce actionable, keyboard-focusable fallback and disabled exports. Preview and exports remain unavailable until initialization succeeds. DOM-double injection passed; real browser failure testing remains. |
| C10 accessible names | Implemented, manual verification remains | All 13 number/checkbox controls have explicit names. Global focus indication, native buttons/pressed states, polite atomic toast and startup alert exist. Accessibility-tree/screen-reader behavior has not been established. |

## Further risks and semantics

| Finding | Current disposition | Remaining work |
| --- | --- | --- |
| R1 aggregate topology | Open | No Boolean union or self-intersection proof. Reference tray still measures 371 aggregate nonmanifold edges without text; pen tray 264 at 1e-5 mm welding. Independent slicer/layer validation is required. |
| R2 export timing | Fixed in handlers | Fresh captured builds replace cached export meshes. Actual rapid browser edit/export remains a manual gate. |
| R3 direct input budget | Guard added | All builders validate finite bounded numeric parameters, allowed modes and labels up to 1000 characters. seg=0 and NaN reject promptly. Pure derive helpers do not promise validation; mesh, canvas and memory profiling remains open. |
| R4 estimates | Copy improved, calibration open | Mass is an approximate solid PLA estimate; heuristic overlap subtraction remains. Snap estimate is labelled and disabled snap hides judgments. No sliced mass or physical click calibration. |
| R5 half-grid | Copy qualified, seating open | 21 mm half-foot arrangement is an implementation choice. Check actual baseplate seating; no universal compatibility claim. |
| R6 performance | Partially addressed | Input bounds and label limit prevent unbounded direct sampling/text inputs. Builders remain synchronous, rendering continuous, and view changes rebuild. Canvas/edge latency, memory and cancellation remain unmeasured. |
| R7 body tip | Clarified | Tip selection applies to body; lid rim remains rounded. Lip-off behavior is not a physical compatibility guarantee. |

## Interface recommendation disposition

| Baseline recommendation | Current disposition |
| --- | --- |
| Block invalid geometry | Known incompatible cases rejected and preview cleared, including settled/pending edges. Exports show errors; valid controls remain available to recover. Specific errors are in summary/toast, not individually linked to controls. |
| Snapshot pair | Implemented and covered by original-handler/timer tests. |
| Name toggles/numbers | Implemented explicit names and units where appropriate; manual accessibility-tree verification remains. |
| Live errors/status | Polite toast and startup alert implemented. Per-control aria-describedby links and speech behavior remain open. |
| Preserve mode setup | Implemented complete in-memory per-mode snapshots. |
| Show effective dimensions | Existing summaries/warnings retained; orientation/count contradictions fixed; oversized label shelf rejected. Comprehensive requested/effective inline values remain a future UI improvement. |
| Startup/download feedback | Implemented actionable fallback and honest download-request wording. |
| Keyboard camera | Open: rotate/zoom remain pointer/touch controls. Native view buttons are keyboard accessible. |
| Narrow screens/zoom | Open: 320/375 px, 200% zoom and large text need real rendered checks. |
| Focus/contrast | Global visible-focus CSS and exact light/dark secondary-text token contrast regressions pass. Overlay/control and rendered contrast remain untested. |
| Control grouping/warning links | Body lip clarified and existing groups retained. Warning links and broader regrouping remain open. |

## Evidence

Run `node --test tools/generator.test.mjs tools/test.mjs`. The executable tests cover actual builders, independent binary STL measurements and original UI handlers with explicit DOM/timer doubles. They do not fabricate canvas, browser, screen-reader, slicer or printing results. See [verification](verification.md), [Round 1](rounds/round-1.md), [Round 2](rounds/round-2.md), and [Round 3](rounds/round-3.md) for commands, ratings and accepted scope.

F09 source comments now describe envelope guards, overlapping component shells, heuristic mass correction and uncalibrated accuracy. Printing notes describe design intent and require slicer inspection rather than guaranteeing support-free prints. Copy was checked directly in source; geometry is unchanged.
