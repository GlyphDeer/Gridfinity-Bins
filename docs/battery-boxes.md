# Horizontal battery boxes

Open [Battery boxes](../source/battery-box.html) from either generator. Select 18650 or 21700, enter 1–24 batteries, and choose 1–3 columns within the normal generator’s 6 × 6 grid limit. Batteries lie horizontally in separate flat-bottom compartments with 1.2 mm dividers. Only the requested number of compartments is created; an incomplete final row remains blank in unused positions.

The standard presets use two 42 mm grid units along each column of batteries. Compartments are packed side by side across the tray; its overall width rounds up to whole Gridfinity units. Longer custom batteries can require three units. The box includes Gridfinity-style feet. Its height follows the entered battery diameter, rounding the body to whole 7 mm height units with at least 0.5 mm between the battery and the seated lid. The box uses the normal bin’s lip profile and snap-groove dimensions; the lid reuses the normal bin lid’s feet and snap beads beneath a continuous flat deck. A 1.2 mm-high perimeter guide locates another bin of the same footprint, with 0.25 mm side clearance at that engagement depth. Smaller bins can rest on the lid but are not individually located by grid pockets. Dividers stop below the lip. The lid is symmetric, so match the label layout when replacing it.

Enable **Include stackable lid**, then **Label pad above every battery**, for one 26 × 8 mm, 0.4 mm-deep recess for each occupied position, centered above that battery by default. Disable **Center labels above cells** to move pads toward one end. These are blank sticker/handwriting pads; the numbered layout is a preview aid, not embossed text in the STL. Label pads can be disabled independently. Lid export is disabled when no lid is selected.

**Finger access** is enabled by default. It reserves at least 4 mm beside each cell and adds approximately 24 mm-wide, 10 mm-deep curved scoops in dividers shared by two occupied compartments. At least 3 mm of divider remains above the floor. A single compartment has the extra side clearance without a divider scoop. Turn it off for straight dividers and a more compact footprint. Extra clearance may increase the number of grid units; 24 large cells with finger access can exceed the 6 × 6 limit.

The initial preview shows the empty tray. **Show batteries**, **Show lid** and **Close lid** let you inspect the contents and assembled box without changing exports.

The reference photos contain an 18650 and an AA-sized Vapcell cell, as identified by the user. They establish the layout and proportions, not exact dimensions. This generator remains for 18650/21700 cells; it does not infer an AA preset from the photo. The default five-cell tray with finger access is 83.5 × 167.5 mm (the lid extends 0.2 mm beyond each side), with a normal Gridfinity rim and lid rather than an exact dimensional replica of the photographed tray.

## Dimensions

Presets use the maximum envelope listed on Molicel's current product pages, checked 2026-10-13:

- [18650 P28A](https://www.molicel.com/product/inr-18650-p28a/): 18.6 mm diameter, 65.2 mm length.
- [21700 P42A](https://www.molicel.com/product/inr-21700-p42a/): 21.7 mm diameter, 70.2 mm length.

These are reference cells, not universal guarantees. Enter the actual maximum dimensions, including wrappers, button tops or protection circuits. The minimum compartment clearance is 0.4 mm per side/end; lid clearance is 0.3 mm per side. Both are adjustable. The floor above the feet is 2 mm thick. Compartments have flat floors, rounded inside corners and thin straight partitions, following the supplied reference photos.

Export the box and lid separately. Box STL is upright; lid STL is feet-down, just like the normal bin lid. Label recesses leave the underside mating feet and the shallow perimeter guide intact. The deck is 2.25 mm thick above the foot shoulders, with 0.4 mm-deep label recesses. Trial-print fit before making a large box. Foot/baseplate fit, lid retention and physical prints have not been tested.

## Verification

`node --test tools/*.test.mjs tools/test.mjs` includes geometry tests for both presets, counts 1/5/24, partial rows, label options, actual empty compartments and pad recesses, unchanged normal-lid mating feet, centered/offset label locations, and the shallow guide, and rejected invalid dimensions. An independent STL reader checks closed edges, winding, finite coordinates and degenerate triangles. Browser verification covers presets, count/layout, lid/label toggles, downloads, mobile layout, and a missing-3D-library fallback.

The extracted `source/bin-geometry.mjs` mirrors the main generator’s two geometry scripts, with named exports and an optional `feetOnly` lid-builder argument added. The default normal lid remains unchanged. The battery lid joins those mating feet to its new deck as a closed mesh. Physical stacking and snap retention still require a trial print.
