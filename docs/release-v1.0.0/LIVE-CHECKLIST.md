# Optional experimental live acceptance — still pending

Core planning is the stable scope. These checks expand experimental evidence; this release does not claim they passed.

Use desktop 1.0.0 and bridge 0.13.0. Record world, server/host mode and package SHA-256. Keep credentials private.

1. On host/server and a second human client, verify scoped tracking, a small approved spawn/removal and a 30 m infantry move/hold/move. Confirm player-occupied targets stay protected.
2. Toggle AI, spawning and removal auto-approval separately. Confirm Companion receives each mode, then Disable All returns every category to manual and a fresh request waits.
3. Disconnect/reconnect the dashboard without ending the server-managed session. Check death/respawn does not transfer authority. End session must invalidate the old key.
4. On a clear flat 20–100 m Huey corridor, confirm one AI pilot plus four passengers, takeoff, landing, four exits and retained pilot on both clients. Stay outside the aircraft. Test airborne cancellation only with the route/LZ already checked; it continues to the approved landing zone and retains passengers. Human takeover requires a competent pilot and its own safe test.
5. Save a supported COMMAND snapshot, restart the test scenario, review without spawning, then separately approve restore and inspect supported entity identity/pose/faction/order state.

Stop on failure and report the exact action/result. Do not use trees, buildings, occupied landing zones or a longer route to test unsupported avoidance/range. Boarding history remains unresolved. Existing game vehicles/aircraft are not generally registerable yet.
