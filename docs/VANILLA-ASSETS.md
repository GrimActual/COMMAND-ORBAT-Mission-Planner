# COMMAND — Vanilla Assets

Start with `Start-Here/01-Operational-Assets-Catalog.json` and its matching `01-Operational-Assets-Resource-Index.json`.

## English
1. In COMMAND, open **Assets → Import catalog JSON** and choose the Catalog file. Do not use Import plan for a catalog.
2. Under **Units**, choose an asset from **Assigned asset from your JSON**. Set the marker faction separately, then place the unit or apply changes.
3. For the GM pilot, select your planned units, open **Game controls → Deploy → Deployment preview**, and load the matching **Resource-Index.json**. Review selected units, then send the reviewed request. The in-game host must review and approve it.
4. The operational pair contains 2,721 character, vehicle, group, weapon and item prefab identities. Complete-Catalog supplies all 19,438 ArmaReforger prefab identities by category; COLLECTIONS.json lists each pair.
5. Importing another catalog replaces the active chooser list. Assigned markers retain their saved asset snapshots. After restarting, reimport the catalog you want to browse. Use the matching index for the selected batch; a different collection may not contain those resources.

This is a metadata snapshot from the installed base-game ResourceDatabase on 14 October 2026. Every listed prefab has its reported GUID, exact path and Arma Reforger addon identity. The core addon dependency is declared; core engine internals and modded assets are outside this index. No game binaries or models are redistributed.

An indexed identity does not prove standalone spawnability. The complete collections include base templates, damage variants, components and editor helpers. Planning icon classifications are inferred from folders and can be overridden. Faction choice remains your responsibility. Prefab component/inheritance dependencies have not been extracted. Native availability remains unverified until checked in the target game; the query did not load or spawn all these resources.

Files are split to respect the existing 5 MB catalog / 5 MiB index and 10,000-record limits. The operational collection lets you review common unit types together. Environment collections are separate; select the appropriate matching index for their batches. Modded assets retain the existing reviewed-metadata import workflow. Regenerate or verify the snapshot after game updates.

## Français
Dans **Assets → Import catalog JSON**, ouvrez le fichier Catalog de Start-Here. Dans **Units**, choisissez la ressource dans la liste des équipements, définissez la faction séparément et placez votre unité. Pour le pilote GM, sélectionnez les unités, ouvrez Game controls → Deploy → Deployment preview et chargez le fichier Resource-Index correspondant. Vérifiez la demande avant de l'envoyer ; l'hôte doit l'approuver dans le jeu.

Le catalogue opérationnel contient 2 721 identités. Les collections complètes contiennent 19 438 préfabriqués du jeu de base. Un nouvel import remplace la liste active, mais les unités conservent leurs références enregistrées. Réimportez le catalogue après un redémarrage. Il s'agit de métadonnées : la présence d'un GUID ne garantit pas qu'un préfabriqué puisse être créé seul. Les modèles de base et les variantes endommagées sont inclus. Les ressources de mods et les éléments internes du moteur sont exclus. Aucun fichier du jeu n'a été modifié.

## Deutsch
Öffnen Sie unter **Assets → Import catalog JSON** die Catalog-Datei aus Start-Here. Wählen Sie unter **Units** den Eintrag in der Ausrüstungsliste, legen Sie die Fraktion separat fest und platzieren Sie die Einheit. Für den GM-Piloten wählen Sie die Einheiten aus, öffnen Game controls → Deploy → Deployment preview und laden die passende Resource-Index-Datei. Prüfen Sie die Anfrage vor dem Senden; der Host muss sie im Spiel genehmigen.

Die operative Sammlung enthält 2.721 Identitäten; die vollständigen Kategorien umfassen 19.438 Basis-Spiel-Prefabs. Ein neuer Import ersetzt die aktive Liste. Platzierte Einheiten behalten ihre gespeicherten Referenzen. Importieren Sie den gewünschten Katalog nach einem Neustart erneut. Dies sind Metadaten: Eine GUID bestätigt nicht, dass jedes Prefab einzeln erzeugt werden kann. Basistemplates und beschädigte Varianten sind enthalten. Mod-Ressourcen und Engine-interne Ressourcen sind ausgeschlossen. Spieldateien wurden nicht verändert.

## Existing rifleman test plans
If a unit was assigned using the earlier single-rifleman test files, keep using the matching Compatibility/Original-Rifleman-Resource-Index.json for that old snapshot. To move it to the full catalog, select the unit, reselect its asset from the new catalog and click Apply changes. Its native prefab GUID and path remain the same, but the new index uses new record IDs and provenance. Do not merge the old and new rifleman records as separate identities. Conflicting old/new snapshots of one asset deliberately block catalog export until reconciled. Your saved mission is not silently rewritten.

Français : pour une unité issue de l'ancien test Rifleman, utilisez son index d'origine dans Compatibility. Pour adopter le nouveau catalogue, sélectionnez l'unité, choisissez à nouveau sa ressource et appliquez les modifications. Ne fusionnez pas les anciennes et nouvelles références en doublon.

Deutsch: Verwenden Sie für Einheiten aus dem früheren Rifleman-Test den ursprünglichen Index unter Compatibility. Für den neuen Katalog wählen Sie die Einheit aus, wählen das Asset erneut und wenden die Änderung an. Alte und neue Referenzen dürfen nicht als doppelte Identitäten zusammengeführt werden.
