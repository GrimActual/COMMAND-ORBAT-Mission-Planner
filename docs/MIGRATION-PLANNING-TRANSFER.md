# Reviewed migration placement — source checkpoint

This unreleased source checkpoint extends dev.gm.8 with manual terrain anchoring and atomic planning-only import. Published downloads remain unchanged. Candidate: A:/Everon-ORBAT-Development/work/migration-terrain-transfer/COMMAND-Terrain-Transfer-Candidate/COMMAND Planner.exe. It uses the existing dev.gm.8 runtime and compatibility identifiers; it is not a new public release.

## Use

1. Close the older Companion and open the separate candidate. Back up your operation.
2. Assets → Arma 3 migration review: inspect source files, confirm/load class mappings, then Prepare mission draft.
3. Expand Place migration units on the planner. Settings → Game Master also has a direct shortcut.
4. Name the source terrain. Enter a known source ground landmark's easting/northing and its intended corresponding Everon native world X/Z. Enter counterclockwise rotation (-180 to 180 degrees) if necessary. Distances remain metres; there is no scaling, mirroring or automatic terrain matching.
5. Select 1–60 eligible mapped spawn intents. Each has editable planning faction/type labels. Unit choices page 20 rows; selection persists between pages. These labels do not change prefab faction/components.
6. Acknowledge unresolved height, grouping and behaviour. Preview planning placement displays up to 20 selected units, total count and omitted intent count. Review the placement, then Add reviewed units to plan.
7. One mission Undo removes the batch; Redo restores the same IDs and provenance. Export your plan normally to retain the result.

## Contracts and limits

The reviewed draft remains non-executable and unchanged. Only explicitly selected mapped spawn intents with literal/resolved positions and no unsupported/preprocessed source-context blockers are eligible. Conditions, loops and dynamic constructs cannot become unconditional placements. Unselected spawns, all movement/waypoint intents and source definitions/findings remain in the source review. No routes, AI group hierarchy, vehicles' occupants, source scripts or behaviour are imported.

Anchoring transforms source horizontal east/north into Everon native X/Z around the two manual anchors. Source altitude is retained as provenance but is not used as a validated target elevation. The map imagery offset of +50 metres is applied once to planning positions; existing native deployment reverses it once. Resulting world X/Z must each be between 0 and 13,450 metres to stay inside the existing mapper bounds after the offset. Out-of-bounds batches reject entirely rather than clamp.

This is manual planning placement, not certified terrain calibration. A single matching landmark and user-specified rotation cannot establish whole-terrain accuracy. Check multiple landmarks yourself; future multi-anchor fitting and residual diagnostics remain on the roadmap. This does not connect imported SQF to an AI blackboard or convert behaviour trees.

Exact prefab resource metadata, source file/hash/location, source intent/group/options, unresolved review gates, declared addon dependency information and manual anchor parameters are embedded in each imported planning asset's migrationSource. Native availability and terrain height remain unverified. The schemaVersion 4 plan contract is unchanged; anchors and selection stay session-only until explicitly imported with those units. Persistent settings are not mixed into the mission. Source files are never rewritten.

Preview does not modify mission/Undo/rehearsal/bridge state. Source, mapping, anchor, selection or mission edits invalidate preview. Apply rechecks the exact mission snapshot before a single existing commit/Undo action. Locks and plan validation remain enforced. A complete result exceeding the existing 5 MB mission import limit rejects before any commit. Save failure is reported distinctly: units may be present in memory and need a backup export.

No game request is created by this feature. Actual native deployment still uses the separate reviewed deployment flow, exact resource index checks and in-game host approval. The existing deployment batch limit remains 16; the 60-unit planning import does not raise it or certify 60-player server support. Native/mod files did not change and were not recompiled or republished.

## Validation and performance

24 unique focused checks passed across seven placement contracts, 12 retained draft contracts, three localization checks and two startup lifecycle checks. New checks cover no mutation during preview, exact inverse deployment coordinates, rotation preserving distance, source-context/asset/position rejection, 60/61 bounds, distinct IDs, stale/repeated application and accessor rejection. Early checks caught invalid all-phases/symbol-mode defaults; imported units now use the existing null phase and NATO symbol conventions.

Actual isolated offline Electron checks passed real source/map workers, manual anchors, exact two-unit selection/faction, preview with unchanged mission, one-step Undo/Redo restoring exact IDs and metadata, stale locking after manual mission/anchor/source changes, EN/FR/DE context retention and no renderer errors. The UI harness initially used an ambiguous nested summary selector; it was corrected to the parent summary before completing the gate. No game client was launched.

Same 60-unit mission JSON, offline terrain, reduced motion, default viewport, 180 steady-state frames per build: published dev.gm.8 and candidate both measured about 16.7 ms median / 16.8 ms p95, 60 markers and 16 tiles, with no sampled frame above 50 ms after loading. Import/startup long tasks were observed separately (published 435/59 ms, candidate 51 ms); these single ordered runs include cold-start/cache/automation effects and are not causal speedup evidence. Main process private memory was about 71,176/74,936 KiB respectively; JS heap estimates were 15.2/11.2 MB and are approximate snapshots, not leak/stability conclusions. Both saved the identical 121,815-byte mission.

Preparing/validating 60 selected placements: five warmups, 20 samples, median 4.39 ms, p95 5.59 ms, max 5.84 ms. This is bounded planning preparation, not terrain accuracy, network or native AI performance. The comparison justifies no additional map optimization in this checkpoint.

## Next additive milestones

Multi-landmark terrain fit/residual review; reviewed source-group/faction adapters; explicit linked route transfer; versioned validated deployment handoff and native authority/lifecycle adapters. Full SQF/SQM conversion, native scene export, the AI command roadmap and all earlier milestones remain retained.


## Subsequent linked-route checkpoint

Optional reviewed linked doMove points can now be imported as proposed planning routes in the separate unreleased candidate described in MIGRATION-LINKED-ROUTES.md. Original execution timing, groups, terrain height and native execution remain unresolved. Public dev.gm.8 downloads remain unchanged.


## Subsequent multi-landmark checkpoint

Optional checked horizontal fitting and residual review are now available in the separate unreleased candidate described in MIGRATION-TERRAIN-LANDMARKS.md. The original manual mode remains. Terrain identity, height and native execution remain unverified.
