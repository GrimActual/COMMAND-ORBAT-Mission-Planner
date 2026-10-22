<!-- COMMAND PREVIEW START -->
> **New preview:** [COMMAND 1.1.3 — Flight & GM Workflow Update](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/releases/tag/v1.1.3), paired with **Command Orbat & Eden 0.15.7**. Optional passengers, helicopter restart changes and queued GM requests. This is a prerelease; native/live acceptance remains pending. The stable offline-planner release remains available separately.
<!-- COMMAND PREVIEW END -->

![COMMAND](planner/COMMAND-Logo.jpg)

# COMMAND — Mission Planning & Control

**COMMAND 1.1 — a stable offline mission planner for Arma Reforger, with optional experimental live-game controls.** Build a plan, bring its assets and deployment setup in one file, review it, and send supported actions to the game with host approval.

[Download COMMAND 1.1.0](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/releases/tag/v1.1.0) · [Start here](planner/operator-guides/00-START-HERE.md) · [Full roadmap](ROADMAP.md)

## Plan the whole operation

- **One mission file:** import/export the plan, asset references and deployment setup together. Review before applying; one Undo restores the prior workspace.
- **One Game Master workspace:** search assets, planned units, deployed targets and tracked units together. Status labels keep their underlying identities distinct; relevant actions follow the selection.
- **Offline planning:** tactical units and ORBAT, routes, areas, drawings, briefings, save/load, JSON exchange, backups and Undo/Redo.
- **Whole-mission deployment review:** see stages and factions together, distinguish groups from actual soldiers, and send eligible batches serially. Stop future batches or review eligible remaining work after interruption.
- **Clear recovery:** failed saves retain edits in memory and report failure. Explicit recovery and same-request retry help prevent silent replacement or duplicate submissions.
- **Guidance close at hand:** Sarge, Settings, keyboard shortcuts and operator guides in English, French and German. New mission resets planning while keeping the live connection.
- **Optional 3D terrain-section preview:** read-only terrain and tactical proxies with synchronized selection. Requires authorized, world-matched elevation and imagery supplied separately.

## Connect when you need it — experimental

Use **bridge 0.15.0** with COMMAND **1.1.0**, with exactly one installed copy of Workshop item **6A969EB0C5012BB9**. The bridge project and compatibility guide accompany the download. Required aircraft addons and dependencies must be installed separately on the server and clients.

- Quick connection runs COMMAND's owned relay/tunnel; Dedicated relay connects to an authorized administrator-managed HTTPS relay.
- Live tracking supplies exact identities. Supported AI infantry recruitment is reviewed; tracking alone does not grant control of arbitrary vehicles or aircraft.
- Supported infantry orders, routes and squad controls; reviewed deployment/removal, occupied spawning with seating verification, transport, treatment, vehicle/convoy and server snapshot tools.
- Host/server-controlled auto-approval categories preserve validation, ownership and duplicate protection. Flight still needs manual approval.
- **22 exact experimental helicopter profiles:** 18 vanilla UH-1H/Mi-8MT variants and four separately installed H60 variants. Select speed, intermediate waypoints, optional minimum heights, land/unload, hover or session-bound loop patrol. No artificial path-distance or minimum waypoint-spacing limit; valid world bounds remain.

Connecting, importing or reviewing does not spawn anything. Deployment, infantry orders and flight are separate reviewed actions; a map route is not automatically an executable order. Accepted requests do not prove physical completion.

### Honest limits

Live controls remain experimental. Historical short native profile checks are bounded evidence; two-client multiplayer, human takeover, player lifecycle, long routes, different loads/speeds and obstacle clearance still need acceptance. Preflight checks do not provide reactive avoidance, guaranteed tree/building clearance, automatic LZ relocation, targeting or combat flight. Inspect the entire route and choose a clear flat LZ. General existing-vehicle/aircraft registration remains unfinished. The historical walking-to-vehicle boarding timeout is unexplained. Patrol and relay state do not survive process restarts.

Workbench import/apply, continuous two-way editing, WebSockets and multi-admin roles remain planned or disabled. Full-world scene reconstruction and exact game models are separate work.

## Install and recover

Extract the complete **COMMAND-1.1.0-Windows.zip** into a fresh folder and run `COMMAND-Windows/COMMAND Planner.exe`. The bundle contains vanilla catalog/index metadata, current guides, test missions, matching bridge publication files, relay/source, licences and checksums. Game models, imagery and elevation are not redistributed.

Save a backup before switching versions. Existing plan/settings formats are preserved. Reconnect explicitly; startup never replays unfinished requests. If delivery is uncertain, inspect the original result and retry its original ID rather than create a replacement. Closing or New mission is not an aircraft emergency stop. Keep the previous download for rollback.

## Source and licence

Planner source is in `planner/`; use Node.js, `npm install`, then `npm start`. `npm test` runs the project tests. Source archives contain tests and tools; development-only dependencies are not desktop features. Keep dependency notices.

Original COMMAND code is **GPL-3.0-only**. Workshop material, dependencies, game assets and third-party content retain their own terms. See [LICENSE](LICENSE), [licensing](docs/LICENSING.md) and [third-party notices](planner/THIRD-PARTY-NOTICES.md). An installed download or prefab GUID does not grant redistribution rights.

COMMAND is an unofficial community companion, not affiliated with or endorsed by Bohemia Interactive. Arma Reforger, Enfusion and associated trademarks belong to their owners.
