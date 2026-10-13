# Convoy optics inserts

Open [Optics inserts](../source/optics-inserts.html) from the bin generator header. Serve the repository over HTTP as described in the [README](../README.md); ES modules do not work reliably from a file URL.

Each downloadable insert is one connected solid with three separate pockets: an upright reflector or TIR, glass held on edge, and an LED centering gasket in a shallow recess. Smooth and orange-peel finishes share the envelope in the relevant Convoy listing. The preview shows cylindrical part envelopes, not exact optical geometry. Only the insert is exported.

## Presets and evidence

Dimensions below are diameter × height (glass: diameter × thickness), in mm. Convoy pages were checked 2026-10-13. These describe replacement parts, not proof of the installed optics in every flashlight variant.

| Preset | Optic | Glass | Source |
| --- | --- | --- | --- |
| 23.3 mm TIR, 60° bead / 10 × 65° stripe | 23.3 × 13.5 | Measure; 23 × 1.6 placeholder | [Convoy TIR](https://convoylight.com/products/23-3mm-tir-lens) |
| S2+ / S3 / T4 reflector, SMO or OP | 20 × 12 | 20 × 1.6 for S2+/S3 | [Reflector](https://convoylight.com/products/reflector-for-s2-s3-t4), [glass](https://convoylight.com/products/20-1-6mm-ar-coaed-glass-lens-for-s2-s2-s3-s6-s8) |
| S8 / S6 / S2 reflector, SMO or OP | 21 × 20 | 20 × 1.6 | [Reflector](https://convoylight.com/products/reflector-for-s2-s6-s8-t6), [glass](https://convoylight.com/products/20-1-6mm-ar-coaed-glass-lens-for-s2-s2-s3-s6-s8) |
| S21E / S21A / S21B standard reflector, SMO or OP | 23.1 × 11.6 | Measure; 23 × 1.6 placeholder | [Reflector](https://convoylight.com/products/reflector-for-s21a-s21b-s21e) |

The S8 listing has conflicting customer measurements; the editable preset uses the seller specification. S21A UV, S12 UV, T8, H4 and T5 variants do not have verified presets here. Use Custom with measured parts. Gaskets are not inferred from LED or reflector-hole names. Measure the widest extent, including tabs; use the diagonal for square gaskets. The initial 8 × 2 mm gasket is a placeholder. Do not put private order PDFs into the public repository.

## Bin and print setup

Use a 1 × 1 bin from this project's generator with **Label shelf: None**, **Scoop: 0**, no dividers, and matching wall/floor values. The insert is sized to pass through the narrower 36.3 mm lip opening and has rounded corners. Other Gridfinity implementations can differ. Set the actual bin height; the default is 6U because the user's bin height was not specified.

The default insert is 35.7 × 35.7 × 12.1 mm. Its loaded envelope is 24.6 mm high, including the upright 23 mm placeholder glass. It needs at least 5U with the default 1.5 mm bin floor. The calculation includes the 4.75 mm base and leaves 0.5 mm beneath the lid's lowest seated foot. Increasing glass diameter can require a taller bin even when the optic stays unchanged.

Part clearance and bin clearance are both **per side**. Default clearance is 0.3 mm. The insert floor is 1.6 mm and the minimum web is 1.2 mm. The reflector/TIR projects 3 mm above the cradle for removal. The gasket recess is its entered height plus 0.3 mm deep; glass sits on its lower edge in an independent slot. The design is loose storage, not a press fit or transport restraint. Parts are not retained if the bin is inverted.

Check dimensions and the clear-bin requirement before enabling export. Editing any dimension clears that confirmation. Invalid or colliding pockets, insufficient height, and nonfinite parameters block geometry/export. Print flat-side down; inspect the STL in a slicer and trial-fit an empty insert first. The full cylindrical optic pocket supports the underside; verify the actual TIR holder protects its optical surface. Coated parts must not be forced against rough print surfaces. Physical fit and scratch resistance remain untested.

## Implementation and checks

- `source/optics-core.mjs`: bounded parameters, layout, single-shell mesh and binary STL.
- `source/optics-ui.mjs`: controls, event-driven Three.js preview, SVG fallback and download.
- `source/vendor/earcut.mjs`: Earcut 2.2.4 with an ESM export adaptation; ISC license alongside it. This triangulates the surface surrounding all three recesses.
- `tools/optics.test.mjs`: independent STL edge checks and point-in-material checks, height, collision and fit validation.

Run `node --test tools/*.test.mjs tools/test.mjs` to include the insert tests. The legacy review harness still covers the original bin/tray/wipe modes. Loss of the Three.js CDN or WebGL leaves the new insert generator's SVG preview and STL export functional.
