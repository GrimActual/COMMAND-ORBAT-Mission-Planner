# COMMAND 2.10.0 release candidate notes

This consolidates the current COMMAND product into one package. Stable promotion awaits the recorded acceptance gates; live integration remains experimental.

- Offline planning, assets, drawings, briefing, save/load, import/export, Undo/Redo, Settings and Sarge remain available with original plan/settings compatibility.
- Eligible individual infantry and squad controls, explicit live/planned targeting and reviewed recovery are included. Scope/ownership/player protections remain mandatory.
- Snapshot heading handling uses native yaw/pitch/roll. Current-state server snapshots and reviewed restore remain separate from planned deployment save. Previously incorrect saved headings require review/resave.
- Quick connection and server-managed relay hosting are explicit. Disconnect dashboard preserves a remote session; End session revokes it after acknowledgement. Host/server auto-approval is scoped to AI orders, spawning and removal; snapshots stay manual.
- Quick connection verifies its public endpoint before issuing pairing credentials, allowing up to two minutes for readiness. Initial temporary DNS failures were observed; a later full native public-tunnel exchange passed.
- Read-only terrain/proxy preview supports authorized elevation, matching imagery, selection and cleanup. It is not an embedded Enfusion world or a full scene/model importer.
- Active startup/version/asset instructions are consolidated. Vanilla indexes, bridge, relay, licences, source and recovery/acceptance documents ship together.

Known limits: historical boarding timeout unexplained; multiplayer/combat acceptance incomplete; strict no-fire behavior unaccepted. Workbench importer/Apply, universal two-way editing, full scene rendering, WebSockets, persistent relay restart and multi-admin roles remain planned. Pilot controls are labelled; unfinished Apply remains unavailable. No historical acceptance evidence is silently upgraded.

Electron 44.9.1 is pinned and the final packaged executable is checked directly. No satellite tiles or elevation dataset are bundled. Offline coordinate-grid planning remains available; add permitted local imagery using [Imagery setup](Guides/08-IMAGERY.md). Existing local copies are preserved.

## Bridge 0.12.1 approval-control repair

Three independent native buttons now display AI ORDERS, SPAWNING and REMOVAL with ON/OFF states. Corrected fixed-anchor offsets restore the missing spawning/removal click targets. Disable All returns all categories to OFF/manual; it is disabled and labelled ALL AUTO-APPROVAL OFF when already manual. Descendant clicks resolve to their owning button. The host publishes changed policy immediately when idle, and acknowledges rapid revisions in order; busy operations retain the existing scheduling and cancellation behavior. Snapshots remain manual. No occupied-spawn or aircraft-flight capability is added.

This repairs a user-reported release blocker. Actual pause-menu clicking must be rechecked on the updated Workshop build, with the Companion's confirmed policy observed. Isolated native action/relay checks are separate from that live UI acceptance. Desktop 2.10.0-rc.1 remains compatible; this is a matching metadata/native patch, not a new desktop feature build. The prior frozen archive remains an acceptance history artifact until reconsolidation and new checksums are complete.
