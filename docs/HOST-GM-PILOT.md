# Host Local mixed tracking and GM execution pilot

Development build: **2.9.1-dev.gm.1**. This is not RC2 and the new mod candidate is not Workshop 0.3.0. Published RC2 and the earlier clean Workshop folder are preserved.

## What passed

- Final native source compiled in PC and Workbench modes.
- Actual standalone Enfusion → temporary HTTPS → actual Companion command path: two synthetic native objects spawned; their owned group removed; an unowned removal rejected. Test-only approval driver replaced a human clicking the panel. No client or real players were involved. Saved mission unchanged, no final script/renderer errors. Sampled server peak 583 MB; short isolated fixture only.
- Synthetic checks of the production shared 60-slot cap and faction/category filters.
- Desktop workflow checks: explicit GM opt-in defaults off, automatic aliases, stale send blocked, result display and unchanged plan. IPC mocked in this UI test; actual transport/execution covered separately.
- Queue authentication, cancellation, expiry, duplicate/conflicting commands, compact history and older group removal choices. Sarge's 50 topics have EN/FR/DE coverage.

The two-object runtime test preceded the final occupied-player removal guard and full request-ID change. Final source containing those changes compiled; occupied live players and real Host Local lifecycle behavior have not been tested.

## 1. Prepare the two applications

1. On your PC, open **GM Control Pilot / COMMAND Planner.exe** from the supplied pilot package. Keep published RC2 available separately.
2. In Workbench on your PC, open the clean **JSOC_ORBAT_Bridge-0.4.0-pilot/addon.gproj** candidate supplied with this pilot. Keep the original GUID `6A969EB0C5012BB9` so this is an update of your existing Workshop mod. Save All, validate scripts, then File → Publish to Workshop. Use **0.4.0** as the test update version; describe it as experimental. Do not upload private server profile files or test world fixtures. This guide does not claim it is already published.
3. On GeForce NOW, download/update that Workshop addon and enable it in **Host locally → Mods**. Use Game Master – Everon for the first test. The old 0.3.0 package will not show the new controls.

## 2. Companion APP: start the mixed connection

1. Gear → **Live bridge** → expand **Server profiles / Dedicated server (experimental)**.
2. Give the profile a name, e.g. `Host Local mixed test`.
3. **Tracking scope:** `Host Local players / AI / factions — 60 slots (pilot)`.
4. **Deployment:** `Local / player-hosted` (selected automatically).
5. **Connection method:** `Free temporary tunnel on this PC`. Leave **Relay root address** empty for this method. An existing relay requires the matching GM-capable relay version.
6. Interval: 1–2 seconds. IDs are automatic (`host_1` through `host_60`); do not enter player names here.
7. For tracking only, leave **Allow reviewed GM requests** OFF. To test spawning, turn it ON before connection. This grants permission to submit requests, not permission to execute without game approval.
8. **Save profile**, then **Connect profile**. Wait for the address and fresh pairing code. Keep the APP and PC awake.

## 3. Reforger GAME: choose tracked units

1. Host your Everon scenario with the candidate addon enabled. Press Escape → **COMMAND – HOST PAIRING**.
2. Open **Players / AI / factions**. Enable Humans and/or AI as wanted. Cycle faction keys and toggle each wanted faction ON. Factions start deselected; `NO_FACTION` is a separate opt-in.
3. **Refresh roster** after spawning units or changing controlled bodies. Click individual rows to select them, or **Select matching** for the filtered list. Bulk selection rejects overflow instead of silently truncating. Total human+AI cap: 60.
4. Return to pairing. GAME **first field / endpoint:** paste the APP's full HTTPS ADDRESS. GAME **second field / pairing code:** paste the APP's current 32-character CODE. Click **CONNECT** and resume.
5. Move a selected character, switch control, spawn AI and repeat Refresh roster as needed. Check APP markers/update status. Deselect a faction and confirm its feed stops. Category/faction filters are checked during each send.
6. Slots are reserved for identity safety during a pairing. Disconnect before reusing deselected slots; start a fresh APP connection and use its new code. Reusing the old code after disconnect is rejected.

AI discovery covers standard `SCR_EditableCharacterComponent` characters registered in this loaded scene. It does not scan all world entities every tick, track arbitrary vehicles or discover custom AI without that component. Selected humans use controller-bound session leases; reconnects need fresh selection/pairing. Names stay in the local roster; telemetry uses aliases. This is a 60-entity pilot, not proof of 60 real connected players or 120-player support.

## 4. Companion APP: send a reviewed spawn

1. Use your matching resource index in Assets to prepare **reviewed prefab assets**, then assign them to planned units. A catalog name alone cannot be spawned.
2. Units: select 1–16 units. Expand **Deployment preview**, load the matching resource index and set heading.
3. **Review selected units**. Inspect exact GUID-qualified `.et` references, positions, required addons and metadata gaps. A plan, heading or index change blocks sending until reviewed again.
4. **Send reviewed spawn request to game**. JSON export is still only an intention file. Sending leaves your saved planner mission unchanged.

## 5. Reforger GAME: review and execute

1. Host pause pairing panel → **Review GM requests** → **Check pending**.
2. Inspect every entity using Next: resource, world X/Z, heading. Native terrain determines height; this pilot does not map planner color to prefab faction/loadout or run AI orders.
3. **Approve** or **Reject** in the GAME. Only the host panel can approve. Pending requests expire after 60 seconds; an approved request has a 30-second execution window.
4. APP → **Check game request results**. Confirm executed, rejected or failed. Native resource identity must match the GUID+path exactly. Failed partial spawn attempts remove earlier roots from that batch.

## 6. Remove or cancel

- APP: **Cancel pending game request** before approval. Cancellation after approval is rejected because execution may already have started.
- APP: Check results, choose a **Bridge-created group**, then **Request removal**. GAME: review and approve again. Arbitrary mission objects cannot be selected for removal. Current code also blocks groups containing a controlled player; real occupied-vehicle/group behavior needs a live test.
- Removing a prefab root uses the engine's child deletion. Ownership is tracked at the spawned root level; arbitrary later attachment of unrelated entities is not a validated use case.
- Limit: 60 bridge-owned root objects at once, not 60 prefab child actors. There are 100 lifetime command slots in the relay pairing and native scene budget. A new pairing resets relay history; native owned groups/budget last until the scene ends. Remove groups before ending pairing; this pilot does not restore their history across reconnects.
- Stop connection / close the APP revokes the session and stops its tunnel. This does not automatically delete approved spawned objects from the game. Use native GM cleanup or end the test scene.

## Performance and release gate

Ten identical completed 16-unit requests: compact status history **4,001 bytes**, versus **30,871 bytes** retaining full bodies. The same fixture was used for both representations. Older active group choices remain separately available. No map renderer changes were made in this step; no FPS claim follows from this traffic comparison.

Before promoting to a public release candidate, test the actual Host Local panels, humans and standard AI, faction deselection, respawn/disconnect, selected-group occupied-player rejection and normal prefab spawn/removal. Custom prefabs and long session lifecycle remain further coverage. AI orders, weather, triggers, live property adapters and the complete GM workspace are subsequent roadmap work.

## Ready vanilla spawn fixture

The user confirmed mixed Host Local tracking and faction deselection in-game. For the next native spawn gate, the real vanilla US Rifleman reference was resolved and loaded read-only by Workbench. See [the numbered catalog/index workflow](VANILLA-GM-SPAWN-TEST.md). The fixture contains metadata only; it does not replace a plan or modify the Workshop addon.

## Placement correction

Use desktop 2.9.1-dev.gm.2 for native spawning: deployment reverses the +50 m map imagery offset in each axis without moving saved plan markers. Discard old pending requests and review again. No Workshop mod update is required. See [GM-PLACEMENT-FIX.md](GM-PLACEMENT-FIX.md).
