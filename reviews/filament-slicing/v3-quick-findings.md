# Third cavity prototype: quick material gate

2026-10-10. Frozen candidate SHA256 `de5b8ae3dcc49c533ff64e1d4a67545bdf1b8fa924e208e1fd57365f8fd2e474`. [Case definitions](cases-v3-quick.json) and [results](comparison-v3-quick.json) preserve eight successful exit-zero slices: freshly verified baseline body/lid and third-prototype standard/economy bodies, in PLA and PETG.

| Body configuration | PLA estimate (g) | PETG estimate (g) |
| --- | ---: | ---: |
| Fresh baseline, solid feet | 31.27 | 31.04 |
| Third prototype, hollow feet | 31.35 | 31.12 |
| Previously verified economy, solid feet | 26.83 | 26.64 |
| Third prototype, economy + hollow | 26.90 | 26.70 |

The larger single-mouth taper still fails the gate: +0.08 g over baseline in each material and +0.07 g PLA/+0.06 g PETG over economy alone. Baseline and economy reference profile hashes/version are identical to prior successful results. Full sixteen-slice validation was deferred because net savings were absent in the quick gate. Candidate lids were not resliced in this quick batch, so no new independently sliced candidate pair claim is made.

Support toolpaths are absent with the same support-disabled official reference preset. Macro warnings and physical-validation limits remain in [README.md](README.md). No physical support-free, load, fit or bridge-quality claim is established.
