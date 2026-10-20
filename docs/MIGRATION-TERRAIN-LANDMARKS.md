# Multi-landmark terrain alignment — source checkpoint

This unreleased source checkpoint adds optional horizontal landmark fitting to the existing reviewed planning import. Open A:/Everon-ORBAT-Development/work/migration-landmarks/COMMAND-Landmark-Candidate/COMMAND Planner.exe. It uses the dev.gm.8 runtime/compatibility identifiers; published downloads and earlier test copies remain unchanged.

## Workflow

1. Assets → Arma 3 migration review: inspect source files, confirm/load prefab mappings and Prepare mission draft.
2. Place migration units on the planner: name the source terrain and select the intended mapped units. Optional linked movement routes retain their separate selection and acknowledgement.
3. Expand Check terrain landmarks. Enter 3–12 corresponding ground landmarks, one per line: source easting, source northing, Everon world X, Everon world Z. Commas or whitespace separate four numeric coordinates. No header or labels. World X/Z excludes the map imagery offset. Spread points across the operation area.
4. Choose the maximum allowed landmark mismatch (0.1–100 metres; default 5). Click Check landmark alignment.
5. Inspect each landmark residual, maximum mismatch, RMS mismatch, fitted rotation and any narrow-coverage warning. Delta X/Z means fitted minus entered target position. A fit beyond the maximum tolerance cannot be used for placement.
6. Confirm you reviewed residuals/coverage, then enable Use checked landmark alignment. The original manual anchor/rotation inputs are disabled while this mode is on; their entered values are retained. Turning this mode off restores the original manual workflow.
7. Preview planning placement, review the units/routes, then Add reviewed units to plan. One Undo/Redo covers the whole imported batch and exact provenance.

Editing landmark coordinates or tolerance clears the fit/review and invalidates placement. Changing source context or source terrain name clears the landmark review while retaining entered pairs; review again before using the fit. Anchor/mode/review changes also invalidate the pending placement. Language changes retain the fitted input, review state and selected unit/route context. The existing Settings → Game Master placement shortcut and Sarge describe this workflow in EN/FR/DE.

## Mathematics and contracts

The bounded least-squares rigid 2D fit aligns source east/north to target native X/Z using centroids, a rotation from summed dot/cross products and translation. Scale remains exactly one; no stretching, mirroring, height adjustment or terrain identity inference occurs. Residuals compare transformed source points with their entered target counterparts. Both source and target RMS horizontal spread must be at least 10 metres; pairs less than one metre apart in either terrain are rejected. An unresolved rotation is rejected. Collinear/narrow coverage is flagged and requires user review rather than claiming broad area accuracy.

Input shape is strictly version:1, landmarks:[{source:[east,north],target:[worldX,worldZ]}], toleranceMeters. Exactly 3–12 pairs; finite source coordinates bounded by absolute 10,000,000 and target coordinates 0–13,450 metres. Unknown fields, sparse arrays and accessor values reject before reading them. Numeric text is parsed as four finite coordinates per line. These are internal/session inputs, not a new mission file schema or executable transport contract.

The planning adapter recomputes the fit, verifies tolerance and explicit review, then checks that supplied anchors/rotation exactly correspond within floating-point tolerance. Derived values supplied by a caller cannot silently shift a reviewed alignment. The existing +50 metre imagery offset is applied once after native horizontal conversion and reversed once by the separate deployment flow. Units/routes still reject atomically if any selected point is outside supported bounds.

Each imported unit's assetCatalogItem.migrationSource.terrainAlignment stores normalized pairs/tolerance, fitting method, fitted anchors/rotation, per-point residuals, RMS/maximum errors, spread/coverage diagnostics and explicit heightValidated:false / terrainIdentityVerified:false. No mission schema version changes. Review and configuration remain session-only until the user explicitly imports planning units; source files are never rewritten. Existing single-anchor callers remain compatible.

A low residual only shows consistency at the supplied landmarks. It does not establish accurate placement elsewhere, correct landmark identification, matching terrain geometry, navigation, source gameplay semantics, elevation or native execution readiness. Different Arma terrains cannot be made equivalent by a rigid transform. Full terrain conversion and ground-height validation remain future work.

## Validation

24 focused checks passed: six landmark-fit contracts, 15 existing/extended placement-route contracts and three localization checks. Tests include rotations near ±180°, distance-preserving fits, outlier residuals, scale/reflection mismatches, collinear warnings, clustered/duplicate geometry, counts/bounds/tolerances, strict accessor/field rejection, atomic placement with exact inverse deployment coordinates, forged anchors/rotation, missing acknowledgement and defensive provenance copies. A symmetric reflected test fixture correctly produced an unresolved rotation; it was changed to a non-degenerate rectangle to test the high-residual case as well.

Actual isolated offline Electron passed mismatched-fit blocking, required landmark review, manual-mode restoration, per-point diagnostics, EN/FR/DE retention, exact checked placement/provenance, linked route paging and unit/route atomic Undo/Redo, stale fit on point edits, source cleanup and no renderer errors. A narrow additional context check verified source-terrain/source-context edits require review again while retaining pairs. The full UI/performance gates were not repeated for that isolated checkbox reset. No game client, native server or Workbench was launched; native/mod files are unchanged.

## Performance

Same 60-unit / 60-route / 240-movement-point mission JSON with three-landmark provenance in the previous linked-route build and new landmark candidate, offline terrain, reduced motion, default viewport, 180 steady-state frames each: both about 16.7 ms median / 16.8 ms p95. Max sampled frame 34.23 / 33.30 ms, no sampled post-load frame over 50 ms. Both had 60 route-pane paths, 60 markers, 16 tiles and the identical 266,195-byte saved mission.

Main-process private memory snapshots: 73,748 / 72,340 KiB; approximate JS heap snapshots: 16.1 / 13.4 MB. Import/startup long tasks (447 / 87 ms) and automated file-selection timings include cold-start/cache/automation effects and are not causal speedup or leak evidence. These are short local samples, not universal FPS/memory or stability guarantees.

Full checked placement preparation with three landmarks, 60 units, 60 routes and 240 movement points: five warmups, 20 samples; median 15.80 ms / p95 16.72 ms / max 19.60 ms. This explicit preview work includes validation, fit recomputation, provenance and candidate plan construction. It is not per-frame map work, network/native AI performance or terrain accuracy. No additional map optimisation was justified by the same-fixture comparison.

## Next additive milestones

Independent check landmarks/coverage overlays and optional reusable alignment profiles; reviewed group/faction/occupant adapters; native authority/lifecycle handoff and approved execution adapters. Height verification, complete SQF/SQM conversion, executable scene/layer export and all earlier roadmap items remain retained.


## Subsequent terrain context checkpoint

Optional declared identity and ground-height file review are now available in the separate candidate described in MIGRATION-TERRAIN-CONTEXT.md. Runtime world GUID/addon identity and terrain height remain unverified; native enforcement and real Everon coverage are retained future milestones.
