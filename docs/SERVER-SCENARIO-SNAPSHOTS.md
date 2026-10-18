# COMMAND server scenario snapshots — development pilot

The bridge writes JSON on the server running the mod. Companion uses the existing explicitly GM-enabled paired HTTP connection; it does not need filesystem access to that server. The server profile contains `COMMAND-Scenarios/<snapshot ID>.json`. IDs contain letters, digits, hyphens and underscores. The bridge generates a new filename from the request ID and refuses overwrites.

## Save the plan

In **Deployment preview**, select and review 1–16 planned units with exact verified prefab references. Choose **Save reviewed planned deployment to server**, then approve the save in Reforger. This stores the planned deployment and resolves terrain height on the server. It neither captures current actors nor spawns them. Refresh request results to obtain the filename and outcome.

## Capture current COMMAND state

Open **Server scenario snapshots**, refresh targets, choose **Save current COMMAND state to server**, and select up to 16 owned entities. Review the identities, send, and approve in Reforger. Refresh results for the saved filename. A successful save means the server's native JSON write returned success; an unavailable or unwritable profile returns failure.

Current capture supports bridge-created on-foot infantry squads and empty, unreserved vehicles. Recruited squads and human-controlled actors are excluded. It records stable planned unit IDs, full prefab GUID/path references, root positions and headings, each supported squad member's prefab and position/heading, native factions and supported COMMAND order intentions. Move, route, formation, stance and native fire-policy settings can be saved. A saved movement intention starts again on restore; it does not resume an engine activity at its former progress point. Halt active timed Hold, Defend or Follow before capture; those activities are rejected rather than silently discarded. Mounted state, convoy state and third-party control are outside this pilot.

Inventories, damage, fuel, supplies, combat state, objectives, ownership of other systems and the rest of the game world are **not** saved. Vehicles and characters are spawned from their prefabs on restore. This package is a COMMAND scenario snapshot, not a complete game save.

## Review and restore after restart

1. Run the matching bridge on the same world with the saved addon set loaded, and pair Companion again with GM commands explicitly enabled. Nothing restores automatically at startup.
2. Choose **Review saved server scenario** and enter the snapshot ID without a path or `.json` extension. Review and send the read request, then approve it in Reforger. This validates the bounded file, schema, world, addon manifest and exact prefab availability without spawning.
3. Refresh results and examine the returned entities, factions, transforms, member counts, saved order descriptions and addon requirements.
4. Choose **Restore reviewed server scenario**, select that completed review, review it again, send, and give separate approval in Reforger. The host preview pages through every entity and its saved orders.
5. Refresh results. Successful restoration creates a new COMMAND-owned batch. The original stable unit IDs are retained; its new request ID identifies the live batch. Removal and later supported commands use that new live identity.

The review freezes the validated package in server memory for that pairing. Editing the disk file afterward does not alter that pending restore. Pairing changes discard reviews; review again after reconnecting. Restoring the same snapshot twice in one session is blocked while its prior restored batch exists. Remove that batch before deliberately restoring it again.

Missing resources, addons, incompatible group membership or unavailable native orders fail the operation. Fresh partial actors and owned waypoints are cleaned up on failure. Actors that become human-controlled are protected and may require host cleanup. Current capture and restore do not bypass normal in-game approval, ownership checks, request deduplication or the 60-root scene limit.

The addon manifest conservatively records the server's loaded addon set, including unrelated loaded addons. It checks loaded identities and exact prefab resolution, not complete addon-version compatibility. The initial schema supports the existing Everon coordinate bounds and requires the same scenario world resource. Other terrain migration and full world restoration remain outside this pilot.

## Administrator transport

This feature uses the existing paired HTTP transport. No local command inbox, file polling, silent fallback or automatic recovery was added. A future file transport must be explicitly selected and use the same validation and approval path, with acknowledgements and retained rejected requests.

## Validation scope

Development validation uses original neutral fixtures and the installed official Enfusion API. Server disk writes, process restart and approved restoration are exercised on an isolated diagnostic server; desktop interaction tests use isolated offline Electron profiles with mocked command IPC. Test receipts distinguish these scopes. Connected-human multiplayer, full combat behavior and Workshop deployment require separate acceptance.

Implementation uses native `JsonSaveContext.SaveToFile`, `JsonLoadContext.LoadFromFile`, bounded `FileHandle.GetLength`, profile-confined `FileIO`, `GameProject.GetLoadedAddons`, exact `Resource.Load` identity checks, and native group-spawn lifecycle events. Snapshot prefab references are serialized as text because `ResourceName` serialization drops the path.

## Français

Dans **Aperçu du déploiement**, vérifiez les unités prévues puis choisissez **Enregistrer le déploiement prévu vérifié sur le serveur**. Cette option enregistre le plan sans créer ni capturer d’acteurs.

Pour l’état en jeu, ouvrez **Instantanés de scénario serveur**, actualisez les cibles, choisissez les entités contrôlées et l’enregistrement de l’état actuel. Vérifiez, envoyez, puis approuvez dans Reforger. Le mod écrit le fichier dans `COMMAND-Scenarios` du profil serveur. Les escouades à pied et véhicules vides sans réservation sont pris en charge. Les inventaires, dégâts et autres systèmes du jeu sont exclus. Les ordres temporisés ou de suivi doivent être arrêtés avant la capture. Les intentions de déplacement enregistrées recommencent à la restauration.

Après redémarrage, chargez le même monde et les addons requis, puis créez un nouveau jumelage GM. Demandez l’examen du fichier par son identifiant seul. Cet examen ne crée rien. Actualisez les résultats, vérifiez les entités et ordres, puis demandez une restauration avec une **nouvelle approbation en jeu**. L’examen conserve une copie validée en mémoire : modifier le fichier ensuite ne change pas cette restauration. Les fichiers invalides sont refusés et les créations partielles sont nettoyées ; les acteurs contrôlés par des humains restent protégés. Aucune restauration automatique ni surveillance de fichiers n’est activée.

## Deutsch

In der **Aufstellungsvorschau** geplante Einheiten prüfen und **Geprüfte geplante Aufstellung auf dem Server speichern** wählen. Diese Funktion speichert den Plan, ohne vorhandene Akteure zu erfassen oder neue zu erzeugen.

Für den Spielzustand **Server-Szenariomomentaufnahmen** öffnen, Ziele aktualisieren, eigene Entitäten auswählen und den aktuellen Zustand speichern. Prüfen, senden und in Reforger genehmigen. Die Mod schreibt die Datei in `COMMAND-Scenarios` im Serverprofil. Unterstützt werden Gruppen zu Fuß und leere Fahrzeuge ohne Sitzreservierung. Inventare, Schäden und andere Spielsysteme sind ausgeschlossen. Zeit- und Folgebefehle vor der Erfassung anhalten. Gespeicherte Bewegungsabsichten beginnen bei der Wiederherstellung erneut.

Nach einem Neustart dieselbe Welt und die erforderlichen Addons laden und eine neue GM-Kopplung erstellen. Die gespeicherte Datei anhand ihrer ID prüfen lassen. Diese Prüfung erzeugt nichts. Ergebnisse aktualisieren, Entitäten und Befehle prüfen und anschließend eine Wiederherstellung mit **eigener Genehmigung im Spiel** anfordern. Die Prüfung hält eine validierte Kopie im Speicher; spätere Dateiänderungen verändern diese Wiederherstellung nicht. Ungültige Dateien werden abgelehnt und Teilwiederherstellungen bereinigt; menschlich kontrollierte Akteure bleiben geschützt. Es läuft weder eine automatische Wiederherstellung noch eine Dateiüberwachung.

Superseded infantry movement is removed from remembered current-state orders only after a new transport, driving or treatment task is successfully installed. Supported formation/stance/fire preferences are retained. Native treatment followed by a real disk capture verified that the old route was excluded and the formation preference remained (control-snapshot-orders-native.json).

Français : après installation réussie d’un transport, d’une conduite ou d’un soin, le mouvement remplacé est retiré des ordres mémorisés ; les préférences de formation, posture et tir prises en charge sont conservées.

Deutsch: Nach erfolgreicher Installation von Transport, Fahrzeugfahrt oder Behandlung wird ersetzte Bewegung aus den gespeicherten Befehlen entfernt; unterstützte Formation, Haltung und Feuerregeln bleiben erhalten.


## Heading correction — bridge 0.11.3 local development candidate

Current-state capture and member pose restoration now use the explicit yaw/pitch/roll APIs. The previous `GetAngles`/`SetAngles` calls operate on X/Y/Z rotation: east/south/west captures could record zero heading, and member restoration could rotate around the wrong axis. The current fix uses `GetYawPitchRoll`/`SetYawPitchRoll`, independently checked against the official and installed [IEntity API](https://community.bistudio.com/wikidata/external-data/arma-reforger/EnfusionScriptAPIPublic/interfaceIEntity.html).

A native old-versus-fixed comparison invoked the actual production pose helpers, wrote and read JSON on disk, and checked the restored matrix and position at 0°, 90°, 180°, 270° and a tilted 135° input. The baseline passed 1/5 heading cases; the fix passed 5/5, with zero script errors in both completed comparisons. This targeted proof does not repeat the complete paired process-restart workflow or connected-player acceptance. Failed incomplete-world setup attempts remain private and are not counted as passes.

Snapshot format 1 remains compatible and still stores heading rather than full pitch/roll. Already-written files with an incorrect heading cannot recover their original facing automatically: review those values and create a fresh current-state snapshot from the corrected bridge when the original actors are available. Planned snapshots use their reviewed headings; no automatic migration rewrites existing files. Desktop followon.11 remains compatible. Existing0.11.2 packages are preserved; only the separate local 0.11.3 bridge candidate contains this correction. Workshop publication remains a separate action.

Reproduction source: `tools/prepare-snapshot-heading-probe.cjs --out NEW_PROJECT_DIRECTORY` prepares only an isolated project with current production sources and the original native regression probe. It launches nothing. Run solely through a diagnostic server and a fresh profile; never install its startup probe in a live mission or production bridge.

Français : le candidat local du pont 0.11.3 corrige la capture et la restauration du cap avec les API explicites lacet/tangage/roulis. Cinq cas natifs avec écriture/lecture JSON et contrôle des matrices passent, contre un sur cinq avant correction. Les anciens fichiers ayant déjà enregistré un mauvais cap ne peuvent pas retrouver leur orientation automatiquement : vérifier et enregistrer à nouveau depuis les acteurs d’origine si disponibles. Le format 1 et Companion followon.11 restent compatibles. La publication Workshop est distincte ; l’acceptation complète après redémarrage avec joueurs n’est pas répétée ici.

Deutsch: Der lokale Bridge-Kandidat 0.11.3 korrigiert Erfassung und Wiederherstellung der Richtung mit den ausdrücklichen Yaw/Pitch/Roll-APIs. Fünf native Fälle mit JSON-Schreiben/Lesen und Matrixprüfung bestehen; vorher bestand einer von fünf. Bereits falsch gespeicherte Richtungen lassen sich nicht automatisch rekonstruieren: prüfen und möglichst aus den ursprünglichen Akteuren neu speichern. Format 1 und Companion followon.11 bleiben kompatibel. Workshop-Veröffentlichung erfolgt getrennt; eine vollständige Wiederholung mit Prozessneustart und Spielern ist hier nicht erfolgt.
