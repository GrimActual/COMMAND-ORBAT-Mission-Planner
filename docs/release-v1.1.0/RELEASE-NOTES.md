# COMMAND 1.1 — Mission Planning & Control

Stable scope: offline mission planning and planning-data workflows. All live-game controls remain experimental. Requires bridge **0.15.0** for matching experimental integration; bridge binaries/source are unchanged from the accepted candidate, so this desktop consolidation does not require a new Workshop upload.

## Highlights

- One-file mission import/export, unified asset/planned/deployed/tracked workspace and whole-mission multi-faction deployment review.
- Clear stage/root/group counts, serial batches, stop remaining work, reviewed resume and pairing-owned cleanup.
- Safer imports and explicit recovery, truthful failed-save state, discarded stale async results and same-ID uncertainty handling.
- Hardened tunnel cancellation/retry and Close/Quit confirmation races.
- Updated Settings, Sarge and English/French/German guidance.
- Experimental exact aircraft profiles, selectable speed, waypoints and session-bound patrol remain available with their existing evidence limits.

## Verification

Focused exception/storage/async/queue/connection/close checks, actual offline desktop checks, a 60-cycle repeated-use soak and matched populated performance comparison passed before packaging. The burst fixture used 60 tracked identities and 1,200 synthetic updates, retaining selection without plan writes. Final executable/package acceptance and checksum verification are required before publication.

Synthetic outcomes and historical isolated native receipts do not prove real multiplayer acceptance. Two-client multiplayer, human takeover/player lifecycle, varied flight loads/speeds/long routes and obstacle clearance remain pending. No fix is claimed for the historical walking-to-vehicle boarding timeout. General existing-aircraft/vehicle registration, reactive avoidance, combat flight, WebSockets and relay restart persistence are not added.

## Upgrade and recovery

Save Backup first. Extract the full Windows ZIP into a fresh folder; preserve the previous version. Plans and settings retain existing formats. Import mission loads the plan/catalog/setup, not a live session. Reconnect explicitly. Startup does not replay requests. After uncertain delivery, check the original result before retrying the same ID. Closing is not cancellation or an airborne emergency stop.

Game models, imagery and elevation are not bundled. Install required aircraft addons separately. See included Guides, Vanilla-Assets, source, licences, manifest and SHA256SUMS.txt.
