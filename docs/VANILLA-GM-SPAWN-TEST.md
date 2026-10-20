# Vanilla US Rifleman — first GM spawn test

No additional mod update is required. These files describe a vanilla prefab already in Arma Reforger. Local diagnostic Workbench resolved its GUID through ResourceDatabase and successfully loaded it as an entity template. No world was opened and no character was spawned during preparation. In-game spawn/AI behavior remains the live test.

## Files and fields — English

1. In Companion, click **Assets**. Under **Import catalog JSON**, choose `01-Vanilla-US-Rifleman-Catalog.json`. This imports one asset and replaces the session catalog; existing assigned unit snapshots remain in the plan.
2. Click **Units**, then **New / deselect** if a previous unit is selected. Callsign: `TEST RIFLEMAN`. Faction: `Bluefor / Friendly`. Under **Assigned asset from your JSON**, select `Vanilla US Rifleman (GM test)`.
3. Click **Place new unit**, then click a clear patch of land near your intended test position. This only adds a planned map marker. Select that marker.
4. Expand **Deployment preview**. Click **Load deployment resource index** and choose `02-Vanilla-US-Rifleman-Resource-Index.json` — use file 02 here, not the catalog.
5. Heading: `0`. Click **Review selected units**. The review must show `{26A9756790131354}Prefabs/Characters/Factions/BLUFOR/US_Army/Character_US_Rifleman.et` and your selected world X/Z.
6. With an explicitly GM-enabled mixed connection active, click **Send reviewed spawn request to game**. Changing plan, heading or index requires another review.
7. Reforger host: Escape → Host Pairing → **Review GM requests** → **Check pending**. Inspect this one prefab and position, then **Approve**. Resume to inspect the result.
8. Companion: **Check game request results**. For cleanup, choose its **Bridge-created group**, **Request removal**, then approve removal in the game.

After restarting the game/app connection, use a fresh address/code in mixed mode. Enable **Allow reviewed GM requests** in Companion before connecting. Planner faction colors do not override the native prefab's faction/loadout. This US Army character uses its native prefab defaults. Spawn one first, not a whole batch.

## Français

1. Companion → Ressources → Importer le catalogue JSON : fichier `01-Vanilla-US-Rifleman-Catalog.json` (remplace le catalogue de session, pas les unités déjà affectées).
2. Unités → Nouveau/désélectionner. Indicatif `TEST RIFLEMAN`, faction amie, ressource `Vanilla US Rifleman (GM test)`. Placer l’unité puis cliquer sur un terrain dégagé et sélectionner le marqueur.
3. Aperçu du déploiement → Charger l’index de ressources : fichier `02-Vanilla-US-Rifleman-Resource-Index.json`. Orientation `0`, vérifier les unités sélectionnées, inspecter prefab et position puis envoyer la création au jeu.
4. La connexion mixte doit autoriser explicitement les requêtes GM. Hôte dans Reforger → Review GM requests → Check pending → inspecter → Approve. Consulter les résultats dans Companion ; demander le retrait du groupe créé puis l’approuver dans le jeu.

## Deutsch

1. Companion → Ressourcen → Katalog-JSON importieren: `01-Vanilla-US-Rifleman-Catalog.json` (ersetzt den Sitzungskatalog; bereits zugewiesene Einheiten bleiben erhalten).
2. Einheiten → Neu/abwählen. Rufname `TEST RIFLEMAN`, freundliche Fraktion, Ressource `Vanilla US Rifleman (GM test)`. Einheit auf freiem Land platzieren und Marker auswählen.
3. Deployment preview → Ressourcenindex laden: `02-Vanilla-US-Rifleman-Resource-Index.json`. Richtung `0`, ausgewählte Einheiten prüfen, Prefab/Position ansehen und Spawn-Anfrage senden.
4. Gemischte Verbindung muss GM-Anfragen ausdrücklich erlauben. Reforger-Host → Review GM requests → Check pending → prüfen → Approve. Ergebnisse in Companion prüfen; Entfernung der erzeugten Gruppe anfordern und erneut im Spiel bestätigen.

## Resource provenance

Owner addon: Arma Reforger `58D0FB3206B6F859`, depending on Enfusion core `5614BBCCBB55ED1C`. Resource GUID: `26A9756790131354`. Import metadata retains `nativeAvailability: unverified` because it cannot guarantee the current game session's installed assets. The native executor rechecks exact identity before spawning. No game asset binaries are copied into these files; license/entitlement is not inferred.

## Placement correction

Use desktop 2.9.1-dev.gm.2 for native spawning: deployment reverses the +50 m map imagery offset in each axis without moving saved plan markers. Discard old pending requests and review again. No Workshop mod update is required. See [GM-PLACEMENT-FIX.md](GM-PLACEMENT-FIX.md).
