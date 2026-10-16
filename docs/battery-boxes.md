# Horizontal battery boxes

Open [Battery boxes](../source/battery-box.html) from either generator. Select 18650 or 21700, enter 1–24 batteries, and choose 1–3 columns within the normal generator’s 6 × 6 grid limit. Batteries lie horizontally in separate compartments with optional press-to-lift floors with 1.2 mm dividers. Only the requested number of compartments is created; an incomplete final row remains blank in unused positions.

The standard presets use two 42 mm grid units along each column of batteries. Compartments are packed side by side across the tray; its overall width rounds up to whole Gridfinity units. Longer custom batteries can require three units. The box includes Gridfinity-style feet. Its height follows the entered battery diameter and the center-support height, rounding the body to whole 7 mm height units with at least 0.5 mm between the battery and the seated lid. The box uses the normal bin’s lip profile and snap-groove dimensions; the lid reuses the normal bin lid’s feet and snap beads beneath a continuous flat deck. A 1.2 mm-high perimeter guide locates another bin of the same footprint, with 0.25 mm side clearance at that engagement depth. Smaller bins can rest on the lid but are not individually located by grid pockets. Dividers stop below the lip. The lid is symmetric, so match the label layout when replacing it.

Enable **Include stackable lid**, then **Label pad above every battery**, for one 26 × 8 mm, 0.4 mm-deep recess for each occupied position, centered above that battery by default. Disable **Center labels above cells** to move pads toward one end. These are blank sticker/handwriting pads; the numbered layout is a preview aid, not embossed text in the STL. Label pads can be disabled independently. Lid export is disabled when no lid is selected.

**Press-to-lift floor** is enabled by default. A broad, 8 mm-long center support raises the cell by 5 mm, with sloping floors toward both ends. Press one end down and grip the opposite end as it rises. There are no springs or holes through the base. Disable it for a flat floor. The normal 21700 preset keeps the previous outside height; 18650 boxes gain one 7 mm height unit to leave room under the lid.

**Finger access** is enabled by default. It reserves at least 2 mm beside each cell, lowers the divider shoulders to approximately 65% of the cell diameter above its support, and adds 32 mm-wide scoops between occupied compartments. The scoop bottoms remain 3 mm above the center support. These wider openings expose the cell sides rather than requiring fingers to reach over the old tall partitions. A single compartment uses the press-to-lift floor without shared-divider scoops. The stacking rim stays full height.

The initial preview shows the empty tray. **Show batteries**, **Preview lifted cell**, **Show lid** and **Close lid** let you inspect the contents and assembled box without changing exports.

The additional ruler photos suggest approximately 125 mm across the five compartments and 31 mm overall height. Perspective and ruler alignment limit precision. The default 18650 box now uses a 2 × 3 grid (83.5 × 125.5 mm body, approximately 38.7 mm open height with press-to-lift enabled; 31.7 mm with a flat floor), with 2 mm minimum side clearance and finger scoops. The short outside dimension is not confirmed by the ruler photos.

All three generators start in dark mode and provide a light-mode control. The preference is saved across pages.

The reference photos contain an 18650 and an AA-sized Vapcell cell, as identified by the user. They establish the layout and proportions, not exact dimensions. This generator remains for 18650/21700 cells; it does not infer an AA preset from the photo. The default five-cell tray with finger access is 83.5 × 125.5 mm (the lid extends 0.2 mm beyond each side), with a normal Gridfinity rim and lid rather than an exact dimensional replica of the photographed tray.

## Dimensions

Presets use the maximum envelope listed on Molicel's current product pages, checked 2026-10-13:

- [18650 P28A](https://www.molicel.com/product/inr-18650-p28a/): 18.6 mm diameter, 65.2 mm length.
- [21700 P42A](https://www.molicel.com/product/inr-21700-p42a/): 21.7 mm diameter, 70.2 mm length.

These are reference cells, not universal guarantees. Enter the actual maximum dimensions, including wrappers, button tops or protection circuits. The minimum compartment clearance is 0.4 mm per side/end; lid clearance is 0.3 mm per side. Both are adjustable. The floor above the feet is 2 mm thick. The floor remains at least 2 mm thick above the feet; the center support adds material above that floor. Compartments have rounded inside corners and thin partitions. The later 21700 print photos showed insufficient grip with the original tall dividers, motivating the lower shoulders and press-to-lift support.

Export the box and lid separately. Box STL is upright; lid STL is feet-down, just like the normal bin lid. Label recesses leave the underside mating feet and the shallow perimeter guide intact. The deck is 2.25 mm thick above the foot shoulders, with 0.4 mm-deep label recesses. Trial-print fit before making a large box. The user supplied photos of the earlier printed tray. The revised removal geometry, baseplate fit and lid retention still require a trial print.

## Verification

`node --test tools/*.test.mjs tools/test.mjs` includes geometry tests for both presets, counts 1/5/24, partial rows, label options, actual empty compartments and pad recesses, unchanged normal-lid mating feet, centered/offset label locations, and the shallow guide, and rejected invalid dimensions. Motion tests sample both cell envelopes in the resting and tipped positions against the floor and compartment walls, and check closed-lid clearance in the resting position. An independent STL reader checks closed edges, winding, finite coordinates and degenerate triangles. Browser verification covers presets, count/layout, lid/label toggles, downloads, mobile layout, and a missing-3D-library fallback.

The extracted `source/bin-geometry.mjs` mirrors the main generator’s two geometry scripts, with named exports and an optional `feetOnly` lid-builder argument added. The default normal lid remains unchanged. The battery lid joins those mating feet to its new deck as a closed mesh. Physical stacking and snap retention still require a trial print.
