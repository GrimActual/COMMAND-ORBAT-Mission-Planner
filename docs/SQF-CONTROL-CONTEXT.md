# Control/context IR, source shape slots and binding links

## Delivered connected batch

`planner/sqf-control-context.js` adds a bounded region-level IR for branches/loops, separate stored-code/callback contexts, assignment-target evidence and expression slots linked to existing local-binding candidates. It preserves source identities and original spans, with a cancellable Node-worker CLI, tests, performance evidence and EN/FR/DE developer instructions. This is a source-only review stage; no installed app capability, executable conversion, verified CFG, runtime type inference or Enforce output is added.

The binding module now exposes `inspect(raw)` alongside the unchanged `build(raw)` report API. Inspection returns its own captured files, freshly built/validated structure and binding report. The new IR reuses that structure instead of rebuilding it for every consumer. Expression slots reuse `sqf-expression-ast.parseExtended()`; no imported AST/binding report can be supplied as authoritative input. Earlier binding reports remain identical against captured pre-change baselines.

## Context and control regions

Each file has a context. Stored code assignments, standalone code literals and opaque nested code create detached child contexts with unresolved invocation/environment. Normal branch and loop blocks retain the enclosing context. Structural ownership relations distinguish detached code from ordinary control regions. No execution edge runs from a stored-code owner into its body; owning code is not calling it, and no closure/caller environment is fabricated.

Normalized node kinds include context roots, sequences, branches, scope exits, loop regions, assignments, stored code, code values, opaque statements and unsupported barriers. Original structural node IDs/kinds/spans remain attached. Supported source forms include if/then/else, while, range/code-form for loops and forEach as identified by the existing bounded structural parser.

Candidate edges express lexical sibling continuation, branch arms, loop regions and possible repeat relationships. They are region-level review relationships, **not a complete executable CFG**: no basic-block join lowering, valid-condition proof, evaluated loop bounds, evaluation-frequency policy, reachability, definite initialization or scheduler behavior is inferred. Every edge has `verified:false`, and no flow edge can cross a detached context boundary.

`exitWith` retains an explicit unresolved target; it is not silently translated to a function return or loop break. Its body is a candidate conditional region and later siblings have an explicitly conditional continuation label. Unsupported switch/try/waitUntil forms remain barriers under the existing parser; nested code in opaque statements is detached rather than invoked automatically.

## Typed slots without inferred runtime types

Each selected structural expression part has a full-source expression slot. Targets and range-counter name spans are recorded separately. Opaque statements also receive `statement-result-candidate` slots, making bounded expression syntax visible inside while/code-form condition bodies and standalone value statements where earlier selected-part reports had no slot.

Slots retain the existing parser's recognized tree or explicit unsupported issue with no partial syntax tree. Syntactic root hints are limited to literal number/string/Boolean, array syntax and opaque code values, unwrapping parentheses. Symbols, command returns and derived operators remain unknown here. A literal initializer does not determine a variable's runtime type. Known non-Boolean condition syntax receives a review finding without evaluating it or selecting a branch.

Each slot/node has unresolved runtime/target type fields and `typeResolved:false`. Numeric syntax decoding does not establish source precision or evaluate arithmetic. Full source-shape/effect checking remains a separate existing review stage; it is not falsely promoted to whole-statement or flow-sensitive analysis by this IR. The word "typed" here refers to explicit type slots and syntax evidence, not a completed type system or target-native type mapping.

Assignment targets link exact source spans to existing declaration/reference candidates. Expression symbols link exact original offsets to the same binding IDs. Code-valued expression nodes link to matching detached context spans where identifiable, with invocation still unresolved. Private/caller scope, runtime namespace, global/cross-file binding, initialization, callback captures and value propagation remain unverified. Cross-file name/write reports remain separate evidence, not silently treated as resolved local bindings.

## Source integrity and bounds

Input is exactly `{files}` in the worker/CLI. It retains the existing structural/binding source contract: 1â€“64 plain files, 256 KiB/file, 2 MiB total, safe unique paths and supported `.sqf/.sqm/.ext/.hpp` text. Configuration files remain inventory-only; `.cpp`, archives and terrain binaries are not accepted by this profile. Captures occur before asynchronous hashing yields, preventing caller mutations from mixing source revisions.

Reports use `command-sqf-control-context-ir` v1, a distinct source-identity context hash, `graphKind:"region-level-structural-candidates"` and original UTF-16 offsets. New IR spans derive line/column indexes from the captured text, including LF/CRLF/CR, while the embedded legacy binding report remains unchanged. Stored code is never executed and no mission state is touched.

Limits: 10,000 contexts, 10,000 IR nodes, 10,000 ownership relations, 30,000 region edges, 10,000 expression slots, 30,000 aggregate expression nodes, 20,000 binding links, 10,000 code-context links, 5,000 findings and a 16 MiB compact report, plus inherited structural/binding/parser budgets. Target names are bounded to 240 characters. Overflow rejects the report rather than truncating an IR. Producer checks verify node/context/slot/binding references and forbid cross-context flow edges; these are not an imported-report validator or a semantic CFG verifier.

Top-level `executable`, `evaluationPerformed`, `controlFlowLowered`, `runtimeTypesResolved`, `targetTypesResolved`, `fullStatementEffectsAnalyzed` remain false. Contexts, nodes and slots retain execution/type/invocation gates, and `summary.executionReady` remains zero. Existing app import contracts and seven-analysis review bundle are unchanged; a future imported-report route still requires strict schema/graph/identity validation and safe rendering.

## Worker and developer command

```powershell
node tools/sqf-review/control-flow.cjs --source-set "A:/Reviews/sqf-files.json" --output "A:/Reviews/new-control-context.json"
```

The fixed `flow` worker uses existing input/memory bounds, timeout/cancellation, awaited termination, regular UTF-8 source checks, original-byte recheck and exclusive fresh report creation. It never loads referenced scripts or evaluates imported source. Worker isolation is not a sandbox for arbitrary JavaScript. Reports include source-derived names and literal values; share only with appropriate rights. No browser rendering or Electron UI safety claim follows from JSON/source-span checks.

## Evidence

24 new focused cases and 65 affected regression cases passed. Coverage includes assignment slots and binding IDs, branch arms without folding, all four loop forms, unresolved scope exits, stored/literal/opaque callback contexts, no cross-context edges, unsupported syntax, expression-parser parity, Unicode/CRLF/CR spans, inventory-only files, source captures, shared structure, hostile inputs and budgets, worker cleanup and no-overwrite output. An initial aggregate expression-budget fixture hit the earlier per-file token ceiling; it was distributed across three files and only the affected budget check rerun locally.

The five previously captured author-permitted source sets contain 30 selected SQF files. Original bytes and pre-change binding reports remain unchanged. The new IR records 1,609 nodes, 84 branch regions, 68 loop regions, 59 unresolved scope exits, 111 detached contexts and 354 assignment regions. It exposes 274 recognized and 909 unsupported expression slots; those counts describe bounded selected syntax, not whole-mod conversion or native readiness. No new third-party downloads were needed for these tests.

On a 16-file synthetic fixture with 160 stored functions, the report contains 3,376 IR nodes, 160 branches, 480 loops, 160 detached contexts and 2,240 expression slots. Every flow edge stays within its context, binding IDs round-trip, source bytes stay unchanged and direct/worker reports match. Two warmups and six measured sets gave median 89.98 ms for the existing binding review, 134.40 ms for the added shared-structure IR/expression work and 277.02 ms through a fresh worker including startup/return/termination. This is added developer-core work, not a speedup, renderer/FPS, universal stability or native behavior claim. Evidence: `docs/test-evidence/sqf-control-context.json`; both hosted Windows Node 22 and Linux Node 24 compiler suites passed for source 33c02ea4dc08c9b95e80ebc842c522f43b67e299: [CI run 38766648093](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/actions/runs/38766648093). Hosted results are recorded separately from local focused cases.

## Next stages and references

Next: strict imported-IR validation, supported statement effects, source-type constraints, definite initialization/context rules, and explicit scope-exit/loop lowering before any target code generation. Native adapters still need resource/lifetime/locality contracts and isolated compile/runtime proof. Official sample and installed API documentation locations are recorded separately in `docs/NATIVE-REFERENCE-SOURCES.md`, for reference/inspiration only.

The author-operated desktop workflow, Sarge/Settings integration and EN/FR/DE app guides remain planned when these developer capabilities ship in the app. EN/FR/DE developer usage is included now. Every existing roadmap goal remains intact.


## Follow-on developer verification/effects stage

Source-bound replay validation and potential statement-effect review are now available as separate developer cores/commands. They do not add app import/execution authority or promote runtime/native readiness. See docs/SQF-IR-VALIDATION-AND-EFFECTS.md.
