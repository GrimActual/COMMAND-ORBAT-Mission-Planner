# COMMAND v1.0.0 — Mission Planning & Control

The first stable COMMAND planner release brings mission planning, asset discovery and unit management into one coherent desktop workspace. **Stable applies to planning features; every live-game control remains experimental.** Earlier 2.x prereleases retain their original tags and downloads.

## Stable planning features

- Offline mission planning with tactical symbols, routes, areas and briefing preparation.
- Unified search and filters across available assets, planned units, deployed targets and tracked units, with distinct status labels and contextual actions.
- One-file mission packages containing the plan, catalog references, resource index and reviewed deployment setup. Import previews do not spawn anything.
- New mission clears the planning workspace without disconnecting; Undo restores the previous plan and deployment setup.
- Plan save/load, supported import/export, whole-workspace Undo/Redo, recovery copies, Settings and Sarge guidance in English, French and German.
- Included vanilla catalog/resource-index pairs and current operator guides. N/B planning shortcuts assign passengers/pilot roles without spawning directly.
- Faster public-tunnel credential availability and deferred background reachability checks. The user observed an address at about five seconds and a code at seven seconds on this PC; this is not a universal timing guarantee.

## Optional experimental integration

Bridge **0.13.0**, protocol 3, Workshop project **6A969EB0C5012BB9**. Includes scoped tracking, reviewed spawn/removal and supported AI orders, category-scoped host/server auto-approval, occupied deployments, server snapshots, transport/treatment/vehicle tools, and force-assisted vanilla Huey insertion. The desktop changes do not require a new bridge publication.

The user confirmed a short live Huey flight, landing, engine shutdown and passenger unloading. Isolated native tests also cover occupied deployment and the flight sequence. These results do not establish universal multiplayer acceptance, obstacle avoidance, other-airframe support or reliable human pilot takeover. Flights remain manual-approval-only.

Flight target selectors now distinguish passenger infantry groups from vehicles and exclude unsupported pilots. Unique eligible choices are selected automatically. Pending deployment results refresh automatically so completed requests no longer leave the deployment workflow locked.

## Known limits

- Two-client multiplayer, player lifecycle and pilot-takeover acceptance are incomplete. Existing in-game infantry recruitment is supported; general existing-vehicle/aircraft registration is unfinished.
- Historical walking-to-vehicle boarding timeout remains unexplained; no fix is claimed.
- Experimental Huey route is clear/flat, 20–100 m, one AI pilot and four passengers. Slow takeoff and backward translation can occur. No trees/buildings avoidance or guaranteed clearance. Verify the entire route and LZ; stay outside the aircraft during assisted flight.
- Optional read-only terrain preview needs authorized world-matched elevation and imagery. No game models, satellite imagery or elevation dataset is redistributed.
- Workbench native import/apply, continuous two-way editing, WebSockets, relay restart persistence and multi-admin roles remain planned or disabled.

## Download and upgrade

Download **COMMAND-1.0.0-Windows.zip** for the complete operator bundle: Windows app, bridge publication source, standalone relay, vanilla indexes, guides, test mission, licences, corresponding source and checksums. Extract to a new folder; preserve the previous installation and export a plan backup first. The existing settings location and plan formats are retained. No automatic updater or Workshop publication is performed by this release.

The executable is unsigned; Windows may show an unknown-publisher warning. Check SHA-256 against the published checksums. See UPGRADE-AND-RECOVERY.md for rollback and LIVE-CHECKLIST.md for the remaining experimental acceptance tests.
