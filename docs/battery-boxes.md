# Horizontal battery boxes

Open [Battery boxes](../source/battery-box.html) from either generator. Select 18650 or 21700, enter 1–24 batteries, and choose 1–6 columns. Batteries lie horizontally in separate flat-bottom compartments with 1.2 mm dividers. Only the requested number of compartments is created; an incomplete final row remains blank in unused positions.

The standard presets use two 42 mm grid units along each column of batteries. Compartments are packed side by side across the tray; its overall width rounds up to whole Gridfinity units. Longer custom batteries can require three units. The box includes Gridfinity-style feet. Its height follows the entered battery diameter, placing the rim 1 mm above the battery. The optional loose lift-off lid leaves 2 mm above the entered battery diameter when seated. A rounded asymmetric corner keys the lid orientation so labels remain mapped to their batteries. No latch, snap retention, magnets, or stacking lip on top of this lid is included.

Enable **Include lift-off lid**, then **Label pad above every battery**, for one 26 × 12 mm, 0.4 mm-deep recess above each occupied position. These are blank sticker/handwriting pads; the numbered layout is a preview aid, not embossed text in the STL. Label pads can be disabled independently. Lid export is disabled when no lid is selected.

## Dimensions

Presets use the maximum envelope listed on Molicel's current product pages, checked 2026-10-13:

- [18650 P28A](https://www.molicel.com/product/inr-18650-p28a/): 18.6 mm diameter, 65.2 mm length.
- [21700 P42A](https://www.molicel.com/product/inr-21700-p42a/): 21.7 mm diameter, 70.2 mm length.

These are reference cells, not universal guarantees. Enter the actual maximum dimensions, including wrappers, button tops or protection circuits. The minimum compartment clearance is 0.4 mm per side/end; lid clearance is 0.3 mm per side. Both are adjustable. The floor above the feet is 2 mm thick. Compartments have flat floors, rounded inside corners and thin straight partitions, following the supplied reference photos.

Export the box and lid separately. Box STL is upright; lid STL is rotated cap-down. Inspect the short bridges over the recessed label pads in the slicer. Trial-print fit before making a large box. Foot/baseplate fit, lid retention and physical prints have not been tested.

## Verification

`node --test tools/*.test.mjs tools/test.mjs` includes geometry tests for both presets, counts 1/5/24, partial rows, label options, actual empty compartments and pad recesses, lid clearance/orientation, and rejected invalid dimensions. An independent STL reader checks closed edges, winding, finite coordinates and degenerate triangles. Browser verification covers presets, count/layout, lid/label toggles, downloads, mobile layout, and a missing-3D-library fallback.
