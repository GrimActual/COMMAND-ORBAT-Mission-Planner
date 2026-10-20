# Workbench exchange contract — 18 October 2026

**Status: source-only development review. Export to Workbench and Import editor changes remain planned.** Nothing here enables the application, changes a mission, spawns an entity or proves a native editor round trip. The existing desktop and bridge releases are unchanged.

## Implemented foundation

`tools/workbench-exchange/contract.cjs` accepts bounded JSON text and produces an original declarative baseline or a read-only change review. `cli.cjs` reads explicitly selected local files and writes only a new output file, without overwriting existing files. Malformed UTF-8, ambiguous duplicate JSON keys, extra fields, excessive nesting and size limits are rejected. The contract supports at most 1,000 managed records per snapshot.

The baseline binds an external stable `planId`, `exchangeId`, canonical mission SHA-256, declared exact world addon/GUID/path, dedicated `COMMAND_<exchangeId>` layer, explicit map offset and 3D bounds. Approved prefab declarations preserve exact addon, GUID and path; GUID/path collisions, including case-only path aliases, are rejected. Each placement retains a stable managed ID, the exact typed planner unit ID, prefab identity and full world-space position/angles. Baseline X/Z must match the selected unit using the declared map offset. Its prefab must match that unit's stored resource reference. Height and orientation must be supplied explicitly; they are not guessed from GUIDs or the 2D marker.

The snapshot binds the complete baseline hash and repeats the world, plan, exchange, layer and transform-space identities. A complete successful managed-layer scan is required before an absent record can be listed as removed. Duplicate or rebound managed IDs are rejected. New records cannot claim existing planner IDs. Foreign entities stay outside the managed list; their declared count is displayed separately and does not give them import authority.

The report separately lists **added, moved and removed** managed records and unchanged IDs. Movement review retains raw position and orientation differences, including altitude, pitch and roll; it does not infer equivalent Euler representations or hide small numeric changes. Changed existing prefabs, unapproved additions and locked moves/removals remain explicit blocking issues. Removals that would retain children under a deleted parent are also flagged; no reparenting is performed. A changed mission invalidates the entire baseline, including unrelated edits. No source plan or input is mutated.

**`canApply` is always false, even when structural checks pass.** There is no Apply method, importer, native launcher, HTTP transport, live command or new application button. Declared complete-scan flags and hashes are consistency checks, not proof that a native importer actually scanned the correct world/layer or that an input file is authentic. Hand-edited JSON must never bypass the native acceptance gates.

## Native APIs independently checked

The official [vector API](https://community.bistudio.com/wikidata/external-data/arma-reforger/EnfusionScriptAPIPublic/interfacevector.html) documents angles as yaw, pitch, roll in degrees. The installed Enfusion API has the same convention. The contract names this convention explicitly; no parent/local conversion is implemented or assumed.

The official [WorldEditorAPI reference](https://community.bistudio.com/wikidata/external-data/arma-reforger/EnfusionScriptAPIPublic/interfaceWorldEditorAPI.html) and installed documentation expose logical edit actions and dedicated subscene-layer operations. Installed documentation was checked at `Workbench/docs/EnfusionScriptAPI/html/interfaceWorldEditorAPI.html`. In this installation, `CreateEntity` returns **IEntitySource**. The [plugin tutorial](https://community.bistudio.com/wiki/Arma_Reforger%3AWorkbench_Plugin_Tutorial) illustrates an IEntity return. This difference must be resolved by compiling against the installed editor before implementation is accepted; tutorial snippets are not copied into COMMAND.

Workbench's `BeginEntityAction` / `EndEntityAction` history is separate from COMMAND's mission history. API availability alone proves neither rollback nor one-step Undo in either application.

## Remaining gates before user-facing import

1. Implement and compile an original Workbench importer/exporter against the installed editor. Validate the actual loaded world, required addons, resource resolution and writable dedicated layer before creating anything. Do not write foreign/base layers or treat a world `.ent` as a prefab.
2. Establish durable managed identities across save/reopen, entity rename, copying, deletion and editor restart. A name or transient replication ID alone is insufficient. Verify actual layer membership and complete scans; reject copied/rebound markers and registry conflicts.
3. Verify exact world transforms, terrain alignment, known headings and local/parent transforms. Preserve the reviewed height/rotation data; development candidates retain a validated last-reviewed full pose per unit; this is not active identity authority.
4. Review added, moved and removed managed records in COMMAND. Require explicit removal review and classification/resource approval for additions. Resolve hierarchy references when a removed unit has children; do not silently reparent foreign plan units.
5. Build the entire candidate through the existing validated mission edit path, atomically, with **one Undo step**. Prove Undo/Redo restores the exact before/after mission and that failed validation, stale review or locked entries cause no partial mutation or history entry. A pure contract test or simulated native receipt cannot satisfy this gate.
6. Test the actual original native importer/exporter and desktop review together: failed partial spawn rollback, stale baselines, conflicts, wrong world/addons, foreign layers unchanged and editor save/reopen identity. Only then enable Apply and describe the workflow as working. Continuous synchronization remains later work.

The original 26 development checks covered the declarative identity/diff and file contracts. They do not certify Workbench compilation, native identity persistence, scene editing, mission application or Undo. No normal game client or Workbench was launched. A separate isolated diagnostic server exercised only native JSON scalar reads, as described below.

## Français

Fondation de développement uniquement : un contrat JSON vérifie les identités déclarées, les références de préfabriqués, le plan de référence et les limites, puis sépare les entités gérées ajoutées, déplacées et supprimées. Les fichiers existants ne sont jamais écrasés et le plan n'est pas modifié. L'importeur Workbench, la vérification native des identités et l'application atomique avec une seule étape Annuler restent à réaliser et à tester. Une validation JSON ne prouve ni l'origine du fichier ni le fonctionnement de l'éditeur ; Appliquer reste désactivé.

## Deutsch

Nur eine Entwicklungsgrundlage: Ein JSON-Vertrag prüft deklarierte Identitäten, Prefab-Verweise, den Ausgangsplan und Grenzen. Hinzugefügte, verschobene und entfernte verwaltete Einheiten erscheinen getrennt. Vorhandene Dateien werden nicht überschrieben und der Plan bleibt unverändert. Workbench-Importer, native Identitätsprüfung und atomare Anwendung mit einem Rückgängig-Schritt müssen noch implementiert und getestet werden. Gültiges JSON beweist weder die Herkunft der Datei noch einen funktionierenden Editor-Austausch; Anwenden bleibt deaktiviert.


## Native JSON boundary and opaque managed IDs

A separate original Game-module probe was compiled and executed on diagnostic engine **1.8.0.13**. Seven scalar cases were reproduced from the source-provided isolated project: number, numeric-looking text, ordinary text, missing field, null, Boolean and fractional number. Native `ReadValue` distinguished numbers from text. However, reading JSON null into a string returned success with an empty string. Failed scalar reads did not invalidate the overall context. An importer therefore must check each read result and reject empty identities; context validity alone is insufficient. The [JsonLoadContext API](https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceJsonLoadContext.html) was checked against the installed Game API before the probe.

The native wire schema is `command-workbench-native-snapshot`, version1. Its envelope is the same as the normalized snapshot, but each entity has only `managedId`, `prefab` and `transform`. Native rows cannot supply a planner unit ID. `reviewNative` resolves that ID from the trusted baseline and then runs the same review checks. Unknown managed IDs become additions with no planner identity. Numeric, empty and null managed IDs are rejected. This preserves typed planner IDs, including safe integers larger than a native 32-bit integer, without converting them through Enfusion's numeric fields. The normal review schema remains available for development fixtures.

Use `review-native` with the same explicit file options as `review`. `prepare-native-probe.cjs --out NEW_PROJECT_DIRECTORY` creates an isolated reproduction project and prints its project, world resource and profile paths. It launches nothing and refuses an existing directory. Its Game startup probe belongs only in this diagnostic fixture; do not add it to the production bridge or a live mission. The generated project was executed with the diagnostic server and matched all seven recorded cases. This is **Game JSON data proof**, not World Editor compilation, native placement/identity persistence, scene exchange or Undo proof.

The 1,000-record synthetic fixture also compares normalized and opaque-native-ID reviews for identical reports. The native mapping path shares already-parsed validation data rather than reparsing and hashing the same baseline twice. Timings and coarse heap samples are recorded in the evidence; they do not certify editor, graphics, lifetime memory or universal performance.

Français : les identifiants gérés du flux natif restent des chaînes opaques ; les identifiants exacts du plan sont retrouvés uniquement dans le registre de référence. Sept lectures JSON ont été vérifiées dans le serveur de diagnostic, mais l'importeur de l'éditeur et Annuler restent non vérifiés et désactivés.

Deutsch: Der native Datenstrom verwendet nur undurchsichtige Verwaltungskennungen; die exakten Plan-IDs werden ausschließlich aus dem vertrauenswürdigen Ausgangsregister zugeordnet. Sieben JSON-Lesefälle wurden im Diagnoseserver geprüft. Editor-Importer und Rückgängig bleiben ungeprüft und deaktiviert.


## Desktop candidate and one-Undo development gate — 18 October 2026

`tools/workbench-exchange/candidate.cjs` prepares a complete mission candidate from a valid native-format review and explicit choices. It exposes no Apply function or product route. Every move and removal needs exact managed-ID confirmation; every addition needs explicit side/type, existing phase/retained parent, and an exact current resource-index binding. Blank addition names receive unique planning names. Removed identities are never reused. Locked units, orphaned retained children, stale plans, unapproved resources, incompatible existing catalog definitions and oversize candidates reject the entire result. Foreign units retain their data.

Each affected unit retains `workbenchReview`: exact world/exchange identity, map offset, world position and yaw/pitch/roll. Shared asset definitions contain no placement pose. Existing exact prefab definitions are reused; otherwise new definitions use neutral `other`, independently of the chosen tactical unit type. The field records **last reviewed provenance**, not current ownership or guaranteed current position. Subsequent 2D movement or copying can leave that provenance out of date. Any future export must establish fresh unique identities and check/resample/review the current pose; it must never authorize a native write from this saved field alone.

Ordinary plans still save as format4. Plans containing this optional record use format5. JSON and CSV retain it; the previous followon.11 reader was checked to reject format5 rather than silently lose its data, and still reads ordinary format4 plans. This extension is in development source and the isolated test copy only. Published and previously packaged releases remain unchanged.

The focused development checks now total **41** (22 contract, five file-CLI, 14 candidate checks). The full suite passed **936**, failed zero and skipped one. An isolated offline Electron copy matching the current planner, core and main/preload source exercised the existing generic validated batch-edit path with synthetic native-format data: simultaneous additions/moves/removals, exact one-step Undo and Redo, foreign data preservation, and stale/invalid rejection without a history entry. Both a three-unit fixture and a 1,000-managed-plus-one-foreign fixture passed. These are actual desktop edit checks, **not a native Workbench round-trip**.

Source-only preparation of the larger fixture took a median159ms across five runs. The larger Electron apply call took1216ms end to end, including IPC/render/storage work; the small call took14ms. These bounded measurements do not establish frame rate, lifetime memory or a speedup. Profile responsiveness before enabling large interactive imports. Reproduction: `verify-desktop.cjs --candidate OWNED_DEVELOPMENT_FOLDER --out NEW_FOLDER --playwright-module MODULE_FOLDER [--bulk]`; it refuses source-hash mismatches, uses a fresh offline profile and closes the test application. It must not be pointed at a user's active profile or a game.

Native importer/exporter compilation, actual editor identity persistence, layer protection, partial-spawn rollback, exact transform round-trip and complete desktop/native acceptance remain pending. **Import editor changes stays planned and disabled.**

Français : le candidat conserve la pose revue dans chaque unité, sans modifier les définitions partagées des ressources. Les plans ordinaires restent au format4 ; les candidats contenant cette donnée utilisent le format5, refusé sans perte silencieuse par l’ancienne version. Ajouter/déplacer/supprimer et Annuler/Rétablir ont été vérifiés dans une copie COMMAND hors ligne avec des données synthétiques. L’importeur natif et les identités persistantes Workbench restent à valider ; l’import utilisateur reste prévu et désactivé.

Deutsch: Der Kandidat speichert die geprüfte Pose je Einheit, ohne gemeinsame Asset-Definitionen zu verändern. Normale Pläne behalten Format4; Kandidaten mit diesen Daten verwenden Format5, das die ältere Version sicher ablehnt. Hinzufügen/Verschieben/Entfernen und Rückgängig/Wiederholen wurden in einer isolierten Offline-Kopie mit synthetischen Daten geprüft. Nativer Workbench-Importer und dauerhafte Identitäten sind weiterhin ungeprüft; der Benutzerimport bleibt geplant und deaktiviert.


## Read-only native editor inventory — 18 October 2026

An original WorkbenchGame plugin now compiles and runs in the installed editor(build192142) against an owned five-entity synthetic world. It reads source IDs, subscene/layer membership, native world positions, explicit `GetYawPitchRoll` angles and world matrix axes. Five orientations reconstruct the native matrices within 7e-8. `GetAngles` is explicitly X/Y/Z rotation; it must not be labeled yaw/pitch/roll. No plugin scene edits, spawning, Save or desktop Apply occur.

Two complete scans used matching project/world identities; only the text-layer entity order changed. In this **synthetic layer without persisted IDs**, two source IDs rebound to different instances. This proves those unpersisted IDs are insufficient for COMMAND identity; it does not establish that all IDs in editor-saved scenes are unstable. Durable persisted markers/registry bindings still need actual save/reopen/copy/rename/delete tests and duplicate detection. Plain entities also returned instance names from source `GetResourceName`; that value alone is not a verified prefab reference.

Workbench exited 0 and reported a successful module close, but logged GenericEntity/GenericEntityClass instance leaks at shutdown. Cleanup/lifetime acceptance remains **unverified**, and this probe is not described as a clean complete editor workflow. Initial addon-path and empty-subscene setup failures are excluded from passing evidence. Raw logs stay private; the bounded receipt is `docs/test-evidence/workbench-inventory-native.json`.

`prepare-inventory-probe.cjs --out NEW_PROJECT_DIRECTORY` prepares a fresh synthetic project without launching anything. It adds only a WorkbenchGame diagnostic plugin, no Game startup hook or production bridge dependency. Use an explicitly selected installed base-game addon directory; the Tools parent directory is not assumed to contain game data. Three focused preparation checks passed. Native importer/exporter, persisted identity, protected writes, partial-spawn rollback and end-to-end exchange remain pending. Apply stays disabled.

Français : l’inventaire natif en lecture seule compile et lit les entités/couches et les matrices. Les identifiants non persistés du cas synthétique changent lors du réordonnancement ; les identités sauvegardées dans l’éditeur restent à tester. Des diagnostics de fuite apparaissent à la fermeture : la validation du cycle de vie reste ouverte. Aucun import ni Appliquer n’est activé.

Deutsch: Die native Nur-Lese-Inventur kompiliert und liest Entitäten/Ebenen sowie Matrizen. Nicht gespeicherte IDs des synthetischen Falls ändern sich bei Umordnung; gespeicherte Editor-Identitäten müssen noch geprüft werden. Beim Schließen erscheinen Leckdiagnosen; die Lebenszyklusprüfung bleibt offen. Import und Anwenden bleiben deaktiviert.
