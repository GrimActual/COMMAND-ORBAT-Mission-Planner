# SQF to Enforce Script: implementation audit and additive compiler plan

Status checked 15 October 2026. This is an engineering plan, not a delivered compiler or a claim of equivalent gameplay. No existing migration or mission-planner roadmap goals are removed.

## What the current source actually does

| Stage | Current implementation | Boundary |
| --- | --- | --- |
| File ingestion | `planner/sqf-migration.js`: bounded SQF/SQM/EXT/HPP inspection, comments/strings/delimiters, source locations and command findings | Does not execute source, expand a full preprocessor or reconstruct Eden/SQM scenes |
| Asset mapping | `planner/sqf-class-map.js`: explicit reviewed class-to-prefab resource index mapping | GUID/addon/path provenance is retained; classname similarity does not establish equivalent assets or behavior |
| Parsing | `planner/sqf-intent-draft.js`: a small AST for literals, arrays, symbols, assignments and supported straight-line commands | Not a full SQF grammar, expression/type system or block parser |
| Neutral draft | Mapped `createUnit`, supported `createVehicle`, linked `doMove` and basic `addWaypoint` patterns, with literal bindings and source-local references | Emits non-executable JSON; mandatory review/blockers remain; unsupported statements clear inferred bindings and block dependent use |
| Planning transfer | `planner/migration-transfer.js`: reviewed mapped units and selected linked movement points, optional horizontal landmark fit and terrain observation provenance | Planning import does not reproduce source timing, functions, groups or native runtime execution |
| Native adapters | Explicit Companion spawn and bounded group AI order adapters exist separately | No general SQF code emitter connects arbitrary blocks to these adapters |
| Enforce Script output | No general `.c` generator in this migration pipeline | Full block transpilation has not been delivered |

Existing source-file SHA-256 values describe decoded UTF-8 text. They are not automatically hashes of original uploaded bytes, nor proof of native asset identity. Current draft schema explicitly requires `executable:false` and every intent remains `executionReady:false`. SQM/EXT/HPP remain inventory-only in the draft builder.

## Additive compiler stages to build

1. **Source/dependency package.** Preserve original bytes, encoding, source text and hashes. Resolve explicitly included files inside a bounded selected package. Inventory macros, configuration references and dependencies. Unsupported preprocessing must produce located findings; never execute `compile`, `execVM` or another source fragment to discover its meaning.
2. **Full syntax representation.** Introduce a versioned SQF syntax tree with expressions, code blocks, declarations, functions, conditionals, loops and source spans. Keep syntax recognition separate from permission to translate or execute. Preserve unsupported nodes and report exact locations rather than flattening them into unconditional actions.
3. **Semantic analysis.** Resolve scopes, local/global namespaces, function calls, entity/group identities, value types and side effects. Distinguish scheduled/unscheduled code and server/client/headless locality. Track ATL/ASL/world spaces, units, timestamps and dynamic values explicitly. Every unresolved condition, symbol or authority requirement remains a blocker.
4. **Typed intermediate representation.** Lower supported constructs into a neutral control-flow/entity graph, not string replacements. Nodes carry stable IDs, provenance, typed values, ownership requirements and effects. Represent sequencing, branches, loops, delayed tasks, event subscriptions and cancellation separately from spawn/movement intents. Model ordered blackboard/context updates; do not infer a behavior-tree path from an SQF behavior-mode label.
5. **Verified semantic adapters.** Maintain an engine-versioned command registry: source signatures, supported operand types, semantic differences, native class/API or prefab GUID bindings, locality and lifecycle rules, tests and confidence/status. Link compatible existing adapters; build the missing ones. Vehicle crews, seats, groups, triggers, event handlers, cleanup and scheduler semantics require their own adapters. Never replace an unavailable adapter with an approximate command silently.
6. **Enforce Script generation.** Emit `.c` classes/components and reviewed configuration/resource references for the supported IR. Generate initialization, authority checks, delayed execution, subscription cleanup and cancellation explicitly. Emit source maps and a per-node conversion manifest. Parser support alone must never mark a construct executable. SQF dynamic-code facilities and engine-specific commands without verified semantics remain unsupported/manual until separately implemented and tested.
7. **Validation and packaging.** Validate every emitted GUID/addon/path against the selected resources, terrain identity and target engine API. Compile in an isolated diagnostic project, then execute bounded native fixtures for each supported semantic family. Export a reviewable package with required addons, diagnostics, source maps, hashes and explicit remaining blockers; retain host/server approval at the execution boundary.

The broader goal remains full migration tooling, but an unconditional promise to convert every arbitrary SQF script is not established. A complete syntax parser can still leave constructs untranslatable until the runtime compatibility layer and native semantic adapters exist. Successful Enforce compilation is also insufficient to claim behavioral equivalence.

## Deterministic build identity

Use versioned, domain-separated SHA-256 fingerprints for source content, dependency/adapter manifests, asset mapping snapshots, target terrain policy, compiler options, compiler version and generated output. Define canonical field ordering, numeric representation and ordered versus unordered collections in the contract. Avoid build timestamps, machine paths or random IDs in reproducible output; runtime session IDs remain separate. Changing any semantic input invalidates a prior conversion review.

Stable IDs may identify compiler nodes/artifacts. They must not fabricate Enfusion resource GUIDs: native resource identity still comes from the engine/resource index. Hashes detect differences against an expected receipt; they do not authenticate who produced it. Signed/session-bound deployment authorization is a separate boundary. Deterministic generated bytes do not imply deterministic AI, physics or multiplayer runtime behavior.

The current terrain diagnostic demonstrates canonical query hashes, copied native-source hashes and exact report-byte hashes with change-detection tests. It does not implement compiler-wide fingerprinting or a signed deployment manifest.

## Acceptance gates for each semantic increment

- Positive and negative grammar/type/scope fixtures, including nested blocks, variable shadowing, Unicode strings and unsupported preprocessing.
- Golden generated output/source maps and reproducible builds across installation directories; changed dependencies/options must invalidate the review.
- Explicit fail-closed findings for dynamic code, unresolved targets, unknown commands and missing native adapters.
- Isolated native compilation plus bounded behavior tests covering authority, cancellation, cleanup, ownership and connection/world changes. Distinguish actual engine evidence from mocked contract tests.
- Offline desktop import/review, stale-context rejection, readable paged findings, unchanged mission state before approval, and atomic Undo/Redo where planning changes are imported.
- Representative parsing/generation/large-package performance measurements when those stages change; reuse passing gates until a relevant change or failure justifies another run.

## What comes next

Complete session-bound native world enforcement for the current migration/deployment path, while preserving the existing planning-only safeguard. Then introduce the versioned block syntax/IR contract and one deliberately bounded control-flow increment with its native adapter tests. Scheduling, events, locality, configuration reconstruction, vehicle/group semantics and broader command coverage remain explicit later increments. This document adds detail to the existing roadmap; it does not replace or reduce it.


## Structural SQF AST inspector checkpoint (unreleased)

Delivered a separate read-only structural AST worker/Assets inspector for nested brace conditions, code-scope exits, while, range/three-block for, forEach and stored code assignments. Source locations/hashes, opaque expressions, unsupported findings, paged safe display, guarded native JSON export, source-stale/cancellation gates and EN/FR/DE Sarge/Settings guidance are included. 27 focused checks, nine schema cases and actual offline desktop tests passed; a 1,401-node fixture prepared at 23.88 ms median / 27.55 ms p95, with same-fixture map frame/storage checks recorded. This is not the full grammar, semantic/type/scope analysis, typed IR lowering or Enforce code generation. Existing migration intents/deployment safeguards and all prior goals remain unchanged. See docs/SQF-STRUCTURAL-AST.md.


## Arma 3 PBO / WRP inventory and identity resolver (planned, separate pipeline)

Added docs/ARMA3-ARCHIVE-WORLD-INVENTORY-PLAN.md: read-only PBO manifest/prefix/compression inventory, streaming/canonical content fingerprints, config/CfgWorlds-to-WRP resolution, version-aware WRP metadata and optional object-reference decoding. Distinguish listed, header-inspected, decoded and unsupported evidence. WRP object lists require an actual decoder; config.bin is not SQF text. The current text/AST inspector does not support these binaries. Full terrain recreation into Enfusion remains a separate potential conversion workflow, not an inventory claim. Existing goals remain retained.


## Bohemia language reference and translation review gates

User-supplied reference: [From SQF to Enforce Script](https://community.bistudio.com/wiki/Arma_Reforger:From_SQF_to_Enforce_Script). Direct retrieval returned HTTP 403 during this checkpoint; this entry records the reference without claiming its contents were reviewed.

Related official guidance verified through indexed Bohemia documentation:

- [Enforce value types](https://community.bohemia.net/wiki/Arma_Reforger:Scripting:_Values): target identifiers are case-sensitive, values have declared types, and arrays have a single element type. Preserve SQF name identity through an explicit symbol mapping; do not derive target types from a single observed literal or silently coerce mixed arrays.
- [Enforce operators](https://community.bohemia.net/wiki/Arma_Reforger:Scripting:_Operators): target operator precedence follows C. Parse source expressions using verified SQF precedence and lower the resulting tree explicitly; copying expression text into Enforce is not a translation rule.
- [Enforce reference counting](https://community.bohemia.net/wiki/Arma_Reforger:Scripting:_Automatic_Reference_Counting): managed object lifetime depends on strong references, with cyclic ownership requiring care. IR and adapter reviews must specify object ownership and cleanup, particularly for delayed callbacks and subscriptions.
- [SQF variables](https://community.bohemia.net/wiki/Variables): source scope and binding analysis must precede target declarations. A structural block boundary alone does not prove a variable binding or an equivalent target scope.

These are implementation acceptance requirements, not newly delivered parser/type/lifetime capabilities. Keep expression recognition, binding confidence, target type resolution and executable adapter approval separately reported. Do not use DayZ-specific restrictions as Reforger evidence. Existing compiler and archive/world inventory goals remain unchanged.


## Bounded expression syntax core checkpoint (15 October 2026)

Added a developer-only, non-executable expression parser for literals, unresolved local symbols, arrays, grouping and basic arithmetic, with a separate numeric lexer and full-source span/hash binding. Unsupported syntax rejects without a partial tree. Desktop UI/export and native execution remain unchanged. Source scope/binding analysis, broader command/operator grammar, typed IR, validator/schema and subsequent UI integration remain pending; no earlier goals are removed. See docs/SQF-EXPRESSION-AST.md for scope and evidence.


## Source-linked semantic adapter requirements (15 October 2026)

Added a developer-only registry/review for 12 radio-relevant mechanic families with source hashes/locations, lexical-only evidence, documented target candidates, explicit unresolved names and lifecycle/behavior test obligations. Read-only radio sample: 80 occurrences, 12 families; zero implemented/native-verified adapters. 24 focused checks passed. No UI/game/export authority is added; source bindings/types, typed IR, native adapters and every earlier goal remain pending as applicable. See docs/SQF-ADAPTER-REQUIREMENTS.md.


## Source bindings, opt-in command syntax and value IR review (15 October 2026)

Added developer-only private/params/loop declaration evidence, conservative reference candidates and deferred-code barriers; an opt-in documented-arity command/comparison/logical parser; a partial source-value IR prototype; and reproducible folder review/integrity tools with EN/FR/DE developer guidance. 70 focused checks passed. The radio sample's 31 selected expression parts are now syntactically recognized by the extended profile, while types, effects, callback context and native behavior remain unresolved. Source files/audio remain untouched. Existing arithmetic output matches db6f9a1. No app executable, native mod, UI or deployment authority changes. Complete type/effect checks, typed statement/control-flow IR, strict UI/import contracts and native adapters remain unfinished; every earlier goal is retained. See docs/SQF-BINDING-VALUE-IR.md and tools/sqf-review/README.md.


## Bounded source operand/effect checks and strict contract (15 October 2026)

Added source-shape compatibility/mismatch/unresolved checks and explicit potential effects for the 18-command subset, including isNil unscheduled evaluation, deferred event/action callbacks, eager defaults and Boolean-versus-code logical evaluation. Strict JS validation and an independent schema fence source spans, graphs, gates and timing obligations. Folder review adds the report while preserving older formats. 52 focused checks and 11 schema cases passed; originals/audio remain untouched. No native adapter, whole-statement/type-flow proof, target code, desktop executable or deployment authority is added. Future full control-flow/type/effect and native goals remain intact. See docs/SQF-SOURCE-SEMANTICS.md.


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

Added a developer-only source-constraint inventory over the existing control/context IR: assignment shapes, parameter default/exemplar evidence, command signature and operator requirements, enclosing control regions and unresolved read initialization. Fixed bounded worker/CLI and source-bound imported-IR replay are covered. No runtime type propagation, definite-assignment solver, native adapter or executable generation is claimed. Existing roadmap goals and report/bundle formats remain intact. See [source constraints](SQF-SOURCE-CONSTRAINTS.md) and its test/performance evidence; flow joins and verified types remain pending.


### 15 October 2026 — desktop dependency inspector

Added an explicit native source picker and on-demand desktop dependency review with unresolved-include filters, search, 40-row pages and captured-source previews. Settings and 51 Sarge topics are synchronized in EN/FR/DE. Cancelling/rejecting retains the previous review; clearing affects only session inspection. Includes are not auto-loaded, guards are not evaluated and source is never executed. This is the first desktop diagnostic increment; function/type/effects explorers, a graph view and combined export remain later work. Existing goals are retained. See [the workflow and validation](DESKTOP-DEPENDENCY-INSPECTOR.md).


### 15 October 2026 — desktop Function Explorer and scaffold-export addition

Delivered a searchable Function Explorer with registrations, possible writes, calls, warnings and source previews in a shared diagnostics window with Dependencies. Settings and 52 Sarge topics include EN/FR/DE guidance. Real radio inputs, a 1,000-row synthetic UI case and short same-fixture performance checks passed; see [the workflow](DESKTOP-FUNCTION-EXPLORER.md).

Added the user-requested [tiered scaffold-export milestone](TIERED-SCAFFOLD-EXPORT-PLAN.md): verified green emission, explicit yellow scaffolds, red manual placeholders and a source-linked checklist. Review remains default. Scaffold Mode and Enforce emission are planned, not delivered here; types/signatures are never guessed from names or simple syntax. All existing roadmap goals remain.


### 15 October 2026 — desktop type and initialization review

Added the third diagnostics tab: source-shape and parameter evidence, unresolved reads, possible writes in branch/loop regions, source requirements and unsupported syntax. Reuses the bounded native picker/worker and source-constraint pass; it does not infer runtime/target types or prove initialization. Settings and 53 EN/FR/DE Sarge topics are synchronized. Actual radio inputs, a larger UI fixture, source safety/context retention and short same-map performance checks passed; see [the guide](DESKTOP-TYPE-INITIALIZATION-REVIEW.md). Existing compiler, scaffold-export and mission-planner goals remain unchanged; verified emission is still pending.


### 15 October 2026 — desktop Effects Inspector

Added the fourth source-diagnostics tab: possible writes, command/invocation candidates, separate stored contexts, scheduling candidates, cleanup/lifetime review and unreviewed regions with source previews. Reuses the bounded worker and existing effect producer; no invocation, native behavior or emission is resolved. Settings and 54 EN/FR/DE Sarge topics are synchronized. Real radio sources, a larger callback fixture and affected desktop checks passed; see [the guide](DESKTOP-EFFECTS-INSPECTOR.md). Prior goals remain intact. Combined diagnostic export, verified target mappings and tiered scaffold generation remain pending.


### 15 October 2026 — combined diagnostics and comments-only scaffold handoff

Delivered combined JSON/offline HTML exports from completed native snapshots with separate source/context identities, missing-review visibility and opt-in complete source text. Added explicit comments-only Scaffold mode: yellow/red source-linked manifest/checklist, safe output names, preserved original notices and no overwrites. Green remains zero; signatures/types/native semantics are not guessed. Settings and 55 EN/FR/DE Sarge topics are synchronized. Actual packaged exports, notice/source safety, snapshot clearing and affected checks passed; see [the guide](COMBINED-DIAGNOSTIC-EXPORT.md). This advances the planned comments-first scaffold stage; earlier planning statements describe the previous checkpoint. All existing goals remain. Verified semantic mappings, green emission and native integration are still pending.


### 15 October 2026 — first verified pure expression family

Added opt-in literal-only Boolean value helpers with source/output maps and a matching native proof receipt. The actual 1.8.0.13 headless diagnostic server compiled/executed 46 cases; Workbench startup crashed before results and is not a pass. Green applies only to pure expressions; parent statement/function/mission conversion remains zero. Commands, variables, code operands, ambiguous grouping and selected preprocessing stay blocked. Ordinary comments-only handoff remains unchanged. Added a non-launching reproduction tool, export budget/proof gates and 56 EN/FR/DE Sarge topics. See [the mapping guide](BOOLEAN-EXPRESSION-MAPPING.md). Earlier zero-green notes describe the prior checkpoint; broad semantic/lifecycle/native integration goals all remain intact.


### 15 October 2026 — initialized Boolean local blocks

Added optional complete flat Boolean local-block lowering: initialized private declarations, preceding local reads, sequential assignments and an explicit final Boolean value. Unknown/global/type-changing or control-flow operations reject that file as a whole. Native 1.8.0.13 diagnostic server compiled and executed 24 cases, then stopped; source SQF and game client were not run. Detached helpers carry original source/output maps and require caller/lifecycle integration. Existing comments-only and literal-expression modes remain intact. Separate review-bound acknowledgment, 58 EN/FR/DE Sarge topics and existing Settings routes cover the feature. This completes only the Boolean straight-line subset; general locals, functions, branches, loops, macros and all earlier roadmap goals remain intact. See [Boolean local mapping](BOOLEAN-LOCAL-MAPPING.md).


### 15 October 2026 — bounded pure Boolean if/else lowering

Added an optional Boolean branch family alongside the existing straight-line local export. Statement-form if/else, optional else and bounded nesting can write previously initialized Boolean locals; both arms are checked. Branch-local declarations, unknown/global/engine operations, loops, value-form if and lifecycle integration stay manual. Native 1.8.0.13 diagnostic server compiled and executed 32 independently checked fixture outcomes, then stopped. No source SQF or game client was run. Family/source/profile changes reset scope acknowledgment; EN/FR/DE guidance and 59 Sarge topics are synchronized. All earlier goals and modes remain intact. See [Boolean branch mapping](BOOLEAN-BRANCH-MAPPING.md).


### 15 October 2026 — conversion coverage polish and exact integer values

Added explicit read-only coverage previews for every expression/block family, with supported/mixed/manual/inventory rows, search and 20-file pages. Matching zero coverage disables that family’s helper export; stale coverage is discarded and save controls stay fixed while busy. Added the next type family: exact integer literal/negation/grouped +, - and * values with every intermediate bounded to ±16,777,215. Native 1.8.0.13 diagnostic server compiled and executed 42 cases after correcting a compiler-detected grouping issue. Parent statements, general numeric semantics and complete missions remain manual. Existing modes, plans and all roadmap goals remain intact. Settings and 61 EN/FR/DE Sarge topics are synchronized. See [coverage and integer mapping](MIGRATION-COVERAGE-AND-INTEGERS.md).


### 15 October 2026 — typed pure function module compiler

Added explicit Boolean params/defaults, named code-valued function bodies, local state, branches, function-root guard exits and cross-file calls inside a selected closed module. Candidate/write uniqueness, typed argument checks, dependency propagation and cycle rejection prevent speculative bindings. Native 1.8.0.13 diagnostic server compiled six methods and executed 42 invocation/default cases. Source registration, dynamic scope, external callers, lifecycle and engine hooks stay manual. Coverage/export now includes typed functions and source/parameter/method/call-edge maps; base comments-only handoff remains intact. Settings and 62 EN/FR/DE Sarge topics are synchronized. All prior goals remain. See [typed Boolean functions](TYPED-BOOLEAN-FUNCTIONS.md).


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
