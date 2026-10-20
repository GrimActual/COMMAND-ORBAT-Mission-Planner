# 60-entity tracking pilot

Unpublished development candidate. RC1 and Workshop 0.2.0 remain single-entity builds. This is explicitly authorised named-entity tracking, not automatic whole-server player tracking. The future 120-player goal is not implemented.

## Companion application
1. Open Settings → Live bridge → Server profiles / Dedicated server.
2. Choose Dedicated server, Free temporary tunnel (or your trusted HTTPS relay), and Named entity allowlist.
3. Enter one unique telemetry ID per line, maximum 60. Use a 1–2 second interval. Save profile keeps settings without credentials.
4. Connect profile. Give the current address and temporary code privately to the server administrator. Keep Companion and its relay PC awake.

## Dedicated server
1. Install the matching tracking pilot addon and protocol 3 relay. Workshop 0.2.0 cannot send batches.
2. Copy JSOC_ORBAT_Tracked.example.json into the resolved private server profile folder as JSOC_ORBAT_Tracked.json. With `-profile A:/ServerTest`, this is `A:/ServerTest/profile/JSOC_ORBAT_Tracked.json`.
3. Put Companion’s address in endpoint and code in pairingCode. Set entityNames to exact unique scenario names and entityIds to the corresponding Companion IDs in the same order. Names and IDs must use letters, digits, underscores or hyphens, maximum 64 characters. Maximum 60 pairs.
4. Enable the config. The sender periodically reads it. Disable the old single-entity sender when using this mode. Never upload the private config, address or code to Workshop.
5. Confirm Companion receives positions. Find live marker fits the received entities. Stop connection revokes the session; use a fresh pairing after revocation.

## Behaviour and evidence
Configured names are resolved and cached; there is no whole-world scan. Updates are limited to 1–2 seconds. Coordinates change after at least 0.5 metres of horizontal movement. Every heartbeat lists active IDs, keeping stationary entities alive; periodic full snapshots and gap recovery restore the baseline. Explicit removal hides a marker immediately; missing telemetry expires after five seconds. Replayed packets cannot refresh stale data.

The real standalone-server HTTPS test received 60 synthetic entities, retained stationary entities, updated a moved entity, and removed a deleted entity (59 remaining markers). Saved mission unchanged; no renderer errors; sampled peak server memory about 582 MB. This bounded test is not a long-running live-player load test or a 60 FPS guarantee. Test relay was revoked, tunnel and server stopped, private sender disabled.

PlayerManager.GetPlayers/GetPlayerControlledEntity is a future efficient player source. It still requires administrator opt-in, stable session identity, respawn handling and the same cap/rate controls before inclusion.
