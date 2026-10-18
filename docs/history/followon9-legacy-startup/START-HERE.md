# COMMAND COMMAND ORBAT / Mission Planner — 2.9.0 RC2

## Install or upgrade
1. In your previous planner, click Save Backup and check the downloaded JSON.
2. Close the previous planner. Extract the ENTIRE application ZIP into a new folder.
3. Run COMMAND Planner.exe inside that folder. Keep resources, locales, DLLs and other files alongside it.
4. This candidate uses the same local profile as the previous OneClick Bridge build. If your operation does not appear, use Import plan with your backup. Previous release folders have not been changed.

## Connect to Reforger / GeForce NOW
1. PLANNER ON YOUR PC: gear → Live bridge → Start free connection. Wait for Ready; startup depends on the tunnel service.
2. GAME: enable the published COMMAND ORBAT Bridge mod and host your scenario. Press Escape to open COMMAND – HOST PAIRING.
3. PLANNER: Copy address. GAME: paste it into the FIRST field (address).
4. PLANNER: Copy pairing code. GAME: paste it into the SECOND field (code), then click CONNECT.
5. GAME: resume and spawn or possess a soldier. PLANNER: Find live marker centers the map on the latest position.
6. The orange LIVE status belongs to the real bridge. SIMULATION OFF refers only to the separate practice simulator.

Keep the planner PC awake and connected. Only the host-controlled character is shared. This does not import all units, AI, vehicles or mission AOs. The existing published mod is compatible; no mod reupload is needed for this planner update.

## Stop or reconnect
Settings → Live bridge → Stop connection ends the helper started by this planner. Closing/reloading the app also stops it. Closing Settings does not stop it. If the tunnel ends or the public code expires (one hour), Start free connection again and copy BOTH the new address and new code into the game. Temporary tunnels are free, require no hosting account/card, and have no uptime guarantee.

## Help and practice
Ask Sarge contains 29 searchable topics and Show me where links. Search live bridge, GeForce NOW, simulation, backup, CSV, HVT, scale, phases or export. The new guides are available in English, French and German; some technical status messages remain English.
Settings → Simulation uses synthetic units only. Simulation controls apply immediately. Simulation and live positions are excluded from saved project data, presentation exports, selection and undo.

## Release review
This is a release candidate. Automated checks passed; give the exact ZIP one short in-game smoke test before labelling it stable. Backups are manual; applied plan edits autosave locally, but scheduled backups and corrupt-storage recovery are not implemented. This update does not add Windows code signing or guarantee removal of SmartScreen warnings.
