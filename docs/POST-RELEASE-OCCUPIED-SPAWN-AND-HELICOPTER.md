# Post-release: occupied spawning, then helicopter insertion

Status: planned only, added 20 October 2026 at the user's request. Neither addition belongs in the current consolidated stable scope. Finish the 0.12.1 approval-control repair and acceptance first. Watchtower uses current commands and GM-directed air operations.

## First: Spawn occupied vehicle

A reviewed card selects exact vehicle prefab, crew/passenger identities, seat assignments or explicit automatic assignment, world position and heading. A single validated request may create the vehicle and characters, resolve authoritative available compartments, request direct seating and verify final occupant identity in each required slot before reporting success. Actors are real engine entities. Do not promise pre-physics or single-frame atomic creation.

Official API checked 20 October: SCR_CompartmentAccessComponent.MoveInVehicle accepts an optional BaseCompartmentSlot; its boolean reports request success. The same API exposes compartment/vehicle inspection. A successful request is not verified final occupancy. Documentation: https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceSCR__CompartmentAccessComponent.html . Installed-build binding, authority, initialization and replication behavior must still be compiled/proved before enabling the feature; no production occupied-spawn capability is advertised.

Resolve compartments on the actual native vehicle, not universal helicopter seat numbers. Keep crew and passengers separate. Validate total actor/root/byte limits, same-faction eligibility, ownership, duplicate requests, disconnected owners, initialization deadlines and cancellation. Reject conflicting/locked/reserved/occupied required seats. Verify identities and vehicle/slot ownership after seating and across clients. Required-seat failure cleans up only entities created by that request, including owned helpers; unrelated mission entities and players are preserved. Retries must not duplicate a successful/partially completed batch. Record request/install/verified execution separately. Host/admin approval and negotiated capability remain mandatory.

Acceptance: exact and automatic assignments, insufficient/blocked seats, rapid cancel/retry, partial creation rollback, two-client replication, owner changes, restart/new pairing, no unrelated deletion, no walking/boarding animation in the demonstrated supported cases. This does not fix or explain the historical walking-to-vehicle boarding timeout.

## Then: bounded helicopter insertion adapter

Planner intent: aircraft, passenger squad, route, explicit altitude reference, LZ, unload, hold/return. Rendering a route does not execute flight. First identify a usable installed native flight behavior or an explicitly supported addon/controller. SCR_AIFlyToWaypoint, SCR_AILandWaypoint and SetUnloadPassengers are unverified candidate names, not approved bindings. A helicopter controller alone does not establish an autonomous pilot.

Require isolated proof of takeoff, navigation, controlled approach, landing, positively observed touchdown, passenger-only unload with crew retained, cancellation and defined timeout/blocked-LZ response. Altitude below two metres plus low speed does not prove touchdown. Landed stability, obstruction/contact state and aircraft condition must be verified against the selected adapter. Use clear altitude units/reference and restrict the initial envelope. Gate UI execution on the connected bridge's specifically verified adapter capability; unsupported versions retain planning-only intentions. Do not silently install external addons or copy other mod implementations.

After proof, integrate the existing request queue, native authorization, ownership, outcomes, Sarge/Settings and EN/FR/DE guidance, then package a separately versioned feature release. No stable autonomous-flight claim, automatic mass deployment or broader test-loop expansion is authorized by this roadmap entry.
