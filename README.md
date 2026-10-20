![COMMAND](planner/COMMAND-Logo.jpg)

# COMMAND — Mission Planning & Control

An independent mission planner for **Arma Reforger**. **COMMAND v1.0.0 is stable for mission planning; all live-game controls remain experimental.**

## Download

[Download COMMAND v1.0.0](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/releases/tag/v1.0.0) · [Release notes](docs/release-v1.0.0/RELEASE-NOTES.md) · [Quick start](planner/operator-guides/00-START-HERE.md)

Extract the complete **COMMAND-1.0.0-Windows.zip** and run `COMMAND-Windows/COMMAND Planner.exe`. It includes the app, optional bridge/relay source, vanilla asset indexes, guides, test mission, licences, corresponding source and checksums. Back up plans and extract to a fresh folder. Earlier 2.x development builds remain in [release history](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/releases).

## Plan and manage a mission

- Find assets and planned/live units in one searchable workspace, with clear state labels and contextual controls.
- Place tactical units, draw routes and areas, prepare briefings, save/load and import/export planning data offline.
- Import one mission package with plan, asset references and deployment setup; review before applying. Importing never spawns anything.
- Start a New mission without disconnecting. Undo/Redo restore the planning workspace; game deletion remains explicit.
- Use catalog/resource indexes, Settings, recovery and Sarge guidance in English, French and German.

## Optional experimental connection

Compatible **COMMAND bridge 0.13.0**, Workshop project **6A969EB0C5012BB9**. Quick connection runs an owned local relay/tunnel; dedicated mode connects to an administrator-managed HTTPS relay. Host/server approval, target ownership and duplicate protection stay in force.

Experimental features include scoped tracking, reviewed spawn/removal and AI orders, host-controlled category auto-approval, occupied deployments, server snapshots, transport/treatment/vehicles and a bounded force-assisted vanilla Huey demonstration. Two-client multiplayer and human pilot takeover acceptance are incomplete. General existing-vehicle registration remains unfinished; historical boarding timeout is unexplained. [Compatibility](docs/release-v1.0.0/COMPATIBILITY.md) · [Remaining live checks](docs/release-v1.0.0/LIVE-CHECKLIST.md)

Huey flight currently needs a clear, flat 20–100 m route, one AI pilot and four passengers. No obstacle avoidance or guaranteed tree/building clearance. Slow takeoff and backward travel can occur. The optional read-only 3D preview needs authorized user-supplied terrain/imagery; no protected game models or satellite/elevation data are bundled.

## Development and roadmap

Original planner source is in `planner/`; use Node.js, `npm install`, then `npm start`. `npm test` runs the project tests. The corresponding release source includes the original tools and tests; keep bundled dependency notices. For Quick connection, use the matching release’s `cloudflared.exe` with its included Apache-2.0 notice.

[Full roadmap](ROADMAP.md) · [Release scope](docs/release-v1.0.0/RELEASE-SCOPE.md) · [Upgrade and recovery](docs/release-v1.0.0/UPGRADE-AND-RECOVERY.md) · [Licensing](docs/LICENSING.md)

Workbench import/apply, continuous two-way editing, WebSockets, relay restart persistence, multi-admin authority and expanded flight adapters remain planned/disabled. A plan route is not automatically an executable game order.

## Licence and independence

Original COMMAND code: **GPL-3.0-only**. Dependencies, separately licensed Workshop material and game assets retain their own terms. See [LICENSE](LICENSE) and [third-party notices](planner/THIRD-PARTY-NOTICES.md). An installed mod or prefab GUID does not grant redistribution rights.

COMMAND is an unofficial community-made companion. It is not affiliated with, endorsed or sponsored by Bohemia Interactive. Arma Reforger, Enfusion and Bohemia Interactive trademarks belong to their respective owners. COMMAND artwork is retained unchanged.
