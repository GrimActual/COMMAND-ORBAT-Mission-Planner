# Bounded source operand shapes and potential effects

## Delivered checkpoint

`planner/sqf-source-semantics.js` adds static shape/effect review for the existing 18-name command-expression profile. It reads the captured source package through extended syntax and conservative binding analysis, then returns a strictly validated, non-executable report. This is an unreleased developer tool, not an installed app update, native adapter or Enforce generator. Desktop Sarge/Settings and the working bridge are unchanged; EN/FR/DE developer guidance is in tools/sqf-review/README.md.

The source rules distinguish compatible known shapes, unresolved operands, invalid known operands and parents blocked by invalid children. Literals, array/code syntax, operator overloads and documented command return categories provide source-shape evidence. A documented return category is conditional on a valid source call and says nothing about a resource's existence, runtime value, engine ownership or target type. Symbols retain unknown types even when a declaration candidate exists: initializer types are not propagated through writes/callbacks without flow analysis.

Examples: `isNull 1` is a known shape mismatch; `isNull _entity` remains unresolved; a literal `findDisplay 8300 displayCtrl 8301 lbAdd "Demo"` chain has compatible source shapes but still requires UI/resource/locality review. Malformed literal descriptors are distinguished from dynamic/unmodeled forms. getVariable results remain unknown even with a typed-looking default. Unsupported select variants remain unresolved. Arithmetic/string/array overloads keep precision/allocation/aliasing requirements; array equality is not silently replaced by target deep equality. SQF string equality requires its case-insensitive behavior, while Boolean comparisons carry a source-version gate.

## Execution timing and cleanup obligations

These are **potential source effects**, not operations performed by this tool or proven reachable paths:

- isNil with a code operand executes that code without suspension in the source model. The report records unscheduled-code analysis; it never evaluates the operand. isNil with a name string instead requires dynamic binding lookup review.
- addEventHandler registers a deferred callback and requires event-owner, parameter, locality and owned-unsubscribe review. No event handler is installed by this tool.
- addAction's script callback and per-frame unscheduled condition string require separate translation. Their strings/code remain unexecuted.
- Logical Boolean operands must preserve their eager source evaluation; a code-valued right operand instead requires conditional/lazy code analysis and a Boolean return. Mapping both directly to target short-circuit syntax could lose source effects.
- getVariable's default expression is evaluated eagerly in the source. Constructing a code-valued default is distinct from invoking its body.
- select with a code filter requires per-element callback/implicit-binding analysis. Index/range domains and selected element types remain unresolved.

UI mutations, subscriptions, player/vehicle context reads and dynamic state reads are explicit labels with resource/lifecycle obligations. No target API is authorized by these labels. Condition/loop role typing, full statements, code strings, function calls, branch reachability, definite values, callback return types, preprocessing and all runtime scheduling remain incomplete. The report covers **selected structural expression parts only**, so it is not a whole-mod effect analysis or a conversion percentage.

## Contract and strict validation

Contract: `command-sqf-source-semantics` version 1, explicit UTF-16 source offsets. All reports require executable:false, evaluationPerformed:false, targetTypesResolved:false, fullStatementEffectsAnalyzed:false and all review gates. Nodes retain null target types, callResolved:false and executionReady:false. Source hashes describe decoded UTF-8 text. Binding-context findings are retained rather than hidden by a successful shape check.

The core calls `sqf-source-semantics-validation.js` before returning. It rejects accessors/coercion methods, cycles/shared non-JSON aliases, excessive nesting, sparse arrays, custom prototypes, extra fields, unsafe source identities, bad ranges, noncanonical/cyclic/multiply-owned graph edges, disconnected nodes, changed gates, invalid finding links, removed mandatory timing/cleanup labels and inconsistent summaries. Object field order is irrelevant; array/gate order remains explicit. Invalid dependencies cannot acquire a result shape through a parent. Validation checks report structure and documented metadata; it cannot authenticate source truth or establish semantic equivalence from editable JSON.

Independent schema: planner/schemas/sqf-source-semantics-v1.schema.json (Draft 2020-12). JavaScript additionally enforces graphs, rule references, exact source containment, findings, mandatory conditional timing labels and aggregate consistency. Limits: JSON data depth 64, 20,000 nodes, 5,000 findings, 8 MiB compact report; existing source/expression budgets remain in force.

## Folder review integration

Current review-bundle version 4 adds source-semantics.json to the prior six analysis files. REVIEW.md summarizes compatible/unresolved/mismatched checks. The verifier checks hashes/metadata and runs the strict semantic validator for this artifact, so recomputing hashes cannot bypass report gates. Readers still support prior v1/v2/v3 bundles; earlier private bundles are preserved. These are internal review formats, not additional app releases. No new report passes the existing structural native-export handler or is exposed as a browser script route.

The tool still requires a fresh output folder outside the source directory, never reads/copies audio, does not traverse nested folders or reinterpret config.cpp/PBO/WRP as SQF, and rechecks original byte hashes before publishing. Hash consistency is not authorship authentication, native behavior verification or deployment permission.

## Evidence

52 focused checks passed: source rules/effects (21), strict validation (12), affected bundle/CLI/legacy-format integration (19). Eleven independent schema cases passed, including actual radio output, known-invalid source, unsupported syntax and corrupted type/execution/gate fields. Passing unrelated app/native suites were not replayed.

Read-only radio sample: 31 selected entries, 189 source-fact nodes and 31 command nodes; 22 compatible shape checks, 24 unresolved checks, no known shape mismatch. Counts are per check, not per expression, so they are not a 31-entry partition. Fourteen nodes carry callback-related obligations. No runtime type/call is marked resolved. Seven before/after script/config SHA-256 comparisons matched; audio was not read/copied and nothing was executed or compiled. The six prior JSON analyses are byte-identical to source checkpoint e9f27cf.

Private bundle: A:/Everon-ORBAT-Development/work/sqf-source-semantics-radio-20261015. Public aggregate evidence (without supplied script bodies/audio): docs/test-evidence/sqf-source-semantics.json.

Same-fixture headless comparison, five warmups / 20 samples: exact e9f27cf bundle versus current bundle with semantic review/strict validation. Radio median 25.77 -> 39.38 ms, p95 28.50 -> 45.33 ms. The 18,289-byte / 200-block fixture measured median 257.79 -> 473.02 ms, p95 268.76 -> 504.21 ms. More analysis and output are produced now. Only current-code costs were remeasured after the final nesting guard; the unchanged prior baseline was retained. Sequential GC-sensitive heap snapshots are not leak/stability proof; these are not app FPS or causal speedup claims. Nothing adds work to the desktop map path. An immutable shared analysis context remains a future way to reduce repeated preparation without trusting mutable imported reports.

## Next unfinished work

Resolve flow-sensitive source types, full-statement effects and callback/string bodies, then lower supported statements/control flow into typed IR with explicit locality and lifetime. Add verified native adapters and real resource/compile/behavior evidence before .c generation can be called runnable. Strict contract/schema and stale-context/localization work are required for future desktop UI integration; this checkpoint does not add that interface. All prior roadmap goals remain retained.

Official source references: [isNil](https://community.bohemia.net/wiki/isNil), [addEventHandler](https://community.bohemia.net/wiki/addEventHandler), [addAction](https://community.bohemia.net/wiki/addAction), [getVariable](https://community.bohemia.net/wiki/getVariable), [select](https://community.bohemia.net/wiki/select), [operators](https://community.bohemia.net/wiki/Operators), and the per-command links in the immutable rule table. Documentation evidence does not establish native Enfusion equivalence.
