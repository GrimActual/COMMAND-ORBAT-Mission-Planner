# COMMAND — start here

This is the COMMAND 1.1.2 release: stable offline planner; experimental live controls. Its bridge remains 0.15.2; inspect Settings → Compatibility and limits and the final package manifest for exact desktop compatibility. Use only the final package identified by its manifest and checksums. Offline planning is the core product; live-game controls and helicopter assistance remain experimental.

1. Open Game Master. Search assets, planned units, deployed targets and tracked units together. Status badges keep these records distinct. Filters and search remain beside the selection.
2. Import mission loads a complete `.command-mission.json` with plan, asset references and deployment setup. It spawns nothing. Use Save Backup before replacing work. Import has one Undo step. Legacy plan exchange remains in Plan files.
3. Select an asset to place it, a planned unit to edit it, or a live target to see supported actions. Pilot/passenger shortcuts B/N create planning data; they do not spawn. Names can be automatic.
4. Mission & deployment defaults to Whole mission, including all declared stages and factions. Review the queue and its exact groups/vehicles, then Send to game. Requests are sent serially in supported batches, retaining host approval. A group is not one soldier. Occupied stages keep their seat assignments.
5. Follow each batch: Queued → Awaiting host approval → Running → result. Order installed means an infantry order was accepted, not arrival. Completed request does not prove the whole mission finished. Flight reports measured progress separately.
6. If delivery is uncertain, check its original result; retry preserves the same request ID. Do not create replacement requests. Stop remaining batches prevents later sends without cancelling the current request. Review changes and expiry explain why another review is needed.
7. Review mission removal lists only matching known COMMAND-created batches from the current desktop pairing. Recruited or unrelated entities are excluded. Removal keeps the plan. New mission clears planning while preserving the live connection, assets and tracking; Undo restores planning. Neither action is an aircraft emergency stop.

## Connection and recovery

Quick connection starts this app’s relay and tunnel. Address/code can appear while public reachability is checked in the background. Relay ready does not mean fresh game positions. Pairing code is hidden until revealed. Dedicated relay connects to an authorized server-managed session. Disconnect dashboard preserves that session; End session explicitly revokes it after review. No auto-connect or automatic queue resume occurs at startup. Closing warns about unfinished requests; save your plan first. Never share private dashboard keys or pairing credentials.

## Existing infantry and flight

Track the faction and select an AI infantry member in Reforger, refresh targets, then review recruitment and approve it in game. Players, mounted groups and foreign orders stay protected. Release control does not delete soldiers. Tracking alone does not authorize control. General existing-vehicle/aircraft registration remains unfinished.

Flight supports the exact enabled catalog profiles, not every helicopter of the same family. Required aircraft addons are separate. Select aircraft and passenger team or the profile-supported pilot-only mode. Review deployment and flight separately; flight requires manual host approval. Select travel speed, map waypoints, final LZ and supported patrol mode. Artificial path-distance/waypoint-spacing limits are removed; world bounds and native checks remain. Optional waypoint heights are minimum AGL; the highest entered minimum applies across cruise. Preflight clearance may raise cruise or reject obstructions; it does not guarantee clearance, reactively avoid obstacles or relocate the LZ. Inspect route, takeoff and landing areas. Human takeover and multiplayer acceptance remain pending. The historical walking-boarding timeout is unexplained.

## Other guides

Use 02-ASSETS, 03-SERVER, 04-COMPATIBILITY, 07-HTTPS-HOSTING, 10-HELICOPTER and 11-DEPLOYMENT-OPERATIONS for details. Sarge opens relevant controls. Optional read-only terrain preview requires authorized world-matched elevation and imagery; no game geometry or imagery dataset is bundled. Workbench native apply, relay restart persistence, WebSockets and multi-admin roles remain planned or disabled. Existing short native receipts are not new human multiplayer acceptance.

## Asset library update

Game Master → Asset library contains Import catalog JSON and Load deployment resource index together. Select the matching two metadata files from Vanilla-Assets/Start-Here. Catalog import changes available assets; planned units retain their saved references. Resource indexes identify exact deployment prefabs. Whole-mission imports already contain both. These are local planning files, not server uploads. Importing does not spawn anything.
