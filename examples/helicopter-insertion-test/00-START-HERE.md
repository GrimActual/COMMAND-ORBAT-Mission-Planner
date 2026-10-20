# COMMAND Huey test — one-file import

Recommended: Mission & deployment → Import mission → COMMAND-Huey-Test.command-mission.json. Review import, import, review the Huey + pilot + fireteam deployment, Send to game, then approve in Reforger. Importing spawns nothing. The included file supplies the matching plan, catalog, resource index and seating setup; no separate imports are needed.

Departure uses operator-confirmed runway coordinates, native X4771 / Z11637. Inspect the actual corridor and a flat LZ 20–100 m away; an 80 m northward test is X4771 / Z11717. Select TEAM as passengers and HUEY as aircraft. Do not choose PILOT as the passenger team. Approve flight separately. No obstacle avoidance or guaranteed tree/building clearance. Slow takeoff/backward translation remain known limits. Stay outside during flight.

New mission clears planning without disconnecting. Existing game entities remain until explicit approved removal. The historical walking boarding timeout is unrelated and unresolved.

## Legacy multi-file workflow (optional source reference)

# COMMAND Huey insertion check

Use COMMAND planner 1.0.0, bridge 0.13.0 and the matching relay. All flight/live controls remain experimental; multiplayer and pilot-takeover acceptance remain pending. Back up your current plan first. These files contain original planning data and prefab identities, with no game assets, scripts or automatic orders.

1. In COMMAND import `01-MISSION-PLAN.json` as Project JSON. Import `02-ASSET-CATALOG.json` in Assets if needed. In Assets → Import Workbench metadata, choose Load resource index JSON, select `03-RESOURCE-INDEX.json`, then Use reviewed resource index.
2. In the actual Everon session inspect the departure at world X 4771 Z 11637 and clear 100 m route north to X 4771 Z 11737. The native fixture used a diagnostic world; this does not certify that the full game scene has no obstacles. Aircraft must be stationary and grounded.
3. Select the three planned unit markers (HUEY, PILOT, TEAM), using Ctrl-click or map box selection. Open Game controls → Deploy and review the selected deployment. In Occupied vehicle deployment choose Use reviewed deployment, vehicle HUEY, PILOT role pilot/automatic and TEAM role cargo/automatic. Set 30 seconds. Review and send; approve in Reforger.
4. Check actual occupancy: one pilot plus four members of TEAM in cargo seats. The request has three roots but five occupants. A group is not four independent root entries. Do not use a walking Embark request for this test. Required-seat failure must clean up only the new batch; do not approve flight after failure.
5. Open Game controls → Orders → Helicopter insertion — experimental. Refresh, select TEAM and HUEY from the successful deployment. Mark the LZ circle (world X 4771 Z 11737), acknowledge the inspected route, review and send. Reject once to confirm no action, then send a fresh reviewed insertion and manually approve it.
6. Observe actual takeoff, short flight, sustained landing and four completed passenger exits; pilot remains. Compare COMMAND progress with the game. Keep human observers outside the aircraft: any human entering any seat releases assistance immediately.

Cancel on a fresh run while airborne: assistance should continue to the approved LZ, land and retain passengers. Never cut control as a cancellation test. Once unloading starts, exits cannot be recalled. Competent human takeover, two-client replication and disconnect/reconnect remain separate live acceptance checks.

No other helicopter profile is enabled. The historical walking boarding timeout is not fixed by direct seating. Importing the plan does not spawn anything or install its LZ annotation as an order. No elevation/image package is required. Preserve your old installation and plans.
