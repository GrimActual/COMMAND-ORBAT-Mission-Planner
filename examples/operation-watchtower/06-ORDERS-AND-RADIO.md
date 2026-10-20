# Operation Watchtower - live orders and radio cards

Read the Brief panel for the full mission. All below are GM-directed actions; map routes are not automatically active. Use current native target identities returned for this pairing, never example/stale request IDs. Each listed request needs review and native approval unless the host deliberately enabled its eligible automatic category.

## 1. Assembly / boarding

Radio: "All stations, ACTUAL. Watchtower is active. Check vehicles, count your people and report ready. EAGLE remains on the ground."

- Refresh **Game controls -> Orders** and run **Check squad execution** on ALPHA; inspect actual group/leader/activation before movement.
- Open **Transport & treatment -> Squad transport (pilot)** (or the Units transport panel). Refresh targets, inspect **BISON 1** seats. Choose **BISON 1 CREW** and **BISON 1**, Embark, enable driver/gunner/cargo roles only if the inspection reports valid seats. Review, send, approve and observe actual boarding. Repeat **BISON 2 CREW -> BISON 2**, allowing driver/cargo as appropriate. Seat counts and faction must pass native checks.
- Inspect **EAGLE** while empty and parked. Choose **CHARLIE -> EAGLE**, cargo roles only. If capacity is insufficient, do not force the order. Pilot uses a separate **EAGLE PILOT -> EAGLE** driver-seat request only if native inspection permits it. Co-pilot seating is not an explicitly selectable COMMAND seat role: use normal GM controls if the reported eligible seats do not identify the desired slot. Record all such fallback actions. Keep EAGLE stationary; no flight order is sent by COMMAND.
- Treat timeout/rejection as a failed boarding test, not success. Leave affected troops on foot and proceed with the ground route if needed.

## 2. Checkpoint North

Radio: "ALPHA, move to Checkpoint North. BRAVO, cover the eastern shoulder. BISON, hold until crews confirm mounted."

Select live **ALPHA**, Move to the centre of **CHECKPOINT** (world X4700 / Z12000), review/send/approve. Wait for physical arrival. Hold for **30 seconds**, then issue Move again later to verify Hold does not leave the group stuck. BRAVO moves to **OVERWATCH** (X4780 / Z12030). Try Wedge then Column; crouch then Auto while stationary and record what members actually do.

For the vehicles, use **Vehicle driving and convoys (pilot)**, not infantry movement. Select the exact crew/vehicle pair after complete boarding and confirmed owned driver. Add a short inspected drivable waypoint (for example X4800 / Z11950) and **SUPPORT HOLD** (X4800 / Z12000); change points if they are not drivable in the live world. Review/send/approve, observe ordered arrivals. A convoy follower is optional only when advertised as supported; keep adequate separation. No route is claimed road-aligned by this file.

## 3. Relay / dynamic decisions

Radio: "ACTUAL, ALPHA. Checkpoint held. Continuing to relay."

ALPHA moves to **RELAY** (X4700 / Z12150). BRAVO holds overwatch or follows **WEST ALTERNATE** (X4580 / Z12080) when the direct approach is blocked. Inspect each route, review/send/approve. The GM decides which branch matches the observed game.

Optional contact: import **04-OPTIONAL-OPPOSITION-PLAN.json**, review its **two red fireteam roots only**, approve once, then return to the friendly plan without redeploying it. Radio: "Contact north of relay. BRAVO cover; ALPHA report movement." Native opposition AI can act immediately. No automatic enemy-wave scheduler or attack order is supplied.

Declare the relay searched only after your actual game inspection. The zone has no spawned tower/intel object: this is a role-play objective. If a real casualty exists, ANGEL's one-member group can attempt supported treatment where the native checks allow it. The mission never injects damage or guarantees medical supplies.

## 4. Recovery / EAGLE

Radio: "Relay clear. All stations recover. EAGLE stand by for pickup if requested."

Normal branch: ALPHA/BRAVO return on foot to **ASSEMBLY** (X4700 / Z11860), vehicle crews return along inspected ground routes.

Extraction branch: move appropriate troops to **LZ** (X4540 / Z12120); the GM/player operates EAGLE's flight/landing. Do not send an infantry Move or wheeled Drive command to the helicopter. Player occupancy intentionally blocks protected bridge operations, so complete eligible AI boarding before a human enters. Neither a seated pilot nor a planner aviation route proves AI flight support.

## 5. Persistence and finish

Dismount all vehicle crews/passengers before testing supported current-state snapshots; inspect on-foot/empty-vehicle eligibility and omit rejected targets. Save planned deployment and current state as separate choices. Review a saved file before separately approving restore. Back up the server profile before a restart; do not overwrite your only save. Any existing live scene/mission outside this test stays outside the snapshot claim.

Use 07-TEST-CHECKLIST.md. Only remove the bridge-created test batches after confirming their exact request IDs and scope; do not remove unrelated mission actors. Confirm any cleanup on both clients when available.
