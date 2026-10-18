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
3. Verify exact world transforms, terrain alignment, known headings and local/parent transforms. Preserve the reviewed height/rotation data; current planner units do not yet store a full native editor transform.
4. Review added, moved and removed managed records in COMMAND. Require explicit removal review and classification/resource approval for additions. Resolve hierarchy references when a removed unit has children; do not silently reparent foreign plan units.
5. Build the entire candidate through the existing validated mission edit path, atomically, with **one Undo step**. Prove Undo/Redo restores the exact before/after mission and that failed validation, stale review or locked entries cause no partial mutation or history entry. A pure contract test or simulated native receipt cannot satisfy this gate.
6. Test the actual original native importer/exporter and desktop review together: failed partial spawn rollback, stale baselines, conflicts, wrong world/addons, foreign layers unchanged and editor save/reopen identity. Only then enable Apply and describe the workflow as working. Continuous synchronization remains later work.

The 26 development checks cover the declarative identity/diff and file contracts. They do not certify Workbench compilation, native identity persistence, scene editing, mission application or Undo. No normal game client or Workbench was launched. A separate isolated diagnostic server exercised only native JSON scalar reads, as described below.

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
