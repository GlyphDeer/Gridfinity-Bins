# Geometry and printing limitations

The generator makes custom triangle meshes from rings, caps, and multiple solids. Some solids intentionally overlap. It does not perform a Boolean union before STL export. Different slicers can interpret overlaps, internal faces, and contacting shells differently; inspect the actual sliced layers for missing walls, unwanted cavities, disconnected features, and repairs.

A rendered preview, positive signed volume, and nondegenerate triangles do not prove a watertight, manifold, correctly wound or printable model. Software checks, slicer inspection, and physical fit checks answer different questions. No physical print success or universal slicer compatibility is established by this documentation.

Dimensions such as 42 mm pitch, 7 mm height units, 0.5 mm total footprint clearance, 4.75 mm base height, and 4.40 mm lip height describe this implementation. Half-grid wipe feet subdivide the footprint using 21 mm cells on half-grid axes. These dimensions alone do not guarantee compatibility with a particular baseplate or another author's bin. Measure and test your actual mating parts.

Before a batch:

1. Import the STL as millimetres and confirm the external dimensions.
2. Inspect all layers in your slicer, especially the floor-to-foot junction, label shelf/window, lip grooves, snap beads, tray text, cutouts, and the wipe notch.
3. Use the intended orientations as starting points: box/tray upright and lid feet down. The in-app guidance describes design intent. Inspect the actual sliced layers and determine support needs for your settings, geometry, and material.
4. Print a representative small bin/lid pair and half-grid foot if needed. Check baseplate seating, lid insertion/removal, flexing, label fit, and real contents.
5. Adjust lid foot radial clearance, bead, groove, and body dimensions based on the measured result. Do not force a very tight lid onto a thin groove wall.

**Lid foot radial clearance (`stackClear`) changes exported lid geometry.** It increases mating-foot insets below the base height on both lid types, reducing the foot size while leaving the box mesh unchanged. Snap interference is estimated geometrically as `beadR - 0.25 - stackClear`; it does not model material stiffness, cooling shrinkage, extrusion error, or repeated use. Groove wall thickness is derived from `max(0.35, 1.9 - grooveDepth)`. Large groove depth can leave a thin band. Selected incompatible floor, shelf, rib, and cradle configurations are rejected before building or export. These checks do not prove all accepted configurations are free of intersections or printable.

The material display uses signed mesh volume minus heuristic overlap corrections, then a fixed PLA density of 1.24 g/cm³. No percent-level accuracy has been established. These are geometric estimates, not sliced filament consumption: infill, perimeter policy, supports, purge, and slicer treatment of overlaps affect consumption. Use the slicer's estimate for planning a print.

The original shallow-tray overflow and oversized-label cases are now rejected by validation. Their original evidence remains in the [baseline code review](../reviews/code-review.md); [Round 1](../reviews/rounds/round-1.md) records the fixes. The material and fit displays are explicitly approximate. The original source-fix rounds did not perform browser, slicer or physical-print verification. The later filament cycles completed offline CLI consumption estimates; visual layer/bridge and physical-print verification remain unperformed.

## Economy and hollow-foot experiment

Economy reduces selected body thicknesses, so inspect floor continuity, loaded stiffness and lid use in your material before a batch. The reference slicer measurements are in [the filament-saving guide](filament-saving.md); model-volume and actual filament consumption are different quantities.

Four hollow-foot designs passed their specified software geometry checks but failed to show additional savings under the fixed X2D reference profiles. The final circular prototype added 0.05 g to the standard body in each material and tied economy at reported precision while taking longer. Its normal UI activation and export are withheld. The developer-only final shape preserves exterior mating surfaces and a flat interior, with measured minimum 1.15 mm floor cover in the checked extreme matrix. That measurement does not establish strength or clean bridging.

The benchmark's official end macros produced Invalid T warnings, and 3MF packaging aborted on this installed macOS version. Successful local runs used slice-data export with validity checks retained. Their G-code is measurement evidence and has not been approved for physical printing. Re-slice the normal exported STL in your intended printer setup.
