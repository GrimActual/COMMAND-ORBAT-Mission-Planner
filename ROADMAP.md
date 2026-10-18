# COMMAND — ORBAT / Mission Planner — future development roadmap

Updated 14 October 2026. Ordered by technical dependencies, with no dates or delivery promises. This is future planning; it does not authorize implementing all 200 items in one release.

## Current foundations and immediate validation gate
- v2.8.2 is the prior stable release; RC2 has a user-tested single-host position feed.
- v2.9.1 Preview 1 adds experimental dedicated profiles/sender source, bounded reconnects, diagnostics, and full map/fullscreen. Its desktop and relay tests pass. The bridge candidate now compiles for PC and WORKBENCH on engine 1.8.0.13; a bounded standalone dedicated-server HTTPS movement test has now passed.
- Existing headless validation, ORBAT hierarchy, map geometry, phases, imports/exports, simulation fixtures, backups and bridge protocols are foundations to reuse. Package completion must be based on evidence, not assumed from feature names.
- Complete the v2.9.1 engine/server validation gate before calling its dedicated path stable. Future architectural work can proceed offline without waiting for a live server.

## First core increment — 13 October 2026
Headless mission validation is reused by a new offline scenario module and CLI. Typed actions, prerequisites, ordered journals and replay are implemented and tested; see [core guide](docs/OFFLINE-SCENARIO-CORE.md). GM UI and temporary overlay are now implemented; GM undo and validated two-copy local recovery are now implemented; see [recovery guide](docs/GM-UNDO-RECOVERY.md). Broader persistence/recovery requirements remain future work. See [desktop GM guide](docs/OFFLINE-GM-DESKTOP.md). This development increment does not alter the packaged preview.

## Scenario authoring / replay / AAR increment — 13 October 2026
A validated objective/event builder, command playback controls, and printable HTML/JSON after-action report exports are implemented in the GM development desktop. See [guide](docs/GM-AUTHORING-AAR.md). Inside-radius conditions and temporary zone boundaries are now implemented in scenario version 2; see [spatial guide](docs/GM-SPATIAL-RULES.md). Validated complete JSON scenario editing and versioned schema contracts are now delivered; see [editing guide](docs/GM-SCENARIO-EDITING.md). Additional visual editing, conditions and campaign mechanics remain future work.

## GM preferences and continuous performance checks — 13 October 2026
Game Master settings now cover recovery, overlay/zone visibility, marker scaling, time steps and replay defaults, with a Sarge destination. Performance and maintenance gates are recorded in AGENTS.md; measured results and removed redundant work are in [the debrief](docs/GM-SETTINGS-PERFORMANCE.md).

## Mission recovery and scenario library — 13 October 2026
Rotating bounded mission recovery, explicit restore with Undo, and a named rules library are delivered. The desktop/Enfusion responsibility split and future deployment package pipeline are recorded in [the future integration note](docs/ENFUSION-MISSION-PACKAGE-ROADMAP.md); they add scope without changing current priorities.

## Integrated offline milestone and remaining gates
An offline JSON-driven Game Master scenario: headless mission loading without data loss; versioned units/objectives/phases/events; allowlisted conditions/actions; GM controls; append-only event journal; deterministic replay; save/reload/undo/recovery; regression and malformed-input checks. Develop this in small verified increments, starting with an audit/extraction of existing core logic. Do not rebuild existing systems or replace Electron before an alternative passes the same workflows.

## Event inspection and compile assurance — 13 October 2026
GM event readiness, prerequisite/zone/time/action inspection, session filters and a saved default filter are delivered, with 40 translated Sarge topics. PC and WORKBENCH compilation passed using the repeatable isolated validation tool. The 122-test regression gate and dense 400-unit / 200-event performance comparison passed; see [inspection and validation guide](docs/GM-EVENT-INSPECTION.md). Dedicated runtime and Workshop packaging remain separate uncompleted gates. Passing gates are not repeatedly rerun without a relevant change or failure.

## How the two proposals fit
The 16 engineering packages below are the delivery structure. The [200-item catalogue](docs/FUTURE-FEATURE-WISHLIST.md) retains every numbered [D]/[E] item as a traceable backlog, not 200 separate release tasks. The [package mapping](docs/FUTURE-FEATURE-MAPPING.json) assigns each item a primary package; many also have cross-package dependencies. Specific priorities and acceptance criteria are set when a package enters development.

## Package/backlog ownership
| Package | Primary backlog items |
|---|---|
| 01 Core architecture | 56–58, 64, 66–68, 70–71, 73–75 |
| 02 Persistence/recovery | 43, 72, 197 |
| 03 Force/ORBAT model | 1–20 |
| 04 Geospatial/map model | 21–35, 40 |
| 05 Mission authoring/briefing | 36–39, 41–42, 44–55 |
| 06 Scenario/rules engine | 59, 81–85, 88–90 |
| 07 Game Master | 60, 76–80, 86–87, 91–100 |
| 08 Simulation/campaigns | 61, 69, 101–120 |
| 09 Event journal/replay/AAR | 63, 190–192 |
| 10 Integration/security | 164–185 |
| 11 Enfusion/server adapter | 62, 65, 121–140 |
| 12 Resource imports | 141–160 |
| 13 Collaboration | 161–163 |
| 14 UI/renderer | 186–189, 196 |
| 15 Plugins/ecosystem | 193–195, 199–200 |
| 16 Release assurance | 198; continuous checks across all packages |

Package 16 starts immediately and runs throughout, despite depending on evidence from the other packages. Package 11's full event/GM scope depends on 04 and 09–10; the existing read-only bridge is retained during that work. Items 121 and 176 require external verification/cooperation: supported APIs do not imply Bohemia endorsement or an established cooperation agreement. Native UI alternatives and AI assistance remain optional evaluations. No hidden tracking, blanket execution or game-process manipulation is permitted.

---

# COMMAND — ORBAT / Mission Planner — Master Implementation Plan

TARGET ARCHITECTURE

Companion Desktop

Map • ORBAT • Mission Editor • GM Console • Replay

Companion Core

Data Models • Events • Scenario Rules • Simulation • Permissions

Storage

Plans and replay

Importers

Permitted resources

Adapters

Enfusion and others

## The 16 implementation packages

## Package 01 — Core architecture and shared schemas

Foundation

Extract existing logic from Electron, define versioned JSON schemas, engine APIs, command validation, event bus, module boundaries and state separation.

DEFINITION OF DONE

A headless Companion Core that can load and validate a mission without launching the desktop interface.

Dependencies: Existing application

## Package 02 — Persistence, migrations and recovery

Foundation

Unify plan storage, snapshots, undo, backups, schema migrations, revision history, import/export validation and recovery.

DEFINITION OF DONE

Plans survive upgrades, corrupted inputs and interrupted saves without losing the last valid version.

Dependencies: 01

## Package 03 — Unified force and ORBAT model

Foundation

Combine hierarchy, personnel, units, vehicles, equipment, readiness, attachments, reserves, templates and force reporting.

DEFINITION OF DONE

One canonical force model used by planning, simulation, GM and live integrations.

Dependencies: 01–02

## Package 04 — Unified geospatial and map model

Foundation

Consolidate terrain coordinates, layers, objectives, routes, zones, symbols, annotations, measurements and map exports.

DEFINITION OF DONE

All map features operate on the same coordinate and entity model.

Dependencies: 01–02

## Package 05 — Mission authoring and briefing pipeline

Product

Connect ORBAT and map data to phases, dependencies, contingencies, briefing templates, annexes, revision summaries and exports.

DEFINITION OF DONE

A mission package generated consistently from one authoritative plan.

Dependencies: 03–04

## Package 06 — Scenario definitions and rule engine

Foundation

Define JSON scenarios, triggers, conditions, action allowlists, event scheduling, phases, prerequisites and validation.

DEFINITION OF DONE

A deterministic scenario can run headlessly from a JSON file.

Dependencies: 01, 03–04

## Package 07 — Manual and automated Game Master

Product

Build GM console, event library, simulated unit controls, hidden information, approvals, undo, pause/reset and automated triggers.

DEFINITION OF DONE

A GM can operate an offline scenario entirely inside Companion.

Dependencies: 06

## Package 08 — Simulation and campaign state

Product

Implement synthetic movement, logistics, readiness, event outcomes, simulation clocks, persistent campaigns and branching.

DEFINITION OF DONE

A repeatable scenario whose units, resources and outcomes change according to defined rules.

Dependencies: 03–04, 06

## Package 09 — Event journal, replay and AAR

Product

Capture events from GM, simulation and authorized game sources; build timeline, playback, state reconstruction and AAR exports.

DEFINITION OF DONE

An operation can be reconstructed and reviewed without modifying its original plan.

Dependencies: 02, 06–08

## Package 10 — Secure integration and permission framework

Security

Unify tokens, roles, capabilities, server ownership, rate limits, audit trails, command validation, revocation and shutdown.

DEFINITION OF DONE

No external adapter can read or change state beyond explicitly granted permissions.

Dependencies: 01, 06

## Package 11 — Enfusion server adapter and live synchronization

Integration

Extend the existing host-position bridge toward authorized server events, friendly-unit state, objectives and acknowledged GM requests.

DEFINITION OF DONE

A tested server can exchange permitted data with Companion while Enfusion remains authoritative.

Dependencies: 04, 09–10

## Package 12 — Workbench and resource import pipeline

Integration

Build local file discovery, permitted metadata extraction, coordinate conversion, format detection, indexing, provenance and licensing checks.

DEFINITION OF DONE

Supported local resources become validated Companion metadata without unauthorized asset redistribution.

Dependencies: 01, 04

## Package 13 — Multi-operator collaboration

Platform

Introduce shared sessions, presence, annotations, revision merging, role-specific views, conflict resolution and session diagnostics.

DEFINITION OF DONE

Two or more authorized operators can work on the same mission without silently overwriting changes.

Dependencies: 02, 09–10

## Package 14 — Desktop UI and renderer modernization

Platform

Introduce clean engine-facing UI APIs, map rendering improvements, GM workspace, role layouts, onboarding and optional native UI prototypes.

DEFINITION OF DONE

The interface can evolve independently of Companion Core; an Electron-to-native rewrite is optional.

Dependencies: 01, 03–09

## Package 15 — Plugins, adapters and ecosystem

Expansion

Define plugin manifests, sandboxed permissions, terrain packs, external adapters, version compatibility and extension documentation.

DEFINITION OF DONE

A third-party module can add a supported capability without editing the engine core.

Dependencies: 01, 10, 12–14

## Package 16 — Release engineering, security assurance and adoption

Continuous

Automate builds and tests, dependency checks, artifact hashes, signing where feasible, diagnostics, threat modeling, documentation and external testing.

DEFINITION OF DONE

Repeatable releases with evidence that important user workflows and security boundaries work.

Dependencies: All packages

## Which packages should be developed together?

This is where you can save the most duplicated work.

Bundle A — The shared foundation

Packages 01 + 02 + 03 + 04

Build your engine contracts, storage, force model and map model as one coordinated effort. A unit should have one stable ID whether it appears in the ORBAT, on the map or in a simulation.

This prevents you from building three incompatible unit systems.

Bundle B — Mission editor + scenario engine + GM

Packages 05 + 06 + 07

Let the mission editor produce the same structured data that the Game Master executes. Objectives, phases and triggers should not need to be re-entered into a separate GM file.

Build the scenario schema and GM console against each other.

Bundle C — Simulation + events + replay

Packages 08 + 09

Every meaningful simulation change becomes a validated event. The replay system consumes those events, so you don't have to reverse-engineer what happened later.

Use deterministic tests to verify that identical initial states and event sequences produce identical results.

Bundle D — Security + live Enfusion adapter

Packages 10 + 11

Design the permissions and server protocol together. Don't build powerful GM commands first and bolt security on afterward.

Start with read-only events, then add narrowly scoped commands only where the server can validate and acknowledge them.

Bundle E — Resource import + map compatibility

Packages 04 + 12

Build coordinate conversion, terrain indexing and importer validation together so imported resources land in the correct map representation.

Keep provenance and redistribution restrictions part of the importer itself.

Bundle F — Collaboration + UI + plugins

Packages 13 + 14 + 15

Once engine interfaces are stable, develop shared operator views, role-based workspaces and extensibility against those same APIs.

This avoids hardcoding collaboration into one particular desktop renderer.

## Dependency map

Simplified technical dependency diagram. Release engineering and testing should operate throughout, not only at the end.

## What I'd actually build first

I'd make the first integrated deliverable a fully offline, JSON-driven Game Master scenario.

It would demonstrate the new architecture without depending on game APIs, tunnels or external servers.

First integrated build checklist

Extract mission and ORBAT logic into a headless core

Define versioned schemas for units, objectives, phases and events

Load an existing mission into the new core without losing data

Create a JSON scenario with conditions and actions

Build a GM panel to trigger and inspect events

Record an append-only event history

Replay the scenario deterministically

Verify save, reload, undo and recovery

Run regression and malformed-input tests

Once that works, your architecture has proven it can support the core idea: one mission can be planned, executed in simulation, controlled by a GM and replayed afterward.

That's a meaningful milestone.

## Non-negotiable engineering rules

Across every package, I'd enforce these principles:

1. One source of truth per entity. Don't maintain separate, incompatible representations of the same unit or objective.
2. Versioned data contracts. Old mission files must be migratable, and unsupported formats must fail safely.
3. Offline-first. A live connection is an enhancement, never a requirement to open a saved plan.
4. Server authority. The Companion can request permitted game actions; it cannot assume the game executed them.
5. Permissioned resource access. Import only data you're authorized to use, and don't redistribute proprietary game assets without permission.
6. Event-driven history. Every important state change should be observable and testable.
7. Test before replacing. Don't abandon Electron until another UI can perform the same essential workflows reliably.
8. No blanket remote execution. GM commands must be typed, allowlisted, validated and auditable.

The biggest optimization here is architectural: you're not building 200 independent features. You're building a small number of reusable systems that unlock dozens of features each.

For example, a well-designed event engine supports mission triggers, GM actions, simulated radio reports, automated scenarios, replay, audit logs and after-action reviews. Build that engine once, and several major parts of the wishlist become much easier.

That's how I'd turn your current project into a serious Companion Core + Game Master + Enfusion integration platform, without wasting effort rebuilding the same functionality over and over.
## Existing scenario draft editing — 13 October 2026
Roadmap packages 05/06/07 now support validated in-place objective/event edits with stable IDs, explicit Apply/Cancel, initial objective status and a Settings shortcut. Complex rules stay in the complete editor and unapplied JSON is preserved. Sarge has 41 translated topics. The relevant 16-test gate, actual desktop workflow and large-authoring latency check passed; see [editing guide](docs/GM-DRAFT-EDITING.md). This development increment follows Preview 4 and does not repeat unrelated passing gates or imply a new Workshop publication.

## Bounded scenario draft history — 13 October 2026
Development 6 adds validated session-only Undo/Redo for applied scenario authoring changes, JSON applications and library loads. Settings chooses 10/20/50 steps within a bounded serialized history budget; Sarge now has 42 translated topics. The relevant 15-test gate, actual desktop isolation/reset workflow and prior-build authoring/storage comparison passed. Added history has measured latency and memory cost, recorded in [the guide](docs/GM-DRAFT-HISTORY.md); unrelated map/bridge/Enfusion gates were not repeated. Mission and GM command undo remain independent. Consolidated packaging remains a later release gate.

## Reforger native properties, COOP template and UI references — 13 October 2026
The user-provided Bohemia attribute tutorial, GRAD COOP Template and Reforger UI screenshot are reviewed in [the reference note](docs/REFORGER-GM-REFERENCES.md). They inform future authorised property integration, scenario setup and an optional compact GM workspace while preserving our own version and current priorities. GRAD uses APL restrictions; no foreign code or artwork was incorporated. The screenshot is retained locally outside source/release trees. This research does not implement a network property API or 3D viewport, and does not repeat previously passing application tests.

## Scenario preflight and optional workspace proposal — 13 October 2026
Development 7 adds advisory initial-draft preflight, diagnostic export, stale-result protection, a Settings shortcut and 43 translated Sarge topics. Eight focused tests and the actual desktop isolation/export workflow passed; the capped 500-finding review latency is recorded in [the guide](docs/GM-SCENARIO-PREFLIGHT.md). No unrelated passing gates were repeated.

Proposed UI sub-milestone **14.1 — Optional Game Master workspace** is recorded in [the implementation plan](docs/OPTIONAL-GM-WORKSPACE-PLAN.md). MagicPath is the proposed design tool for panel hierarchy and boundaries; no prototype or layout rewrite is delivered yet. The proposal stays inside the 16-package roadmap. Its “Package 20” is mapped to existing security/integration/release owners, and unimplemented properties/automatic-play behavior remain future work.

## Enfusion resource-format reference — 13 October 2026
The user-supplied extension inventory is reviewed in [the importer reference](docs/ENFUSION-RESOURCE-FORMATS.md), with corrections for procedural animation projects, text model/animation intermediates, script metadata exceptions and source files excluded from publishing. Package 12 will distinguish readable metadata, registered resource resolution and opaque runtime formats rather than claiming one universal parser or a complete engine schema. This reference does not change the current goal or deliver new binary import support.

## Resource metadata contract foundation — 13 October 2026
Package 12 now includes a versioned headless resource index, canonical JSON Schema, documented sample and read-only review CLI. Ownership, safe paths, GUID ambiguity, provenance, dependency gaps and transactional replacement/merge behavior are explicit. Twelve focused tests, thirteen schema cases and representative large-index timing samples passed; see [the contract guide](docs/RESOURCE-INDEX-CONTRACT.md). Desktop Development 7, Sarge and Settings remain unchanged because this increment delivers no user-facing importer. Native metadata parsing and real server resource validation are subsequent adapter gates. Consolidated packaging remains a later release gate; unrelated passing tests were not repeated.

## Offline property-adapter foundation — 13 October 2026
The property catalogue foundation now provides explicit review/apply translation for existing planner-unit names, affiliations, unit types, notes and local-map positions. Unsupported fields, missing/locked targets, duplicate edits and stale plans block application; unrelated mission data and separate provenance are preserved. Ten focused tests, eleven independent wire-schema cases and a 400-unit timing/isolation sample passed; see [the adapter guide](docs/PROPERTY-ADAPTER-FOUNDATION.md). This extends offline authoring and packages 07/12 without claiming native component mappings or writable server commands from packages 10/11. Development 7, Sarge and Settings remain unchanged until an actual review UI is delivered. No new package or Workshop update is implied.

## Reviewed unit-property UI — 13 October 2026
Development 8 adds file/pasted-request review in Units, an optional bounded resource-index loader, paged before/after findings and explicit Apply through existing mission authoring. Property batches carry paired builder snapshots: one mission Undo restores the full unit batch and builder text; Redo reapplies it. Extra builder snapshots share a 2 MiB session budget. Settings adds a shortcut and Sarge has 44 EN/FR/DE topics. Actual desktop atomicity, stale-lockout, Unicode display safety, ID/GUID/reference preservation, save-failure, memory-limit and localization/context checks passed, plus a 400-unit timing sample and prior-build authoring comparison. See [the workflow guide](docs/UNIT-PROPERTY-REVIEW.md). Active rehearsal remains unloaded; native writes/importers remain pending. Consolidated packaging stays a later gate, and unrelated completed tests were not repeated.

## Consolidated Preview 5 validation — 13 October 2026
At the user's explicit request, Package 16 runs a full release validation rather than repeating small gates indefinitely: 159 automated tests, five schema definitions, 33 schema corpus cases, actual desktop property workflows, dense-map baseline comparison, repeated batch/history cycles and offline reload/reopen checks passed. The unchanged native compile evidence is retained by source-hash comparison. Preview 5 consolidates Development 5–8 and the resource/property foundations; [the debrief](docs/PREVIEW5-VALIDATION.md) records measured performance, scope and remaining dedicated/native/signing limits. Archive integrity and packaged startup are separate final packaging checks.

## Selected Workbench metadata identities — 13 October 2026
Package 12 adds bounded identity extraction for the observed GameProject/MetaFileClass subset, a read-only selected-file CLI, stable addon/GUID-derived resource IDs and real user-addon fixtures. Eleven focused checks and a 500-sidecar timing sample passed. The actual inspected world target was empty and the partial addon dependency unresolved; both remain explicit, rather than being called a valid native world. Configuration bodies/resource dependencies remain uninterpreted. [Reader guide and evidence](docs/WORKBENCH-METADATA-READER.md). This source-only increment follows Preview 5; the desktop, Sarge/Settings and existing ZIPs remain unchanged until a metadata import UI is delivered. No server/native property writes are added.

## Usable metadata import workflow — 13 October 2026
Development 9 delivers the Package 12 desktop workflow in Assets: native project/sidecar pickers, worker-based inspection, resource/warning pages, dependency-gap review, native index export and transfer to offline property review. Imports preserve mission/builder/journal state; cancelled/rejected inputs retain the prior review, and transfer invalidates stale property reviews. Settings has a shortcut and Sarge has 45 translated topics. Twelve relevant checks, the actual 500-resource desktop workflow and a 400-unit Preview 5 performance comparison passed; [steps and debrief](docs/WORKBENCH-METADATA-IMPORT-UI.md). Native component interpretation, spawning and server validation remain subsequent milestones. Preview 5 archives remain preserved; the development executable contains this feature.

## Native text, DPI and graphics diagnostics — 13 October 2026
Development 10 extends Package 14/16 with consistent native system-font styling, work-area-aware initial sizing and a Display & graphics Settings page. DPR/monitor scale/interface zoom are separate, reports become stale on resize/settings changes, and bounded GPU/driver/exit diagnostics are read-only. Eight relevant tests, twelve DPI/zoom combinations, normal/software rendering comparisons, translated report controls and the existing metadata workflow passed; [display guide/evidence](docs/DISPLAY-QUALITY.md). Sarge has 46 topics. Some sampled DPI frames exceeded 100 ms and are documented. No driver/global settings were changed, no universal sharpness or driver-interference conclusion is claimed, and native adapter/release goals remain intact.

## Reviewed prefab planning assets — 13 October 2026
Development 11 advances Package 12 from identity review to usable planning references. Prefab rows offer explicit name/type selection and prepare the existing Units asset selector; applying/placing embeds GUID, addon ID, path, provenance and target warnings. Preparation is mission-neutral; assignments use existing save and one-step Undo/Redo. Conflicting duplicates are rejected, locale changes retain draft values, and Sarge/Settings guidance is synchronized in EN/FR/DE. Focused contracts and actual desktop assignment/reload passed; the same 400-unit/500-resource sample stayed near 59 FPS. [Guide and validation](docs/REVIEWED-PREFAB-ASSETS.md). Engine spawning/component adapters and server verification remain separate unfinished milestones. Preview 5 archives remain unchanged.

## Portable planning catalogs — 13 October 2026
Development 12 continues Package 12: Assets can export the session catalog plus assigned unit snapshots through a validated native Save dialog, then reimport them after restart. GUID/provenance and warnings survive; conflicts stop export before saving, and no mission/Undo/live-state changes occur. Sarge and Settings guidance are synchronized in EN/FR/DE. Sixteen relevant checks, actual desktop save/reimport/error workflows and a narrow post-optimization save check passed. Operation timings were compared against Development 11; a redundant renderer validation pass was removed while retaining native validation. [Steps and measured limits](docs/PORTABLE-PLANNING-CATALOGS.md). Preview 5 archives are unchanged. The separate manifest-copy experiment is not promoted into release source or treated as verified prefab GUID data.

## Downloaded-addon project identity review — 13 October 2026
Development 13 extends Package 12 with opaque bounded GameProject Configurations acceptance and a one-picker project-only review. Real copied Invade & Annex identity/dependencies now import without sidecars, exporting zero resource records rather than inventing GUIDs. Sarge/Settings are synchronized in EN/FR/DE. Twenty-three relevant checks and the actual desktop copy workflow passed; parser timing was compared with Development 12. All 12 original installed addon files remain hash-identical. [Steps and compatibility limits](docs/PROJECT-IDENTITY-COMPATIBILITY.md). The isolated manifest test stays preserved; binary resource mapping and native engine adapters remain future gates. Preview 5 packages are unchanged.

## Resource index reuse in Assets — 13 October 2026
Development 14 advances Package 12 with a one-picker worker-backed resource-index JSON load, multiple-addon owner review, bounded unresolved-reference findings and the existing prefab-to-unit preparation flow. Imported observations are explicitly declarations; referenced files are not rechecked and target-warning filtering is disabled. Empty indexes and cancel/rejection retention work. Sarge/Settings are synchronized in EN/FR/DE. Thirteen relevant checks and the actual 501-resource desktop workflow passed. The review retains its audit instead of rebuilding it during paging/preferences; matching 500/5,000-reference timings and zero UI rebuilds were recorded. [Steps and evidence](docs/RESOURCE-INDEX-REVIEW-UI.md). Native GUID extraction from RDB and engine/server adapters remain subsequent gates; Preview 5 archives are unchanged.

## Native read-only bridge runtime gate — 13 October 2026
The real diagnostic local-server executable sent native Enforce position updates through temporary HTTPS into Companion. Movement, unchanged mission JSON, same-stream interval reload after a reproduced counter-reset fix, native authentication rejection and cleanup were verified. Changed Enforce source compiled for PC/WORKBENCH. Server profile-path instructions are corrected in the guide, Settings and translated Sarge guidance. [Native runtime scope/evidence](docs/NATIVE-BRIDGE-RUNTIME.md). The standalone dedicated-server HTTPS movement gate now passed. Endpoint-preserving revocation/retry-limit checks and testing the downloaded Workshop package remains pending. No new feature-build number or package was created; consolidate after the remaining release gates.

## RC2 — bounded live tracking and deployment preview

Packages 01/04/11 now carry 60 opt-in named-entity batches with native HTTPS evidence. Package 12/14 adds a desktop deployment review/export with GUID provenance and stale checks; execution remains pending. Settings and 47 EN/FR/DE Sarge topics accompany delivery. Automatic opt-in player discovery, respawn lifecycle, 120-player scaling, server-reviewed spawn/remove and optional compact GM workspace remain future milestones. See docs/RELEASE-CANDIDATE-2.md.

## Player source pilot — unpublished

Workshop 0.3.0 publication is user-confirmed. The next native candidate selects up to 60 explicit session player IDs with controller-bound leases, respawn delta resets and disconnect retirement. PC/Workbench compilation passes; real player lifecycle testing remains required. The existing RC2 reader is compatible with the batch format. See docs/PLAYER-TRACKING-PILOT.md.

## Host Local mixed roster and first native GM execution pilot — 13 October 2026

Packages 04/11 gain explicit human/GM-editable AI selection and faction filters sharing 60 aliases. Package 14 now has reviewed spawn/remove requests with host approval, expiry, cancellation, duplicate protection and root ownership checks. Two synthetic objects passed actual native HTTPS execution; final safeguards compile and desktop/queue checks pass. This is a bounded development pilot, not the full GM suite or a real 60-player validation. Sarge has 50 EN/FR/DE topics. See [HOST-GM-PILOT.md](docs/HOST-GM-PILOT.md). Next: real Host Local lifecycle/UI gate, then native AI orders/property/environment adapters. RC2 and published Workshop 0.3.0 remain unchanged until the candidate is uploaded.

## Real Host Local gate and placement correction

The user confirmed mixed tracking, faction deselection and actual character spawning in Host Local. Removal reported executed; visual removal confirmation remains separate. Placement exposed a missing inverse map-image offset; desktop 2.9.1-dev.gm.2 now subtracts 50 m per axis for native requests and intention exports, leaving saved plan coordinates unchanged. Production single/mixed render round trips, the installed app and matched converter timings pass. Precise corrected placement still requires user confirmation; full player lifecycle/occupied removal/GM roadmap features remain open. See docs/GM-PLACEMENT-FIX.md.

### Asset browser usability — 14 October 2026
Searchable, paged asset cards replace the full catalog dropdown. Unit type links to troop/armoured/APC/light-vehicle/aircraft/logistics filters; prefab faction filters and variant visibility remain independent of mission faction. Exact asset snapshots and GUIDs are retained. Settings opens the browser; Sarge and EN/FR/DE guidance cover the workflow. Deployment review explains missing or invalid names. Native spawn availability remains separate from classification hints.

## Package 14.1 — compact GM workspace, 14 October 2026
The optional layout is implemented in 2.9.1-dev.gm.4: existing asset chooser in a collapsible drawer, capped read-only planned-selection inspector, existing deployment/results links and explicitly offline rehearsal controls. Mode/drawer preferences stay outside mission JSON; layout-only changes skip map/asset rebuilds and leave active replay running. Existing forms, pending edits, selection, Undo/Redo and full-map behavior are retained. Settings and 50 Sarge topics have EN/FR/DE guidance. The active MagicPath design is COMMAND — Compact GM Workspace. See [the workflow guide](docs/COMPACT-GM-WORKSPACE.md). Native AI orders, properties and environment adapters remain the next integration milestones; this layout does not implement them.

## Native AI-order pilot — 14 October 2026

Package 14 now adds Move to position and timed Hold for bridge-created on-foot infantry AI groups in desktop 2.9.1-dev.gm.5 / Workshop candidate 0.5.0. In-game host review remains mandatory. Versioned requests, capability negotiation, same-pair ownership and stale desktop reviews accompany the adapter. Native PC/Workbench compilation and an isolated actual-server waypoint lifecycle gate passed; physical travel/arrival, combat behaviour and occupied/mounted rejection in real Host Local sessions remain pending. The new runtime test used loopback, not public HTTPS. Desktop context/localization/mission isolation and all 215 regression tests passed. Settings and the existing 50 Sarge topics include EN/FR/DE guidance. Vehicle transport/crew, route chains, properties and environment remain separate roadmap milestones. See [the pilot guide](docs/NATIVE-AI-ORDERS-PILOT.md).

## Package 14.2–14.5 — squad-command expansion, 14 October 2026

The requested friendly-squad selection/recruitment, Follow Me, ground/map Move and chained routes, Force Move, Attack, Defend, Halt, formations, stances, strict fire control, suppression/look, vehicles/healing, attach/detach/convoys and stack/breach/garrison/clear are retained in [the implementation and native-binding specification](docs/AI-COMMAND-EXPANSION.md). Advanced AI Command 69A404653EE3F3C4 is inspiration only; no code/assets/dependency is imported. The existing published Move/timed-Hold pilot is unchanged. New source rejects missing native group utility, incompatible waypoint classes and unknown actions rather than guessing a movement behaviour. Diagnostic work now traces waypoint selection, activity and resolved behaviour-tree resource; arrival/combat/interior completion remain separate gates. Undelivered controls stay unavailable, and Settings/Sarge state that explicitly in EN/FR/DE.

### First tactical adapters — development source
Defend position and cancellation of the Companion-owned waypoint are connected through a separate capability, strict contract, stale-reviewed desktop form and native host approval. Actual isolated-server traces confirm the defend state/activity/ActivityDefend.bt, cancellation, subsequent Move and old-relay fallback. EN/FR/DE desktop checks pass. Source is dev.gm.6 / native 0.6.0 candidate; published dev.gm.5 and Workshop 0.5.0 remain intact. Physical navigation/defence and the broader squad-control stages are still open. See [the complete scope and evidence](docs/AI-COMMAND-EXPANSION.md).


## Additive milestone — Arma 3 / SQF to Enfusion migration

Retain every existing roadmap package. Extend shared contracts, resource identity/adapters and the GM workspace with drop-file migration review, then explicit Arma 3 class-to-prefab mapping, supported-pattern parsing, terrain calibration, reviewed neutral intents and native export/validation. The first source workflow inventories selected SQF/SQM/EXT/HPP files without execution, offers verified movement binding candidates, and marks unresolved classes, control flow and engine semantics for review. Full SQF translation and native mission export remain unfinished. See [migration foundation](docs/SQF-MIGRATION-FOUNDATION.md). Current published releases and the user’s test copy remain unchanged.

Migration release checkpoint: 2.9.1-dev.gm.7 consolidates this read-only workflow and the previously tested tactical Defend/cancellation candidate. 226 release regressions, offline worker/drop/picker, localization/context, safe display, paged findings and validated native JSON Save passed. Existing native source hashes match retained compilation/runtime evidence. Full automatic SQF conversion and chained AI routes remain separate unfinished milestones; no earlier roadmap content was removed.


## Additive migration checkpoint — reviewed class mappings

The next source candidate adds explicit Arma 3 classname-to-prefab confirmation against the validated resource index, searchable typed cards, repeated-class reuse, portable mapping export/reload and transactional rejection of incompatible index changes. Exact addon/GUID/path, provenance and declared dependencies are preserved; mappings remain non-executable and gameplay equivalence/native availability unverified. 27 focused checks and actual offline desktop/large-list gates passed, including a quote-scanner hardening found by the large-file test. Sarge/Settings guidance remains synchronized in EN/FR/DE. Cached 2,721-resource searches measured p95 0.341 ms. The published dev.gm.7 release is unchanged. Supported-pattern neutral intent translation, terrain/native validation and chained AI waypoints remain retained unfinished milestones. See [mapping guide](docs/SQF-CLASS-MAPPINGS.md).


## Additive migration checkpoint — source-linked neutral intent drafts

The next source candidate recognizes a bounded straight-line SQF subset and emits non-executable mapped spawn/movement/basic-waypoint drafts, literal bindings and source-local object links. Source hashes/references, exact resource-map snapshots, mandatory review gates, source/mapping stale locks and validated native JSON export accompany worker preparation. Conditional/dynamic/unsupported constructs remain unresolved and are never flattened into actions. 39 focused JS checks, 13 independent schema cases and actual offline desktop isolation/export/race gates passed. Sarge and Settings guidance is synchronized in EN/FR/DE. A 400-intent/200-definition preparation fixture measured median 16.32 ms / p95 18.17 ms. Published releases and earlier candidates are preserved. Terrain calibration, planning transfer, native export, complete SQF conversion and chained AI routes remain retained unfinished milestones. See [draft guide](docs/SQF-MISSION-INTENT-DRAFTS.md).


## COMMAND dev.gm.8 release checkpoint

Reviewed reusable Arma 3 class mappings and bounded source-linked non-executable mission drafts are packaged together. 247 release regression tests and isolated offline package export passed. Terrain calibration, full mission conversion and reviewed native execution remain future additive milestones.


## Reviewed migration placement checkpoint (unreleased)

Completed manual ground-anchor/rotation preview and selected mapped-spawn transfer into the existing planner as one Undo/Redo batch (1–60 planning units). Source/mapping/mission changes stale the preview. Exact prefab/source/dependency provenance retained; height, grouping, movement and native execution remain unresolved. Multi-anchor terrain verification, linked routes and native approval adapters remain future additions. See docs/MIGRATION-PLANNING-TRANSFER.md.


## Linked migration planning routes checkpoint (unreleased)

Optional reviewed doMove points now form proposed planning routes linked to selected source-created units. Source order is retained without claiming original execution timing. Units/routes apply and Undo/Redo as one batch; limits remain 60 planning units and 240 selected movement points. Exact source/route/unit provenance is retained. Group waypoints, native AI execution and terrain calibration remain future additions. See docs/MIGRATION-LINKED-ROUTES.md.


## Multi-landmark planning alignment checkpoint (unreleased)

Completed optional rigid horizontal fitting from 3–12 source/Everon landmark pairs with per-point/RMS/maximum mismatch, user tolerance gate, narrow-coverage warning and explicit review. Fitted provenance is retained in imported units; manual placement remains available. Height and terrain identity remain unverified. Independent check landmarks, reusable profiles, native authority/lifecycle adapters and all earlier milestones remain additive future work. See docs/MIGRATION-TERRAIN-LANDMARKS.md.


## Terrain identity and ground-height review checkpoint (unreleased)

Added optional declared world addon/GUID/path review, exact-position imported ground samples, sampler-query export and atomic planning provenance. Missing samples/world conflicts block sampled imports; the older native deployment flow rejects explicit terrain-context units rather than dropping the requirement. Separate read-only native sampler passed bounded empty-world API/serialization and wrong-path rejection tests. Runtime GUID/addon authority, real Everon elevation accuracy and native world-enforced deployment remain future additions. See docs/MIGRATION-TERRAIN-CONTEXT.md.


## Native Everon sampling checkpoint (unreleased, 15 October 2026)

Completed actual read-only GetSurfaceY sampling in installed EmptyEden 1.8.0.13, packed-addon namespace validation, wrong-addon/path rejection and a bounded Windows diagnostic runner. Four launch/file/memory guard tests passed; final native runner validated all three returned positions and stopped its server (668.1 MiB sampled peak, 1000 MiB limit). Full Eden stopped at its 2000 MiB limit without a report. This is terrain sampling evidence, not full-scene stability or authenticated live identity. Exact world GUID/terrain lineage, live session negotiation and approved native world-enforced deployment remain pending; the deployment block and all existing roadmap goals remain. See tools/terrain-sampler/README.md and docs/test-evidence/native-everon-terrain.json.


Final packed-path boundary check: a shortened addon-relative suffix was rejected without a report. The stricter source then sampled all three points successfully at 461.71 MiB sampled peak, validated report positions and confirmed server cleanup. The earlier 668.1 MiB runner result is retained above as observed variation, not a memory guarantee. No desktop renderer changes were made, so previously completed desktop performance gates were not repeated.


## Exact native world lookup and deterministic diagnostic receipts (unreleased)

The separate diagnostic now matches the loaded packed world's addon/path to one exact runtime resource-database GUID before sampling. Wrong GUID and unproven loose-world ownership reject; equivalent casing passes. SHA-256 query/source/report receipts and an offline integrity checker detect changed files without claiming authenticated origin. Ten focused tool checks and actual native positive/negative runs passed; final run measured 6 ms for one lookup and 462.69 MiB sampled peak, with server cleanup. Imported files remain unverified planning data and the native deployment block stays in place. Parent-terrain lineage, session-bound capability negotiation and host-approval-time enforcement remain next additive milestones; all prior goals are retained. No Workshop or desktop executable update is included. See docs/test-evidence/native-world-identity.json and tools/terrain-sampler/README.md. Existing Settings/Sarge guidance and EN/FR/DE runtime-unverified labels remain correct because no desktop workflow changed.


## SQF-to-Enforce block transpilation audit and staged plan (additive)

Source audit confirms bounded inspection, explicit asset mapping, a small straight-line AST and non-executable spawn/movement drafts; no full SQF block parser, control-flow/type/locality analysis or general Enforce `.c` emitter has been delivered. Full migration remains retained. Added docs/SQF-ENSCRIPT-TRANSPILATION-PLAN.md to detail source packaging, full syntax representation, semantic analysis, typed control-flow IR, verified native adapters, Enforce generation, deterministic build fingerprints/source maps and isolated native validation. Unsupported or unresolved semantics stay explicit blockers; parser recognition and compilation alone do not prove equivalent execution. No existing goals were removed and no compiler capability is advertised in the current app.


## Structural SQF AST inspector checkpoint (unreleased)

Delivered a separate read-only structural AST worker/Assets inspector for nested brace conditions, code-scope exits, while, range/three-block for, forEach and stored code assignments. Source locations/hashes, opaque expressions, unsupported findings, paged safe display, guarded native JSON export, source-stale/cancellation gates and EN/FR/DE Sarge/Settings guidance are included. 27 focused checks, nine schema cases and actual offline desktop tests passed; a 1,401-node fixture prepared at 23.88 ms median / 27.55 ms p95, with same-fixture map frame/storage checks recorded. This is not the full grammar, semantic/type/scope analysis, typed IR lowering or Enforce code generation. Existing migration intents/deployment safeguards and all prior goals remain unchanged. See docs/SQF-STRUCTURAL-AST.md.


## Arma 3 PBO / WRP inventory and identity resolver (planned, separate pipeline)

Added docs/ARMA3-ARCHIVE-WORLD-INVENTORY-PLAN.md: read-only PBO manifest/prefix/compression inventory, streaming/canonical content fingerprints, config/CfgWorlds-to-WRP resolution, version-aware WRP metadata and optional object-reference decoding. Distinguish listed, header-inspected, decoded and unsupported evidence. WRP object lists require an actual decoder; config.bin is not SQF text. The current text/AST inspector does not support these binaries. Full terrain recreation into Enfusion remains a separate potential conversion workflow, not an inventory claim. Existing goals remain retained.


## Bounded expression syntax core checkpoint (15 October 2026)

Added a developer-only, non-executable expression parser for literals, unresolved local symbols, arrays, grouping and basic arithmetic, with a separate numeric lexer and full-source span/hash binding. Unsupported syntax rejects without a partial tree. Desktop UI/export and native execution remain unchanged. Source scope/binding analysis, broader command/operator grammar, typed IR, validator/schema and subsequent UI integration remain pending; no earlier goals are removed. See docs/SQF-EXPRESSION-AST.md for scope and evidence.


## Source-linked semantic adapter requirements (15 October 2026)

Added a developer-only registry/review for 12 radio-relevant mechanic families with source hashes/locations, lexical-only evidence, documented target candidates, explicit unresolved names and lifecycle/behavior test obligations. Read-only radio sample: 80 occurrences, 12 families; zero implemented/native-verified adapters. 24 focused checks passed. No UI/game/export authority is added; source bindings/types, typed IR, native adapters and every earlier goal remain pending as applicable. See docs/SQF-ADAPTER-REQUIREMENTS.md.


## Source bindings, opt-in command syntax and value IR review (15 October 2026)

Added developer-only private/params/loop declaration evidence, conservative reference candidates and deferred-code barriers; an opt-in documented-arity command/comparison/logical parser; a partial source-value IR prototype; and reproducible folder review/integrity tools with EN/FR/DE developer guidance. 70 focused checks passed. The radio sample's 31 selected expression parts are now syntactically recognized by the extended profile, while types, effects, callback context and native behavior remain unresolved. Source files/audio remain untouched. Existing arithmetic output matches db6f9a1. No app executable, native mod, UI or deployment authority changes. Complete type/effect checks, typed statement/control-flow IR, strict UI/import contracts and native adapters remain unfinished; every earlier goal is retained. See docs/SQF-BINDING-VALUE-IR.md and tools/sqf-review/README.md.


## Bounded source operand/effect checks and strict contract (15 October 2026)

Added source-shape compatibility/mismatch/unresolved checks and explicit potential effects for the 18-command subset, including isNil unscheduled evaluation, deferred event/action callbacks, eager defaults and Boolean-versus-code logical evaluation. Strict JS validation and an independent schema fence source spans, graphs, gates and timing obligations. Folder review adds the report while preserving older formats. 52 focused checks and 11 schema cases passed; originals/audio remain untouched. No native adapter, whole-statement/type-flow proof, target code, desktop executable or deployment authority is added. Future full control-flow/type/effect and native goals remain intact. See docs/SQF-SOURCE-SEMANTICS.md.


## Author-operated mod conversion corpus and pathway priorities (15 October 2026)

Private external-source test details are withheld. The general implementation goals and supported contracts remain unchanged.


## Supplied-source include resolver and compiler CI (15 October 2026)

Added a bounded read-only dependency core and cancellable Node-worker CLI with explicit virtual mounts, source identities, missing/case/unsafe-path findings and potential cycle evidence. 22 focused checks passed; five pinned script/header fixtures yielded 49 exact include paths and six unresolved virtual-prefix requests. No preprocessing, cross-file symbol binding or native conversion is claimed. Added relevant-path Windows/Linux compiler CI; hosted results are separate from local checks. Tree-sitter/ANTLR and GNU CPP remain compatibility evaluations, not integrated dependencies. Release artifact attestations are a future packaging gate; no SLSA level is claimed. The author-operated in-app workflow and all earlier roadmap goals remain. See docs/SQF-SOURCE-DEPENDENCIES.md.


## Literal function registration and lexical call candidates (15 October 2026)

Added bounded literal CfgFunctions registration/source-path inventory, explicit config-root context, named lexical call/spawn candidates and an isolated Node-worker CLI. 26 new focused cases and 22 affected regression cases passed. Five pinned sampled projects (65 files) yielded 186 registration candidates, eight exact source paths and two unique name-candidate call sites; no runtime bindings or execution readiness are claimed. Macro-generated config, include-fragment insertion order, conditionals, inheritance, runtime writes and native behavior remain unresolved. Existing dependency reports match prior fixtures. CI includes the new checks; hosted evidence is separate. This is source-only developer tooling, keeping the author-operated in-app workflow and every prior roadmap goal intact. See docs/SQF-FUNCTION-REGISTRATIONS.md.


## Bounded literal include insertion and source maps (15 October 2026)

Added read-only literal include assembly, per-character original spans, repeated-include occurrence chains and guarded registration composition through explicitly synthetic config identities. Macro/conditional/unknown directives, missing or ambiguous files, cycles and unsupported line splices block entries without partial source/maps/candidates. 22 new cases and 11 affected worker/CLI regression cases passed. Of ten pinned real config entries, three literal units completed and seven macro-dependent units remained blocked; nontrivial include composition is proven by synthetic fixtures, not native mod conversion. Source-only developer tooling; no app/native execution authority or release binary is added. Main now also has the user-requested community policies, GPL-3.0-only original-code licensing and private vulnerability reporting. All prior roadmap goals remain. See docs/SQF-INCLUDE-EXPANSION.md.


## Explicit marker conditions and guarded includes (15 October 2026)

Added an opt-in, source-mapped conditional profile with caller-declared closed-set markers, empty include guards, simple defined/0/1 branches, per-entry state and bounded diagnostic traces. Unsupported replacement/function macros, expressions and substitutions remain blockers; no native environment or conversion readiness is implied. The original literal API/reports remain unchanged against all five cached source sets. 20 new focused cases and 33 affected regression cases passed. A guarded synthetic 102-file fixture now retains 100 registration candidates; real samples remain three completed config units/seven replacement-macro blockers. Same-fixture direct medians: literal 4.03 ms, conditional 4.54 ms; fresh worker 52.15 ms, with no renderer/FPS claim. Fixed worker/CLI, EN/FR/DE developer guides and evidence added. Source-only, no new app binary or app execution authority; existing roadmap items remain. Next: replacement-macro compatibility/origins, cross-file write/binding candidates and typed control-flow/context IR. See docs/SQF-CONDITIONAL-INCLUDES.md.


## Scalar replacement macros with definition/use origins (15 October 2026)

Added opt-in bounded numeric/double-quoted scalar replacements atop the guarded-include engine. Replacement segments retain copied definition spans plus exact invocation and both include-occurrence identities; config registration projections retain those origins. General/function/alias macros, computed includes, scalar-valued predicates and native equivalence remain unresolved. Existing literal and conditional reports match all five cached source sets. 19 new checks and 53 affected regressions passed. Real samples remain three completed entries/seven blockers with 186 registration candidates; a 102-file synthetic fixture demonstrates 101 replacements and 100 candidates. Same literal fixture medians: conditional 4.29 ms, scalar mode 4.32 ms; separate 101-replacement fixture 6.53 ms direct/71.03 ms fresh worker. Fixed worker/CLI, limits, non-execution gates, EN/FR/DE developer instructions and evidence added. Source-only; no new app binary or full conversion claim. Cross-file write/binding candidates, typed IR, broader macro semantics and all existing roadmap goals remain. See docs/SQF-SCALAR-MACROS.md.


## Bounded macro aliases and complete definition chains (15 October 2026)

Added opt-in single-name aliases ending in supported scalar literals, resolved against use-time definitions with mutation-invalidated per-entry caching. Every replacement retains the root invocation, all alias-definition bodies and the terminal literal/occurrences. Distinct missing/empty/cycle/depth findings, a 32-definition bound and 16,384 aggregate origin-reference cap block unsafe/incomplete output. Existing literal/conditional/scalar reports match all five cached source sets. 19 new checks and 72 affected regressions passed; a 102-file fixture exposes 100 registration candidates after 101 replacements with 202 origin links. Real sampled coverage remains three completed config entries/seven blockers and 186 candidates. Same direct-scalar fixture medians: scalar 5.72 ms, alias profile 5.85 ms; separate alias-chain fixture 7.21 ms direct/70.66 ms fresh worker. Developer-only worker/CLI and EN/FR/DE instructions; no app binary, native equivalence or general conversion claim. Next: cross-file function/write candidates and typed control-flow/context IR, with broader preprocessing still gated. All existing roadmap goals remain. See docs/SQF-ALIAS-MACROS.md.


## Cross-file function writes, call joins and conflict review (15 October 2026)

Added a connected developer batch: direct/literal namespace function-write inventory, cross-file call/registration name joins, and competing-write/namespace/dynamic-code review findings. Reuses original registration token scans while the old report wrapper avoids retaining them. Domains, nested code, raw preprocessing, private/local names, computed writes and load order remain explicit uncertainties; no winning definition, resolved binding or execution is inferred. Fixed bounded worker/CLI, strict source input, fan-out limits and EN/FR/DE developer guides added. 25 new checks and 54 affected regressions passed. Five cached sets preserve all older reports and expose 21 write candidates, 19 unique-write-name call sites and two multi-write-name call sites, all unbound. Same 203-file fixture: 200 registrations, 220 writes, 400 calls; median 8.03 ms registration-only, 11.91 ms with the new index, 70.50 ms fresh worker. Source-only; no new app executable/native behavior claim. Next: typed control-flow/context IR using these source candidates, with scope/types/effects/locality and full preprocessing still gated. All existing roadmap items remain. See docs/SQF-CROSS-FILE.md.


## Control/context IR, type slots and detached code regions (15 October 2026)

Added a connected developer batch: region-level branch/loop/exit candidates, detached stored-code/callback contexts, assignment/binding links and bounded expression slots with syntax-only shape hints. Reuses the binding inspector's own captured structure; old binding reports remain identical. No executable CFG, runtime type propagation, inferred exit destination, full statement effects or target code is claimed. Fixed worker/CLI, graph/reference checks, limits and EN/FR/DE developer instructions added. 24 new checks and 65 affected regressions passed. Thirty cached SQF files expose 1,609 IR nodes, 84 branches, 68 loops, 59 unresolved scope exits, 111 detached contexts and 354 assignments; unsupported expressions stay explicit. Same 16-file/160-function fixture: median 89.98 ms binding-only, 134.40 ms with IR, 277.02 ms fresh worker. Source-only; no new app executable. Added official sample and installed API documentation reference locations, strictly as inspiration/reference with no code copied or native verification. Next: strict imported-IR validation, supported statement effects and source-type/context constraints before verified lowering. Every existing roadmap goal remains. See docs/SQF-CONTROL-CONTEXT.md and docs/NATIVE-REFERENCE-SOURCES.md.


## Source-bound IR verification and potential statement effects (15 October 2026)

Added strict control/context IR verification by defensive plain-data snapshot plus exact source replay, preserving every field/gate and returning a fresh canonical source-produced report. Added potential statement effects, same-context summaries and callback/conditional invocation candidates; detached bodies are not merged as already executed. Fixed effect/verification workers and read-only/fresh-output CLI commands, budgets, raw-byte rechecks and EN/FR/DE developer guides added. 38 new checks and 38 affected regressions passed. Thirty cached SQF files retain identical source/IR bytes and expose 103 command candidates, 13 invocation candidates and 354 potential writes, with unknown coverage explicit. Same 16-file fixture: 124.83 ms IR-only, 150.18 ms effects, 371.27 ms replay validation/equality, 326.66 ms fresh effect worker, 503.15 ms fresh verification worker. No app execution/import authority, full statement analysis or native readiness is claimed. Next: source-type/initialization constraints and explicit supported lowering before native adapters. All prior roadmap goals remain. See docs/SQF-IR-VALIDATION-AND-EFFECTS.md.


### 15 October 2026 — source constraints and initialization evidence

Added a developer-only source-constraint inventory over the existing control/context IR: assignment shapes, parameter default/exemplar evidence, command signature and operator requirements, enclosing control regions and unresolved read initialization. Fixed bounded worker/CLI and source-bound imported-IR replay are covered. No runtime type propagation, definite-assignment solver, native adapter or executable generation is claimed. Existing roadmap goals and report/bundle formats remain intact. See [source constraints](docs/SQF-SOURCE-CONSTRAINTS.md) and its test/performance evidence; flow joins and verified types remain pending.


### 15 October 2026 — desktop dependency inspector

Added an explicit native source picker and on-demand desktop dependency review with unresolved-include filters, search, 40-row pages and captured-source previews. Settings and 51 Sarge topics are synchronized in EN/FR/DE. Cancelling/rejecting retains the previous review; clearing affects only session inspection. Includes are not auto-loaded, guards are not evaluated and source is never executed. This is the first desktop diagnostic increment; function/type/effects explorers, a graph view and combined export remain later work. Existing goals are retained. See [the workflow and validation](docs/DESKTOP-DEPENDENCY-INSPECTOR.md).


### 15 October 2026 — GM workspace layout correction

Packages 14/16: the floating editor and drawers clear wrapped map tools; long controls stay inside the panel. Five actual-app size/language/text combinations, Full map restoration, drawers, source-file inspection and unchanged mission checks passed. A matched short 400-unit comparison found no obvious frame-time regression. Existing Sarge/Settings destinations remain unchanged; EN/FR/DE usage notes and limits are recorded in [the layout guide](docs/GM-WORKSPACE-LAYOUT-FIX.md). This is a small usability correction; diagnostic explorers and all existing roadmap goals remain pending as previously recorded.


### 15 October 2026 — compact floating GM controls

The full-width bar is now content-sized. Assets, Inspector, Editor and live status remain visible; GM actions contains secondary commands. Existing handlers, approval boundaries and mission state are preserved. Sarge/EN/FR/DE guidance, responsive menu checks and the short performance sample are in [the toolbar guide](docs/GM-COMPACT-TOOLBAR.md). All existing roadmap goals remain.


### 15 October 2026 — desktop Function Explorer and scaffold-export addition

Delivered a searchable Function Explorer with registrations, possible writes, calls, warnings and source previews in a shared diagnostics window with Dependencies. Settings and 52 Sarge topics include EN/FR/DE guidance. Real radio inputs, a 1,000-row synthetic UI case and short same-fixture performance checks passed; see [the workflow](docs/DESKTOP-FUNCTION-EXPLORER.md).

Added the user-requested [tiered scaffold-export milestone](docs/TIERED-SCAFFOLD-EXPORT-PLAN.md): verified green emission, explicit yellow scaffolds, red manual placeholders and a source-linked checklist. Review remains default. Scaffold Mode and Enforce emission are planned, not delivered here; types/signatures are never guessed from names or simple syntax. All existing roadmap goals remain.


### 15 October 2026 — desktop type and initialization review

Added the third diagnostics tab: source-shape and parameter evidence, unresolved reads, possible writes in branch/loop regions, source requirements and unsupported syntax. Reuses the bounded native picker/worker and source-constraint pass; it does not infer runtime/target types or prove initialization. Settings and 53 EN/FR/DE Sarge topics are synchronized. Actual radio inputs, a larger UI fixture, source safety/context retention and short same-map performance checks passed; see [the guide](docs/DESKTOP-TYPE-INITIALIZATION-REVIEW.md). Existing compiler, scaffold-export and mission-planner goals remain unchanged; verified emission is still pending.


### 15 October 2026 — desktop Effects Inspector

Added the fourth source-diagnostics tab: possible writes, command/invocation candidates, separate stored contexts, scheduling candidates, cleanup/lifetime review and unreviewed regions with source previews. Reuses the bounded worker and existing effect producer; no invocation, native behavior or emission is resolved. Settings and 54 EN/FR/DE Sarge topics are synchronized. Real radio sources, a larger callback fixture and affected desktop checks passed; see [the guide](docs/DESKTOP-EFFECTS-INSPECTOR.md). Prior goals remain intact. Combined diagnostic export, verified target mappings and tiered scaffold generation remain pending.


### 15 October 2026 — combined diagnostics and comments-only scaffold handoff

Delivered combined JSON/offline HTML exports from completed native snapshots with separate source/context identities, missing-review visibility and opt-in complete source text. Added explicit comments-only Scaffold mode: yellow/red source-linked manifest/checklist, safe output names, preserved original notices and no overwrites. Green remains zero; signatures/types/native semantics are not guessed. Settings and 55 EN/FR/DE Sarge topics are synchronized. Actual packaged exports, notice/source safety, snapshot clearing and affected checks passed; see [the guide](docs/COMBINED-DIAGNOSTIC-EXPORT.md). This advances the planned comments-first scaffold stage; earlier planning statements describe the previous checkpoint. All existing goals remain. Verified semantic mappings, green emission and native integration are still pending.


### 15 October 2026 — first verified pure expression family

Added opt-in literal-only Boolean value helpers with source/output maps and a matching native proof receipt. The actual 1.8.0.13 headless diagnostic server compiled/executed 46 cases; Workbench startup crashed before results and is not a pass. Green applies only to pure expressions; parent statement/function/mission conversion remains zero. Commands, variables, code operands, ambiguous grouping and selected preprocessing stay blocked. Ordinary comments-only handoff remains unchanged. Added a non-launching reproduction tool, export budget/proof gates and 56 EN/FR/DE Sarge topics. See [the mapping guide](docs/BOOLEAN-EXPRESSION-MAPPING.md). Earlier zero-green notes describe the prior checkpoint; broad semantic/lifecycle/native integration goals all remain intact.


### 15 October 2026 — consistent component source review

Private external-source test details are withheld. The general implementation goals and supported contracts remain unchanged.


### 15 October 2026 — initialized Boolean local blocks

Added optional complete flat Boolean local-block lowering: initialized private declarations, preceding local reads, sequential assignments and an explicit final Boolean value. Unknown/global/type-changing or control-flow operations reject that file as a whole. Native 1.8.0.13 diagnostic server compiled and executed 24 cases, then stopped; source SQF and game client were not run. Detached helpers carry original source/output maps and require caller/lifecycle integration. Existing comments-only and literal-expression modes remain intact. Separate review-bound acknowledgment, 58 EN/FR/DE Sarge topics and existing Settings routes cover the feature. This completes only the Boolean straight-line subset; general locals, functions, branches, loops, macros and all earlier roadmap goals remain intact. See [Boolean local mapping](docs/BOOLEAN-LOCAL-MAPPING.md).


### 15 October 2026 — bounded pure Boolean if/else lowering

Added an optional Boolean branch family alongside the existing straight-line local export. Statement-form if/else, optional else and bounded nesting can write previously initialized Boolean locals; both arms are checked. Branch-local declarations, unknown/global/engine operations, loops, value-form if and lifecycle integration stay manual. Native 1.8.0.13 diagnostic server compiled and executed 32 independently checked fixture outcomes, then stopped. No source SQF or game client was run. Family/source/profile changes reset scope acknowledgment; EN/FR/DE guidance and 59 Sarge topics are synchronized. All earlier goals and modes remain intact. See [Boolean branch mapping](docs/BOOLEAN-BRANCH-MAPPING.md).


### 15 October 2026 — conversion coverage polish and exact integer values

Added explicit read-only coverage previews for every expression/block family, with supported/mixed/manual/inventory rows, search and 20-file pages. Matching zero coverage disables that family’s helper export; stale coverage is discarded and save controls stay fixed while busy. Added the next type family: exact integer literal/negation/grouped +, - and * values with every intermediate bounded to ±16,777,215. Native 1.8.0.13 diagnostic server compiled and executed 42 cases after correcting a compiler-detected grouping issue. Parent statements, general numeric semantics and complete missions remain manual. Existing modes, plans and all roadmap goals remain intact. Settings and 61 EN/FR/DE Sarge topics are synchronized. See [coverage and integer mapping](docs/MIGRATION-COVERAGE-AND-INTEGERS.md).


### 15 October 2026 — typed pure function module compiler

Added explicit Boolean params/defaults, named code-valued function bodies, local state, branches, function-root guard exits and cross-file calls inside a selected closed module. Candidate/write uniqueness, typed argument checks, dependency propagation and cycle rejection prevent speculative bindings. Native 1.8.0.13 diagnostic server compiled six methods and executed 42 invocation/default cases. Source registration, dynamic scope, external callers, lifecycle and engine hooks stay manual. Coverage/export now includes typed functions and source/parameter/method/call-edge maps; base comments-only handoff remains intact. Settings and 62 EN/FR/DE Sarge topics are synchronized. All prior goals remain. See [typed Boolean functions](docs/TYPED-BOOLEAN-FUNCTIONS.md).


## Additive checkpoint — typed scalar function modules, revision 2

Delivered bounded subsets of the next compiler priorities: selected literal CfgFunctions file bodies with original source maps; structured/nested closed calls; explicit bool/exact-int/ASCII-string parameter/local/return contracts; initialized branch-private scope; literal-count loops with conservative closed-call cost bounds. Existing pure Boolean paths remain supported. Generated compatibility filenames/keys are retained.

The selected-project preparer emits a new isolated Game project without launching an engine. The native 1.8.0.13 server checked 82 invocations across 16 methods through this preparation path and matched the exact generated module hash. Source SQF was not run; this is not an Arma 3 runtime equivalence test or proof of complete mod conversion. See docs/FUNCTION-MODULES.md and docs/test-evidence/function-modules-native.json.

The ten requested priorities remain tracked explicitly:

| Priority | Current state |
| --- | --- |
| 1 Registered function files | Literal unique selected registrations supported; inheritance/preprocessed merges and automatic init remain manual. |
| 2 Preprocessing | Existing includes/conditions/scalar/alias subsets retained; full function-like macros/shared-context integration remains pending. |
| 3 Structured calls | Closed scalar calls may be grouped/nested and composed in Boolean expressions; dynamic calls remain manual. |
| 4 Typed values | Boolean, bounded exact integers and short printable ASCII strings supported for copy/pass/return; arithmetic/dynamic arrays remain pending. |
| 5 Scope/initialization | Initialized branch locals and type consistency checked; shadowing and uninitialized declarations remain manual. |
| 6 Loops | Bounded literal range subset supported; counter reads, dynamic bounds, general loops and nested exits remain manual. |
| 7 Scheduling/lifecycle | Pending verified semantic adapters; no automatic spawn/sleep/waitUntil translation. |
| 8 Engine adapters | Existing GM adapters remain separate; migration-to-engine entity/group/vehicle wiring still pending. |
| 9 Workbench handoff | Selected generated project preparation and synthetic native validation delivered; project integration stays manual. |
| 10 Real mod/release validation | Private source review continues; complete real-mod migration and consolidated release are not complete. |

This is progress on the ten tasks, not a claim that all ten are finished. The wider planner, GM/server, resource, binary inventory and release roadmap remains intact. Sarge, Settings destinations and EN/FR/DE guides accompany this checkpoint.


## Additive RC3 milestone — preprocessing, owned scheduling and game-review handoff

RC3 delivers bounded implementations for the remaining release-batch priorities: selected function-style preprocessing with origin-preserving fresh review export; native-tested owned delay/readiness job scaffolds; imported-unit handoff to the existing host-approved deployment adapter; and consolidated real-source, regression, desktop and performance validation. See docs/RC3-MIGRATION-ADAPTERS.md and docs/RC3-RELEASE-DEBRIEF.md.

The ten-priority batch now has concrete supported paths for registered files, selected preprocessing, structured calls, scalar contracts, initialized branch scope, literal loops, owned scheduling, reviewed engine deployment, isolated native handoff and prerelease validation. This does not complete arbitrary SQF-to-EnScript translation. Native preprocessing parity, missing external headers, engine-side UI/audio/events, general scheduling, crew/group reconstruction and unsupported source semantics remain explicit manual/roadmap items. No broader goal is removed or marked complete by inference.

Source is never executed to infer meaning. Generated jobs are not auto-started; deployment still requires in-game host approval. Runtime state remains separate from saved missions and Undo. Existing Workshop scripts were not changed for these desktop additions.


## RC3 follow-on sequence

The additive next 100 steps are recorded in docs/NEXT-100-STEPS.md. Private third-party corpus identities and findings are withheld from distribution.


## Next-100 implementation checkpoint — 16 October 2026

Added explicit folder preview, shared-header capture, virtual-mount repair, navigable include connections, saved non-source review controls, unchanged-report reuse, bounded decimal conditional review, source-linked comparison, read-only generated project preview, compatibility status and a public distribution exclusion gate. Asset search adds category aliases, naval/support hints and filtered category counts. Sarge and EN/FR/DE guidance follow the new controls. These are development additions, not completion of all 100 steps or stable-release approval. See docs/NEXT100-DELIVERY.md and docs/NEXT100-PROGRESS.md (paths relative to repository root). All existing roadmap goals remain.


## Advisory initialization and symbol checkpoint — 16 October 2026

Added bounded background path review for supported literal writes, branch intersections and zero-iteration loops; unknown effects and caller contexts remain manual. Added revision-bound symbol provenance, nested forEach body candidates, source-linked paged UI and explicit local export. Reports retain runtime/type/lowering authority as false and do not mutate the original Types snapshot or mission state. General CFG/type inference and native switch/loop generation remain pending. Sarge and EN/FR/DE guidance cover the optional Types panel. See docs/NEXT100-INITIALIZATION.md. All existing roadmap items remain.

### Asset browser organization — 16 October 2026

Complete-vehicle filters now exclude vehicle components, wrecks and base templates. These technical entries have separate categories and remain hidden by default; selecting a technical category enables their visibility. Props and structures take precedence over imported vehicle icon hints. Existing resource identities and assigned-unit snapshots are unchanged. Sarge and French/German guidance describe the filters. Classification remains a catalog hint, not proof of native spawnability.

Validation: six browser tests and three localization tests passed. An isolated offline Electron fixture passed vehicle/part separation, technical-category visibility, locale switching and unchanged mission data with no page errors. On the same 2,721-entry vanilla catalog, the default vehicle list narrowed from 570 to 198 candidates. The short local classification/filter measurements are recorded in docs/test-evidence/asset-browser-organization.json; they are not sustained-performance or native-spawning certification.


### Named tracking and default faction organization

Adds catalog-only faction organization and negotiated live label/faction/kind telemetry. Player names come from the server player manager. Unknown/legacy feeds remain unidentified. See docs/NAMED-TRACKING-AND-FACTIONS.md; native and real-session acceptance are recorded separately.


### Reviewed infantry route checkpoint

Companion followon.4 and native bridge 0.8.0 candidate add 1–16 ordered map waypoints, full host review, separate capability negotiation and ownership-safe replacement/cancellation. Native installation/lifecycle gates passed; normal-terrain travel remains an acceptance test. AI labels now read AI while player names are retained. See docs/INFANTRY-ROUTES-PILOT.md. Existing goals remain unchanged.


### Existing-squad control checkpoint — 16 October 2026

Followon.5 / bridge 0.9.0 candidate adds explicit live-marker selection, reviewed recruitment and release, and native bounded Follow. Synthetic native lifecycle and desktop checks passed. Real-player Follow and normal-terrain travel remain acceptance work. Formation, stance, combat, transport and building-entry scope is retained. See docs/SQUAD-CONTROL-PILOT.md.


### Native squad-settings checkpoint — 16 October 2026

Followon.6 / bridge 0.10.0 candidate adds four verified formation definitions with restoration, persistent native stance settings and distinct native fire policies. Synthetic readback, membership propagation, foreign editor-setting protection and desktop review gates passed. Diamond/Circle, adaptive Auto, physical formation/combat acceptance and other command families remain open. See docs/SQUAD-SETTINGS-PILOT.md. Existing roadmap goals are retained.


### Vehicle seat inspection checkpoint — 17 October 2026

Step 71 adds separately negotiated, host-approved read-only snapshots of bridge-created vehicles. Empty, AI-occupied, reserved/inaccessible and nonvehicle cases passed native diagnostics; offline Electron checks passed review, safe display, three languages, stale review, pairing cleanup and mission preservation. Source checkpoint only: no new release or Workshop publication. Steps 72–74 and real-player/combat acceptance remain open. See docs/VEHICLE-INSPECTION-PILOT.md. All existing goals remain.


### Embark preflight groundwork — 17 October 2026

Step 72 is partial: original native read-only role/capacity checks compiled and passed eight isolated checks. Vehicle inspection now rejects recruited infantry at the relay. Reviewed boarding requests, execution authority/lifecycle, actual boarding, dismount and mixed-human transport remain unfinished. No action is advertised and no release is packaged. See docs/EMBARK-PREFLIGHT.md. All existing goals remain.

### Transport and server snapshot development — 17 October 2026

Original reviewed embark/dismount now pass actual four-member native boarding, partial recovery, cancellation, foreign-reservation preservation and pairing cleanup. Server snapshots separately save planned deployment or supported current COMMAND state inside the server profile. Native process-restart, frozen no-spawn review, separately approved restoration, exact member positions, saved move/stance and incompatible-restore rollback passed. Offline desktop checks cover both workflows, three languages and unchanged mission data. Source development only; no new release or Workshop publication yet. Vehicle driving, convoy, supported healing and building metadata remain active next work. See docs/SQUAD-TRANSPORT-PILOT.md and docs/SERVER-SCENARIO-SNAPSHOTS.md. All existing roadmap goals and external acceptance remain.

### 18 October 2026 — integrated control development pilot

Original reviewed transport, server-side COMMAND scenario snapshots, separate vehicle routes, bounded convoy pursuit and one-member native treatment now have isolated native and offline desktop evidence. Read docs/CONTROL-PILOT-RELEASE.md and docs/test-evidence/control-pilot-validation.json. Native building door metadata assessment passed without enabling entry/navigation. This is development scope; connected-human, multiplayer, combat and remaining NEXT100 acceptance work stays open.
