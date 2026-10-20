# Experimental helicopter insertion

Compatible experimental integration: desktop 1.0.0, bridge project 0.13.0 and included relay. This is an optional force-assisted vanilla UH-1H adapter, not native autonomous-pilot pathfinding. Other aircraft remain disabled. The ordinary offline planner works without it.

Use the [three-root test pack](../../examples/helicopter-insertion-test/00-START-HERE.md): it contains a named helicopter, individual AI pilot and actual four-person fireteam, matching catalog/index and a marked LZ. Importing it changes planning data only. Back up your current plan first.

Prepare one reviewed occupied deployment: helicopter vehicle, pilot in an automatic pilot seat, complete fireteam in automatic cargo seats. Check successful actual occupancy before proceeding. This avoids the walking-to-vehicle workflow; it does not fix its historical timeout. Flight is a separate reviewed request and always needs manual host approval.

Game controls → Orders → Helicopter insertion — experimental: refresh targets, select the owned aircraft/team, mark the LZ, confirm the inspected route, review and send. No flight action occurs on import or review. Unsupported bridges keep the card disabled.

Initial envelope: one pilot and four cargo passengers, inspected clear/flat 20–100 m route at approximately departure terrain elevation. The controller uses about 8 m above departure body origin, not a universal skid-AGL clearance. Terrain samples cannot detect buildings, trees or traffic. No obstacle avoidance or realistic banking is claimed.

Success requires physical flight, sustained ground contact/low motion, four completed native animated exits and the pilot retained aboard. COMMAND reports measured phases; request acceptance alone is not success. Native result text can remain English in all app languages.

Cancel airborne keeps assistance until landing at the already approved LZ and retains passengers. Once unloading begins, exits cannot be recalled. Any human entering any aircraft seat releases assistance immediately; observers stay outside. Competent pilot takeover still needs live acceptance. Physical destruction, process restart or unavailable simulation cannot guarantee a safe recovery.

Disconnect dashboard leaves a server-managed session and approved flight running; reconnect to the same authorized session to recover its result. End session/revoke pairing requests controlled cancellation. A relay restart does not restore its in-memory session. These controls do not edit mission JSON or Undo history.

Live gates: matching Workshop version actually loaded, two-client observation, physical pause-menu approval/auto-approval controls, pilot takeover and disconnect/reconnect. The experimental adapter is not a stable multiplayer claim. Land first, close this app, then return to the preserved installation if necessary; retain plan backups.
