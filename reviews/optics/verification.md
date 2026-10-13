# Optics insert verification — 2026-10-13

Built from GitHub main da172ba. This branch adds the insert generator independently of the earlier unpublished lid/UI changes.

- Existing suite: 27 JavaScript tests and 7 Python tests pass.
- New suite: 6 tests cover all presets, closed STL edges/winding, material floors and empty cavities, invalid/colliding pockets, lid height, clearance changes, small-glass access and gasket floor protection.
- Headless Chrome: all five presets render, desktop 1280 × 900 and mobile 375 × 812 inspected, no horizontal overflow, no page errors. A real STL download was checked independently: 860 triangles, no nonfinite or degenerate facets, boundary/nonmanifold/inconsistent edges all zero. Bounds 35.7 × 35.7 × 12.1 mm.
- Missing Three.js CDN: SVG preview and STL export remain available. Validating malformed heights disables export. Changes clear the measured-dimensions confirmation.
- Documentation links and the existing parameter reference pass. New parameters are documented separately in the optics guide.

The browser run supplied a local copy of the same pinned Three.js r128 library, so it verifies UI behavior but not live CDN availability. Physical prints, slicer layer inspection, coated-surface contact and exact stock-part fit have not been verified. Default gasket and S21/TIR glass measurements are explicitly placeholders. The private order PDF was not copied into the repository.
