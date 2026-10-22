# Helicopter controls — experimental

Use COMMAND 1.1.3 with bridge 0.15.7. Install the selected aircraft and its required addons on the game/server and participating clients.

1. Refresh flight targets and choose the aircraft.
2. Leave **Flight only — retain passengers** selected for flight without an unloading task. Every supported profile offers this option. The pilot must be alive, conscious, AI-controlled and seated in the pilot compartment. A passenger team is not required.
3. To unload a team on arrival, clear that option and choose the team. Only its cargo passengers actually aboard are designated for unloading; dismounted members do not prevent takeoff.
4. Mark the final landing zone, add map waypoints or copy a planned route, then review and send. A one-point planned route supplies the LZ. The host controls approval.
5. After landing, review a new route for the same aircraft. You do not need to reload the mission or put unloaded passengers back aboard.

Terrain flatness and stationary-speed vetoes are removed. Helicopter routes have no artificial distance, spacing or waypoint-count restriction; finite supported coordinates and request-size validation remain. Cruise is 57 m/s, Fast 66 m/s; 4, 8 and 12 m/s are also selectable. Clearance checks are preflight checks, not reactive obstacle avoidance or guaranteed clearance.

GM requests may queue behind an active operation. Only one request executes at a time in the current bridge. A looping patrol continues to occupy that execution slot until stopped; queued does not mean concurrently executing. The 100-request reconnect cutoff is removed, while receipts remain for the paired session to prevent duplicate execution.

Human entry releases assistance. Host ownership, pilot health, collision checks and observed grounded completion remain. The current candidate has had source inspection and syntax checking only; no automated tests, native compilation, game or app launches were performed for this update. Historical short flights do not validate these changes or high-speed flight.
