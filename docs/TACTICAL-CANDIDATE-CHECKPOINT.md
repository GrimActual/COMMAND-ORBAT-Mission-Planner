# COMMAND tactical source checkpoint — dev.gm.6 / native 0.6.0 candidate

This is an unpublished development checkpoint. The existing dev.gm.5 release and 0.5.0 Workshop project remain intact. Do not assume that the Workshop entry already contains these commands.

New source controls: Defend position for 5–300 seconds using the native defend preset, and Cancel owned movement. The latter removes only the Companion-owned waypoint; it does not freeze AI or suppress combat reactions. Move and timed Hold remain available. Host review and approval are required for all four actions. Older mods keep the new choices disabled, and the updated mod preserves Move/Hold when talking to the previous relay.

If testing this checkpoint, use both matching candidates:
- Workbench project: A:/Everon-ORBAT-Development/publish/COMMAND-ORBAT-Bridge-0.6.0/addon.gproj. Publish version 0.6.0 to the same COMMAND Workshop identity 6A969EB0C5012BB9, then update/restart the game session. Existing COMMAND branding is retained.
- Companion: A:/Everon-ORBAT-Development/work/ai-command-bindings/COMMAND-Tactical-Candidate/COMMAND Planner.exe. Keep its supporting folder together. Close the old Companion before opening this one, reconnect using a GM-enabled Host Local mixed profile, and pair the game.
- Spawn a verified infantry AI group through the existing review/approval process. In the game, check pending GM requests to advertise support. In Companion Units → Native AI orders, Refresh command targets and results, select the group, choose Defend position and its destination/duration, Review and Send. Approve it in the game and refresh results in Companion. Cancellation uses the same review/approval path, with no destination or duration.

The actual native-server gate traced the requested defend waypoint to SCR_AIDefendWaypointState → SCR_AIDefendActivity → AI/BehaviorTrees/Chimera/Group/ActivityDefend.bt. Cancellation, subsequent Move, owned removal and old-relay fallback passed. PC/Workbench compilation, desktop checks and 219 regression tests passed. Sarge and Settings include EN/FR/DE guidance; the guide remains 50 topics.

This synthetic world did not validate travel or defence under fire. A longer no-navigation trace reached an engine pathfinding error; that limitation is retained in the evidence. Test real travel and combat in a normal terrain/navmesh Host Local session before calling this stable. No automatic commands, real players or game client were used in the native tests; servers/relays were stopped and private pairing files cleared.

All requested later command families are retained in docs/AI-COMMAND-EXPANSION.md: selection/recruitment of friendly existing squads, chained waypoints, Follow, Force Move/Attack, formations, stances, strict fire control, suppression/look, vehicle support/healing, attach/detach/convoys and stack/breach/garrison/clear. The reference mod 69A404653EE3F3C4 is inspiration only. None of its code, assets or trees is imported.
