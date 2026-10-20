# Infantry routes and AI labels — followon.4 / bridge 0.8.0

AI map labels now read **AI**, while real player display names are retained. Internal tracking IDs remain unchanged. The label improvement works with the named metadata supplied by bridge 0.7.0; no republish is required solely for that display change.

## Route test

Use Companion 2.9.1-dev.followon.4 and the separately prepared COMMAND ORBAT Bridge 0.8.0 project. Publish the mod update to existing Workshop ID 6A969EB0C5012BB9, update it in the game, restart the hosted session and create a fresh GM-enabled pairing. Source/Windows publication to GitHub does not publish Workshop.

1. Spawn a verified infantry AI **group** through Companion's reviewed deployment and approve it in the game. An individual rifleman is not a squad target.
2. In Reforger, check pending GM requests so the mod advertises its capabilities.
3. In Companion, open Units → Native AI orders → Refresh command targets and results. Select the bridge-created group.
4. Choose **Follow waypoint route**. Click **Add waypoint on map**, then click reachable open ground. Repeat for 1–16 points. The numbered route is a temporary overlay; saved plans and Undo remain unchanged.
5. Use **Remove last waypoint** or **Clear route** to correct it. Review the full ordered coordinate list, then send it for host approval. Editing the route requires a fresh review.
6. In Reforger, inspect each point using NEXT, then approve the full request. Resume and observe actual movement and progression. Refresh the result in Companion. An installed route is not proof of arrival.
7. Test replacing a route and **Cancel owned movement**. Other in-game waypoints block this pilot and are not deleted. Human-controlled or mounted group members are rejected.

Older mods leave route controls unavailable. Existing Move, timed Hold, Defend and cancellation remain supported. Routes apply only to bridge-created, on-foot standard editable infantry AI groups with 1–16 resolved members. This update does not add existing-squad recruitment, Follow Me, formations, stances, fire control or vehicle commands.

## Français

Les marqueurs IA affichent **AI** ; les noms des joueurs sont conservés. Avec Companion followon.4 et le pont 0.8.0, créez un groupe d’infanterie via le déploiement approuvé. Actualisez les cibles, choisissez Suivre un itinéraire et ajoutez 1 à 16 points sur la carte. Vérifiez l’ordre, envoyez puis contrôlez chaque point et approuvez dans Reforger. Retirer le dernier point et Effacer permettent de corriger le tracé. Toute modification exige une nouvelle vérification. Les anciennes versions désactivent cette commande. L’installation native ne prouve pas l’arrivée ; vérifiez le déplacement sur terrain normal. Aucun changement de mission ou d’historique Undo.

## Deutsch

KI-Marker heißen **AI**; Spielernamen bleiben erhalten. Mit Companion followon.4 und Bridge 0.8.0 eine Infanteriegruppe über die freigegebene Bereitstellung erzeugen. Ziele aktualisieren, Wegpunktroute wählen und 1–16 Kartenpunkte setzen. Reihenfolge prüfen, senden und im Spiel jeden Punkt kontrollieren und freigeben. Letzten Punkt entfernen und Leeren korrigieren die Route; Änderungen benötigen eine neue Prüfung. Alte Mods deaktivieren Routen. Native Installation bestätigt keine Ankunft; Bewegung auf normalem Gelände prüfen. Mission und Undo bleiben unverändert.

## Validation

Local release regression: 853 tests, 852 passed, 1 skipped because no local independent C preprocessor was installed, 0 failed. New route contracts, capability negotiation, approval and duplicate/ownership guards passed. Actual offline Electron checked map picking, ordered preview, stale review, 16-point bounds, older-mod gating, EN/FR/DE, AI labels, preserved player names and unchanged mission data.

Native game scripts compiled in the standalone diagnostic server. An isolated actual server with a synthetic fireteam and loopback relay installed 3 and 16 waypoints in order, replaced routes, returned to Move, cancelled all owned points, rejected a foreign waypoint without removing it, and removed the owned group. The fixture had no terrain/navmesh travel acceptance and no real players. Server/relay were stopped and pairing revoked. Workbench's earlier startup crash is not a passing Workbench validation.

A matched three-second desktop sample with 60 named synthetic markers measured 60.28 FPS before and 60.36 FPS with the route, p95 16.8 ms in both. One hundred route-overlay add/clear cycles left map DOM at 512 → 512. These short samples do not certify sustained multiplayer performance.

Advisory source initialization review now keeps later reads manual after unresolved control transfers or unknown effects, even when later literal assignments exist. It still never authorizes native lowering. Source capture is not watched after disk edits; recapture when source changes.

User-reported live tracking acceptance: the user confirmed the named-tracking session worked after enabling the faction/selection controls. This is one reported session, not broad mixed-player certification.
