# Squad settings pilot — followon.6 / bridge 0.10.0

This candidate adds reviewed formations, persistent squad stances and native fire policies. It retains existing tracking, recruitment, release, bounded Follow, Move, Hold, Defend and routes. Tracking remains capped at 60 selected entities. Bridge 0.9.0 remains a separate preserved project and does not gain these settings automatically.

## Setup and use

1. Publish the prepared COMMAND ORBAT Bridge 0.10.0 project to existing Workshop ID 6A969EB0C5012BB9, update the addon in the game, restart the hosted session and make a fresh GM-enabled pairing. GitHub does not publish Workshop.
2. Use Companion 2.9.1-dev.followon.6. Native AI orders → Refresh command targets and results → choose a controlled infantry squad. Recruit an existing selected AI squad first, or use a bridge-created infantry group.
3. Choose Set formation, Set squad stance or Set native fire policy. Select the value, Review AI order, Send, then check and approve it in Reforger. No command executes automatically.
4. Refresh results and inspect the squad in-game. A successful result confirms native setting readback, not arrival, physical spacing or a combat outcome.

### Formations

Column, Staggered Column, Wedge and Line are verified against the tested vanilla group definitions. Restore previous formation restores the baseline captured before the first Companion formation change. A missing definition is rejected with the previous formation restored. A formation changed outside Companion is retained on release. Diamond, Circle and terrain-adaptive Auto remain roadmap work; no unsupported definition is guessed.

### Stances

Stand, Crouch and Prone use the native group/character AI settings system, not an animation-only character-controller call. Auto removes only the exact Companion setting. Native group propagation covers existing members and membership changes. A higher-priority editor setting blocks a conflicting request and is preserved through release.

### Fire control

Open Fire, Hold Fire and Return Fire map to distinct native policies. Auto removes the owned setting and restores the captured prior external policy when it still belongs to this override. The native actual policy readback distinguishes Hold Fire from Open Fire; Return Fire is currently Hold Fire while not under attack. Strict no-fire behavior when receiving damage has not been combat-tested. Do not advertise that acceptance claim yet.

## Lifecycle and authority

Existing selected-squad, faction, on-foot AI membership, host approval, expiry, capability and foreign-waypoint guards remain in effect. Settings are independent of movement waypoints and survive an ordinary move/route replacement. Release, pairing shutdown or invalidated control removes owned settings. Existing mission/editor settings are retained. Saved mission data and editor Undo/Redo are untouched. Older bridge versions leave these settings disabled.

## Verification

- Full local regression: 857 tests, 856 passed, 1 skipped, 0 failed. The local skip is the unavailable independent preprocessor. An unrelated one-second backend test-cache fixture expired under load; its fixture lifetime was corrected while keeping the explicitly expired entry.
- Native compilation and 18 synthetic request outcomes passed. Readbacks cover four formations plus restoration, all four stance choices, all four fire choices, higher-priority editor rejection and release cleanup. Member transfer removed the stance override from the departing AI and propagated it again on rejoin. Release retained the foreign editor stance, restored the fire policy, and kept the existing squad alive.
- The native fixture paused AI/physics in a terrain-free world. No real players, terrain travel, physical formation spacing, under-fire response, vehicle occupants or building navigation were validated. No game client or public tunnel was launched.
- Actual offline Electron exercised all 13 setting choices, stale-review invalidation, escaped target names, EN/FR/DE, older-mod gating and unchanged mission state. Longer help is collapsible.
- Matched short 60-marker samples stayed near 60 FPS with p95 16.8 ms and no stalls over 100 ms in either build. One hundred overlay cycles left map DOM 512 → 512 in both. These are short observations, not a sustained-session or causal speedup guarantee.

Vehicles, support, suppression/look-at, building entry and the wider compiler/campaign roadmap remain open.

A final targeted native cleanup check also preserved an editor Hold Fire setting that had the same value as the Companion setting. Cleanup checks exact setting ownership as well as the value; the owned setting was removed while external and actual fire policy both remained Hold Fire. The earlier 18-outcome lifecycle receipt retains its original source hashes; this final guard has its own module hash and targeted result.
