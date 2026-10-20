# COMMAND helicopter controls — experimental

Desktop **1.0.1 (20 October flight refresh)**, matching bridge **0.13.1**. Stable offline planner; all live controls remain experimental. This refresh requires bridge 0.13.1.

1. Back up the current plan. Close the old app; run this test app in its separate folder.
2. Publish the included Bridge-0.13.1/addon.gproj to the existing Workshop item as 0.13.1. Use one copy, load it in the test game/server, and pair this app explicitly.
3. Import the included Huey mission, inspect the actual departure and LZ, review deployment and approve it. Confirm the actual AI pilot and four passengers are seated.
4. Open helicopter controls. Refresh targets; select TEAM as passengers and HUEY as aircraft. Choose travel speed (4/8/12 m/s). Open Flight waypoints → Add waypoint on map for each intermediate point. Mark the final LZ separately.
5. Review the entire order. It is one manual approval; the pilot follows points in order, then lands and unloads only the passengers. Total planned path is 20–1000 m. Sixteen intermediate points maximum. Choose Flight ending: Land and unload, Fly route then hover, or Loop route. Patrol stays airborne while its authorized paired session remains alive. Land / stop patrol follows the remaining reviewed route to the LZ and retains passengers. Lost authority eventually triggers controlled landing; no persistent unattended operation is promised. The loop-closing leg is included in the 1 km budget and preflight checks.

## Observed checks

- Actual isolated native 1 km flight behind initial heading completed: route-facing gate, ~41 m lift, landing, four exits and retained pilot, ~188 s total.
- Actual native three-leg ~400 m route at a reviewed 8 m/s completed; intermediate point errors ~0.55 m and ~0.10 m, observed maximum horizontal speed ~8.32 m/s, landing/four exits/pilot retained, ~148 s total.
- Actual native collision tests detected terrain and a vanilla hangar. A hangar-obstructed LZ was rejected before flight. This is preflight clearance admission, not a demonstrated dynamic avoidance pilot.

Cruise targets 40 m above the sampled route high point. Bounded preflight sweeps may raise it above detected geometry or reject the route. Geometry streaming, foliage collision, dynamic obstacles and other worlds are not universally verified. Operator route/LZ inspection remains required. Flat LZ, one vanilla UH-1H, one AI pilot and four cargo passengers remain the tested profile. Takeoff begins after operating rotor RPM; it is not an instant launch. Historical walking boarding remains unrelated/unresolved. Human takeover and two-client acceptance are pending.

No normal game client was launched for automated tests. Private native fixture files and raw diagnostics are not included. Do not interpret accepted requests as physical completion. Cancellation remains controlled until landing at the approved LZ.

## Next session: v1.1

Prioritize Mi-8MT/USSR aircraft adapter calibration and actual occupied takeoff, route, landing, cancellation and crew retention tests. Existing metadata and COM reports are references, not finished flight adapters. Other aircraft are not enabled by this refresh.
