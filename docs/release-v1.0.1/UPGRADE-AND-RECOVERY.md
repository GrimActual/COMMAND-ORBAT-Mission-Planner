# Upgrade and recovery

1. In the old app, export your plan and, if used, its complete mission package. Save catalog/index files you imported. Keep the old installation.
2. Close the old app, extract the whole COMMAND-1.0.1-Windows.zip to a new folder and launch COMMAND-Windows/COMMAND Planner.exe. Do not overlay another build. Version 1.0.1 is the public stable planner edition following earlier 2.x development builds; saved-data schema and settings location are unchanged.
3. Settings remain in the existing Everon-ORBAT-OneClick-Bridge user-data location for compatibility. No automatic connection, deletion, reset or migration is performed at startup.
4. New mission clears the planning workspace; one Undo restores it. It keeps the connection, available asset metadata and game entities. Removal and cancellation are separate approved actions. Importing another mission also requires review and spawns nothing by itself.
5. Optional live controls require the installed matching bridge 0.13.1 on the relevant game/server. Preserve project ID 6A969EB0C5012BB9 and use one addon copy. The included project is publication source, not a claim it has been published to Workshop. Do not rename/relicense third-party or game assets.
6. To roll back, close v1.0.1 and launch the old installation; restore your exported backup if needed. Ordinary schema 4 plans remain supported; schema 5 pose provenance or newer mission packages may not be understood by an older reader. Keep an untouched original.
7. Quick connection owns its tunnel. Disconnect dashboard and End session have different meanings for a server-managed relay; use End session only when you intend to revoke the session. Never paste keys into public reports.
