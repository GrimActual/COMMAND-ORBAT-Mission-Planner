# COMMAND control execution update

Candidate desktop: 2.9.1-dev.followon.8. Candidate bridge: 0.11.1.

## What changed

A native waypoint can be attached while its AI group and member agents are inactive. The original neutral diagnostic fixture reproduced an accepted Move request with no travel during a ten-second observation. The updated execution path requests native `ActivateAI(false)` after validating the approved group and existing waypoint ownership, then checks activation. It does not pin LOD, teleport characters, remove foreign orders, reset all behaviour, or change player control. If native activation is refused, infantry execution reports that failure.

The game now reports revoked recruitment authority to the paired relay. Revocation is monotonic for that recruitment lease. Companion disables normal orders to unavailable squads and keeps **Release unavailable squad** available. Approve release in-game, then recruit a currently tracked member. A lost member identity is not silently replaced by another entity.

**Check squad execution** is a separately reviewed, read-only request for the exact controlled squad. It reports group/member activation, leader X/Z, current waypoint and control authority. It does not wake or move the squad. It remains available for a revoked lease so the reason can be inspected before release.

The latest outcome appears above the controls. Pending AI requests refresh automatically every 1.5 seconds for a bounded period, stop on terminal outcomes or pairing changes, and never approve themselves. History is newest first. **Order installed** confirms native attachment or setting application; it does not certify travel, combat or formation spacing. The game keeps the execution outcome separate from delivery acknowledgment. Expired approvals get distinct guidance. Recruitment preview now explains recruitment rather than release.

Transport and treatment target lists exclude explicitly revoked squads. Runtime authority checks remain in the game. Live reviews, results and diagnostic state stay outside mission JSON and Undo/Redo.

## Verification basis

The implementation uses independently checked Bohemia APIs: [AIGroup](https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceAIGroup.html), [AIAgent](https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceAIAgent.html), and [AIWaypoint](https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceAIWaypoint.html). The installed 1.8.0.13 documentation and compiler provide the activation overload used here; the online reference has a different displayed signature. Compilation and actual native behaviour, rather than an assumed online signature, are required gates.

Defend retains its native area radius and cover behaviour. It is not evaluated using Move's close destination tolerance. The neutral native fixture checks actual entry into the waypoint's own completion radius.

A broader convoy validation initially stopped during boarding with 3 of 4 members complete at the existing 60-second limit. A subsequent traced run, with unchanged production transport code, completed both four-person boarding operations, the two-point leader route, physical follower pursuit, cycle rejection and detach. This does not establish a cause or eliminate intermittent boarding failure. Partial completion remains a reported failure; no teleport or forced seating is used. If it occurs in a hosted session, inspect actual occupancy and use an approved Dismount before retrying Embark.

Current receipts are stored separately under `docs/test-evidence/live-control-*.json`. The baseline inactive case is `dormant-control-baseline.json`. Desktop checks use an isolated profile and synthetic command IPC; native checks use a real isolated diagnostic server with terrain and navigation data. These do not certify connected-human multiplayer, sustained combat or the user's hosted scenario.

## Use the candidate

1. Preserve/export the current plan and close the older Companion when ready to switch.
2. Use the candidate desktop together with bridge 0.11.1. Its bundled local relay understands the new status capability. A separately hosted relay also needs the updated server code. Older relays negotiate older support; execution inspection will remain disabled.
3. Publish the prepared bridge project to Workshop as 0.11.1, update it in the game, and restart the hosted session. Verify **0.11.1** in the pairing/review title.
4. Make a fresh GM-enabled pairing and select the intended AI/faction tracking scope.
5. Refresh targets. For an existing squad, choose a live member and recruit it with in-game approval.
6. Use **Check squad execution** before and after a simple Move. Compare reported position and waypoint with the game. Preserve the result if an order remains installed without movement.
7. Test transport, driving, convoy, treatment and snapshot operations only with supported targets and their separate reviewed panels. All gameplay requests still require approval.

The candidate is a development build. Server configuration, unavailable navigation, combat decisions, dead or player-controlled members, changed tracking selection, foreign waypoints and incompatible vehicles can still prevent a request. Report the actual result and execution inspection rather than treating relay acknowledgment as success.

## Français

Utilisez l’application candidate avec le pont 0.11.1 et un nouveau jumelage GM. Le dernier résultat s’actualise automatiquement. « Ordre installé » ne prouve pas l’arrivée. « Vérifier l’exécution de l’escouade » indique activation, position, point de passage et autorité sans modifier l’escouade. Si le contrôle est indisponible, libérez-le avec approbation en jeu, puis recrutez un membre actuellement suivi. La publication Workshop et le redémarrage de la session restent nécessaires.

## Deutsch

Die Kandidaten-App mit Bridge 0.11.1 und neuer GM-Kopplung verwenden. Das neueste Ergebnis aktualisiert sich automatisch. „Befehl eingerichtet“ bestätigt keine Ankunft. „Gruppenausführung prüfen“ zeigt Aktivierung, Position, Wegpunkt und Befugnis ohne Änderung der Gruppe. Nicht verfügbare Steuerung im Spiel freigeben und danach ein aktuell erfasstes Mitglied übernehmen. Workshop-Veröffentlichung und Sitzungsneustart sind weiterhin erforderlich.
