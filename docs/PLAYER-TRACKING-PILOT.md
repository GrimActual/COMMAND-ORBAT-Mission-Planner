# Opt-in player source — unpublished pilot

Workshop 0.3.0 and Companion RC2 support named-entity tracking. This later addon candidate adds an explicit player source; it is not in Workshop 0.3.0. No automatic whole-server feed or 120-player capability is implemented.

## Proposed administrator workflow
1. In Companion RC2, use the existing dedicated allowlist profile and enter the permitted telemetry aliases, such as alpha_player and bravo_player. Connect to create fresh pairing. The reader already understands the same protocol 3 batches.
2. On the dedicated server, use the later player-source candidate. Copy JSOC_ORBAT_Players.example.json into the resolved private profile as JSOC_ORBAT_Tracked.json.
3. Set source to players. Enter current positive server player IDs in playerIds and the matching Companion aliases in entityIds, in the same order, maximum 60. These are session player IDs, not Steam IDs, platform IDs or player names. The server administrator must obtain them from the server’s authorised session tools; this pilot does not expose a roster picker.
4. Put the relay address into endpoint and fresh temporary code into pairingCode; enable the config. Never publish the private file or real credentials.
5. Waiting/disconnected players send no marker. A controlled character creates its alias marker. Character changes/respawns reset the delta baseline. A disconnect retires the authorised slot until fresh pairing; changing player selection also needs a fresh code. Do not silently reuse IDs after server restart.

The resolver checks only configured player IDs with PlayerManager.IsPlayerConnected/GetPlayerController/GetPlayerControlledEntity. It does not enumerate world entities or transmit names/platform identities. The connected controller is the binding; changing that controller retires the slot. Existing 1–2 second rate, 0.5 m delta, full recovery, 60-slot cap and five-second stale rules apply.

## Validation boundaries
PC and Workbench compilation passed using the installed game assets. The standalone HTTPS runtime test passed 10 valid empty heartbeats from the real player source with zero connected players and passed synthetic production lease inputs (join, missing controller, respawn continuity, disconnect retirement and changed controller). No native script or renderer errors; mission unchanged; sampled peak server memory about 582 MB. Session revoked, server/tunnel stopped and private sender disabled. It does not prove real player joins, respawns or reconnects. A live client test is required before publishing this candidate as player support. Published RC2 and the clean Workshop 0.3.0 folder are preserved.

The first compile attempt used standalone-server assets for Workbench and crashed before compilation. Correcting the asset directory restored successful validation; no crash dump or personal logs are committed.

API reference: https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfacePlayerManager.html
