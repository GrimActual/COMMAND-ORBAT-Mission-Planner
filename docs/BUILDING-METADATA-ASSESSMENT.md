# Building metadata assessment

Original COMMAND code reads native door metadata with bounded traversal (256 entities, 64 doors). On an official village-house fixture it found four doors across 50 entities; repeated reads were stable and vehicle/null inputs were rejected. See test-evidence/building-metadata-native.json.

Door pivot, normal, state and character-clearance hints do not establish a navigable entrance or safe interior route. NavigationVerified remains false. No building-entry, garrison or room-clearing command is enabled by this assessment.

## Français

Quatre portes ont été détectées dans le bâtiment de test. Ces métadonnées ne confirment ni un accès praticable ni un itinéraire intérieur. Aucune commande d’entrée dans un bâtiment n’est activée.

## Deutsch

Im Testgebäude wurden vier Türen erkannt. Diese Metadaten bestätigen weder einen begehbaren Eingang noch einen Innenraumweg. Ein Befehl zum Betreten von Gebäuden wird dadurch nicht aktiviert.

## Next bounded building feature (18 October 2026)

The next proposed control is a reviewed **approach a host-selected entrance**, followed by an explicit timed Hold. It is not automatic garrison or room clearing. Reuse the existing approved movement path; require a living on-foot controlled infantry target, an explicitly chosen approach position and the host's review. Door pivots remain inspection hints, not automatically trusted destinations. A locked door, unavailable interior navigation, changed membership, player control or foreign orders must prevent an automatic interior transition.

A later smart-action experiment must resolve an actual native entity and an observed compatible smart-action tag, correlate the owned waypoint, reserve only its own slot, time out cleanly and demonstrate physical movement on a navigation-enabled house fixture. No guessed action tags or generic internal blackboard variables are accepted. Do not enable a Garrison or Clear action merely because a Defend waypoint was installed.

Official documentation and the matching installed API both expose `SCR_SmartActionWaypoint.SetSmartActionEntity(IEntity, string)` and its readback method. They require a concrete entity and action tag; this does not enumerate safe interior positions. The documented `SCR_AIDefendActivity` provides defend-direction and radial-cover operations. Those interfaces alone do not establish complete building occupancy or room-clearing behavior. `SCR_AIFindSmartActions` is a behavior-tree node with search ports, not a direct high-level building-command API.

Sources independently checked against the installed Workbench documentation:
- [Bohemia smart-action waypoint API](https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceSCR__SmartActionWaypoint.html)
- [Bohemia defend activity API](https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceSCR__AIDefendActivity.html)

No new building command is delivered by this assessment. Existing door metadata acceptance remains unchanged and is not rerun.

### Français

Prochaine étape proposée : approche d’une entrée choisie par l’hôte, vérifiée puis approuvée, suivie d’un arrêt temporaire. Les portes détectées ne prouvent pas un accès praticable. Les API natives d’actions et de défense ne suffisent pas à certifier une garnison ou un nettoyage de pièces. Aucune nouvelle commande de bâtiment n’est activée.

### Deutsch

Nächster begrenzter Vorschlag: geprüfte, vom Host freigegebene Annäherung an einen manuell gewählten Eingang und anschließendes zeitlich begrenztes Halten. Türmetadaten beweisen keinen begehbaren Zugang. Native Aktions- und Verteidigungs-APIs bestätigen keine vollständige Gebäudebesetzung oder Raumräumung. Kein neuer Gebäudebefehl wird aktiviert.
