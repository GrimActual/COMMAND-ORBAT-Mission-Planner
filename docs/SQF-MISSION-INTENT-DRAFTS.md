# Supported-pattern migration mission drafts

These features are included in COMMAND 2.9.1-dev.gm.8, in the COMMAND-Mission-Migration Windows package. Earlier dev.gm.7 downloads remain unchanged. Compatibility identifiers are preserved.

## Workflow

Close the older Companion before switching candidates. In Assets → Arma 3 migration review, inspect selected text files. Confirm or load a portable Arma 3 asset mapping library. Expand Prepare migration mission draft and click Prepare mission draft. Inspect source references, mapped resource IDs, proposed positions, dependency links and blockers. Export mission draft uses the validated native Save dialog. Settings retains the migration shortcut and Sarge explains the workflow in EN/FR/DE.

Drafts are session-only. They do not apply units, change the saved plan, enter editor Undo, alter rehearsal/journals, send a bridge request or execute source scripts. No raw source file is rewritten. Selected source text stays in session memory for explicit preparation; full raw scripts are not embedded in exports, but recognized literal declarations and placement options are included.

Source/mapping revisions invalidate prepared drafts and disable export. Pending workers are stopped; late results cannot replace the stale view. Rejected source imports retain the previous accepted source context, which can be explicitly prepared again. Rejected or over-limit draft builds retain the previous draft as stale. Language changes retain data and do not change those revisions. Clearing source files disables preparation; clearing a draft removes only that session review.

## Supported subset

Top-level straight-line assignments (including private underscore-prefixed declarations), bounded literal strings/numeric arrays, file-local literal bindings and source-entity aliases are supported. Identifier lookup is case-insensitive while original spellings are retained. Later assignments replace earlier bindings. Aliases are never resolved across files, and unsupported statements clear known bindings conservatively.

The adapter recognizes the modern group createUnit array form, unary createVehicle array form, literal-class binary createVehicle form, doMove with a literal/resolved XYZ vector, and basic two-argument addWaypoint. Optional spawn placement parameters are preserved, not silently defaulted. Basic waypoint radius is preserved, not mistaken for completion radius. Source-created object IDs can link later movements through a bounded acyclic dependency list.

Conditions, loops, code blocks, function calls, dynamic compilation, arithmetic, marker/function position expressions, old createUnit init-string syntax and indexed/named waypoint variants are not lowered. Commands inside those constructs are not flattened into unconditional actions. Unsupported statements are source-linked findings and flag all recognized intents in the affected file for review. Preprocessing is not expanded. SQM/EXT/HPP remain inventory-only; no native scene graph is reconstructed.

This is a supported-pattern parser, not a complete SQF grammar, interpreter or syntax checker. Runtime locality, global namespace interactions, scheduling, group/faction construction, behaviour changes and source execution context remain unresolved. A parsed pattern is not proof that the complete source mission is valid.

## Data contract

command-sqf-intent-draft version 1 contains decoded-text SHA-256 fingerprints, source file/line/column/UTF-16 offsets, definitions, spawn/movement/waypoint intents, explicit review gates, dependency links, findings and the validated asset-map snapshot. Prefab identities remain qualified by addon/GUID/path with provenance and declared dependencies. Resource IDs reference the included map; they are not live game entity IDs. Exported fingerprints identify decoded UTF-8 source text, not original undecoded file bytes and not a cryptographic approval or trust signature.

Source XYZ is retained. Proposed Enfusion XYZ only reorders axes to X/Z/Y; it does not calibrate a different terrain, apply the planner imagery offset or validate elevation. Unit creation's source height semantics, spawn collision/random placement, waypoint placement and individual-versus-group movement remain explicit blockers. Unknown classes, positions and targets remain null/blocked rather than guessed. Every draft and intent remains non-executable; all six review gates are mandatory. There is no direct native deployment or Game Master Apply button in this increment.

Bounds: existing 64-file/256-KiB-per-file/2-MiB source limits, 500 intents, 500 definitions, 1,000 findings, four literal nesting levels, 16 entries per literal array and 8 MiB serialized draft. UI pages 40 rows. Source strings are copied once for preparation, not on every render. Schema checks enforce shape; the native validator additionally checks exact asset mappings, source links, dependency order, axis consistency, mandatory blockers and review gates before opening Save.

## Validation

39 unique focused JS checks passed: 12 draft/dataflow/export checks, seven existing migration checks, nine class-map checks, three localization checks and eight shared native-file lifecycle checks. Thirteen independent schema cases passed using an isolated development-only jsonschema dependency; it is not bundled into the desktop app. Both portable class maps and draft contracts now have self-contained canonical JSON schemas.

Actual offline Electron worker and native Save checks passed exact mapped spawn/move links, conditional exclusion, decoded-source hashes, source/mapping stale locks, rejected input retention, over-limit rejection, delayed real-worker delivery isolation, EN/FR/DE context and unchanged mission JSON. Save dialog selection was automated for tests; validation and filesystem writes were real. No game client, Workbench compilation or server test was repeated because native production scripts were not changed.

Performance fixture: one 21,559-byte source file, 200 mapped spawns, 200 linked moves and 200 definitions. After five warmups, 20 headless hash/AST/dataflow/contract samples measured median 16.32 ms, p95 18.17 ms and max 21.47 ms. Draft size was 244,567 bytes. These measure draft preparation, not map FPS, total app RAM, gameplay travel, network latency or complete mission conversion. Preparation runs in a worker.

## Next retained milestones

Add explicit terrain calibration and reviewed neutral-draft transfer into planning; expand supported group/faction/source constructs only with verified semantics; then add optional native export/approval adapters. Full SQF conversion, scene/layer export, chained native AI waypoints and the rest of the original roadmap remain unfinished and retained.

Primary syntax references: [identifier rules](https://community.bistudio.com/wiki/identifier), [createUnit group syntax](https://community.bistudio.com/wiki/createUnit_group?useskin=vector), [createVehicle](https://community.bistudio.com/wiki/createVehicle?useskin=vector), [addWaypoint](https://community.bistudio.com/wiki/addWaypoint). The source unit Z/placement, waypoint radius and case-insensitivity distinctions were checked against these primary references; they are not assumed identical to Enfusion behaviour.


## Subsequent source checkpoint

Manual anchor preview and selected mapped-spawn planning transfer are now available in the separate unreleased candidate described in MIGRATION-PLANNING-TRANSFER.md. The dev.gm.8 download and this non-executable draft contract remain unchanged. Verified terrain calibration, movement conversion and native execution remain future milestones.


## Subsequent linked-route checkpoint

Optional reviewed linked doMove points can now be imported as proposed planning routes in the separate unreleased candidate described in MIGRATION-LINKED-ROUTES.md. Original execution timing, groups, terrain height and native execution remain unresolved. Public dev.gm.8 downloads remain unchanged.
