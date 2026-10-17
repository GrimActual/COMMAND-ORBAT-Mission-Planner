# Roadmap navigation — updated 13 October 2026

The current future programme is [the master roadmap](../ROADMAP.md), with [all 200 backlog items](../docs/FUTURE-FEATURE-WISHLIST.md) and [package ownership](../docs/FUTURE-FEATURE-MAPPING.json).

Current development executable: **2.9.1-dev.gm.4 — COMMAND compact GM workspace pilot**. It retains the placement fix, searchable vanilla catalog and existing reviewed spawn/remove workflow. Earlier release notes below are historical; current scope is recorded in [the compact workspace guide](../docs/COMPACT-GM-WORKSPACE.md).

The notes below are retained historical release notes. Their older pending/current labels are not the status of the latest build.

---

## v2.8.1 delivery
Scaling preferences, five source-verified side-mission planning templates, manual mission clock/event log and Excel-compatible planner CSV delivered. Native XLSX and GeoJSON/KML/KMZ/MilX are pending validated interoperability and, for geographic formats, a verified game-to-WGS84 mapping. Live game objectives/timers remain out of scope.

# COMMAND — development roadmap, 10 October 2026

## Current tested increment: v2.6.1

Keep the existing planner and manual backups. This release covers the first priority batch, not the complete pasted roadmap.

- Offline editor startup: Leaflet bundled locally; a 16-tile lower-detail Everon background is available offline. Online tiles add detail. The desktop presentation exporter uses the bundled fallback too. Workshop, URL catalogs and online terrain still need a connection.
- Settings: light/dark/high-contrast options, desktop scaling, metric/imperial display, snap-to-grid, default zoom, partial-enclosure selection, WASD preference. English, French and German interfaces and Sarge help are available.
- Saving: Saved/Unsaved/Saving/Failed states; existing timestamped, validated manual backups retained. No automatic backup scheduler.
- Editing: selected-unit group movement, session copy/paste, duplicate, alignment/distribution, locks, Space-drag pan, fit visible ORBAT. Group mutations use one undo step; locked objects reject mutation and deletion. Imports intentionally replace the whole plan and are not constrained by old object locks.
- Briefing: expand map and request fullscreen; restore editor with Exit briefing/Escape. The saved operation is unchanged.
- Locations: a research registry records the requested 20 names with null coordinates. Nothing is guessed. It is not exposed as verified navigation data or a project JSON file.

## Performance pass before continuing

v2.4.3 retains map objects through zoom, reuses unit markers during edits, reduces grid/cursor work, bounds terrain requests, and reports GPU compositing status. See UPDATE-2.4.3.md for measurements and limits.

## Still pending from immediate targets

- Native-speaker translation review and full localization of technical diagnostics remain pending. Generated brief/legend labels, selected brief distance units and form hints are covered in v2.6.1.
- Keyboard customization delivered in v2.4.2 for canvas actions and movement, with validated alternatives, disable/reset and typing guards. Mouse gestures, Shift boost and dialog/fullscreen Escape stay fixed.
- Individual unit patches and multiple named branding profiles remain pending. One opt-in community default (name/logo/watermark/stamp) is saved locally in v2.6.1, excluding operation title/date. SVG, export community logo/patch, watermark, operation date and fictional exercise stamps are delivered in v2.6.0. Preview and selected unit/route/area export are delivered in v2.5.0.
- Verify all 20 locations against the correct Reforger Everon world, record version/source and coordinate conversion controls. Then implement search, jumps, coordinate copy, objective creation and export labels. Do not activate unverified targets.

## Next phases after this release is stable

Radio/callsign management → OPORD generator → expanded mission phases → templates → transport/logistics → GM/player redaction → documented Reforger interchange.

Elevation/LOS requires verified terrain data. TOC connections, collaboration, live game sync and simulation are future work, not current functionality. No implied real-time connection or verified ballistic model.

## Compatibility and verification

Project schema stays at v4. Optional true `locked` properties are preserved by this release on units, routes and areas; earlier builds can open the geometry but discard lock flags. Older v1–v3 imports are still supported. Preferences remain local and separate from plans. Offline base imagery uses the pre-existing map transform; it does not establish independently verified world-coordinate calibration.

Full UI scale is native in the Windows EXE; browser fallback enlarges controls. Copy/paste is within the app session, not a cross-application system clipboard. Snap changes new placement/drag targets, not existing geometry automatically.

## Reviewed prefab planning assets — 13 October 2026
Development 11 advances Package 12 from identity review to usable planning references. Prefab rows offer explicit name/type selection and prepare the existing Units asset selector; applying/placing embeds GUID, addon ID, path, provenance and target warnings. Preparation is mission-neutral; assignments use existing save and one-step Undo/Redo. Conflicting duplicates are rejected, locale changes retain draft values, and Sarge/Settings guidance is synchronized in EN/FR/DE. Focused contracts and actual desktop assignment/reload passed; the same 400-unit/500-resource sample stayed near 59 FPS. [Guide and validation](../docs/REVIEWED-PREFAB-ASSETS.md). Engine spawning/component adapters and server verification remain separate unfinished milestones. Preview 5 archives remain unchanged.

## Portable planning catalogs — 13 October 2026
Development 12 continues Package 12: Assets can export the session catalog plus assigned unit snapshots through a validated native Save dialog, then reimport them after restart. GUID/provenance and warnings survive; conflicts stop export before saving, and no mission/Undo/live-state changes occur. Sarge and Settings guidance are synchronized in EN/FR/DE. Sixteen relevant checks, actual desktop save/reimport/error workflows and a narrow post-optimization save check passed. Operation timings were compared against Development 11; a redundant renderer validation pass was removed while retaining native validation. [Steps and measured limits](../docs/PORTABLE-PLANNING-CATALOGS.md). Preview 5 archives are unchanged. The separate manifest-copy experiment is not promoted into release source or treated as verified prefab GUID data.

## Downloaded-addon project identity review — 13 October 2026
Development 13 extends Package 12 with opaque bounded GameProject Configurations acceptance and a one-picker project-only review. Real copied Invade & Annex identity/dependencies now import without sidecars, exporting zero resource records rather than inventing GUIDs. Sarge/Settings are synchronized in EN/FR/DE. Twenty-three relevant checks and the actual desktop copy workflow passed; parser timing was compared with Development 12. All 12 original installed addon files remain hash-identical. [Steps and compatibility limits](../docs/PROJECT-IDENTITY-COMPATIBILITY.md). The isolated manifest test stays preserved; binary resource mapping and native engine adapters remain future gates. Preview 5 packages are unchanged.

## Resource index reuse in Assets — 13 October 2026
Development 14 advances Package 12 with a one-picker worker-backed resource-index JSON load, multiple-addon owner review, bounded unresolved-reference findings and the existing prefab-to-unit preparation flow. Imported observations are explicitly declarations; referenced files are not rechecked and target-warning filtering is disabled. Empty indexes and cancel/rejection retention work. Sarge/Settings are synchronized in EN/FR/DE. Thirteen relevant checks and the actual 501-resource desktop workflow passed. The review retains its audit instead of rebuilding it during paging/preferences; matching 500/5,000-reference timings and zero UI rebuilds were recorded. [Steps and evidence](../docs/RESOURCE-INDEX-REVIEW-UI.md). Native GUID extraction from RDB and engine/server adapters remain subsequent gates; Preview 5 archives are unchanged.

## Native read-only bridge runtime gate — 13 October 2026
The real diagnostic local-server executable sent native Enforce position updates through temporary HTTPS into Companion. Movement, unchanged mission JSON, same-stream interval reload after a reproduced counter-reset fix, native authentication rejection and cleanup were verified. Changed Enforce source compiled for PC/WORKBENCH. Server profile-path instructions are corrected in the guide, Settings and translated Sarge guidance. [Native runtime scope/evidence](../docs/NATIVE-BRIDGE-RUNTIME.md). Standalone dedicated-server runtime, endpoint-preserving revocation/retry-limit checks and Workshop candidate publication remain pending. No new feature-build number or package was created; consolidate after the remaining release gates.

## RC2 — bounded live tracking and deployment preview

Packages 01/04/11 now carry 60 opt-in named-entity batches with native HTTPS evidence. Package 12/14 adds a desktop deployment review/export with GUID provenance and stale checks; execution remains pending. Settings and 47 EN/FR/DE Sarge topics accompany delivery. Automatic opt-in player discovery, respawn lifecycle, 120-player scaling, server-reviewed spawn/remove and optional compact GM workspace remain future milestones. See docs/RELEASE-CANDIDATE-2.md.

## Unpublished player-source pilot

Explicit positive session player IDs, stable telemetry aliases, controller-bound leases, respawn baseline resets and disconnect retirement compile in PC/Workbench. Synthetic native policy and real empty-player-source HTTPS checks passed. Actual connected-player validation is pending; Workshop 0.3.0 and RC2 remain unchanged. See ../docs/PLAYER-TRACKING-PILOT.md.

### Asset browser usability — 14 October 2026
Searchable, paged asset cards replace the full catalog dropdown. Unit type links to troop/armoured/APC/light-vehicle/aircraft/logistics filters; prefab faction filters and variant visibility remain independent of mission faction. Exact asset snapshots and GUIDs are retained. Settings opens the browser; Sarge and EN/FR/DE guidance cover the workflow. Deployment review explains missing or invalid names. Native spawn availability remains separate from classification hints.

## Package 14.1 — compact GM workspace, 14 October 2026
The optional layout is implemented in 2.9.1-dev.gm.4: existing asset chooser in a collapsible drawer, capped read-only planned-selection inspector, existing deployment/results links and explicitly offline rehearsal controls. Mode/drawer preferences stay outside mission JSON; layout-only changes skip map/asset rebuilds and leave active replay running. Existing forms, pending edits, selection, Undo/Redo and full-map behavior are retained. Settings and 50 Sarge topics have EN/FR/DE guidance. The active MagicPath design is COMMAND — Compact GM Workspace. See [the workflow guide](../docs/COMPACT-GM-WORKSPACE.md). Native AI orders, properties and environment adapters remain the next integration milestones; this layout does not implement them.

## Native AI-order pilot — 14 October 2026

Package 14 now adds Move to position and timed Hold for bridge-created on-foot infantry AI groups in desktop 2.9.1-dev.gm.5 / Workshop candidate 0.5.0. In-game host review remains mandatory. Versioned requests, capability negotiation, same-pair ownership and stale desktop reviews accompany the adapter. Native PC/Workbench compilation and an isolated actual-server waypoint lifecycle gate passed; physical travel/arrival, combat behaviour and occupied/mounted rejection in real Host Local sessions remain pending. The new runtime test used loopback, not public HTTPS. Desktop context/localization/mission isolation and all 215 regression tests passed. Settings and the existing 50 Sarge topics include EN/FR/DE guidance. Vehicle transport/crew, route chains, properties and environment remain separate roadmap milestones. See [the pilot guide](../docs/NATIVE-AI-ORDERS-PILOT.md).

## Package 14.2–14.5 — squad-command expansion, 14 October 2026

The requested friendly-squad selection/recruitment, Follow Me, ground/map Move and chained routes, Force Move, Attack, Defend, Halt, formations, stances, strict fire control, suppression/look, vehicles/healing, attach/detach/convoys and stack/breach/garrison/clear are retained in [the implementation and native-binding specification](../docs/AI-COMMAND-EXPANSION.md). Advanced AI Command 69A404653EE3F3C4 is inspiration only; no code/assets/dependency is imported. The existing published Move/timed-Hold pilot is unchanged. New source rejects missing native group utility, incompatible waypoint classes and unknown actions rather than guessing a movement behaviour. Diagnostic work now traces waypoint selection, activity and resolved behaviour-tree resource; arrival/combat/interior completion remain separate gates. Undelivered controls stay unavailable, and Settings/Sarge state that explicitly in EN/FR/DE.

### First tactical adapters — development source
Defend position and cancellation of the Companion-owned waypoint are connected through a separate capability, strict contract, stale-reviewed desktop form and native host approval. Actual isolated-server traces confirm the defend state/activity/ActivityDefend.bt, cancellation, subsequent Move and old-relay fallback. EN/FR/DE desktop checks pass. Source is dev.gm.6 / native 0.6.0 candidate; published dev.gm.5 and Workshop 0.5.0 remain intact. Physical navigation/defence and the broader squad-control stages are still open. See [the complete scope and evidence](../docs/AI-COMMAND-EXPANSION.md).


## Additive milestone — Arma 3 / SQF to Enfusion migration

Retain every existing roadmap package. Extend shared contracts, resource identity/adapters and the GM workspace with drop-file migration review, then explicit Arma 3 class-to-prefab mapping, supported-pattern parsing, terrain calibration, reviewed neutral intents and native export/validation. The first source workflow inventories selected SQF/SQM/EXT/HPP files without execution, offers verified movement binding candidates, and marks unresolved classes, control flow and engine semantics for review. Full SQF translation and native mission export remain unfinished. See [migration foundation](../docs/SQF-MIGRATION-FOUNDATION.md). Current published releases and the user’s test copy remain unchanged.

Migration release checkpoint: 2.9.1-dev.gm.7 consolidates this read-only workflow and the previously tested tactical Defend/cancellation candidate. 226 release regressions, offline worker/drop/picker, localization/context, safe display, paged findings and validated native JSON Save passed. Existing native source hashes match retained compilation/runtime evidence. Full automatic SQF conversion and chained AI routes remain separate unfinished milestones; no earlier roadmap content was removed.


## Additive migration checkpoint — reviewed class mappings

The next source candidate adds explicit Arma 3 classname-to-prefab confirmation against the validated resource index, searchable typed cards, repeated-class reuse, portable mapping export/reload and transactional rejection of incompatible index changes. Exact addon/GUID/path, provenance and declared dependencies are preserved; mappings remain non-executable and gameplay equivalence/native availability unverified. 27 focused checks and actual offline desktop/large-list gates passed, including a quote-scanner hardening found by the large-file test. Sarge/Settings guidance remains synchronized in EN/FR/DE. Cached 2,721-resource searches measured p95 0.341 ms. The published dev.gm.7 release is unchanged. Supported-pattern neutral intent translation, terrain/native validation and chained AI waypoints remain retained unfinished milestones. See [mapping guide](../docs/SQF-CLASS-MAPPINGS.md).


## Additive migration checkpoint — source-linked neutral intent drafts

The next source candidate recognizes a bounded straight-line SQF subset and emits non-executable mapped spawn/movement/basic-waypoint drafts, literal bindings and source-local object links. Source hashes/references, exact resource-map snapshots, mandatory review gates, source/mapping stale locks and validated native JSON export accompany worker preparation. Conditional/dynamic/unsupported constructs remain unresolved and are never flattened into actions. 39 focused JS checks, 13 independent schema cases and actual offline desktop isolation/export/race gates passed. Sarge and Settings guidance is synchronized in EN/FR/DE. A 400-intent/200-definition preparation fixture measured median 16.32 ms / p95 18.17 ms. Published releases and earlier candidates are preserved. Terrain calibration, planning transfer, native export, complete SQF conversion and chained AI routes remain retained unfinished milestones. See [draft guide](../docs/SQF-MISSION-INTENT-DRAFTS.md).


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

Added a developer-only source-constraint inventory over the existing control/context IR: assignment shapes, parameter default/exemplar evidence, command signature and operator requirements, enclosing control regions and unresolved read initialization. Fixed bounded worker/CLI and source-bound imported-IR replay are covered. No runtime type propagation, definite-assignment solver, native adapter or executable generation is claimed. Existing roadmap goals and report/bundle formats remain intact. See [source constraints](../docs/SQF-SOURCE-CONSTRAINTS.md) and its test/performance evidence; flow joins and verified types remain pending.


### 15 October 2026 — desktop dependency inspector

Added an explicit native source picker and on-demand desktop dependency review with unresolved-include filters, search, 40-row pages and captured-source previews. Settings and 51 Sarge topics are synchronized in EN/FR/DE. Cancelling/rejecting retains the previous review; clearing affects only session inspection. Includes are not auto-loaded, guards are not evaluated and source is never executed. This is the first desktop diagnostic increment; function/type/effects explorers, a graph view and combined export remain later work. Existing goals are retained. See [the workflow and validation](../docs/DESKTOP-DEPENDENCY-INSPECTOR.md).


### 15 October 2026 — GM workspace layout correction

Packages 14/16: the floating editor and drawers clear wrapped map tools; long controls stay inside the panel. Five actual-app size/language/text combinations, Full map restoration, drawers, source-file inspection and unchanged mission checks passed. A matched short 400-unit comparison found no obvious frame-time regression. Existing Sarge/Settings destinations remain unchanged; EN/FR/DE usage notes and limits are recorded in [the layout guide](../docs/GM-WORKSPACE-LAYOUT-FIX.md). This is a small usability correction; diagnostic explorers and all existing roadmap goals remain pending as previously recorded.


### 15 October 2026 — compact floating GM controls

The full-width bar is now content-sized. Assets, Inspector, Editor and live status remain visible; GM actions contains secondary commands. Existing handlers, approval boundaries and mission state are preserved. Sarge/EN/FR/DE guidance, responsive menu checks and the short performance sample are in [the toolbar guide](../docs/GM-COMPACT-TOOLBAR.md). All existing roadmap goals remain.


### 15 October 2026 — desktop Function Explorer and scaffold-export addition

Delivered a searchable Function Explorer with registrations, possible writes, calls, warnings and source previews in a shared diagnostics window with Dependencies. Settings and 52 Sarge topics include EN/FR/DE guidance. Real radio inputs, a 1,000-row synthetic UI case and short same-fixture performance checks passed; see [the workflow](../docs/DESKTOP-FUNCTION-EXPLORER.md).

Added the user-requested [tiered scaffold-export milestone](../docs/TIERED-SCAFFOLD-EXPORT-PLAN.md): verified green emission, explicit yellow scaffolds, red manual placeholders and a source-linked checklist. Review remains default. Scaffold Mode and Enforce emission are planned, not delivered here; types/signatures are never guessed from names or simple syntax. All existing roadmap goals remain.


### 15 October 2026 — desktop type and initialization review

Added the third diagnostics tab: source-shape and parameter evidence, unresolved reads, possible writes in branch/loop regions, source requirements and unsupported syntax. Reuses the bounded native picker/worker and source-constraint pass; it does not infer runtime/target types or prove initialization. Settings and 53 EN/FR/DE Sarge topics are synchronized. Actual radio inputs, a larger UI fixture, source safety/context retention and short same-map performance checks passed; see [the guide](../docs/DESKTOP-TYPE-INITIALIZATION-REVIEW.md). Existing compiler, scaffold-export and mission-planner goals remain unchanged; verified emission is still pending.


### 15 October 2026 — desktop Effects Inspector

Added the fourth source-diagnostics tab: possible writes, command/invocation candidates, separate stored contexts, scheduling candidates, cleanup/lifetime review and unreviewed regions with source previews. Reuses the bounded worker and existing effect producer; no invocation, native behavior or emission is resolved. Settings and 54 EN/FR/DE Sarge topics are synchronized. Real radio sources, a larger callback fixture and affected desktop checks passed; see [the guide](../docs/DESKTOP-EFFECTS-INSPECTOR.md). Prior goals remain intact. Combined diagnostic export, verified target mappings and tiered scaffold generation remain pending.


### 15 October 2026 — combined diagnostics and comments-only scaffold handoff

Delivered combined JSON/offline HTML exports from completed native snapshots with separate source/context identities, missing-review visibility and opt-in complete source text. Added explicit comments-only Scaffold mode: yellow/red source-linked manifest/checklist, safe output names, preserved original notices and no overwrites. Green remains zero; signatures/types/native semantics are not guessed. Settings and 55 EN/FR/DE Sarge topics are synchronized. Actual packaged exports, notice/source safety, snapshot clearing and affected checks passed; see [the guide](../docs/COMBINED-DIAGNOSTIC-EXPORT.md). This advances the planned comments-first scaffold stage; earlier planning statements describe the previous checkpoint. All existing goals remain. Verified semantic mappings, green emission and native integration are still pending.


### 15 October 2026 — first verified pure expression family

Added opt-in literal-only Boolean value helpers with source/output maps and a matching native proof receipt. The actual 1.8.0.13 headless diagnostic server compiled/executed 46 cases; Workbench startup crashed before results and is not a pass. Green applies only to pure expressions; parent statement/function/mission conversion remains zero. Commands, variables, code operands, ambiguous grouping and selected preprocessing stay blocked. Ordinary comments-only handoff remains unchanged. Added a non-launching reproduction tool, export budget/proof gates and 56 EN/FR/DE Sarge topics. See [the mapping guide](../docs/BOOLEAN-EXPRESSION-MAPPING.md). Earlier zero-green notes describe the prior checkpoint; broad semantic/lifecycle/native integration goals all remain intact.


### 15 October 2026 — consistent component source review

Private external-source test details are withheld. The general implementation goals and supported contracts remain unchanged.


### 15 October 2026 — initialized Boolean local blocks

Added optional complete flat Boolean local-block lowering: initialized private declarations, preceding local reads, sequential assignments and an explicit final Boolean value. Unknown/global/type-changing or control-flow operations reject that file as a whole. Native 1.8.0.13 diagnostic server compiled and executed 24 cases, then stopped; source SQF and game client were not run. Detached helpers carry original source/output maps and require caller/lifecycle integration. Existing comments-only and literal-expression modes remain intact. Separate review-bound acknowledgment, 58 EN/FR/DE Sarge topics and existing Settings routes cover the feature. This completes only the Boolean straight-line subset; general locals, functions, branches, loops, macros and all earlier roadmap goals remain intact. See [Boolean local mapping](../docs/BOOLEAN-LOCAL-MAPPING.md).


### 15 October 2026 — bounded pure Boolean if/else lowering

Added an optional Boolean branch family alongside the existing straight-line local export. Statement-form if/else, optional else and bounded nesting can write previously initialized Boolean locals; both arms are checked. Branch-local declarations, unknown/global/engine operations, loops, value-form if and lifecycle integration stay manual. Native 1.8.0.13 diagnostic server compiled and executed 32 independently checked fixture outcomes, then stopped. No source SQF or game client was run. Family/source/profile changes reset scope acknowledgment; EN/FR/DE guidance and 59 Sarge topics are synchronized. All earlier goals and modes remain intact. See [Boolean branch mapping](../docs/BOOLEAN-BRANCH-MAPPING.md).


### 15 October 2026 — conversion coverage polish and exact integer values

Added explicit read-only coverage previews for every expression/block family, with supported/mixed/manual/inventory rows, search and 20-file pages. Matching zero coverage disables that family’s helper export; stale coverage is discarded and save controls stay fixed while busy. Added the next type family: exact integer literal/negation/grouped +, - and * values with every intermediate bounded to ±16,777,215. Native 1.8.0.13 diagnostic server compiled and executed 42 cases after correcting a compiler-detected grouping issue. Parent statements, general numeric semantics and complete missions remain manual. Existing modes, plans and all roadmap goals remain intact. Settings and 61 EN/FR/DE Sarge topics are synchronized. See [coverage and integer mapping](../docs/MIGRATION-COVERAGE-AND-INTEGERS.md).


### 15 October 2026 — typed pure function module compiler

Added explicit Boolean params/defaults, named code-valued function bodies, local state, branches, function-root guard exits and cross-file calls inside a selected closed module. Candidate/write uniqueness, typed argument checks, dependency propagation and cycle rejection prevent speculative bindings. Native 1.8.0.13 diagnostic server compiled six methods and executed 42 invocation/default cases. Source registration, dynamic scope, external callers, lifecycle and engine hooks stay manual. Coverage/export now includes typed functions and source/parameter/method/call-edge maps; base comments-only handoff remains intact. Settings and 62 EN/FR/DE Sarge topics are synchronized. All prior goals remain. See [typed Boolean functions](../docs/TYPED-BOOLEAN-FUNCTIONS.md).


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


## Next-100 implementation checkpoint — 16 October 2026

Added explicit folder preview, shared-header capture, virtual-mount repair, navigable include connections, saved non-source review controls, unchanged-report reuse, bounded decimal conditional review, source-linked comparison, read-only generated project preview, compatibility status and a public distribution exclusion gate. Asset search adds category aliases, naval/support hints and filtered category counts. Sarge and EN/FR/DE guidance follow the new controls. These are development additions, not completion of all 100 steps or stable-release approval. See docs/NEXT100-DELIVERY.md and docs/NEXT100-PROGRESS.md (paths relative to repository root). All existing roadmap goals remain.


## Advisory initialization and symbol checkpoint — 16 October 2026

Added bounded background path review for supported literal writes, branch intersections and zero-iteration loops; unknown effects and caller contexts remain manual. Added revision-bound symbol provenance, nested forEach body candidates, source-linked paged UI and explicit local export. Reports retain runtime/type/lowering authority as false and do not mutate the original Types snapshot or mission state. General CFG/type inference and native switch/loop generation remain pending. Sarge and EN/FR/DE guidance cover the optional Types panel. See docs/NEXT100-INITIALIZATION.md. All existing roadmap items remain.


### Reviewed infantry route checkpoint

Companion followon.4 and native bridge 0.8.0 candidate add 1–16 ordered map waypoints, full host review, separate capability negotiation and ownership-safe replacement/cancellation. Native installation/lifecycle gates passed; normal-terrain travel remains an acceptance test. AI labels now read AI while player names are retained. See docs/INFANTRY-ROUTES-PILOT.md. Existing goals remain unchanged.


### Existing-squad control checkpoint — 16 October 2026

Followon.5 / bridge 0.9.0 candidate adds explicit live-marker selection, reviewed recruitment and release, and native bounded Follow. Synthetic native lifecycle and desktop checks passed. Real-player Follow and normal-terrain travel remain acceptance work. Formation, stance, combat, transport and building-entry scope is retained. See docs/SQUAD-CONTROL-PILOT.md.


### Native squad-settings checkpoint — 16 October 2026

Followon.6 / bridge 0.10.0 candidate adds four verified formation definitions with restoration, persistent native stance settings and distinct native fire policies. Synthetic readback, membership propagation, foreign editor-setting protection and desktop review gates passed. Diamond/Circle, adaptive Auto, physical formation/combat acceptance and other command families remain open. See docs/SQUAD-SETTINGS-PILOT.md. Existing roadmap goals are retained.
