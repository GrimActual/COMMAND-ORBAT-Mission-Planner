# COMMAND ORBAT Bridge 0.6.0 — optional Workshop update

The desktop migration review works offline and does not require a Workshop update.

For the native tactical controls included in this release, publish the supplied clean 0.6.0 Workbench project to existing addon GUID 6A969EB0C5012BB9. Preserve the COMMAND name and logo. GitHub publication does not publish the Workshop addon.

Adds host-reviewed timed Defend (5–300 seconds) and cancellation of Companion-owned movement for bridge-created, on-foot infantry AI groups. Existing Move/timed Hold, tracking and reviewed spawn/remove are retained. Separately negotiated capabilities gate the controls; older compatible relays fall back to supported controls.

Defend uses the native SCR_DefendWaypoint and engine-selected ActivityDefend.bt. Cancellation removes Companion-owned waypoint activity while retaining combat reactions; it is not strict Hold Fire. Human-controlled members, mounted troops, incompatible groups and foreign waypoints remain rejected.

Unchanged production scripts retain their passed PC/Workbench compilation and bounded isolated native-server evidence. Normal-scenario navigation, combat outcomes and extended stability remain separate tests. No chained routes, vehicle orders, arbitrary SQF execution or whole-mission conversion are added to the addon.
