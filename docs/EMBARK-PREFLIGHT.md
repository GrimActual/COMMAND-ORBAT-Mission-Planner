# Embark preflight — development groundwork

This is original COMMAND code for roadmap step 72. It does not expose an embark command, install a waypoint, reserve a seat, eject an occupant, or certify successful boarding. Step 72 remains partial.

`COMMAND_ORBAT_EmbarkPreflight.Check` reads current native compartments through COMMAND vehicle inspection. It rejects missing/unsupported vehicles, squad sizes outside 1–16, no allowed seat roles, player/unknown occupants, and insufficient seats among the explicitly allowed driver/gunner/cargo roles. Occupied, reserved, locked and inaccessible seats do not contribute to available role counts. Existing AI occupants remain untouched. The check returns a reason code, not a game action.

The future host execution adapter must independently resolve exact owned vehicle/squad identities, same-faction authority, actual on-foot AI members, human control, foreign waypoints, lifecycle expiry and the fresh reviewed request. It must recheck eligibility immediately before installation, use a fixed verified boarding resource, enforce bounded cleanup and observe actual boarding. A check result grants no authority and cannot eliminate races after it returns. Mixed human/AI transport is still deferred.

## Independent API verification

Public Bohemia references, checked against the installed Workbench API:

- https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceSCR__BoardingEntityWaypoint.html — entity binding via SetEntity.
- https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceSCR__BoardingWaypoint.html — separate driver/gunner/cargo SetAllowance flags.
- https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceBaseCompartmentSlot.html — compartment accessibility and occupancy.
- https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceExtBaseCompartmentSlot.html — occupant, reservation and get-in locks. A lock can represent an in-progress entry; it is not an occupant.

The new checker uses read-only compartment inspection. Waypoint APIs are verified candidates for subsequent work, not implemented actions. No third-party implementation was inspected or used.

## Scope

The relay now rejects vehicle inspection against recruited squads before game execution; it preserves approval, capability and pairing ownership checks. Five focused tests pass, including this rejection and matching distributed queue copies. No new UI, preferences, mission fields or auto-execution path was added. Existing EN/FR/DE vehicle guidance remains applicable. No desktop packaging or public release is performed for this groundwork.

## Native verification

The original checker compiled and passed eight checks on an isolated diagnostic server: all-seat capacity, cargo-only insufficiency, absent gunner seats, no roles, oversized squad, missing vehicle, restricted cargo and remaining driver availability. The fixture also retained empty/occupied/restricted snapshot and nonvehicle assertions. AI boarding initialization is awaited by exact occupant identity before the occupied inspection. A preceding run correctly failed during a temporary get-in lock; it is not counted as a pass. Evidence: test-evidence/embark-preflight-native.json.

No real human occupant, combat, live client, embark waypoint or transport behavior was tested. Protected player/unknown occupant rejection is implemented but lacks a real-player native acceptance test. Diagnostic process stopped; no game client or public tunnel was started. Existing performance results are unchanged because this checker has no active production caller, renderer or periodic traffic.

## Subsequent transport implementation

The preflight-only status above records the earlier checkpoint. Reviewed native embark and dismount, bounded cleanup, actual member outcomes and partial recovery have since passed the local transport gate. See SQUAD-TRANSPORT-PILOT.md for the current workflow and evidence. No connected-human acceptance or stable-release claim is added.
