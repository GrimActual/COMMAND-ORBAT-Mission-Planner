# Server, Workshop project and scenario files

The bundle includes the matching Bridge-0.15.0/addon.gproj project. Use the existing project identity and dependency; do not enable two addon copies with the same identity. Validate and publish through Workbench when updating Workshop, and configure the server to require the actual published item/version. This bundle does not establish the current Workshop publication status or invent a Workshop item ID. Restart the hosted session after a mod update and check the actual published Workshop version before pairing. A separate HTTPS relay must use the matching relay source, not merely a new desktop UI.

## Tracking configuration is not execution approval

The Guides/Config-Examples folder provides disabled examples for JSOC_ORBAT_Dedicated.json, JSOC_ORBAT_Tracked.json and JSOC_ORBAT_Players.json. Choose the explicit sender workflow supported by your scenario. Dedicated is the older named-entity path; Tracked uses selected named entities; Players uses explicit player IDs. Do not enable overlapping senders blindly. Copy a chosen example into the server's resolved $profile: folder and configure the current relay address/code and explicit allowed identities. Keep real credentials private and out of Workshop/repository uploads. The example endpoint and empty or placeholder codes are not working credentials.

Check the server log's mounted profile path. The documented fixture used -profile A:/ServerTest with $profile: mounted at A:/ServerTest/profile. A hosting provider can have a different mount. The bridge performs the disk operation on the game server; Companion needs no direct filesystem access.

Tracking configuration alone grants no execution approval. The optional COMMAND_ORBAT_ServerGM.json runner separately enables server-local command polling and explicit per-pair scoped approval. See 07-HTTPS-HOSTING.md. Snapshot operations stay manual; local file inbox polling is not implemented.

## Save and restore

For a planned deployment, Game controls → Deploy → More deployment tools → Save reviewed planned deployment to server stores the approved intention. It does not capture actors or spawn anything.

For current supported entities use Game controls → Server → Server scenario snapshots. Review selected owned entities, send and approve the save. The bridge writes COMMAND-Scenarios/<snapshot ID>.json inside its server profile and reports success/failure and filename. Stable IDs, exact prefab references, supported positions/headings/factions and supported orders are recorded. This is a bounded COMMAND snapshot, not a complete game save.

Current capture supports owned on-foot infantry groups and supported individual infantry and empty/unreserved supported vehicles; recruited groups, human actors, active transport/convoy/treatment and arbitrary engine state are excluded. For restore, review the saved ID, inspect required addons/prefabs and the summary, then send a separate restore request and approve before spawning. Restart does not automatically restore files. Unsupported/malformed files fail; do not bypass validation or manually assume addon availability.

Use the matching bridge 0.15.0 for individual-character snapshots; earlier unsupported bridges may not restore their character-root control groups. Feature references distinguish fresh native tests from historical evidence and do not certify connected-human or combat acceptance. Local file polling remains unimplemented and does not silently replace HTTP.

[Start](00-START-HERE.md) · [Compatibility](04-COMPATIBILITY.md)
