# HTTPS relay hosting and approval controls (development)

Quick connection — this computer starts COMMAND's own loopback relay and temporary tunnel. Disconnecting or closing COMMAND stops those owned processes.

Dedicated relay — server managed connects to a separately installed relay through its HTTPS root address. Disconnect dashboard and application shutdown leave that relay session running. End session requires a relay acknowledgement and revokes the pairing. It does not stop an externally managed tunnel or delete saved plans or snapshots.

## Server setup

Run `node relay/dedicated-server.js` on the server. It binds 127.0.0.1:8080. Set COMMAND_RELAY_PORT if needed; COMMAND_RELAY_HOURS accepts integer hours 1–24 (default 1). These settings take effect when the relay starts. Configure an administrator-managed Cloudflare tunnel to forward its public HTTPS root to http://127.0.0.1:8080. Keep the origin loopback-only. Cloudflare credentials stay with the tunnel administrator.

In COMMAND → Settings → Live bridge → Server profiles choose Dedicated relay — server managed. Use a named allowlist and explicitly enable reviewed GM requests. Connect the profile, then securely copy its private dashboard key before disconnecting. Reconnect dashboard uses that HTTPS address and key; it retains the same session, request history and ownership. Keys are not saved in profiles or missions. Reattachment currently requires tracked protocol 3, not legacy single-entity sessions. Possession of this key grants dashboard control; multiple-administrator roles are not implemented.

For server-local command execution, put the following in the resolved server profile as COMMAND_ORBAT_ServerGM.json. Replace pairingCode with COMMAND's displayed game pairing code. Do not put credentials in a Workshop project, release or public log.

```json
{"enabled":true,"endpoint":"http://127.0.0.1:8080/","pairingCode":"REPLACE_WITH_32_CHARACTER_GAME_CODE","approvalPairingCode":"","automaticAIOrders":false,"automaticSpawning":false,"automaticRemoval":false,"manualApprovalRequestId":""}
```

The optional server GM runner uses the existing owned-entity execution handlers. Live tracking still uses the separately configured JSOC_ORBAT_Tracked.json sender. Recruitment/follow of selected live entities requires the Host Mixed selection owner; the standalone server runner does not provide that selection and must not be described as universal AI recruitment.

## Approval

Manual is the default. A local game host can toggle AI orders, spawning and removal independently in the native GM review controls. Disable all auto-approval stops future automatic approvals, not an already approved/running operation. Pairing and Stop reset the host controls to manual.

For dedicated server automation, explicitly set approvalPairingCode to the current pairingCode and enable only the desired categories. Bind permissions again for each fresh pairing. Missing, malformed or disabled private configuration stops the runner. An expired or revoked pairing cannot automatically regain ownership from the unchanged file.

For manual server approval, inspect the full last received request in $profile:COMMAND-Pending-Review.json, then set manualApprovalRequestId to that exact request ID while it remains pending. This is a local administrator action; the dashboard cannot approve itself. Review is stale once the request expires. Scenario save/review/restore operations always require manual approval in this implementation.

The native bridge requests relay approval and waits for acknowledgement before the existing execution handler runs. The relay records manual/automatic approval with the result. All existing caps, ownership checks, player protections, request expiry, duplicate handling and operation scheduling remain mandatory. Companion displays the last confirmed native policy; missing/stale contact displays Approval mode unconfirmed. The display is information, not authority.

## Limits and verification boundary

Sessions and queues remain in memory and expire; this is not restart persistence. The new runner is experimental pending real multiplayer and public Cloudflare acceptance. HTTP loopback diagnostic tests do not prove public HTTPS connectivity. WebSockets, larger capacity tiers and multi-admin authorization are separate future work. No new release version or Workshop publication is implied by these source changes.


## Public HTTPS readiness

A Quick connection checks its public HTTPS health before showing a pairing code. Tunnel registration alone does not prove the address is reachable. If DNS lookup fails or the public relay cannot be reached, no code is issued and COMMAND closes its owned helper. Retry later or use a working server-managed relay. This does not change your computer DNS settings or your mission.

COMMAND waits up to two minutes for public HTTPS health before issuing a pairing code. Public diagnostic command exchange passed on 20 October; real multiplayer acceptance remains separate.
