# Stable promotion — remaining operator acceptance

Record candidate desktop version, actual Workshop version, world, host/dedicated setup, date and this package SHA-256. A green isolated-server test is not two-client acceptance. Never mark a failed or unperformed step passed.

## Exact live checks the operator must perform

1. Publish/update the included Bridge-0.12.1 project to the existing Workshop item. Confirm 0.12.1 actually loads on the server and both game clients; enable one copy only. Keep desktop 2.10.0-rc.1 and the included relay. Restart the scenario.
2. Join with two human clients. Start an explicit GM-enabled pairing with narrow tracking scope. Confirm selected identities/positions on COMMAND; unselected identities must not appear. Disconnect/reconnect one player and respawn one player: old identity/authority must not silently transfer to a different actor.
3. With manual approval, deploy one supported individual soldier and one supported fireteam to clear walkable ground. Confirm the request remains pending until the host approves. Count actual actors on both clients. Refresh targets, send Move about 30 m, approve and observe actual arrival for each. Hold, then Move again; crouch then Auto. Record displayed outcomes and actual behavior separately.
4. Try a protected player-controlled or player-occupied target. It must reject unsafe AI control/removal and preserve the human actor. Remove only the bridge-owned test deployment after approval; verify both clients see the removal and unrelated entities remain.
5. Enable only automatic AI orders in the native host/server controls. Confirm COMMAND reports the confirmed mode. An eligible AI request can progress automatically; spawning/removal must still wait for their own approval. Disable auto-approval, then fresh-pair: default manual must return. Do not use unreviewed live mission entities for this check.
6. For server-managed hosting, securely retain the private dashboard key. Disconnect dashboard and reconnect with the same HTTPS address/key: same session and owned targets must remain. End session, then verify the old key/pairing rejects. Rebooting a relay is not persistence and requires a fresh session.
7. Save the current supported COMMAND test deployment to the server; note the returned filename. Restart the test scenario, review the saved file and confirm review spawns nothing. Separately approve restore, then inspect headings/positions/factions and a saved supported formation/order. Remove only the restored test batch. This is not a whole-world save.

## Pilot exclusions

The historical boarding timeout is unexplained; no fixed/stable boarding claim is permitted. Broader vehicle/treatment/convoy/combat acceptance remains separate. Strict no-fire-under-attack and universal two-way editor control are not accepted capabilities. Optional read-only 3D needs a permitted matching elevation dataset; test world alignment before operational use. Workbench Apply is unavailable.

Any failed required live check blocks stable publication. Provide exact steps, world/entity prefabs, displayed result and private logs with secrets removed. After all required package and live gates pass, promote the approved artifact/source pair; changed artifacts require affected checks again. No normal game client is launched by the packaging tools.

## Imagery distribution boundary

The candidate excludes legacy offline satellite JPEG tiles from runtime and source archives. No redistribution permission is asserted. Optional permitted local tiles and custom 3D imagery are described in Guides/08-IMAGERY.md. Verify clean offline grid planning and the no-imagery 3D fallback on the final artifact. Existing user images remain untouched.

## Focused 0.12.1 recheck

Confirm 0.12.1 in the native pairing heading. Review GM requests must show three visible category buttons. Toggle SPAWNING ON and wait for Companion's confirmed spawning policy, then send one small supported test spawn: it must execute without manual approval. Click Disable All: all three labels become OFF, native state becomes manual, and Companion confirms all categories OFF. Send another test request: it must remain pending until manually approved. Toggle AI ORDERS and REMOVAL individually to confirm independent state. Snapshots remain manual throughout. Resume briefly if the game pauses simulation; record physical outcomes separately. This recheck does not replace the outstanding multiplayer/respawn/boarding checks.
