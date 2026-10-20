# COMMAND v1.0.0 — Mission Planning & Control

Stable mission planning for Arma Reforger, with optional **experimental live-game controls**. This is the first stable COMMAND product edition; the earlier 2.x development versions remain available as history. Saved-plan formats and the existing user-settings location are retained.

1. Export a plan backup, close the previous app and extract the complete ZIP into a new folder. Run `COMMAND-Windows/COMMAND Planner.exe`.
2. Find assets and units in the Game Master workspace. Status labels distinguish assets available to place, planned units, deployed targets and tracked entities. Select an item for its relevant actions.
3. **New mission** on the main toolbar clears the planning workspace without disconnecting. One Undo restores it. It retains installed asset metadata and live entities; it never silently removes entities or cancels an active game operation.
4. **Mission & deployment → Import mission** opens one `.command-mission.json` containing the plan, asset references and deployment setup. Review the import, then review a deployment stage separately. Importing never spawns anything.
5. Offline planning, JSON save/load, import/export, drawings, briefing, Undo/Redo, Settings and Sarge form the stable scope. See `01-DESKTOP.md` and `11-UNIFIED-GM.md`; French and German guides accompany them.

## Optional experimental game connection

Compatible bridge: **0.13.0**, Workshop project ID **6A969EB0C5012BB9**. Game/server addons must already be installed. Quick connection runs a relay and temporary tunnel on this computer; dedicated relay mode connects to an administrator-managed relay. Connecting does not itself authorize game changes. Host/server approval and ownership validation remain required.

Tracking, spawning/removal, AI controls, category auto-approval, occupied deployment, snapshots, transport/treatment/vehicle controls and force-assisted Huey flight are experimental. Existing infantry can be recruited through reviewed control; general existing-vehicle/aircraft registration is unfinished. The historical walking-boarding timeout remains unexplained. Two-client multiplayer and pilot takeover acceptance remain pending.

The Huey test uses one vanilla UH-1H, one AI pilot and four seated passengers on an operator-checked clear, flat 20–100 m route. Select a passenger infantry group and the aircraft separately. No obstacle avoidance or guaranteed tree/building clearance exists. Takeoff is slow and the aircraft may translate backwards to a point behind it. Verify the whole corridor and LZ; never use an obstructed route. Do not board during assisted flight. This is not a general autonomous helicopter pilot.

No game models, satellite imagery or elevation data are included. Optional terrain preview requires your own authorized, correctly aligned data. Standalone relay, bridge source, vanilla metadata, licensing, source and checksums accompany the Windows download. Read `RELEASE-SCOPE.md`, `UPGRADE-AND-RECOVERY.md` and `LIVE-CHECKLIST.md` at the package root.
