COMMAND ORBAT Bridge 0.10.1 — AI stance response hotfix

Fixes idle AI squads accepting Crouch or Prone settings without promptly changing pose. The bridge now requests the normal stance transition after applying the persistent native setting, respecting native transition checks and separate editor overrides.

Real terrain/navigation tests exercised Move, Hold, Defend, routes, Follow and cancellation. Stand, Crouch and Prone changed all four test soldiers within five seconds. Separate editor settings survived the command and release.

Requires Companion 2.9.1-dev.followon.6 or a compatible later build. Restart the hosted session and create a fresh GM-enabled pairing after updating. No new desktop executable is required.

Experimental: tests used an isolated server and synthetic actors. Real-player Follow, combat formation spacing and strict Hold Fire under attack still need acceptance. Vehicle, support and building commands are not added. Tracking remains capped at 60 selected entities.
