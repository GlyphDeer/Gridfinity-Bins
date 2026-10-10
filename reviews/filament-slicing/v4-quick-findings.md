# Final bounded cavity prototype: quick material gate

2026-10-10. Frozen candidate SHA256 `c2f75a59193df0f5b021f92bfdda2d4d4dcdd54a1b2303b3dc9c7ebb074a8e99`. [Case definitions](cases-v4-quick.json) and [results](comparison-v4-quick.json) preserve eight successful slices using unchanged official X2D 0.4 mm reference profiles. The final circular taper fails the strict positive-savings gate in both materials.

| Body configuration | PLA estimate (g) | PETG estimate (g) |
| --- | ---: | ---: |
| Fresh baseline, solid feet | 31.27 | 31.04 |
| Circular prototype, hollow feet | 31.32 | 31.09 |
| Previously verified economy, solid feet | 26.83 | 26.64 |
| Circular prototype, economy + hollow | 26.83 | 26.64 |

Hollow alone adds 0.05 g in each material; combined with economy it is equal to economy alone at the slicer's 0.01 g reporting precision. Equality is not proof of savings. Hollow also increases model time: economy PLA goes from 52m49s to 54m15s; economy PETG from 1h04m36s to 1h06m03s. Candidate lids were not resliced in the quick gate, so no new candidate pair estimate is asserted.

All reference/candidate numeric profile hashes match the earlier measurements. No support toolpaths were generated because the reference preset disables supports. Official invalid-T macro warnings remain recorded. No physical print, bridge, load, fit or weighed-filament validation occurred. The planned full sixteen-slice batch was withheld because the quick gate did not pass. Further geometry attempts fall outside this bounded research exercise; the consumer filament-saving control should be withheld.

The evidence parser now requires completed header/config/executable blocks, finite positive mass/length/density/diameter, valid time fields and X2D 0.4 machine identity. Seven pure-parser tests exercise valid, missing/truncated, duplicate, negative, NaN/infinite and wrong-machine evidence. All eight actual final-candidate G-code files also pass the new parser. The header's raw volume field is retained unchanged; normalized cubic-centimetre volume is derived explicitly from reported filament length and diameter, avoiding the installed CLI's ambiguous raw volume-unit label.
