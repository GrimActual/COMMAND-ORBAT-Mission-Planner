# COMMAND aircraft profiles and read-only diagnostics

Original development tools, separate from desktop startup, relay requests, occupied spawning and the frozen 2.10.0 release candidate. These profiles provide no aircraft assets and enable no autonomous flight. No installed addon is downloaded, unpacked, changed or redistributed.

## Current profiles

`profiles.cjs` declares eight requested target variants: Mi-8MT, UH-60M, MH-6, AH-6M, CH-47F, AH-64D, AH-1Z and AW159. MH-6 and AH-6M remain distinct despite sharing the user-supplied WCS addon ID. The four other supplied Workshop IDs are discovery hints, not prefab identities. AW159 has no guessed addon ID.

Seven exact vanilla Mi-8MT candidate profiles cover transport, armed, three gunship loadouts and two civilian variants. Four exact Sikorsky H60 Project candidates cover armed, medical, quad-Hydra and supply. The H60 candidates explicitly retain `targetMatch: unverified-variant`: their resource names do not certify UH-60M. No capability or measured envelope transfers between candidates. Wrecks, parts, lights, weapons, technical bases and editable wrappers do not become aircraft profiles through directory/display-name matching.

The selected H60 supply candidate was cold-inspected natively: valid active/dynamic Physics, two pilot-role plus two gunner compartments and zero cargo compartments. Its name does not establish passenger transport. Other H60 candidates remain separately uninspected; the exact M variant and flight calibration remain unverified. Mi-8 transport inspection confirms a dynamic body and local COM, but its unoccupied body stayed inactive with no ground contact across the bounded sample series, so resting clearance remains unavailable. Neither observation enables flight.

Each original profile has exact addon/GUID/path identity, dependency IDs, required component types and evidence provenance. Rotor implementation, control bindings and authoritative role hints remain unverified. `calibration` and `validatedEnvironment` are null. User-supplied real-world mass estimates are kept only in `targets[].realWorldReference`, in kg with their unverified provenance. They never supply engine mass, payload capacity, gains, RPM thresholds or operating limits.

## Contract and evidence boundaries

`contract.cjs` reuses the existing `planner/resource-index.js` contract. It resolves exact identities, distinguishes missing addons/resources from unknown implementations and conflicting identities, and checks transitive declared addon dependencies. Metadata fingerprints include indexed identities, versions and declared references. `discover.cjs` hashes bounded installed project/resource-database metadata and checks addon versions. `run-native.cjs` rechecks that snapshot before and after capture. These are metadata fingerprints; they do not certify all internal prefab dependencies or hash every installed asset byte. Same-version asset replacement without a metadata change still requires explicit revalidation. Native observation is bound to the selected exact identity and snapshot.

All returned results have `executable: false`. `inspect` can be reported as observed read-only; crew seating, passenger seating, lift, hover, point flight, landing and unload remain independently unverified. Discovering occupied compartments does not verify a seating operation. An empty cargo slot is not a promise that boarding, exit animations or flight with that payload will succeed.

The native inspection helper takes only a caller-selected authorized entity. It reads actual component types, prefab identity, manager/slot ID pairs, roles, occupancy/reservation, position, attitude, simulation velocity/angular velocity, engine/rotor/contact readings and physics-body mass where available. Compartment IDs are signed native integers and are local observations, never universal saved seat indices. Missing readings normalize to null with explanations. Version 2 additionally reads body dynamic/active state, local-space centre of mass, simulation timestamp and body-origin height above terrain. The optional bounded series captures 13 samples at 250-ms intervals; only sustained actual ground contact plus low motion can establish a resting-origin observation, otherwise it remains null. Neither a terrain-relative height nor a dormant dynamic body proves actuator authority. Version-1 captures remain supported. Physics-body mass does not establish whether fuel/occupants are included. Counts remain separate for crew and cargo. Capture does not load/spawn entities, start engines, write controls, seat anyone, claim ownership, issue orders, install callbacks or save a mission.

The isolated harness creates its own fixture aircraft separately from Capture. Its pre/post pose comparison is a scoped synchronous check, supplemented by the helper's absence of mutation APIs; it is not general multiplayer immutability proof. Fixture logs and failed attempts stay outside public source.

## Local workflow

Run from this directory with Node 18 or later. Paths below are placeholders; use actual local paths. Reports contain local installation paths and must stay in private development storage on A:, outside source/release archives.

```text
node --test contract.test.cjs discover.test.cjs
node discover.cjs VANILLA_INDEX.json INSTALLED_ADDON_DIRECTORY BASE_ADDON_DIRECTORY GAME_VERSION NEW_DISCOVERY.json
node cli.cjs RESOURCE_INDEX.json
node run-native.cjs query-h60 DISCOVERY.json SERVER_DIAG.exe NEW_RUN_PARENT
node import-query.cjs DISCOVERY.json QUERY_RUN_RESULT.json NEW_MERGED_DISCOVERY.json
node run-native.cjs inspect-mi8mt DISCOVERY.json SERVER_DIAG.exe NEW_RUN_PARENT
node run-native.cjs inspect-mi8mt-resting DISCOVERY.json SERVER_DIAG.exe NEW_RUN_PARENT
node run-native.cjs inspect-h60-supply MERGED_DISCOVERY.json SERVER_DIAG.exe NEW_RUN_PARENT
node cli.cjs DISCOVERY.json command-mi8mt-transport NATIVE_RUN_RESULT.json
node cli.cjs --series DISCOVERY.json command-mi8mt-transport NATIVE_SERIES_RUN_RESULT.json
```

`cli.cjs` accepts either a resource index or the complete discovery file. It accepts a raw native report or a successful harness outcome; `--series` accepts a bounded raw frame array or successful series outcome. Failed/stale outcomes are rejected, and private discovery paths are omitted from results. The harness preserves failures privately. `import-query.cjs` accepts only complete bounded H60 receipts bound to the original metadata snapshot and imports only the four explicitly declared aircraft candidates. It does not import the complete third-party inventory or infer aircraft from names.

Discovery visits at most 500 installed addon directories and only the requested addons plus transitive dependencies. Individual project/JSON/RDB metadata reads are bounded; it does not scan or extract archives. Reuse its snapshot until relevant versions/resource metadata change. The native query captures at most 512 metadata rows. Inspection captures at most 256 component names, 128 compartments and 16 rotor readings; truncation prevents an unrestricted compatibility result. No persistent entity/telemetry cache or background polling is installed.

Native execution is opt-in, server-only, time-bounded to 90 seconds and requires at least 1.5 GiB free RAM and stops its owned server if free RAM falls below 256 MiB. It uses an original isolated project with EmptyEden as the known world dependency, requested localhost server settings and owned-process shutdown. Temporary addon junctions refer to existing installations; cleanup removes the junction entries only. Serialize native runs with the controller owner. The successful EmptyEden capture logged 0.0.0.0:2001 despite the requested localhost/29992 config; binding is not enforced by this launch path. Historical `-port` and `-rplPort` arguments also did not move replication off 2001. Never stop another chat's server or launch the normal client implicitly.

## Shared controller integration

The private helicopter adapter reference and `COMMAND_HelicopterFlightLease` owned by the controller chat define the shared path. The reference currently proves a scoped UH-1H force-assisted physics experiment, not native pilot-input authority or another aircraft's flight capability. This directory adds no Vehicle hook, force writer, shared runtime consumer or request protocol. The controller owner's extracted lease now has native compilation and bounded UH-1H insertion/cancellation proof. Reviewed app binding, human takeover and multiplayer acceptance remain that owner's integration work; these results do not certify another aircraft.

Next per-model gates are initialized dynamic Physics and valid helicopter simulation in the known world; actual mass/COM/resting clearance; verified exact variant; then coordinated isolated response/hover/flight/descent calibration through that one controller. Use original reset fixtures, exact addon/resource/build identities and explicit payloads. Do not enable another airframe by deleting the lease's UH-1H guard or copying Huey gains. Real connected-client acceptance is a separate later gate.

No UI controls or persistent settings are added by this slice, so Sarge, Settings and translated operator guides are unchanged. Their synchronization is required when a reviewed user-facing consumer is delivered.
