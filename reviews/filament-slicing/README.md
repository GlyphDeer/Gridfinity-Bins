# Offline X2D slicing benchmark

Run `python3 tools/slice-benchmark.py` from the repository. Requires Node, Python and a local Bambu Studio installation; alternate executable/profile roots and cases are supported through `--help`. No GUI, printer connection, print-job submission or personal slicer settings are used. Official bundled profile inheritance and includes are flattened into full machine/process/filament JSON as required by the [official CLI manual](https://github.com/bambulab/BambuStudio/wiki/Command-Line-Usage).

The reference is Bambu Studio 02.08.04.57, Bambu Lab X2D with 0.4 mm nozzle, 0.20 mm Standard, Generic PLA or Generic PETG, Textured PEI Plate. It uses the official preset's 2 classic wall loops, 15% grid infill, 5 top layers/1 mm minimum, 3 bottom layers and disabled supports. The bed is an explicit benchmark selection because the CLI otherwise chooses Cool Plate, incompatible with this PETG preset. Upright bodies and feet-down lids retain model orientation; only XY arrangement is enabled. The selected profiles are comparison references, not the user's saved settings or a certified physical-print prescription.

[summary.json](summary.json) records source/STL/G-code/effective-settings hashes, complete resolved input settings and original bundled profile hashes, CLI return status, warnings and header statistics. Large local runs contain full generated STLs, G-code, effective settings, command arguments and logs; `runs/` is ignored. Only exit-zero slices with nonempty G-code are accepted as successful. Reported grams/time are slicer estimates; no prints were made or weighed and no visual layer/bridge inspection is established. Support paths are absent because the profile disables supports, not because support-free performance has been proven.

Unmodified official-profile runs using `--export-3mf` aborted on this installed macOS CLI after G-code generation. The benchmark instead uses `--export-slicedata`, which returns zero and retains direct `plate_1.gcode`. It does not omit macros or use `--no-check`. Official X2D end macros log `Invalid T command (T65279)` and `Invalid T command (T65535)` even on successful slice-data runs. Keep these warnings visible; this consumption comparison is not approval of printer-ready G-code or end-macro correctness.

The unchanged 2×1×6U baseline uses 31.27 g body + 12.24 g lid in PLA (43.51 g pair); 31.04 g body + 12.15 g lid in PETG (43.19 g pair). Existing-control wall 1.2 mm/floor 1.0 mm/scoop 3 mm yields 26.83 g PLA body or 26.64 g PETG body. Reusing the identical baseline lid gives 39.07 g PLA or 38.79 g PETG pairs, approximately 10.2% less estimated consumption for this specific sliced case. These figures do not apply automatically to another footprint, height, mode, material brand or profile. The experimental hollow base has not been included in this initial comparison.

## Current revisions and historical replay

The default benchmark intentionally replays the archived pre-filament baseline and existing-control economy reference. To evaluate the current working generator after code changes, use [current-cases.json](current-cases.json):

```sh
python3 tools/slice-benchmark.py --cases reviews/filament-slicing/current-cases.json --summary reviews/filament-slicing/current-summary.json
```

These patches define the fixed 2×1×6U reference geometry; they do not promise that every custom configuration receives the same savings. Both current reference STL pairs were checked byte-for-byte against the archived measured baseline/candidate. Each future run records its own source and profile versions. Historical case files record the original invocation paths, which may point into ignored local runs; use the [portable replay manifest](../filament-prototypes/README.md) for retained snapshots. Full G-code/log artifacts are local-only; published JSON preserves the recorded measurements and hashes.
