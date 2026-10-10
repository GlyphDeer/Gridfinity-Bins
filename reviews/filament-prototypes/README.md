# Historical filament prototypes

These three exact source snapshots preserve failed research candidates. The first small-cavity candidate is recorded by hash and measurements, but its full source snapshot was not retained. All four tested designs failed to show positive marginal savings in the tested X2D reference profiles. They are not the released consumer app and have not been physically validated. Use the current [generator](../../source/gridfinity_generator_4.html) for normal operation.

Replay the controlled historical comparison with installed Bambu Studio profiles:

```sh
python3 tools/slice-benchmark.py --cases reviews/filament-prototypes/replay-cases.json --summary reviews/filament-slicing/replay-summary.json
```

The tool checks source hashes and records its own current slicer/profile versions. New versions can yield different estimates; do not assume they reproduce historical grams. It performs local slicing and sends no print jobs. Benchmark G-code is measurement evidence, not approved printer-ready output. See [slicing notes](../filament-slicing/README.md) and the [research report](../filament-research.md).
