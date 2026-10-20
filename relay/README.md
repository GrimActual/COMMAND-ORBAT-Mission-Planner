# COMMAND HTTPS relay — 1.0.0 — experimental live integration

Use with stable planner 1.0.0 and experimental bridge 0.13.0. HTTP polling is implemented; WebSockets, process-restart persistence and multi-admin roles are not. Sessions and queues live in memory. Closing a remote dashboard is different from ending/revoking its session.

## Quick connection — this computer

COMMAND starts its own loopback relay and verified cloudflared helper. It issues pairing credentials after tunnel registration, then checks public HTTPS reachability in the background; a warning remains visible if reachability is unconfirmed. Disconnect or application shutdown stops only its owned processes. This folder is not needed to run that built-in workflow.

## Dedicated relay — server managed

Install Node 22 or later (Node 24 used for acceptance checks). Run `node dedicated-server.js` from this folder. Default binding is 127.0.0.1:8080. COMMAND_RELAY_PORT changes the port; COMMAND_RELAY_HOURS selects integer hours 1–24 (default 1) when starting. Point an administrator-managed HTTPS reverse proxy/tunnel at that loopback listener. Keep tunnel credentials private. Do not expose an unprotected origin listener directly.

In COMMAND Settings → Live bridge → Server profiles select Dedicated relay — server managed, enter the HTTPS root, choose a narrow tracking allowlist and explicitly enable reviewed GM requests if required. Securely copy the private dashboard key before disconnecting. Reconnect dashboard requires the same root and key and protocol-3 tracked session. The key grants command authority; a shared URL alone does not. Keys stay out of mission and profile exports. Disconnect dashboard leaves the server session running. End session waits for acknowledgement and revokes it. A relay process restart loses sessions and requires new pairing.

The included Dockerfile runs server.js for a separately secured hosting environment; publish its container port on host loopback when using a local tunnel. `node dedicated-server.js` is the default server-box setup described above. Configuration examples contain no live credentials.

## Host authority and testing limits

Native host/server controls hold approval authority. Manual approval is the default; automatic AI/spawn/removal categories are separate and retain validation, caps, ownership, duplicate and player protections. Snapshot operations remain manual. Rebind private dedicated approval settings to each fresh pairing. Read Guides/07-HTTPS-HOSTING.md in the complete package for the server configuration and manual review flow, or planner/operator-guides/07-HTTPS-HOSTING.md in the source archive.

Isolated native public-HTTPS command exchange and mixed snapshot process restart were verified on this PC. They do not certify human multiplayer, combat behavior or the unexplained historical boarding timeout. All relay/live controls remain experimental; complete LIVE-CHECKLIST.md before claiming broader gameplay acceptance. Keep this relay version together with its matching bridge and desktop; do not merge files from historical development archives.
