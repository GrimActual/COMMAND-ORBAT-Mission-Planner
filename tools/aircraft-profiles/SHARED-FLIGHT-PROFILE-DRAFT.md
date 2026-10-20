# Shared flight profile argument — coordination draft

This is a proposed boundary for the existing `COMMAND_HelicopterFlightDispatcher.StartReviewed` and `COMMAND_HelicopterFlightLease.StartApproved`. It is not an implemented overload, registered capability, new force writer or authorization to remove the existing UH-1H guard. The controller owner retains those files. Profile discovery and inspection remain independently usable and read-only.

## Proposed call boundary

The host resolves a profile ID from a trusted, locally validated registry, makes an immutable snapshot, then supplies that one `COMMAND_ValidatedAircraftProfile` argument alongside the existing owned aircraft, seated pilot, exact passenger array and approved LZ. Neither HTTP requests nor plan JSON supply gains, tested limits, mass overrides, resource paths or arbitrary profile data. A profile ID selects a candidate; it does not authorize execution.

`StartReviewed(proposedLease, requestId, aircraft, pilot, passengers, lz, validatedProfile)` delegates to `StartApproved` with the same immutable snapshot. The dispatcher remains the sole lease owner and its existing Vehicle callback remains the sole force writer. The current approved/owned identity, expiry/session, human-protection, cancellation and duplicate-request checks remain mandatory and outside the profile.

## Required snapshot sections

| Section | Fields and evidence |
|---|---|
| Identity | Original profile ID/revision; exact addon ID, prefab GUID and path; exact M/D/F variant match; engine/controller/component identities. |
| Tested environment | Observed game/build identity, addon and dependency versions, relevant resource fingerprints, exact shared-controller source/version hash, and acceptance-evidence ID. Missing versions or changed identities require revalidation. Metadata hashes alone do not certify unchanged packed asset contents. |
| Physical prerequisites | Valid simulation, authoritative dynamic Physics body, current mass and COM from supported native reads, documented units/semantics, engine operating state, and individually established ground/clearance behavior. Current mass is a fresh observation, never substituted by reference empty mass/MTOW. |
| Crew and payload | Actual required role predicates and tested crew/passenger/load conditions, with runtime compartment resolution delegated to occupied spawning. No universal manager/seat/door indices. Gunner slots do not imply cargo. |
| Controller calibration | Measured vertical response/hover requirement; per-axis attitude/angular damping and actuator caps; lateral/braking/descent parameters; rotor configuration/control interpretation only when verified. No Huey defaults for another model. |
| Tested envelope | Explicit maximum route/speed/acceleration, altitude reference and limits, terrain/obstacle restrictions, wind/load conditions, touchdown contact/motion/duration criteria, cancellation endpoint constraints and unload acceptance. Each field has units and a test basis. |
| Accepted capabilities | Separate evidence-bound inspect, crew seating, passenger seating, controlled lift, hover, point flight, landing, unload and cancellation results. A profile enables only capabilities that its exact implementation and relevant shared path actually passed. Multiplayer acceptance is a distinct flag. |

The existing original metadata profiles have `calibration: null`, `validatedEnvironment: null` and `executable: false`; none can construct this validated argument. The controller owner's existing proven Huey behavior must remain unchanged until it explicitly adopts a compatible validated snapshot. No profile should inherit capability from a similar name, mass, controller base class or another addon implementation.

## Current Mi-8 evidence

The exact vanilla Mi-8MT transport prefab `{DF5CCB7C0FF049F4}Prefabs/Vehicles/Helicopters/Mi8MT/Mi8MT_unarmed_transport.et` was inspected on EmptyEden under game 1.8.0.13 with no occupants and no control writes. Simulation and Physics body were available. `Physics.GetMass()` returned 9046; the current diagnostic labels the engine mass in kg, with fuel/occupant inclusion explicitly unknown. The user-supplied 7260 kg reference estimate remains in the separate reference section. Native rotors read `[0,0]` RPM, engine off, ground contact false, linear/angular velocity zero at this sample; two pilot-role and fifteen cargo compartments were empty. Synchronous pose was unchanged.

The first sample did not establish dynamic state, COM or resting clearance. The follow-up read-only series now confirms a dynamic Physics body and local COM approximately `(0.0081524, 2.3479173, -0.7903221)` metres. Across 13 samples over 3.596 seconds, the body stayed inactive, reported no ground contact and remained one metre above terrain. The reported resting clearance is therefore null; that one-metre origin offset is not a clearance measurement. All synchronous captures preserved pose.

Body activation/actuator authority, stable resting clearance, inertia, pilot seating, engine startup, force response, hover, landing and unload remain unverified. These observations cannot supply the validated argument above. The next prerequisite is an active/occupied fixture provided through the authoritative spawning path; the spawning owner explicitly deferred that expansion before consolidation. Calibration must then use the single shared controller after its owner implements the explicit profile parameter. Preserve failures and keep each aircraft disabled until its own gates pass.
