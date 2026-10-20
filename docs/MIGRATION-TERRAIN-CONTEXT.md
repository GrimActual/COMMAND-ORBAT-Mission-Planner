# Terrain identity and ground-height review — source checkpoint

This unreleased source checkpoint adds optional target-world identity and imported ground-height review to the existing migration placement workflow. Open A:/Everon-ORBAT-Development/work/terrain-context/COMMAND-Terrain-Context-Candidate/COMMAND Planner.exe. It uses the existing dev.gm.8 runtime and compatibility identifiers. Public downloads, previous candidates and the production Workshop mod remain unchanged.

## Workflow

1. Inspect source files, confirm/load prefab mappings, prepare the migration draft and select placement units/routes as before. Manual or checked-landmark horizontal placement remains available.
2. Open Terrain identity and ground height. Enable Use explicit terrain and height review. Enter the exact world addon ID and qualified {GUID}Worlds/...ent resource from your metadata. A display name alone is not an identity.
3. Choose Resolve ground in the game after approval (no offline height required) or Require imported ground samples for planning preview. Acknowledge that you reviewed world/map compatibility, file origin and policy. Source altitude is retained as source provenance and is not copied to the target height.
4. Preview planning placement. It reports the declared/imported-path status and ground heights/pending positions. Export terrain sampler query produces the selected positions for the separate diagnostic addon. Follow tools/terrain-sampler/README.md to produce a report in your own isolated world.
5. Load terrain observation JSON, review again and preview. Sampled mode blocks planning import until every selected unit and route destination has a matching ground sample. Missing coverage is shown; no interpolation or distant nearest-point guess fills gaps.
6. Add reviewed units to plan applies units/routes and their identity/elevation provenance as one Undo/Redo batch. Normal plan export keeps those fields. The world identity and reported height remain explicitly unverified at runtime.

The existing Settings → Game Master placement shortcut leads to these controls. Sarge and EN/FR/DE instructions cover both the review and sampler workflow. All policy/input/report data is session-only until explicit planning import; no persistent preferences or live/rehearsal state are inserted into the saved mission.

## Deployment boundary

The current Workshop bridge already resolves terrain height with GetSurfaceY at approved spawn time. It does not yet negotiate or enforce the new exact world-identity requirement. Therefore units imported with this explicit terrain context are blocked by the older deployment review rather than silently dropping their declared world. They remain usable as planning units/routes. Legacy units without this optional context retain their existing behavior. This checkpoint does not implement absolute-height/airborne placement or native world GUID authority.

## Identity, samples and provenance

Expected identity includes nonzero addon ID, nonzero resource GUID and safe relative .ent path, using the existing resource identity validator. Reports must match that triple and the reported world filename must match its relative path or qualified resource. Conflicting addon/GUID/path, unsafe paths or unsupported claims reject. Native path observation is not proof of the declared addon/GUID, nor of base terrain compatibility. Both runtimeVerified and heightValidated remain false; file origin is unattested-imported-file and map compatibility is user-reviewed-Everon.

Report contract: command-terrain-observation version 1, world, observedWorldFile, engineVersion, method:GetSurfaceY and 1–300 samples of worldX/worldZ/surfaceY. Coordinates are finite within 0–13,450 metres; reported Y is finite within -1,000–10,000 metres. Samples less than 2 cm apart reject as duplicate/ambiguous. A selected position matches only within 1 cm; no interpolation is done. JSON is capped at 256 KiB. Exact identity/path/duplicate/coverage checks belong to the JS validator; the canonical schema independently checks document shape and bounds.

The native query contract is enabled:true, version:1, world, samples. Samples are deduplicated exact positions with surfaceY:0 placeholders; queries cannot assert heights or provide output paths. The guarded native Save handler checks the trusted main frame, validates before opening the dialog, supports cancellation and writes atomically. The sampler uses fixed profile input/output names.

Preview renders up to 20 height rows. Imported units preserve expected identity, policy, report scope and their reported height; associated route provenance keeps each selected destination's sample. Actual map positions remain 2D and the existing imagery offset is applied/reversed once. Source XYZ and unresolved semantics remain intact. Rejected reports retain the previous valid file but clear review; world/mode/source/placement changes invalidate Apply and sampler export. Loading/report review alone never changes the mission.

## Validation

41 focused JS checks passed across eight terrain/query contracts, 17 placement/route contracts, five deployment contracts, eight native metadata/Save lifecycle checks and three localization checks. Eight independent schema cases passed, including the actual native observation. Tests cover missing/partial samples, exact matching without guessing, world conflicts, unsafe/oversized/ambiguous data, no forged runtime claims, 300-sample bounds, accessor rejection, query deduplication, sender/path/Save guards, fail-closed native deployment and unchanged preview state.

Actual isolated offline Electron passed native query Save with automated dialog selection and real file write, selected five-position query output, missing/incomplete sample gates, wrong-world rejection retaining prior report, reported Y distinct from source altitude, unchanged preview mission, EN/FR/DE retention and exact unit/route Undo/Redo provenance. No renderer errors. Query/height review did not send a game command.

The separate read-only diagnostic sampler passed actual native script compilation/execution, JSON export and desktop/schema round-trip on engine 1.8.0.13. An intentionally wrong world path was rejected without output. Both bounded diagnostic servers were stopped. The empty fixture returned -256 surface values; no real Everon terrain/elevation accuracy or live-session world identity is claimed. Workbench validation crashed before compiler output with access violation; no crash report was submitted. Full detail and API references are in the sampler README.

## Performance

Same 60-unit / 60-route / 240-movement-point JSON with 300 reported ground samples and three-landmark provenance in previous landmark and new terrain-context candidates, offline terrain/reduced motion/default viewport: both 16.7 ms median / 16.8 ms p95 over 180 steady-state frame samples. Each run had one frame above 50 ms (maximum 82.64 / 100.10 ms). These isolated stalls remain noted; this short test does not establish their cause or certify sustained stability. Both builds showed 60 route paths, 60 markers, 16 tiles and identical 318,825-byte saved missions.

Main-process private memory snapshots 72,020 / 74,680 KiB; approximate JS heap snapshots 17.1 / 18.2 MB. Startup/import long tasks (701/70 ms and 739/122 ms) and automated file-selection times are recorded separately, not treated as causal speedups/regressions. Full 300-sample resolution plus checked 60-unit/60-route preparation: five warmups, 20 samples, median 19.38 ms / p95 21.21 ms / max 21.98 ms. This explicit preview work is not per-frame execution. Redundant cloning of the full point list for each unit was avoided; per-unit provenance keeps only that unit's point plus route-specific samples. Sample lookup uses bounded spatial buckets after strict report validation.

The timing harness initially inserted setup code into the renderer sampling callback; that harness error was fixed before the comparison completed. No completed correctness/UI/native gates were rerun for timing. No universal FPS/RAM, terrain accuracy, native spawning or network-latency guarantee follows.

## Next additive milestones

Authoritative world GUID/addon/terrain lineage verification, session-bound native terrain probing and capability negotiation; real Everon samples, reported-data freshness/session identity, terrain/water/building placement policy; reviewed native deployment with explicit world enforcement. Absolute elevation/source height semantics and the rest of the existing roadmap remain retained.


## Native Everon sampling checkpoint (unreleased, 15 October 2026)

Completed actual read-only GetSurfaceY sampling in installed EmptyEden 1.8.0.13, packed-addon namespace validation, wrong-addon/path rejection and a bounded Windows diagnostic runner. Four launch/file/memory guard tests passed; final native runner validated all three returned positions and stopped its server (668.1 MiB sampled peak, 1000 MiB limit). Full Eden stopped at its 2000 MiB limit without a report. This is terrain sampling evidence, not full-scene stability or authenticated live identity. Exact world GUID/terrain lineage, live session negotiation and approved native world-enforced deployment remain pending; the deployment block and all existing roadmap goals remain. See tools/terrain-sampler/README.md and docs/test-evidence/native-everon-terrain.json.


Final packed-path boundary check: a shortened addon-relative suffix was rejected without a report. The stricter source then sampled all three points successfully at 461.71 MiB sampled peak, validated report positions and confirmed server cleanup. The earlier 668.1 MiB runner result is retained above as observed variation, not a memory guarantee. No desktop renderer changes were made, so previously completed desktop performance gates were not repeated.


## Exact native world lookup and deterministic diagnostic receipts (unreleased)

The separate diagnostic now matches the loaded packed world's addon/path to one exact runtime resource-database GUID before sampling. Wrong GUID and unproven loose-world ownership reject; equivalent casing passes. SHA-256 query/source/report receipts and an offline integrity checker detect changed files without claiming authenticated origin. Ten focused tool checks and actual native positive/negative runs passed; final run measured 6 ms for one lookup and 462.69 MiB sampled peak, with server cleanup. Imported files remain unverified planning data and the native deployment block stays in place. Parent-terrain lineage, session-bound capability negotiation and host-approval-time enforcement remain next additive milestones; all prior goals are retained. No Workshop or desktop executable update is included. See docs/test-evidence/native-world-identity.json and tools/terrain-sampler/README.md. Existing Settings/Sarge guidance and EN/FR/DE runtime-unverified labels remain correct because no desktop workflow changed.
