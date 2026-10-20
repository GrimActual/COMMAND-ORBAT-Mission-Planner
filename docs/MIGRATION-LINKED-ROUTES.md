# Reviewed linked migration routes — source checkpoint

This unreleased checkpoint extends manual terrain placement with optional source-linked planning routes. Open A:/Everon-ORBAT-Development/work/migration-linked-routes/COMMAND-Linked-Routes-Candidate/COMMAND Planner.exe. It uses the existing dev.gm.8 runtime and compatibility identifiers. Older test copies and public downloads are unchanged.

## Workflow

1. Assets → Arma 3 migration review: inspect supported sources, confirm/load prefab mappings and Prepare mission draft.
2. Place migration units on the planner: enter the manual source/Everon anchors and rotation, then select mapped spawn intents and planning classifications. The existing Settings → Game Master shortcut opens this panel.
3. Expand Linked movement routes. Select the movement points you want for those selected units. Choices page 20 rows and retain selection between pages/languages. Unselecting a unit removes its selected movements.
4. Acknowledge that these are proposed planning paths and do not reproduce source execution timing. Keep the existing placement acknowledgement checked too.
5. Preview planning placement. It shows selected-unit, proposed-route and omitted-intent counts, up to 20 unit rows and 20 route summaries. Add reviewed units to plan imports units and routes together.
6. One Undo/Redo covers the whole batch, including exact object IDs and provenance. Export the plan normally to keep it.

## Meaning and contracts

Only resolved doMove intents linked by the validated draft to an explicitly selected source-created unit can be selected. Literal positions and file-local aliases already resolved by the draft are supported. Group addWaypoint, unknown targets, dynamic positions, preprocessing and unsupported execution context remain in review. No source branch is flattened or inferred.

Selected moves are ordered by their positions in the source draft, regardless of checkbox click order. One proposed route per selected unit begins at its imported position and passes through its selected movement positions. This is a user-approved planning interpretation: consecutive doMove statements are not proof that all points are traversed. Timing, completion, locality, group behaviour, navigation and terrain height remain unresolved. No source command, game order or bridge request is executed.

Limits: existing 1–60 selected planning units, at most 240 distinct selected movement points, and one route per affected unit. Empty movement selection preserves the previous units-only workflow without a route acknowledgement. Existing placement callers with no route fields remain compatible. Supplying route fields requires both routeIntentIds and a boolean routeAcknowledged; nonempty selection requires true. Duplicate/missing IDs, accessors, unselected source targets, out-of-bounds destinations and routes with no horizontal length reject the entire batch. Existing locked objects and 5 MB plan limit remain enforced.

Units and routes use the unchanged schemaVersion 4 plan contract. Imported-unit assetCatalogItem.migrationSource.planningRoutes preserves route/unit IDs, source intent IDs, source locations/hashes/positions/blockers, initial planning points and explicit sourceTimingReproduced:false / terrainHeightValidated:false. Routes themselves use the existing validated route fields and arrow style/faction colour. Source/class-map/mission/anchor/selection changes invalidate the pending preview; final apply rechecks the exact mission snapshot.

Those saved links are provenance snapshots, not a live binding. Manually moving/editing/deleting a planned unit or route does not automatically update its counterpart or rewrite its recorded source positions. Source files, the non-executable draft, scenario rehearsal and live state are not rewritten. Planning routes do not become native AI waypoints. The existing separate deployment and native host-approval requirements remain unchanged; no Workshop update was made.

## Validation

15 focused tests passed: 12 placement/route contracts and three localization checks. New tests cover source-order alias links, serialization/provenance, explicit acknowledgement, missing/duplicate/unselected targets, unresolved individual moves and group waypoints, zero-length/out-of-bounds atomic rejection, preserved existing drawings, unique route IDs, 240/241 bounds and accessor rejection. Existing units-only tests remain passing.

Actual isolated offline Electron passed real source/map workers, selected routes across 20-row pages, required route acknowledgement, per-unit faction colours, source intent links, whole-batch unit/route Undo/Redo, stale locking after mission/anchor/source changes, selection cleanup when a unit is deselected, source-clear cleanup, EN/FR/DE context retention and no renderer errors. A test-only ambiguous nested summary selector was corrected before the UI gate completed. No game client or native server was launched.

## Performance

Same 60-unit / 60-route / 240-movement-point JSON in the previous terrain candidate and new linked-route candidate, offline terrain, reduced motion, default viewport, 180 steady-state frames each: both about 16.7 ms median / 16.8 ms p95. Largest sampled frame: 16.8 ms previous, 33.25 ms candidate; neither exceeded 50 ms after loading. Both showed 60 markers and 16 tiles, estimated 17.1 MB JS heap and identical 217,115-byte saved missions. Main-process private memory snapshots were 75,388 / 74,096 KiB. No leak or universal FPS/memory conclusion follows from these short samples.

Import/startup long tasks (previous 428 ms, candidate 74/84 ms) and automated file-selection timings are recorded separately and include cold/cache/automation effects; they are not causal speedup evidence. Initial instrumentation queried the default overlay pane, so its zero route-path count was not a count of the custom route pane. A narrow follow-up verified 60 SVG paths in the actual route pane in each build without repeating the timing run.

Preparing/validating the full 60-unit / 60-route / 240-point batch: five warmups, 20 samples, median 11.86 ms / p95 12.97 ms / max 13.04 ms on this PC. No additional map optimisation was justified by this comparison. UI choices and summaries stay paged/bounded. These measurements do not cover network latency, native AI, terrain accuracy or extended stability.

## Next additive milestones

Multi-landmark terrain calibration/residual review; reviewed group/faction/occupant adapters; source-context and lifecycle translation; validated native deployment handoff and host approval. Full SQF/SQM conversion, executable scene export, chained native AI orders and the rest of the roadmap remain retained.


## Subsequent multi-landmark checkpoint

Optional checked horizontal fitting and residual review are now available in the separate unreleased candidate described in MIGRATION-TERRAIN-LANDMARKS.md. The original manual mode remains. Terrain identity, height and native execution remain unverified.
