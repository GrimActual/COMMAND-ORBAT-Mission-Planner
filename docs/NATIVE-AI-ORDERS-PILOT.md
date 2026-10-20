# COMMAND native AI orders — development pilot

Companion **2.9.1-dev.gm.5** and **COMMAND ORBAT Bridge 0.5.0 pilot** add host-reviewed **Move to position** and **timed Hold** for bridge-created, on-foot infantry AI groups. They retain the existing tracking, deployment, spawn/remove and offline GM workflows. This is a development prerelease, not the complete native GM suite.

## Which application does what

1. **Workbench:** open the prepared `COMMAND-ORBAT-Bridge-0.5.0/addon.gproj`, keeping Workshop identity `6A969EB0C5012BB9`. Publish an update to the existing COMMAND ORBAT Bridge, version `0.5.0`. Use the supplied Workshop change notes. Publication is a separate user step; the GitHub package cannot update Workshop automatically.
2. **Reforger:** update the Workshop addon and start a compatible Host Local session with it enabled. For GeForce NOW, ensure that the new addon version is installed in that session.
3. **Companion:** close the old Companion, extract the entire new Windows ZIP and launch `COMMAND Planner.exe`. Settings → Live bridge: use a Host Local mixed profile and explicitly enable reviewed GM requests. Start the connection and pair it in Reforger using the displayed endpoint and temporary code.
4. **Companion, Units:** assign a verified infantry **group** prefab, such as the vanilla US Fire Team, to a planned marker. An individual rifleman prefab is not a group. Review and send the spawn through Deployment preview. **Reforger host:** inspect and approve it. **Companion:** check its executed result.
5. **Reforger host:** check pending GM requests once so the updated mod reports AI-order support. **Companion:** open Units → Native AI orders (pilot), or Settings → Native AI orders (pilot). The compact GM toolbar also has a shortcut. Click **Refresh command targets and results** and select the spawned group target.
6. **Companion:** choose Move and **Choose destination on map**, or use exactly one selected planned marker as the destination. Escape cancels map picking. For timed Hold, enter 5–300 seconds. Review the order, inspect the target and destination/duration, then **Send reviewed order for host approval**.
7. **Reforger host:** inspect the request and approve or reject it. **Companion:** explicitly refresh results. An executed result means a native waypoint was accepted; it does not confirm arrival. Observe the group in the game for the travel test.

## Bounds and behaviour

- Only an executed bridge-created target from the current pairing can be submitted. The game resolves the actual group and requires 1–16 resolved standard editable infantry AI members. Human-controlled members, mounted troops and foreign waypoints are rejected. Unknown control/membership fails closed.
- Move uses a game waypoint and terrain height, rather than teleporting the group. Hold creates a timed wait at the current leader position; AI can still react to combat. A new order replaces only the previous Companion waypoint after validation and creation succeed. Other mission waypoints are retained and block this pilot.
- Review expires after 60 seconds. Form, mission or pairing changes invalidate it. Requests use the existing 60-second pending and 30-second approved execution windows, cancellation, rate limits, duplicate protection and 100-command lifetime budget. Cancel is available before approval. No background order submission or automatic startup connection is added.
- The existing 60 tracking aliases and 60 owned-root limits are retained. Group prefab children can create more actors; these limits are not a 60-player or 120-player load certification.
- Saved plan coordinates, editor Undo/Redo, offline rehearsal and exported mission data are untouched by native orders. The destination ring is temporary. A native order is not an editor change that Undo can reverse.
- The old 0.4.1 mod remains usable for its existing features, but cannot advertise the new capability. New controls stay gated. A new mod can fall back to legacy relay polling for spawn/remove; AI orders require a matching relay.
- Vehicle driving, crew/transport orders, embark/disembark, arbitrary existing-unit control, route sequences, writable properties and environment controls remain future adapters. This pilot does not add dedicated-server command approval controls.

## Verified and still pending

PC and Workbench script compilation passed using the installed diagnostic executable. An isolated actual standalone server with a synthetic vanilla fireteam and loopback relay passed Move, timed Hold, replacement, foreign-waypoint rejection and owned-group removal. Hold duration was read back as 60 seconds, and each accepted order had one attached waypoint. No game client or real player was used. The server and relay were stopped and the private pairing file cleared. This fixture had no navigation terrain; actual travel/arrival and combat behaviour are not asserted, and the new order payload was not tested over a public HTTPS tunnel.

The offline desktop UI passed capability gating, stale plan/form/pairing rejection, destination conversion, safe imported-name display, EN/FR/DE context retention, Settings/compact shortcuts, map click/Escape and unchanged mission data. Send/cancel replies were mocked for this desktop UI gate; native execution was tested separately. All 215 regression tests passed.

On the same 60 completed one-root request fixture, 1,000 warmed status serializations measured the prior release at 6,292 bytes / p95 0.086 ms and this pilot at 10,112 bytes / p95 0.281 ms. Target metadata is capped at 60 labels and command replies at 64 KiB. Telemetry remains capped at 32 KiB. Results are fetched explicitly. These are local serialization measurements, not a map FPS or network-latency guarantee.

Next gate: update Workshop and confirm a host-approved fireteam Move and Hold in a normal Host Local session, including human possession and mounted-member rejection. Then expand transport/crew and route adapters separately.
