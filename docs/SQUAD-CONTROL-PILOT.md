# Existing AI squad control — followon.5 / bridge 0.9.0 candidate

This development candidate adds host-reviewed recruitment of existing selected AI squads, release without deletion, and bounded Follow of an explicitly selected same-faction player. It preserves the 60-entity tracking cap. It does not add vehicle, formation, stance, fire-control or building-entry commands.

## Use the matching pair

Use Companion 2.9.1-dev.followon.5 and the prepared COMMAND ORBAT Bridge 0.9.0 project. Publish the project to existing Workshop ID 6A969EB0C5012BB9, update the game addon, restart the hosted session and make a fresh GM-enabled pairing. GitHub publication does not update Workshop automatically. Older bridge versions keep the new controls disabled.

1. GAME: Host Pairing → Players / AI / factions. Enable the desired faction and AI/Humans, refresh and select the AI member and player you want to use. These share the existing 60 tracking slots. Connect and resume.
2. APP: Native AI orders → Refresh command targets and results. Click a live AI marker, or select Recruit existing AI squad and choose its live identity. This represents its whole standard AI squad, not just that soldier.
3. Review AI order, send it, then GAME: Check pending request and approve recruitment. No order executes before approval.
4. APP: Refresh again. Choose the recruited controlled squad. Move, Hold, Defend and waypoint routes retain their existing review flow. Clicking an already recruited member selects its controlled target.
5. For Follow selected player, choose the player and a duration of 5–300 seconds, review, send, and approve in the game. The native Follow prefab is bound to that exact character; expiry, lost selection, respawn or faction mismatch cancels the Follow order. Reissue after respawn. This is not a guessed remote “me”.
6. Release squad control also requires review and game approval. It removes Companion-owned waypoints, retains the squad, and removes the control target from the refreshed app list. It never grants permission to delete existing squads.

## Boundaries

Recruitment accepts standard editable on-foot AI squads with 1–16 members, a resolved common faction, no human-controlled member, and no foreign waypoints. Every execution rechecks current native state. Selection/faction changes revoke the recruited control lease; release remains available to clear it. A relay target list is a last acknowledged result, not proof the target is still eligible. The native server decides eligibility at execution.

Follow leases are independent for each squad, including multiple squads spawned in one batch. A 1 Hz bounded check covers at most 60 controlled roots. Only COMMAND-owned waypoints are cleared. Saved mission positions, scenario state and Undo/Redo are not modified. Tracking still sends at its configured rate; no global map scan was added.

## What was verified

Native script compilation passed in the isolated standalone diagnostic server. A loopback fixture recruited an existing synthetic fireteam, bound a native SCR_EntityWaypoint to an explicit target, expired Follow, cancelled it after target loss, accepted Move afterward, released control without deleting the group, recruited it again, rejected a revoked selection, and released the revoked lease. AI and physics were paused in that terrain-free lifecycle fixture; the synthetic target stood in for a player. These checks do not prove real-player following, formation or travel/arrival on terrain.

The first unpaused empty-world attempt selected the native ActivityFollow behavior but hit an engine failed-movement diagnostic because the fixture has no navigation mesh. That run was not counted as passing navigation validation. Normal terrain, real players, respawn, combat and extended multiplayer acceptance remain pending.

Actual offline Electron checks cover a live-marker click, recruitment/Follow/release review and submission, stale live-selection rejection, escaped player names, EN/FR/DE, older-mod capability gating, and unchanged mission data. No game client or public tunnel was launched.

Pairing shutdown was also checked: control records returned to zero, the existing squad stayed alive, and recruitment succeeded again. Full local regression: 855 tests, 854 passed, 1 skipped, 0 failed. The skip is the unavailable local independent preprocessor. A short 60-marker sample measured 57.66–60.34 FPS, p95 16.8 ms, no stalls over 100 ms, and map DOM 512 → 512 after 100 overlay cycles. These samples do not certify sustained multiplayer performance.
