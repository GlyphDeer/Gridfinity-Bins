# Second cavity prototype: net material gate

2026-10-10. The immutable candidate snapshot has SHA256 `9e3373ce77ed8fad60ccf3294115ffd8cd1a2f227a769e562d00a0376ad47334`. [Case definitions](cases-v2.json) reference the local ignored snapshot rather than mutable working source; [comparison-v2.json](comparison-v2.json) records all hashes, official profiles, settings and output headers. The snapshot is local evidence, not a remotely published source artifact.

All sixteen slices returned zero. The redesigned three-by-three cavity layout in each body foot uses **more** estimated material than the corresponding solid-foot model:

| Configuration | PLA body (g) | PLA pair (g) | PETG body (g) | PETG pair (g) |
| --- | ---: | ---: | ---: | ---: |
| Baseline | 31.27 | 43.51 | 31.04 | 43.19 |
| Economy, solid feet | 26.83 | 39.07 | 26.64 | 38.79 |
| Hollow v2 only | 32.08 | 44.32 | 31.85 | 44.00 |
| Economy + hollow v2 | 27.64 | 39.88 | 27.44 | 39.59 |

Hollow v2 adds 0.81 g to default bodies/pairs in both materials. Relative to economy alone, it adds 0.81 g PLA and 0.80 g PETG. Its combined savings against the original baseline arise from the economy parameters, not from cavities. The cavities fail the material-saving acceptance criterion in the tested profile and case. The initial cavity's smaller +0.12 g penalty remains preserved in [round3-findings.md](round3-findings.md).

For the hollow-only body, PLA model time rises from 55m40s to 59m56s; PETG rises from 1h06m25s to 1h11m02s. The ordinary lids remain unchanged at 12.24 g PLA and 12.15 g PETG.

Support paths remain absent because the reference preset disables supports; this does not establish printability of cavity roofs. Official macro invalid-T warnings remain recorded. No automatic-check bypass, machine/profile substitution, physical print, bridge/layer visual inspection or load test occurred. Settings and shared limitations remain in [README.md](README.md).
