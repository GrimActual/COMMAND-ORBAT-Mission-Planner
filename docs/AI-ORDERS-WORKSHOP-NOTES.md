# COMMAND ORBAT Bridge 0.5.0 pilot — change notes

Adds reviewed Move and timed Hold requests for bridge-created on-foot infantry AI groups when paired with COMMAND Companion 2.9.1-dev.gm.5.

The game host must inspect and approve every order. Human-controlled members, mounted troops and groups with foreign waypoints are rejected. Orders replace only the previous Companion waypoint. Timed Hold supports 5–300 seconds and does not suppress combat reactions.

Existing tracking and reviewed spawn/remove remain available. Capability negotiation prevents older mods from exposing unsupported AI controls; legacy relay fallback retains spawn/remove compatibility.

PC/Workbench compilation and an isolated native waypoint lifecycle test passed. An accepted waypoint does not confirm arrival. Actual navigation in normal scenarios still needs Host Local testing. Vehicle crew/transport orders are not included.
