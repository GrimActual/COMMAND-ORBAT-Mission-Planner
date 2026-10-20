# COMMAND read-only terrain sampler (separate diagnostic addon)

This is a separate opt-in development tool, not the Workshop bridge update. It reads the currently loaded world's path and GetSurfaceY at up to 300 explicitly supplied coordinates. It does not create/delete/move entities, save the mission, scan players, send network requests or alter the production mod.

## Using it

1. In the new desktop candidate, prepare a migration draft and placement. Open Terrain identity and ground height. Enter the intended world's addon ID and qualified {GUID}Worlds/...ent resource, choose a height policy, acknowledge the review, then Preview planning placement.
2. Export terrain sampler query saves COMMAND-terrain-query.json through the native Save dialog. It includes the current selected unit/route positions, deduplicated exact coordinates and zero placeholders, not source altitudes or asserted ground heights.
3. Make an isolated development scenario/project that depends on this diagnostic addon and the intended world's addons, or add its Scripts/Game file to your isolated test project. Do not copy the empty-world test fixture into your real mission. Do not publish this tool over the Workshop bridge.
4. Put the exported query in that server profile's data directory as $profile:COMMAND-terrain-query.json. The explicit enabled:true flag is required. Use a fresh profile/output file to avoid confusing a prior report; a rejected query does not overwrite an older report.
5. Start your intended development world. One second after world initialization (including diagnostic worlds with no game mode), the server-only sampler reads the request, compares the loaded world path and writes $profile:COMMAND-terrain-observation.json. Wrong paths or invalid coordinates produce no new report. No client launch or public tunnel is required by the tool.
6. Load that report into Companion, review its origin/world/height policy and Preview again. Missing selected positions block sampled planning import. Remove/disable the query and stop the isolated server afterward.

The current native check requires an exact engine-registered GUID and addon-relative path from ResourceDatabase.SearchResources, tied to the loaded world's addon namespace. Unavailable, ambiguous or mismatched identity rejects before sampling; loose absolute world paths now reject because their addon ownership cannot be established by a suffix. This local diagnostic check does not prove that an imported report belongs to a current live session or that a child scenario uses the planner's Everon terrain. Imported JSON is not signed or authenticated live state. It does not prove terrain availability, current session identity, collision/building-floor placement, navmesh validity, freshness or safe spawning. Native world-GUID/authority enforcement remains a future bridge capability.

## Native evidence

The source compiled and executed in ArmaReforgerServerDiag 1.8.0.13 against a bounded isolated empty-world fixture. Two actual API values (-256) round-tripped through the desktop validator/schema. That fixture had no real terrain; these values are not Everon height evidence. A second negative check rejected a different expected world path and wrote no observation. Both diagnostic servers were stopped. No game client, tunnel or players were used.

Workbench PC/WORKBENCH validation attempts crashed at startup with access violation and no compiler stdout. They were not retried after the startup failure was identified, and the crash report was not submitted. Standalone diagnostic execution provides the actual Game-script compile/runtime evidence; Workbench validation remains unverified.

The initial runtime lookup tried Resource.Load on an absolute world filename, then on the declared scene resource. Those scene loads did not yield usable prefab resources. The final tool compares the engine-observed world path directly and explicitly keeps addon/GUID as declarations. It does not claim native resource GUID resolution that the test did not establish.

Primary API references: [Game.GetWorldFile](https://community.bistudio.com/wikidata/external-data/arma-reforger/EnfusionScriptAPIPublic/interfaceGame.html), [BaseWorld.GetSurfaceY](https://community.bistudio.com/wikidata/external-data/arma-reforger/EnfusionScriptAPIPublic/interfaceBaseWorld.html). Query/observation examples use synthetic identities; replace them with your own metadata.


## Real Everon terrain checkpoint — 15 October 2026

The installed 1.8.0.13 resource database identified the lightweight `{55A3176BBDD01AAE}worlds/Eden/EmptyEden.ent` world in addon `58D0FB3206B6F859`. Actual diagnostic-server sampling returned -6.527908 at X4241.47/Z9469.76, 13.012909 at X4830.77/Z12279.20, and 161.875 at X6500/Z6500. Coordinates in the report reflect native float precision. This validates actual terrain API sampling/serialization/desktop consumption at those points, not island-wide accuracy, scenario compatibility, water safety or building floors. `examples/TERRAIN-OBSERVATION-EVERON-1.8.0.13.json` preserves the actual report; its world GUID remains a declaration, not a signed engine attestation.

Packed worlds use `$AddonID:relative/path`. The sampler now checks that namespace against `GameProject.GetAddonID(expectedAddonGuid)` before comparing the relative path. Wrong-addon and wrong-path queries produced no report. Loose absolute paths still only establish path matching. `ResourceName.GetPath()` returned the same path for correct and deliberately wrong GUIDs; it cannot verify a GUID. Scene container loading did not provide a usable canonical scene resource either. Therefore all imported reports remain unattested and the existing deployment block stays in place.

The full Eden scene exceeded the 2,000 MiB sampled working-memory limit and was stopped without output. The lightweight world sampled successfully at about 462 MiB; the final reusable runner peaked at 668.1 MiB with a 1,000 MiB limit. Different fixture content makes these scope measurements, not an app performance comparison. No full-scene stability claim follows. A terrain prefab without its world data returned -256 and was not used as real elevation evidence.

### Bounded Windows diagnostic runner

`run-diagnostic.cjs` accepts five positional arguments: absolute diagnostic-server executable, absolute addons directory, absolute query JSON, absolute work directory, and optional memory limit in MiB (default 1000, allowed 500–2000). Use your Node installation to run it. Example with paths adjusted for your machine:

```powershell
node .\tools\terrain-sampler\run-diagnostic.cjs "D:\ReforgerServer\ArmaReforgerServerDiag.exe" "D:\ReforgerServer\addons" "D:\Tests\COMMAND-terrain-query.json" "D:\Tests\terrain-results" 1000
```

Use `EVERON-QUERY-EXAMPLE.json` only with a matching installed game version/resources. The runner validates the query before creating a profile; accepts only the diagnostic-server filename; copies this diagnostic addon into a fresh attempt directory; samples working memory roughly every two seconds; stops above the sampled threshold or a 90-second sampling deadline; validates returned sample identities/positions; and terminates only its own server process. Monitoring is sampled, so the threshold is not a hard OS memory reservation. Startup/shutdown and a memory-monitor call can add a few seconds beyond the deadline. Native source/logs and result.json remain in the attempt directory; successful runs also copy the observation beside result.json. Exit code zero requires sampling and server cleanup to succeed. It never starts Workbench, the game client or a tunnel.

No production addon update or desktop setting is required. These are developer diagnostics and imported planning observations only. They do not unlock native deployment. Current Sarge/Settings guidance and EN/FR/DE runtime-unverified labels remain accurate and unchanged.

FR : Le diagnostic séparé a mesuré le terrain réel d’EmptyEden. Les fichiers importés ne prouvent ni le GUID actif ni la session ; le déploiement reste bloqué pour ce contexte. Aucun changement du mod Workshop n’est requis.

DE: Das separate Diagnosewerkzeug hat das echte EmptyEden-Gelände vermessen. Importierte Dateien bestätigen weder die aktive Welt-GUID noch die Sitzung; die Bereitstellung mit diesem Kontext bleibt gesperrt. Kein Workshop-Mod-Update erforderlich.

Evidence: `docs/test-evidence/native-everon-terrain.json`. Remaining work: exact native world GUID and parent-terrain lineage, session-bound capability negotiation, approval-time enforcement and explicit water/building policy. Previous roadmap items remain intact.


Final packed-path boundary check: a shortened addon-relative suffix was rejected without a report. The stricter source then sampled all three points successfully at 461.71 MiB sampled peak, validated report positions and confirmed server cleanup. The earlier 668.1 MiB runner result is retained above as observed variation, not a memory guarantee. No desktop renderer changes were made, so previously completed desktop performance gates were not repeated.


## Exact native world identity and SHA-256 receipts (current checkpoint)

The source now performs one filtered runtime `ResourceDatabase.SearchResources` lookup for the loaded world's addon, directory, filename and `.ent` extension, without recursion. It requires exactly one callback whose full relative path and exact addon-qualified path match the loaded world, then compares the callback's resource GUID against the expected GUID. The search terms come from the engine's registered path so equivalent request casing works. It does not load a scene as a prefab, enumerate entities, scan the entire map or repeat the lookup each tick.

Actual engine 1.8.0.13 checks: EmptyEden GUID/addon/path accepted; deliberately wrong GUID with the same actual loaded world rejected without output; equivalent GUID/path casing accepted; loose absolute fixture path rejected without output. The final runner confirmed native identity, validated all three samples and stopped its server, with 462.69 MiB sampled working-memory peak under its 1000 MiB limit. One identity lookup measured 6 ms; this single cold/warm-context observation is not a universal timing or frame-rate guarantee. Earlier full-scene and GUID-unverified observations above remain historical evidence; this section describes the current diagnostic behavior.

`result.json` now records `querySha256`, `nativeSourceSha256` and `observationSha256`. Query hashing validates the v1 contract, emits fixed field order, normalizes identity casing and retains sample order, then hashes a versioned domain prefix plus UTF-8 JSON using SHA-256. Native source hashing uses a separate versioned domain, sorted relative script/project filenames and each file's exact-byte SHA-256. The observation digest covers the exact saved report bytes. Identical source trees installed in different directories get the same source digest; source/file renames or changed content change it. Symbolic links in the source tree reject. These digests do not hash every base-game asset or prove immutable world content under a reused GUID.

To check that the captured files still match a completed receipt:

```powershell
node .\tools\terrain-sampler\diagnostic-receipt.cjs "D:\Tests\terrain-results\terrain-EXAMPLE"
```

`contentMatches:true` means the query, copied native source and report match their recorded hashes. It is not a signature, authenticated origin, live-session proof or deployment permission. A person able to edit all files can regenerate all hashes. Actual final receipt verification passed, and Companion still reports `runtimeVerified:false` / `heightValidated:false` when importing the observation; the saved report schema remains v1. The current Workshop bridge and deployment safeguard are unchanged.

Four launch/file/memory guard checks, two native-log parsing checks and four deterministic-hash/change-detection checks passed. The first receipt run encountered a CRLF log-parser issue despite successful native matching; it was fixed and the final run passed. No completed desktop renderer/performance suite was repeated, since this checkpoint changes only the separate developer diagnostic tool.

FR : Le diagnostic vérifie maintenant le GUID et le chemin exacts via la base de ressources du moteur. Les empreintes SHA-256 détectent les modifications des fichiers ; elles n’authentifient pas une session. Les mondes absolus sans preuve d’appartenance sont refusés et le blocage du déploiement reste actif.

DE: Das Diagnosewerkzeug prüft GUID und exakten Pfad jetzt über die Ressourcen-Datenbank der Engine. SHA-256-Prüfsummen erkennen Dateiänderungen, bestätigen aber keine Sitzung. Absolute Weltpfade ohne Eigentumsnachweis werden abgelehnt; die Bereitstellungssperre bleibt aktiv.

Primary APIs: [ResourceDatabase.SearchResources](https://community.bistudio.com/wikidata/external-data/arma-reforger/EnfusionScriptAPIPublic/interfaceResourceDatabase.html), [SearchResourcesFilter](https://community.bistudio.com/wikidata/external-data/arma-reforger/EnfusionScriptAPIPublic/interfaceSearchResourcesFilter.html), [GameProject](https://community.bistudio.com/wikidata/external-data/arma-reforger/EnfusionScriptAPIPublic/interfaceGameProject.html). Evidence: `docs/test-evidence/native-world-identity.json`.
