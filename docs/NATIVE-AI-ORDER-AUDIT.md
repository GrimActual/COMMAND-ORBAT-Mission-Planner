# Native AI order audit and bridge 0.10.1 hotfix

## What changed

Idle soldiers could retain their previous physical stance after Companion successfully installed a Crouch or Prone setting. A focused native test reproduced the mismatch for 25 seconds: each soldier had the requested setting, but several remained standing.

After installing the persistent setting, the adapter now requests the normal native stance transition once. It checks the character's effective setting belongs to the exact Companion setting or its propagated child, then respects `CanChangeStance` before calling `SetStanceChange`. It does not force animation, disable AI, repeatedly override the character, or remove other settings. Auto still removes only the Companion setting and lets AI choose its next stance.

## Install

Publish the prepared **COMMAND ORBAT Bridge 0.10.1** project to the existing Workshop item **6A969EB0C5012BB9**. Update the game addon, restart the hosted session and make a fresh GM-enabled pairing. GitHub publication does not publish Workshop.

Use the existing **Companion 2.9.1-dev.followon.6** desktop application. This is a bridge-only hotfix; there is no new desktop executable or changed mission format. Existing Settings and Sarge directions remain applicable. Formation, stance and fire-policy controls require bridge 0.10.x; 0.9.0 does not contain those controls.

## Order audit

The isolated diagnostic server used Everon terrain and the installed Game Master soldier navigation mesh. Infantry AI and physics were active; no game client, public tunnel, real players or saved mission was used.

| Control | Observed evidence | Limit |
| --- | --- | --- |
| Move | Leader travelled to within 6 m of a 40 m destination. A separate initial run travelled about 75 m toward an 80 m destination. | Open runway fixture, not every terrain/scenario. |
| Timed Hold | Leader drift stayed 0.1–1.1 m during a ten-second observation. | Combat can still interrupt; duration expiry is covered separately by lifecycle checks. |
| Defend | Leader travelled 51–71 m and entered the native Defend activity. | Defend covers an area and need not stand on the exact point. No combat result claimed. |
| Cancel | Owned waypoints removed; leader drift stayed below 1 m in the cancellation observation. | Combat reactions remain enabled. |
| Route | Two ordered points traversed; leader reached within 6 m of the final point. | Maximum-length routes and arbitrary obstacle paths were not physically tested here. |
| Follow | Squad approached a character stand-in, then followed after that target moved another 25 m. | Synthetic target, not a real player connection. |
| Formation | Column, Staggered Column, Wedge, Line and restoration read back from native definitions. | Physical spacing in terrain/combat remains unverified. |
| Stance | Final hotfix requests physically changed all four members to Stand, Crouch and Prone within five seconds each. | Flat open-ground fixture; injury, obstruction and combat can affect transitions. |
| Fire policy | Open Fire, Hold Fire, Return Fire and Auto accepted and read back. | No enemies or incoming fire in this audit. Strict no-fire under attack is not certified. |
| Ownership/release | Separate per-character editor stance retained, other three members crouched, and the editor setting survived release. | Real multiplayer acceptance remains separate. |

The direct native harness exercises production adapters and waypoint replacement. It is not a new end-to-end HTTPS or real-client test. The existing relay authority/approval tests remain separate. Recruitment, release, Follow expiry and identity invalidation retain their earlier synthetic lifecycle coverage.

The initial terrain-only fixture lacked navigation data and could not demonstrate travel. A full-world attempt hit the diagnostic memory cap; the lightweight fixture with the actual Game Master navigation mesh used about 0.8 GB server working set. These fixture problems are not evidence that the user's hosted scenario lacks navigation data.

This fixes a confirmed stance issue. It does **not** establish the cause of every unresponsive order in the reported hosted session. After publication, test a controlled on-foot infantry group on open ground, resume gameplay, approve in-game, and allow initial spawning/navigation to settle. A single rifleman asset, mounted squad or vehicle is not a supported infantry group target. Retain the exact failed result and destination if travel still fails.

## Scope retained

Tracking remains capped at 60 selected entities. No vehicle movement, transport, attack/force-move, suppression, healing or building entry commands are added by this hotfix. All roadmap goals remain. The original neutral diagnostic fixture and sanitized receipt accompany the source; no private sample projects or their metadata are included.
