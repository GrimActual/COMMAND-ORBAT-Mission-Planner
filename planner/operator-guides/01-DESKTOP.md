# Desktop and live controls

The left navigation contains Units, Draw, Brief, Assets, Game controls and Offline rehearsal. Game controls groups Deploy, Orders and Server. Plan files in the header contains Project JSON, presentation export, Copy brief and Import plan. Save Backup remains separate. Settings and Help & Sarge are at the bottom left. Applied planning edits save locally; keep portable backups too.

For the existing host pairing path, open Settings → Live bridge and start the selected connection. In Reforger enable the matching bridge and open COMMAND host pairing. Paste the relay address and pairing code into their separate fields. Use the current tracking/faction scope in the game; this is not limited to the host character. Only the selected supported scope is shared, not the whole mission. A tunnel or code change requires fresh pairing information.

In Game controls → Orders, use Control existing in-game squad, choose a currently tracked AI member, review and send, then approve recruitment in Reforger. Orders affect its existing squad. The matching bridge also accepts a supported living individual infantry AI on foot through a native one-member control group. Players, foreign waypoints, incompatible membership or changed scope can block control. Release unavailable control and recruit a current member when required. After reconnecting, recruit the tracked AI again with host approval; previous-pairing ownership is transferred only for that selected target. Recruitment does not grant deletion.

The bridge reports actual infantry, vehicle or unsupported target types. In-game targets are labeled separately from planned markers, and incompatible actions are disabled. Older bridges do not supply these details.

Check squad execution reports activation, position, waypoint and authority. Order installed confirms attachment, not arrival or combat compliance. Cancel pending AI order applies while queued; Cancel owned movement is a separate reviewed action for installed movement. Transport, treatment, vehicles and convoys have separate panels and approval.

Offline rehearsal and simulation are distinct from live commands. Neither modifies the real game. Full map hides the interface and Show menus restores it. Opening a panel or changing UI language does not change your plan.

The optional [3D preview](05-3D-PREVIEW.md) selects existing planned entities and does not send game orders.

[Start](00-START-HERE.md) · [Compatibility](04-COMPATIBILITY.md)


## Deployment compositions (development source)

Units → Deployment compositions: select units and save JSON. Load a saved file, choose planner anchor easting/northing and clockwise heading, preview the count, coordinates and unresolved identities, then insert. First selected unit is the saved anchor; internal command parents remap, external parents become top-level, phases become shared and copies start unlocked. Supported unit fields, explicit affiliation and prefab provenance survive; runtime handles do not. One Undo/Redo removes/restores the instance. Preview again after mission/placement edits. Open deployment review separately with a matching resource index; its 16-unit limit still applies. Saved per-unit headings take precedence over the deployment heading field. No automatic batches, occupied seating or flight is added.

[Game Master workspace / Espace Maître du jeu / Game-Master-Arbeitsbereich](11-UNIFIED-GM.md) · [FR](11-UNIFIED-GM-FR.md) · [DE](11-UNIFIED-GM-DE.md).
