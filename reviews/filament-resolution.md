# Filament implementation disposition

User approved opt-in economy A and experimental hollow feet B, followed by five check/fix cycles. [The new ledger](filament-rounds/feature-locks.json) preserves reviewer-only lock history; [prior locks](rounds/feature-locks.json) remain intact.

**A is available:** the economy action uses the smaller of each current value and its target, never raises already thinner settings or re-enables a zero scoop/fillet. It changes only active-mode wall/floor and applicable scoop/fillet fields. Standard defaults, label/window/snap settings, dimensions and other modes are retained. Actual reference slicer estimates show about 10.2% less pair filament for the documented 2×1×6U bin.

**B is withheld from consumer activation/export:** four cavity designs did not establish additional savings in the fixed X2D PLA/PETG reference profiles. The final circular prototype adds 0.05 g to the standard body and ties economy at reported precision while taking longer. Its exact exterior/flat floor/roof/cavity checks passed, but reduced mesh volume did not establish material benefit. The developer bin builder, tests, measurement data and three exact historical snapshots remain available for research; the first candidate survives by hash/measurements only. No more geometry optimization was authorized in this five-cycle task.

Final source SHA-256: `1d350c214690a56ce75e58f6e0bf237438aca61964634bee367a59734dafde12`. Standard mesh bytes match the archived pre-filament version for all five builders. The 76-foot geometry matrix verifies cavity occupancy, boundaries, actual roof span, retained floor and unchanged exterior profiles. Individual feet have no detected topology defects; known aggregate coarse/all-label and tray topology risks remain, as do Boolean-union/self-intersection limitations.

Lead verification: 27 Node tests and 7 Python evidence-parser tests pass. The current review completes 37 cases: 32 mesh results and 5 expected validation rejections. Recorded G-code hashes in the initial, array, square and circular benchmark reports were checked against actual local outputs. An intentionally missing CLI returns failure and writes a fatal prerequisite record, without simulated estimates.

Delegated documentation/reviewer tasks encountered a service usage limit. The lead drafted documentation and checked source/evidence independently of the fixer; the final round report records whether renewed independent delegation succeeded. Unavailable delegation is not silently treated as success.

See [the user guide](../docs/filament-saving.md), [slicing method](filament-slicing/README.md), [failed-candidate evidence](filament-slicing/v4-quick-findings.md), and [historical replay](filament-prototypes/README.md). Real browser, visual layer/bridge, physical load/fit, material calibration and weighed-print checks remain unperformed. Official macro warnings mean benchmark G-code is not approved printer-ready output.

## Final closure

Five cycles completed at 7.4 → 7.2 → 7.4 → 8.3 → 8.5 out of 10. Independent reviewer delegation resumed and completed rounds 3–5, including review of the lead-drafted documentation. Every accepted scope is locked; E02's research geometry is locked with consumer release withheld. The final evidence links open in separate tabs to preserve in-memory settings. Current automated diagnostics are published in [final-checks.json](final-checks.json).
