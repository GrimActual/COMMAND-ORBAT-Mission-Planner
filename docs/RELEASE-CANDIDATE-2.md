# COMMAND — ORBAT / Mission Planner 2.9.1 RC2

RC2 adds experimental dedicated tracking of up to 60 explicitly named entities and a reviewed deployment preview. It preserves offline planning and the previous Host Local character feed. It does not implement automatic 60-player tracking, 120-player support or native spawning.

## Start here
1. Extract the whole Windows ZIP into a new folder. Run **COMMAND Planner.exe** there. Keep your old installation and plan backups.
2. Import your saved plan or continue offline. Connections and rehearsals never start automatically.
3. For dedicated allowlists, update the Workshop bridge to 0.3.0 and use the matching protocol 3 relay bundled with RC2. See TRACKED-ENTITIES-PILOT.md. Existing Workshop 0.2.0 remains suitable for the previous single-entity feed.
4. Deployment preview is in Units and Settings. Select 1–16 units with reviewed prefab references, load a matching resource index, review and save an intention JSON through the Save dialog. The game does not execute it.

## Server administrator handoff
The bridge source ZIP includes the clean addon project; WORKSHOP-UPDATE-0.3.0.md describes publishing. JSOC_ORBAT_Tracked.example.json is disabled by default. Put address/code and matching entityNames/entityIds only in the private server profile. Never publish those credentials.

## Validation and limits
Native compilation and the real 60-entity HTTPS test passed (movement, stationary presence, deletion, mission isolation). The desktop deployment workflow passed native save, stale rejection, safe text and EN/FR/DE context checks. Short renderer samples are not busy-server performance guarantees. Live-player joins, respawns and long-running missions remain further testing. The Windows executable remains unsigned.

Sarge includes 47 translated topics. Setup, publishing and debrief guides accompany the package. RC1 archives remain available.
