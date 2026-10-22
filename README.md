# COMMAND — Mission Planning & Control

COMMAND is an independent community mission planner for Arma Reforger. Plan offline, organize assets and units in one workspace, import complete mission packages, and send reviewed deployments and supported orders through the optional **Command Orbat & Eden** bridge.

## Current downloads

- **Preview:** [COMMAND 1.1.3 and Command Orbat & Eden 0.15.7](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/releases/tag/v1.1.3). This update is a prerelease; native compilation and live acceptance remain pending.
- **Stable offline planner:** [COMMAND 1.1.0](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/releases/tag/v1.1.0). Use that release's matching bridge. All live-game controls remain experimental.

## Highlights

- Whole-plan mission import, reviewed deployment, and reusable test missions.
- Unified asset, planned-unit and live-unit workspace with search, selection and contextual controls.
- Offline mission planning, briefings, save/load, import/export, Undo/Redo and recovery.
- Optional paired relay with host-controlled Manual, Full and Custom approval modes.
- Supported AI orders and routes, occupied vehicle deployment, transport, treatment and server snapshots.
- Experimental profiles for 22 exact helicopter variants with route, speed and patrol controls. Exact aircraft addons and dependencies must be installed separately.

## Flight and GM workflow update

COMMAND 1.1.3 requires bridge 0.15.7 and the matching relay. The bridge's display name is **Command Orbat & Eden**; its project identity is unchanged.

- Every supported aircraft offers **Flight only — retain passengers**. A seated, living, conscious AI pilot is required; a four-person cargo squad is not.
- Optional unloading includes only designated cargo actually aboard. Already-unloaded squad members do not prevent a subsequent flight.
- Removed the terrain-flatness and tiny stationary-start vetoes, the helicopter waypoint-count restriction, and the 100-request reconnect cutoff.
- GM requests can queue instead of being rejected by a blanket busy check. The current bridge still executes one request at a time; a looping patrol occupies that slot until stopped.
- Requested flight speeds include 4, 8, 12, 57 and 66 m/s. Higher speeds are configuration, not verified airspeed claims.
- No artificial flight-distance or waypoint-spacing limit. Supported world coordinates, transport message sizes, host authority, duplicate protection, collision checks and measured landing conditions remain.

The review-menu layout change removes invalid serialized slot declarations identified in a user crash log. It still requires native compile/render acceptance. Historical 22-profile short flights do not validate this update, higher speeds, human takeover or multiplayer.

## Install and upgrade

Download **COMMAND-1.1.3-Windows.zip**, extract the entire archive, and start `COMMAND-Windows/COMMAND Planner.exe`. Do not run inside the ZIP or separate the executable from its folder. The complete download includes the bridge project, standalone relay, vanilla indexes, guides, licences, source and test missions.

Keep existing plans and settings. Install one bridge copy. Dedicated server operators must update their relay too; finish or explicitly end in-memory sessions before replacing it. Source-only changes do not migrate running sessions. Workshop publication is separate from GitHub distribution.

Do not treat accepted commands as proof of physical completion. Automatic combat/weapon operation, general registration of existing aircraft, concurrent helicopter controllers, relay restart persistence and broad multiplayer acceptance remain unfinished. The historical walking-to-vehicle boarding timeout remains unexplained.

The optional 3D terrain-section preview requires authorized, world-matched elevation and imagery. Game models, satellite imagery and elevation datasets are not redistributed.

See the included licences and operator guides. Game assets and third-party content retain their own terms. COMMAND is not affiliated with or endorsed by Bohemia Interactive.
