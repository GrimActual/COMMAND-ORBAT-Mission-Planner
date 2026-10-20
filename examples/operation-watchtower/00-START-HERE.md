# COMMAND - Operation Watchtower

A complete planning/test mission for stable planner **1.0.0** and experimental bridge **0.13.0**. Separate from the frozen release; no application/mod files are changed. Vanilla base-game prefab references only. No game assets, map images, heightmaps, real server credentials or private samples are included.

## Import and deploy

1. In your current plan click **Save Backup**. Keep the backup. Do not import an asset index or scenario rules as a mission.
2. **Assets -> Import catalog JSON**: choose **02-MISSION-ASSET-CATALOG.json**. This replaces the session catalog, not already assigned unit snapshots.
3. **Plan files -> Import plan**: choose **01-MISSION-PLAN.json**. This replaces the planner mission; Undo and your backup provide recovery. Click **Fit ORBAT** to see the assembly area. The briefing is under **Brief**.
4. **Game controls -> Deploy -> Load deployment resource index**: choose **03-MISSION-RESOURCE-INDEX.json**.
5. Confirm your connection is live and allows reviewed GM requests. Focus the map and use **Ctrl+A** with the default bindings, or box-select the 12 friendly unit markers. Routes and areas are annotations, not extra soldiers. Review must show exactly **12 prefab roots**, including three vehicle/aircraft roots and all assigned troops/crews. The number of actual soldiers is determined by the loaded group prefabs.
6. Set deployment heading **0**. **Review selected units**, inspect names, prefabs and coordinates, then **Send reviewed spawn request to game**. In Reforger open **COMMAND host pairing -> Review GM requests -> Check pending**, inspect every placement and **Approve** once. Actual controls may be translated. Do not repeatedly send while waiting: a new request can create a second batch.
7. Resume and inspect actual troop/vehicle placement. If buildings, existing units or slopes obstruct a point, adjust its planned marker before sending, re-review, and keep vehicle/rotor clearance. This pack cannot inspect your live world.
8. **Check game request results**, then refresh order/transport targets. Follow **06-ORDERS-AND-RADIO.md**: boarding and every live order remain separate reviewed requests. One spawn approval does not pre-seat troops, start vehicle movement or install the drawn routes.

## Files

- 01: main friendly plan, 12 deployment roots, names, embedded references, routes, zones and full briefing.
- 02/03: matching small catalog and resource index; no other catalog is needed.
- 04: optional two-fireteam opposition only. Import/send only when the friendly force is ready. Reimport 01 afterward for the friendly planning view and refresh live targets; **do not resend the friendly spawn**. Opposition can engage immediately.
- 05: optional **offline rehearsal only**. After importing 01, open **Offline rehearsal -> Load scenario JSON**, choose 05, then Resume and Advance in 10-second steps. Its timed movements/objectives/reports are synthetic and never run the real game. Fire optional events to rehearse the blocked-route/contact/casualty/extraction decisions.
- 06: immersive phase orders and exact live command steps.
- 07: honest pass/fail record.
- 08/09: readable roster/reference data, not planner import files or executable live orders.
- VALIDATION.json: preparation/UI checks and remaining live gates.

## Important boundaries

Helicopter flight is **GM/player operated**. COMMAND currently exposes wheeled driving, not aircraft flight waypoints. All crews start beside their vehicles; inspect native seats and board separately. No specific helicopter co-pilot seat, capacity, flight, or boarding completion is guaranteed by metadata. Never use a wheeled or infantry order to fly EAGLE. If boarding is rejected/times out, record the result and use normal GM seating only as a separately labelled fallback; do not record that as a successful COMMAND boarding test. Board AI passengers before a human enters; player-occupied vehicles are protected.

The relay search and casualty events are role-play prompts. No physical intel item, building, wound, medical inventory or live mission trigger is supplied. Scripted dynamics in file 05 are **offline rehearsal**, while the live mission's decisions are GM-directed using the order cards. A true pre-crewed, automatically scripted Reforger scenario import is not implemented by this pack.

Current snapshots support on-foot groups/empty eligible vehicles; dismount first and review exact supported targets. Do not claim full-world/occupied-aircraft saving. Historical boarding timeout and multiplayer/combat acceptance remain unresolved.

Keep this pack and source release licences together. Original scenario prose and generated plan are GPL-3.0-only, consistent with the source release; game/prefab material retains its own rights. Exact GUID metadata does not redistribute the referenced assets or prove their availability on a particular server.

Recommended bridge: **0.12.1**, containing the native approval-control repair. The original plan contract remains compatible with 0.12.0, but use the patched bridge for acceptance.
