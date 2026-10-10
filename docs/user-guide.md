# User guide

Start the server using the [README](../README.md), then select **Lidded bin**, **Slotted tray**, or **Lens wipe box**. Dimensions are millimetres unless marked in grid cells or height units (U). This implementation uses a 42 mm cell pitch and 7 mm height units; the lip adds height above the nominal body height.

Drag the preview to rotate, scroll to zoom, or use a two-finger pinch to zoom. The bin and wipe-box views offer **Apart**, **Closed**, **Bin**, and **Lid**. Read warnings and the available-height result after every substantial change. Known incompatible floor, label, rib and cradle configurations show adjustment messages and cannot build or export. Resolve those errors before downloading; advisory warnings still require judgment. Available height checks clearance; it does not resize the model.

## Small screws or electronic parts

1. Select the lidded bin, choose **Reset everything** to establish its default settings, then use the **2x1x6** size preset: nominal body height 42 mm and footprint 83.5 × 41.5 mm.
2. Enable a label shelf in one column or all columns. Set the actual label dimensions and clearance; an oversized label is rejected when its pad cannot fit the shelf. Reduce label width or border, and resolve validation messages before export.
3. Adjust the scoop and its selected walls to make small parts easier to retrieve. Inspect the lid window and snap settings in the advanced controls.
4. Inspect the closed view and download the bin, lid, or both. The two-file action may need browser permission for multiple downloads. Verify both files in the browser's download list.

## Pens or pencil leads

1. Select the slotted tray. Its initial defaults select a 3×2×3U tray with no stacking lip; the **Pen tray** preset instead sets a 3×4×3U tray with seven 13.6 mm round slots and text disabled.
2. Measure your pens. Diameter buttons set slot width to the chosen diameter plus 0.6 mm; this is the generator's allowance, not a verified fit for every printer.
3. Choose slot direction, square or round bottoms, borders, rib chamfer, and the finger cutout. The effective slot count is capped by available width; inspect the derived result rather than assuming the requested count fits.
4. For pencil leads, enable raised text and enter labels separated by commas, semicolons, or `|`, such as `HB, B, 2B`. Labels map in order to slots; missing labels leave slots blank. Text can shrink to fit the slot pitch.
5. Download the tray. It is one STL, with no separate lid export in tray mode.

## Lens-wipe packets

1. Select the wipe box. Enter packet length and width, then either packet thickness and count or measured stack height. As a starting example, the supplied packet preset uses 100×38 mm packets, 2.9 mm thickness, and 15 packets; measure your own pack.
2. Use **Size the box to this pack** to choose half-cell dimensions and an integer height, within 6×6×20U. It aims for 1 mm extra space in each footprint dimension and above the stack. Fit is approximate and must be checked.
3. Either measured footprint side can be entered as Length: automatic sizing, badges, and warnings compare the packet in either orientation. Recheck the actual floor space and stack depth after sizing.
4. Configure the front notch and floor fillet. The effective notch is limited to preserve some front lip and a retaining wall above the floor. Inspect the remaining wall and lid engagement.
5. Preview the closed pair, download both STLs, and confirm that both downloads completed. Both files are built and serialized from the settings captured at the click, so later settings or mode changes do not alter the pair. Half-grid feet and snap fit need a physical trial with your baseplate.

## State, presets, and safe iteration

Each mode keeps a complete parameter snapshot and its own available-height value. Switching bin→tray→wipe→bin restores the bin's settings, including shared-looking wall, floor, lip, and dimension controls. The view returns to assembly on a mode switch. These snapshots last only for this page session; only theme persists across reloads.

Size chips change dimensions. **Reference** and **Pen tray** apply their preset settings to the active mode. **Reset** restores that mode's defaults while keeping its available-height value; other modes keep their settings. Record any configuration you want to reproduce after closing or reloading.

Numeric boxes exist for packet dimensions, thickness, count, and stack height. Dimensional inputs retain values finer than slider steps; sheet count rounds to a whole number when entered. Blank or nonfinite text does not replace the last valid value. On blur, the field shows the retained value.

Invalid settings show an adjustment message and cannot export. Floor/flare ordering, oversized shelves, insufficient tray rib spacing, and cradles that rise too far into the slot are among the checks. Validated inputs still need slicer and physical inspection. Advisory print warnings can remain even when export is allowed.

Export builds fresh geometry from a snapshot of the current settings and prepares both files before requesting a pair download. There is no need to wait for the preview frame to avoid an old mesh. Check the browser download list to confirm both files arrived.

See [parameters](parameters.md) for hidden clamps and [printing](printing.md) before a batch print.
