# Universal battery drawer

Open [Battery drawer](../source/battery-box.html), choose how many cells to hold, and export the box and optional lid. One compartment size accepts both 18650 and 21700 reference cells, including a mixture in the same drawer. There is no battery-size selector. Counts from 1–24 and 1–3 columns are supported within the 6 × 6 Gridfinity limit. Only the requested number of compartments is made; unused positions in a partial row remain solid.

## Clear-tray layout

The drawer follows the user's clear-tray photos: flat floors, thin straight dividers, and horizontal cells. The earlier rocker and finger-scoop designs are removed. Dividers are 1.2 mm thick and rise 14 mm above the floor. Internal corners use a 1.2 mm radius. The flat floor is 2 mm thick above the Gridfinity feet.

The default five-cell drawer occupies a 2 × 3 grid, with an 83.5 × 125.5 mm body. Its five compartments are 77.1 mm long and 22.86 mm wide, providing about 0.58 mm per side around the larger reference cell. Both reference cell sizes project above the internal dividers. Increasing minimum clearance can move the drawer to the next whole grid unit.

This is a close adaptation of the photographed layout, not an exact dimensional copy. The photos suggest approximately 125 mm across five compartments and 31 mm outside height, but do not establish every dimension. Preserving the normal Gridfinity feet, full stacking rim and lid interface gives this universal drawer a 35 mm body and approximately 38.7 mm open height. The outer rim remains taller than the dividers; practical finger access still needs a test print.

## Cell fit

Every compartment is sized from one fixed reference envelope: **21.7 mm diameter × 70.2 mm length**, plus clearance. This also accommodates the smaller **18.6 × 65.2 mm** reference envelope. The preview alternates 21700 and 18650 reference cylinders to show that they share identical compartments; it never changes the exported geometry.

These dimensions are the project's existing Molicel reference envelopes, originally checked on 2026-10-13: [21700 P42A](https://www.molicel.com/product/inr-21700-p42a/) and [18650 P28A](https://www.molicel.com/product/inr-18650-p28a/). Actual cells must fit the stated envelope; longer protected cells and button tops are not guaranteed to fit.

**Fit adjustments** contains minimum cell clearance and lid clearance only. Minimum cell clearance defaults to 0.4 mm per side, adjustable from 0.15 to 0.8 mm. Grid rounding can provide more space. Lid clearance defaults to 0.3 mm per side, adjustable from 0.15 to 0.5 mm.

## Lid and preview

**Include stackable lid** adds a 1.2 mm-thick flat deck with a 1.2 mm perimeter guide. The lid is 7.15 mm high including its mating feet, reduced from 8.2 mm. Label recesses leave 0.8 mm of deck above the feet. The underside retains the normal bin lid's mating feet and snap beads. The guide locates another bin of the same footprint; smaller bins can rest on the deck without individual locating pockets.

**Label pad above every battery** adds one 26 × 8 mm, 0.4 mm-deep recess per occupied compartment. Pads are centered by default; disable **Center labels above cells** to move them toward one end. Pads are blank for stickers or handwriting. Preview numbers are not embossed in the STL. The lid is symmetric, so match its label layout when replacing it.

The initial preview shows an empty drawer. **Show batteries**, **Show lid** and **Close lid** control the preview only. Dark mode is the default; light mode is saved across the generator pages. If the 3D library is unavailable, the numbered layout and STL downloads still work.

## Printing and verification

Export the box and lid separately and print both feet-down. Filenames identify the universal design and count, such as `battery-universal-5-box.stl`. A two-cell trial checks both sizes and access beside a neighboring cell before printing a larger drawer.

`node --test tools/*.test.mjs tools/test.mjs` checks both reference envelopes across count, layout and clearance choices; flat floors and straight dividers in the actual mesh; vertical removal paths through the rim; closed-lid clearance; real label recesses; unchanged normal mating feet; and invalid inputs. Independent STL inspection checks closed edges, winding, finite coordinates and nondegenerate triangles. Browser checks cover the single universal workflow, mixed-size preview, labels/lid controls, count/layout, dark/light themes, mobile layout, missing-library fallback and downloads.

The new geometry has not been physically printed or inspected layer by layer in a slicer. Geometry and browser checks do not establish removal comfort, printer-specific fit, or snap retention. See [verification history](../reviews/batteries/verification.md) for the checks performed.
