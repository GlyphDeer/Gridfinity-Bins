# Round 2 — mode state, accessible controls and failure feedback

Status: complete; F06–F07 locked after independent verification.

## Executor scope

- **F06 independent mode configuration (C7):** keep bin/tray/wipe parameter snapshots. Switching away and back restores edits including shared wall, floor, lip and dimensions. First visit may initialize mode defaults. Reset/reference/presets affect only current mode. Acceptance: edited bin→tray→wipe→bin restores bin exactly; edit tray and revisit; reset one mode leaves others intact. Preserve F01–F05 lock scope.
- **F07 accessible controls and failure feedback (C9/C10 and measured contrast):** give every numeric input and checkbox a stable accessible name tied to its actual control. Maintain keyboard-visible focus; use real buttons and pressed states for segmented controls. Expose restrained live status/error announcements, not an announcement on every animation frame. Add explicit CDN-load and WebGL creation failure messages readable without preview, with actionable recovery and disabled nonworking export controls where initialization cannot continue. If export is decoupled, test it; otherwise honestly report unavailability. Darken light-theme secondary text: existing #6B6F75 on #EDEAE4 measures 4.21:1 at normal small text, below required 4.5:1. Add a token contrast regression check with exact ratio comparison (no rounding up). Keep dark contrast adequate. Acceptance: enumerate names for all number/checkbox inputs; keyboard can reach error and export controls; inject missing THREE and throwing renderer and observe error feedback; verify computed static token contrast. DOM doubles do not establish screen-reader behavior or rendered contrast over all overlays.
- **R4/R5/R7 focused copy:** label mass/volume and snap fit estimates as approximate; hide/gate snap judgments when snap is disabled; replace unsupported categorical physical outcomes (“will crack”, universal standard baseplate compatibility) with qualified guidance. Clarify lip tip applies to body. This copy belongs to F07 verified scope; do not attempt a Boolean rewrite or unvalidated geometry redesign.

## Verification and rating

Reviewer reruns all regressions, inspects mode transitions and fallback code, verifies new acceptance probes and records limitations. Source/static and DOM-double evidence are separate from real browser, screen reader, slicer and print checks. Weighted rubric remains correctness40%, validation25%, UX/accessibility20%, docs/workflow15%. No perfect score without sufficient evidence.

## Independent verification result

Reviewer reran `node --test tools/generator.test.mjs tools/test.mjs`: **17/17 pass**, including all Round 1 contracts. Source inspection confirms complete per-mode snapshots, isolated reset/reference behavior, missing-CDN and renderer-creation guards that display actionable alerts and disable unavailable downloads, static names on number/checkbox controls, focus styling, polite toast status and qualified physical-fit copy. New probes cover full UI startup failure paths with DOM doubles and exact secondary-token contrast ≥4.5. Preview invalidation also cancels queued edge work and hides stale edges. No new evidence requires reopening F01–F05.

**Rating: 8.0/10** (correctness 8, validation 8, UX/accessibility 8, documentation/workflow 8). F06–F07 locked within the stated software/static acceptance scope. Browser keyboard traversal, accessibility tree/screen-reader announcements, rendering over overlays and real download behavior remain manual gates, as do slicing and physical printing. This is not comprehensive accessibility certification. Documentation still needs the Round 3 current-behavior update; the workflow score reflects existing reusable evidence tools.
