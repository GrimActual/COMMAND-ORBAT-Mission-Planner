# COMMAND squad command expansion — requirements and native bindings

Requested 14 October 2026. This extends Package 14 without replacing the existing offline planner, tracking, deployment or host-approval work.

## Reference policy

Advanced AI Command, Workshop `69A404653EE3F3C4`, and the supplied screenshot are **workflow and UI references only**. No scripts, textures, behaviour trees, package files or runtime dependency are imported from that mod. COMMAND retains its own source, namespaces and product branding. Its feature description is not evidence that our implementation works. The supplied videos could not be fetched; no claim of reviewing their contents is made.

## Command path and acceptance

The desktop sends bounded typed intentions, never a caller-supplied `.bt` path, script or engine class. The relay checks pairing, capability, ownership, expiry and approval. The native host resolves live identities and components, applies the relevant adapter, and checks the resulting native state. The game engine owns behaviour selection and execution.

For current Move and timed Hold:

`Companion UI → version-2 intention → GM-enabled relay queue → in-game host approval → bridge-created group resolution → native SCR_AIWaypoint → SCR_AIGroupUtilityComponent → SCR_AIWaypointState → native activity/behaviour tree`

- Move: `{750A8D1695BD6998}Prefabs/AI/Waypoints/AIWaypoint_Move.et`.
- Timed Hold: `{531EC45063C1F57B}Prefabs/AI/Waypoints/AIWaypoint_Wait.et`, with `SCR_TimedWaypoint.SetHoldingTime`.
- New source guards require the native group utility component and a scripted native waypoint; an unknown action cannot default to Move. Missing or incompatible bindings reject without replacing the previous order.
- The diagnostic native fixture observed `SCR_AIMoveActivity` with `AI/BehaviorTrees/Chimera/Group/ActivityMove.bt`, and `SCR_AIIdleActivity` with `AI/BehaviorTrees/Chimera/Group/ActivityIdle.bt`. These are observed group-activity resources, **not an exhaustive mapping of waypoint and individual-soldier trees**. A result callback can run before the engine selects the new activity, so the immediate callback must not be attributed to the just-accepted command.
- The group-activity and waypoint selection paths will be correlated to the requested waypoint before future commands are marked behaviour-verified. Physical navigation, combat, vehicle occupancy and building interiors require scenario tests with the appropriate terrain/navmesh and actors.
- An accepted request, an attached waypoint, a selected activity, and successful completion are separate states. Acknowledge the strongest state actually observed. Do not label a timed wait as strict Halt, Defend or Hold Fire.

## Delivery stages

### 14.2 — selection and movement

Friendly AI squads are selectable on the Companion map through a live identity mapping. Planned markers alone do not grant authority. The host explicitly permits the relevant faction; recruiting an existing squad requires a host-reviewed lease, with player control, destruction, respawn, faction change and revocation checks. Begin with bridge-created groups, then expand recruitment.

Commands: Move/Go To, chained waypoints, Force Move, Attack, Defend, Halt/Cancel Orders, Follow Me/Squad on Me. Companion uses map coordinates; the in-game ground-look workflow needs its own game input/raycast adapter. Follow resolves an explicitly chosen authorised player and their current character, with bounded refresh, formation and respawn handling. Do not infer which player “me” means across machines.

Native candidate bindings to verify:

- Move and route chain: group waypoints, native utility/state processing, bounded ordered queue and atomic replacement. A route is 1–16 points initially; no partial installation or removal of foreign waypoints.
- Defend: exact vanilla `{93291E72AC23930F}Prefabs/AI/Waypoints/AIWaypoint_Defend.et`, defend waypoint state and `SCR_AIDefendActivity`/member behaviour. Radius, sectors, duration and position must be explicit and validated. Index identity and the native defend state/activity have been verified in the development candidate; it has not been released.
- Attack: exact vanilla `{1B0E3436C30FA211}Prefabs/AI/Waypoints/AIWaypoint_Attack.et`, with the corresponding native activity and target acquisition. It must not become a renamed Move.
- Force Move: a separate behaviour/priority policy, with combat interruption tests. Teleportation or disabling all AI is not an implementation.
- Halt: cancel only owned movement/route/follow activity, preserve other settings and foreign orders, then verify stopped movement. It is not a fire-control or invulnerability switch.

### 14.3 — formations, stances and combat

Formations: Column, Staggered Column, Wedge, Line, Diamond, Circle and Auto. Resolve available definitions from the installed faction/group configuration. `AIFormationComponent.SetFormation` is a candidate entry point; a string name alone does not prove that a definition exists. Verify reported formation, follower spacing and movement. Auto needs a bounded terrain/obstacle policy and hysteresis, rather than switching every tick.

Stances: Stand, Crouch, Prone and Auto. Use the native character/group settings consumed by soldier AI. Auto removes only the COMMAND override and returns control to the AI. A temporary character-controller animation call must not be claimed as a persistent AI stance policy. Check existing settings, new members, unsupported prefabs and cleanup.

Fire at Will/Open Fire and **strict Hold Fire, including while under attack**, require `SCR_AIGroupUtilityComponent` combat settings and verification of the **actual** mode/weapon behaviour. The official API distinguishes externally requested and evaluated actual combat modes; investigate conditional return-fire policies separately. Restore previous policy on detach/revoke. Do not use a zero fire-rate coefficient as a substitute.

Suppressive Fire: explicit target area, bounded duration and ammunition expenditure; use the native suppression activity/member behaviour, validate geometry and stop conditions. Look At: explicit point and duration through the native look action/utility, without silently creating an attack order. These have independent capabilities and tests.

### 14.4 — vehicles, support and relationships

Get In/Get Out uses native compartment/seat reservations and vehicle-use activities. Select a live authorised vehicle; specify driver/gunner/passenger policy and report insufficient seats, occupancy changes, destruction and failed boarding. Dismount verifies members actually leave. Troops filling a vehicle do not automatically grant driving authority.

Heal uses native medic/smart-healing behaviour, with target identity, injuries, supplies and interruption checks. It must not silently restore health numerically. Report unavailable support separately from a successfully completed treatment.

Attach/Detach supports authorised foot-follow groups and vehicle convoys. Reject self-links, cycles and stale identities. Bound graph size and update frequency; preserve earlier orders/settings and release only COMMAND-owned leases on detach or lost targets.

### 14.5 — building entry

Stack at a selected door, breach, Garrison and Clear require native door/smart-action, building slot/interior navigation and coordinated squad behaviours. Reserve door/room slots, handle blocked or locked doors, occupants, insufficient space and missing interior navigation. Garrison moves members inside and holds; Clear tracks reachable room/sector progress. Neither is a marker on a building or a renamed attack waypoint. Aggressive contact handling needs explicit policy and combat tests, not a claim of universal successful clearing.

## UI and settings

Use the reference hierarchy, adapted to COMMAND's existing map and compact workspace: Movement, Formations, Stances, Combat, Support, Entry and Attach/Detach. Show selected squad, authority/faction, current native order and latest execution state. Context actions must be accessible by keyboard and the normal panel as well as map interaction. Target picking must not drag planned units or change mission Undo history. Chaining is explicit and previewed.

Only advertise a command once its native capability is reported and its required target binding is resolved. Unimplemented controls remain hidden or explicitly unavailable; no clickable fake success paths. Keep map context, forms and selections when changing EN/FR/DE. Sarge and Settings will describe delivered controls and their real semantics at each stage. Current published 2.9.1-dev.gm.5 / Workshop candidate 0.5.0 remain the Move/timed-Hold pilot; this document is not a new release.

## Verification and performance

For each command: strict contract rejection; same-pair/faction authority; native component/resource resolution; actual waypoint/activity/behaviour observation; stale identity/player control; cancel/replacement/expiry; reconnect; ownership-safe cleanup; saved mission isolation. Behaviour-specific tests include arrival, following, return fire while under attack, stances retained across combat, seat occupancy, treatment and interior navigation.

Query opted-in targets, not every world entity. Keep the shared 60 tracked-entity cap, send telemetry at 1–2 seconds, bound follow/convoy work and render batches in one animation frame. Measure the same fixture before/after, including server work, response bytes, map stalls and cleanup. Do not rerun passing unrelated gates or manufacture 60/120-player certification from a small synthetic fixture.

Primary references:

- [Bohemia group utility API](https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceSCR__AIGroupUtilityComponent.html)
- [Bohemia waypoint API](https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceSCR__AIWaypoint.html)
- [Bohemia group settings API](https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceSCR__AIGroupSettingsComponent.html)
- [UI/workflow reference only](https://reforger.armaplatform.com/workshop/69A404653EE3F3C4-AdvancedAICommand)

## Tactical development candidate — 2.9.1-dev.gm.6 / native 0.6.0 candidate

The development source now wires **Defend position** and **Cancel owned movement** through the reviewed desktop form, strict version-2 contracts, relay target ownership and mandatory in-game host approval. `ai-tactical-v1` is negotiated separately from `ai-orders-v1`. Older mods leave the new choices disabled; new native code falls back to the original capability against the immutable published dev.gm.5 relay, preserving Move and timed Hold. The native cancelled waypoint is removed before the associated ownership entry is cleared. Combat reactions are still enabled.

Defend uses `SCR_DefendWaypoint` and its existing native presets, with a validated 5–300-second duration. It does not repurpose Move's completion radius as a defence-sector setting. A real isolated-server request selected **SCR_AIDefendWaypointState → SCR_AIDefendActivity → AI/BehaviorTrees/Chimera/Group/ActivityDefend.bt**. Cancellation removed the owned waypoint and native activity returned to Idle; subsequent original Move and owned-group removal passed. These are initial state/behaviour selection and lifecycle tests, not arrival or successful defence under fire.

The desktop gate passed tactical capability negotiation, reviewed Defend coordinates/duration, cancellation without invented destination/duration, stale mission rejection, old-mod fallback, unsafe-name display and EN/FR/DE context retention. UI command replies were mocked; real native relay/approval execution was tested separately. No mission writes or automatic connection/commands were added. Sarge remains 50 topics.

A longer trace of the no-terrain/no-navmesh fixture reached an engine pathfinding NodeError via Group.bt / MoveToLocation.bt / SCR_AIProcessFailedMovementResult. That failure is retained in the evidence. The shorter passing diagnostic gate measures initial command binding only and does not hide this navigation limitation. A normal terrain/navmesh Host Local travel/combat gate remains required.

The published dev.gm.5 app and Workshop 0.5.0 folder remain intact. No new release is published by this development-source update. Chained waypoints, map selection/recruitment of existing friendly squads, Follow, formations, stances, fire control, vehicles/support, convoy relationships and building entry remain the subsequent stages above.


### Existing-squad control checkpoint — 16 October 2026

Followon.5 / bridge 0.9.0 candidate adds explicit live-marker selection, reviewed recruitment and release, and native bounded Follow. Synthetic native lifecycle and desktop checks passed. Real-player Follow and normal-terrain travel remain acceptance work. Formation, stance, combat, transport and building-entry scope is retained. See docs/SQUAD-CONTROL-PILOT.md.


### Native squad-settings checkpoint — 16 October 2026

Followon.6 / bridge 0.10.0 candidate adds four verified formation definitions with restoration, persistent native stance settings and distinct native fire policies. Synthetic readback, membership propagation, foreign editor-setting protection and desktop review gates passed. Diamond/Circle, adaptive Auto, physical formation/combat acceptance and other command families remain open. See docs/SQUAD-SETTINGS-PILOT.md. Existing roadmap goals are retained.
