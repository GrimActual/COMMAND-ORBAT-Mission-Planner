# GM placement correction — 2.9.1-dev.gm.2

The user confirmed real Host Local spawning, but the character appeared near rather than exactly at the planned point. Source inspection found the coordinate-space mismatch: both single and mixed live layers render native world X/Z with +50 m in each axis for the map imagery, while deployment previously sent saved map coordinates directly. The corrected converter subtracts 50 m in each axis exactly once. The native mod and live renderer are unchanged.

For example, a planned marker at map X 4830.770434689487 / Z 12279.162876961545 now produces native world X 4780.770434689487 / Z 12229.162876961545. The returned live point renders at the original planned marker. Terrain Y remains resolved by the native sender. Existing saved plans/markers are not moved or rewritten. Old intention files and pending requests retain their old coordinates: review and send a new request after updating.

## User steps

1. Close only Companion. Apply the desktop patch or use the patched copy. The Workshop mod stays at 0.4.0.
2. Reopen the same EXE; its title ends with Placement Fix and package version is 2.9.1-dev.gm.2.
3. Start a fresh mixed profile connection with GM requests enabled. In Reforger select mixed roster mode and use the fresh address/code.
4. Select the existing TEST RIFLEMAN planned marker; keep its position. Load the matching vanilla resource index again, set heading, Review selected units and send a fresh spawn request.
5. Approve in the game. Confirm the new soldier's position against the planned marker, then remove the bridge-owned group if finished. Cancel/expire previous pending requests rather than approving them.

The exact installed user copy was patched after the user closed it, with originals backed up on A:. Saved plan storage was checked before/after and remained unchanged. No game command was sent by automated tests.

## Validation

- Deployment/stale/schema/boundary tests and actual production single + mixed live renderers prove native-to-display round trips at the reported coordinates; 14 initial affected checks and 7 final coordinate/localization checks passed.
- The actual patched executable imported the vanilla catalog, assigned a unit, loaded a matching deployment index, prepared the corrected review and retained its asset after reload in an isolated profile. Native file selection was mocked; JSON import and validation were real.
- Same 400-unit fixture and 16-unit batch, alternating before/after: mean review about 11.3 ms before and 10.0 ms after across twelve measured samples each. Both intent bodies were 13,928 bytes. This is a short converter workload, not a causal speedup/FPS/whole-session guarantee. No map renderer, extra requests or saved mission writes were introduced.
- The user must still confirm precise corrected placement in their actual game session. No native recompilation or repeat synthetic HTTPS test was needed because native code did not change.

## Français

La conversion retire désormais 50 m de chaque axe X/Z cartographique pour obtenir les coordonnées natives. Les positions du plan ne changent pas. Redémarrez Companion (Placement Fix), créez une nouvelle connexion mixte autorisant GM, recouplez le jeu, rechargez l’index, vérifiez puis envoyez une nouvelle requête. L’addon Workshop reste en 0.4.0. Les anciennes requêtes gardent leurs anciennes coordonnées.

## Deutsch

Die Umrechnung zieht nun 50 m von jedem Karten-X/Z ab, um native Weltkoordinaten zu erhalten. Planpositionen bleiben unverändert. Companion (Placement Fix) neu starten, neue gemischte GM-Verbindung erstellen, Spiel neu koppeln, Index laden, erneut prüfen und neue Anfrage senden. Workshop-Addon bleibt 0.4.0. Alte Anfragen behalten ihre alten Koordinaten.
