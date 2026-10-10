# Experimental foot-cavity comparison

2026-10-10. [Exact case patches](cases-round3.json), [full slicing results](comparison-round3.json). Current source SHA256 `2b021e6fe9ccb9be6bd900ca61f0a646af114dd87d0f8ab475022885b7cde518`; archived baseline `7fad9ed651b568bde8fb85c35e8a86cfb05d078e3f621b440915726c2bce2421`. All sixteen offline slices returned zero using unmodified X2D 0.4 mm reference profiles and validity checks; no print jobs were sent.

The experimental `hollowFeet:true` geometry fails its filament-saving gate for the tested 2×1×6U case. Adding it increases estimated consumption despite lowering geometric solid volume.

| Case | PLA body (g) | PLA pair (g) | PETG body (g) | PETG pair (g) |
| --- | ---: | ---: | ---: | ---: |
| Baseline | 31.27 | 43.51 | 31.04 | 43.19 |
| Economy | 26.83 | 39.07 | 26.64 | 38.79 |
| Hollow only | 31.39 | 43.63 | 31.16 | 43.31 |
| Economy + hollow | 26.95 | 39.19 | 26.75 | 38.90 |

The lid stays at 12.24 g PLA or 12.15 g PETG in every case. Hollow only adds 0.12 g per body/pair in both materials. Adding hollow to economy adds 0.12 g PLA or 0.11 g PETG. Its geometry should be revised and remeasured, or retained solely as an explicitly experimental option without a material-saving claim. Existing economy controls alone retain approximately 10.2% pair savings in this reference case.

The likely mechanism is added cavity perimeters/roof layers replacing a region that the slicer previously filled sparsely. That is an inference from the geometry and settings, not a measured feature-by-feature decomposition. Support toolpaths are absent because the chosen official profile disables supports; no support-free printing claim follows. PLA hollow body model time increases from 55m40s to 56m08s; PETG from 1h06m25s to 1h07m01s.

Reference settings and limitations are in [the benchmark notes](README.md). The successful slice-data route retains official end-macro `Invalid T command` warnings; G-code is consumption evidence and has not been approved for physical printing. No visual layer/bridge inspection, load testing, physical seating or weighed-print checks were performed.
