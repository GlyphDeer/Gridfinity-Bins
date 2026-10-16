# Horizontal battery tray verification — 2026-10-15

The photos establish a flat compartment layout and thin dividers. The user identified the reference cells as an 18650 and an AA-sized Vapcell. New ruler photos suggest roughly 125 mm across the compartments and 31 mm overall height; the short dimension is unconfirmed. This is a photo-based adaptation with Gridfinity feet and lid, not an exact dimensional replica. Private photos are excluded.

- Finger access adds at least 2 mm side clearance and approximately 24 × 10 mm scoops in shared dividers. Single compartments receive side clearance only. A compact mode restores straight dividers.
- The lid has a flat label deck and 1.2 mm perimeter guide. Labels can be centered above each battery or offset toward one end. The underside reuses the normal lid's mating feet and snap beads; the former tall top ribs are removed. The guide locates a matching-footprint bin, not each smaller bin independently.
- 41 JavaScript tests pass, including six battery tests covering both presets, counts 1/5/18/24, partial rows, label options, real empty scoop regions, solid floors, preserved mating feet, shallow guide clearance and invalid inputs. The 24-cell case uses compact mode.
- An additional layout sweep checks 18 valid count/column combinations with independent STL closure, winding and degeneracy checks.
- Headless Chrome verifies options, mobile layout, missing-CDN fallback, and actual box/lid downloads. The exported meshes are independently checked for boundary/nonmanifold edges and degenerate triangles.
- Documentation links resolve.

The browser test uses a local copy of the pinned Three.js r128 library. Physical print, baseplate fit, lid retention and slicer layer inspection remain unperformed.

Dark/light verification: all three generator pages default to dark in a fresh browser context, support light mode, and retain the preference across reloads and navigation. All six page/theme combinations and 375 px layouts passed browser checks without page errors. A blocked 3D CDN leaves theme switching functional.

## 2026-10-16: removal revision after the 21700 print

The supplied photos show 21700 cells sitting below tall shoulders with limited grip. The revision adds a switchable 5 mm press-to-lift support, lowers divider shoulders and widens scoops to 32 mm. The 21700 outside footprint/height and lid interface remain unchanged for the same count/layout. The 18650 press-to-lift option adds one height unit.

Validation now includes real support/end recess checks, independent rocker/finger-access toggles, sampled resting/tipped cell envelopes, lid clearance, and 18 additional layout checks. Browser checks cover the lift preview, its reset when closing the lid, disabled lift preview with a flat floor, dark/light rendering, mobile layout, missing-CDN fallback and actual downloads. The new geometry has not yet been physically printed. Private photos are excluded.

For this revision, all 51 local JavaScript tests pass (including eight tests for the separately developed adjustable box); 43 tests apply to the files currently in this pull request. The downloaded four-cell 21700 box and lid pass the independent STL inspector. A one-cell trial STL is generated locally for checking the removal action before a full reprint.
