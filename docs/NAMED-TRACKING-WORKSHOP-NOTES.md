# COMMAND ORBAT Bridge 0.7.0 — named tracking

Adds negotiated live identity metadata: player names from PlayerManager, actual in-game faction keys and player/AI/vehicle/object classifications. Matching Companion 2.9.1-dev.followon.3 displays named faction symbols. Catalog US/BLUFOR and Soviet/OPFOR grouping is organizational only and never forces live ownership.

Older relays retain coordinate-only tracking: the sender enables metadata only after an accepted batch explicitly advertises support. Stationary name/faction changes are transmitted; the shared 60-entity cap, 1–2-second cadence, approval controls and existing troop orders remain unchanged. No automatic whole-world vehicle discovery is added.

Native game scripts compiled successfully in the standalone diagnostic server. An isolated loopback test observed initial anonymous tracking, negotiated identity and a stationary synthetic object rename. Workbench startup crashed before validation; real multiplayer player-name/faction acceptance remains to be checked. No game client or real players were used in these tests.

Publish this project to existing Workshop ID 6A969EB0C5012BB9, version 0.7.0. Update Companion and the mod, restart the hosted session and create a fresh pairing. Existing 0.6.0 project is preserved.
