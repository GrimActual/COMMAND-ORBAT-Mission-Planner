# COMMAND compact GM workspace — 2.9.1-dev.gm.4

Close only Companion before opening this version; the game can stay open. Launch COMMAND Planner.exe inside COMMAND-GM-Workspace, keeping its supporting files together. Existing saved-profile storage is retained. Reconnect the bridge after reopening. No Workshop update is needed: use the existing COMMAND ORBAT Bridge 0.4.1.

Click GM workspace in the header. It starts disabled for existing users. Assets opens the searchable drawer; Inspector shows planned selection, IDs, grid, asset GUID/path and lock state. Editor opens the existing forms. Choosing assets or switching layouts does not apply pending form edits or spawn anything.

Review deployment opens the existing reviewed workflow. Request results performs an explicit result check. Native execution still needs in-game host approval. Offline rehearsal, Pause rehearsal and Advance rehearsal remain separate from live game commands. No new native AI/property/environment controls are claimed.

Drawers collapse and use one panel at a time on narrow windows. Escape closes a panel outside text fields. Full map / full screen keep their existing restoration controls. GM workspace off restores the standard editor and the same asset chooser, retaining unapplied form values, search and filters.

Settings → Game Master has Enable compact GM workspace and Open compact GM workspace. Open offline GM panel is the distinct rehearsal shortcut. Sarge remains 50 topics with English/French/German guidance. Layout preferences stay outside saved mission JSON and Undo. Layout-only changes skip unrelated map/asset rebuilds and keep active replay playing.

Validation: actual desktop layout/selection/asset-node preservation, pending form values, safe imported-name display, detached inspector snapshots, 16-object cap, narrow panels, Escape/full-map restore, existing form Undo/Redo, explicit results navigation, offline Pause/Advance, Settings/reload and localization passed. Replay continuity passed after isolating layout settings. No live game command or native retest was performed for this desktop-only change.

Performance: first dense samples included fit/load stalls (previous 54 FPS; compact 50.2 FPS). Warmed matched 400-unit/2,721-asset six-second samples measured previous 60.0 FPS / p95 16.8 ms and compact 60.2 FPS / p95 16.9 ms, with no frames over 100 ms. The compact map is wider, so viewport dimensions are recorded. Final 400-unit layout-switch sample p95 was 40.8 ms; drawer geometry is coalesced into animation frames. These short samples are not universal guarantees or evidence of a causal FPS improvement. Complete before/after evidence is included.

COMMAND name and artwork are used in the active app and active MagicPath workspace. Historical source/test notes and user-authored mission values remain preserved for compatibility.
