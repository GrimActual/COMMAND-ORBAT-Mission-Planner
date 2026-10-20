# COMMAND — one Game Master workspace

Desktop 1.0.0 / unchanged bridge 0.13.0. This is a UI acceptance build; stable publication and real multiplayer acceptance remain pending.

1. Open COMMAND. Game Master is the starting workspace. Search by name, unit or prefab; use the status, type and faction filters. Available to place, Planned, Deployed and Tracked in game are distinct sources, not interchangeable authority.
2. Select an asset → Place on map → click the map. Select a planned unit → Edit unit or Review deployment. Name is optional. Appearance and organisation are secondary. One editor is shown at a time and search stays visible.
3. Mission & deployment → Open Huey test mission, or Import mission. One .command-mission.json carries the editable plan, asset references, matching resource index and deployment/seat setup. Review the import, import, review its deployment and explicitly send to game. Game addons are installed separately. Existing ordinary Project JSON remains supported.
4. Select a planned vehicle, use Pilot · B or Passengers · N, choose an occupant prefab and Place on map. Review before deployment. This prepares planning data; it never spawns from a keypress. The pilot/passenger unit and seat setup undo together. Remap keys in Settings → Keyboard Shortcuts.
5. Refresh live → select a tracked AI → Register / control existing AI. Review registration and approve in game. An existing supported AI squad or on-foot individual can then receive orders; it need not have been spawned by COMMAND. Player control and foreign orders stay protected. Tracking an existing vehicle does not grant it control: bridge0.13.0 has no general vehicle-registration operation.
6. Select a deployed target → Supported orders. Transport, treatment, vehicle and experimental helicopter panels use existing requests and approval rules. More tools exposes the other preserved workflows. Accepted/installed is not proof of physical completion.

Filters are remembered separately from the mission. Selection survives search/live-list refresh. Only the workspace body scrolls on a normal desktop window. Advanced actions open in the same pane and Back to selection returns to the selected item.

Keep the entire Windows folder together. Back up plans in your existing app and close it before switching. Existing plans/settings retain their storage location. Keep the frozen RC2 installation for recovery. No bridge update is required by this desktop presentation change.

## Short acceptance check
- Import the included single-file Huey mission; undo/redo and reopen the app. Confirm plan, assets and seating are present.
- Search/filter populated lists; select and edit one planned unit; check map selection and optional names.
- Connect using bridge0.13.0. Register an existing infantry AI with approval, then send a short move order and observe it in game.
- Review occupied deployment; approve and check actual seats. Experimental flight remains separately reviewed. Historical walking boarding and real multiplayer acceptance remain unresolved.

Startup hotfix: address/code become available after Cloudflare tunnel registration and local pairing. Public reachability is checked separately in the background and remains explicitly unconfirmed until checked. No host-approval rule changes. Window display no longer waits for full page resources; online map imagery starts after the first frame.
