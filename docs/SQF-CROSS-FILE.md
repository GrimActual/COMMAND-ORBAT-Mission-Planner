# Cross-file function writes, call links and conflict review

## Delivered batch

`planner/sqf-cross-file.js` adds three connected developer capabilities: lexical function-write inventory, joins to existing call/config registration candidates, and review findings for competing writes, namespace uncertainty and dynamic source operations. A fixed Node-worker CLI, bounded outputs, tests, performance evidence and EN/FR/DE developer guidance accompany them. No installed desktop feature, source execution, mission edit, Enforce output or native verification is added.

The [Bohemia variable documentation](https://community.bistudio.com/wiki/Variables) explains source scope and dynamic/caller context, while [namespace documentation](https://community.bistudio.com/wiki/Namespace) describes separate variable domains. The index preserves that uncertainty rather than treating a matching function name as a proven runtime binding. These references inform the inventory; it is not a complete SQF semantic parser.

## Inventory and source context

Input is exactly `{files,mounts,configRoots}`, matching the existing function-registration developer input. Original file identities and explicit config roots retain their prior strict validation. The new module calls `sqf-function-registrations.inspect()`, which produces the existing registration report plus its bounded original-source token scans and delimiter pairs. The cross-file index reuses those scans instead of lexing every file again. The older `build()` wrapper disables scan retention and returns the same report as before; it does not retain all token arrays unnecessarily. No API accepts untrusted prebuilt tokens as source facts.

Only `.sqf` files supply write/operation inventory. Config/header files still supply the embedded existing CfgFunctions review. A supported function-name candidate follows the existing `TAG_fnc_name` naming convention, with a 512-character joined-name bound. Names are grouped using ASCII-compatible lowercase, consistently with the existing registration/call inventory. Arbitrary variable assignments outside this naming convention are not a complete write inventory.

Supported write patterns:

- A function-name word followed by a single assignment `=` and a bounded RHS span. Comparison operators are excluded. Direct underscore-prefixed names and immediate private declarations are skipped as local/private evidence; general private/caller scope remains unresolved.
- A `setVariable` occurrence with a literal two- or three-item argument array and a double-quoted function-name key. Recognized immediate receiver tokens retain separate `mission`, `ui`, `profile`, or `parsing` domains. Other receivers, including objects and parenthesized expressions, remain `dynamic-or-object-unresolved`. A third broadcast argument is retained only as unresolved evidence. Computed/single-quoted keys and unsupported shapes create opaque-write findings. Non-function literal keys are outside this inventory.

Explicit namespace keys beginning with an underscore are retained as namespace facts, unlike direct local assignments. They are not joined to underscore-prefixed local call targets. This distinction avoids silently losing explicit string-key writes while inventing no cross-file local-variable binding.

Each write retains an original UTF-16 name span, RHS span, form, domain, broadcast context and lexical brace depth. A standalone balanced code literal RHS is labelled `code-literal-candidate`; source/compile operations produce `dynamic-code-or-source`; other values remain unmodeled. None of these labels proves a runtime Code type, execution, initialization or target adapter. Nested code writes may be deferred, conditional or caller-dependent; depth is evidence, not a control-flow interpretation.

Comments, strings and directive bodies cannot invent direct write facts. Raw conditional branches are not evaluated here: both apparent alternatives may remain candidates with `activation:"not-evaluated"`. Directives/line splices receive preprocessing warnings. Unterminated strings/comments or unbalanced delimiters expose no partial writes from that file, while independent files can remain inspectable. This lexical scanner is not a complete SQF grammar validator. Case-colliding source owners retain both identities and explicit review blockers.

## Candidate joins and hazards

The report embeds the unchanged registration review, including its original source identities, path-resolution results and call-site IDs. Per-name symbol records link registration, write and named-call IDs, retain spelling variants and partition write IDs by domain. Calls link all same-name write/registration candidates without choosing a winner, assuming execution order, or inferring namespace compatibility. A unique matching name is still only a name candidate. Inline/dynamic forms and underscore-prefixed calls remain unresolved contexts.

Hazards include repeated writes in one domain, namespace resolution, writes in different files with unknown load order, duplicate registration names, registration/runtime-write overlap, dynamic/untyped values and nested code context. Separate explicit namespaces are not automatically labelled as same-domain overwrites. An implicit direct assignment remains `implicit-unresolved`, not an asserted mission binding, until source namespace/scope is resolved.

Lexical occurrences of compile/source-loading commands, private/params/import/with and public-variable operations are retained as opaque context evidence. They are never executed, loaded or expanded. Unknown generated code and computed variable names can still hide writes; all call links retain private/namespace/load-order/preprocessing/runtime blockers. Operation detection is lexical and can over-report command-looking words. Even zero detected writes does not mean a source set has no runtime writes.

This completes a candidate index, not cross-file symbol resolution. Source ordering in the report is deterministic file identity order, never an execution schedule. No flow-sensitive last-write-wins, closure conversion, callback lifetime inference, server/client locality resolution or full call graph is claimed.

## Contract and bounds

Reports use `command-sqf-cross-file-review` v1, with a domain-separated context hash derived from the embedded registration context. Top-level `executable`, `preprocessingPerformed`, `symbolBindingsResolved`, `filesystemAccess` are false; evidence is `lexical-candidates-only` and `summary.executionReady` stays zero. Writes, symbols and call links repeat non-binding/non-execution gates. Existing review requirements remain and now explicitly include typed control-flow IR.

Limits: 8,192 writes, 8,192 opaque operations, 8,192 symbols, 4,096 findings, 16,384 aggregate candidate references and a 16 MiB compact report, plus existing source/token/config/call budgets. Reference charging includes symbol ID links, namespace partition membership and call-to-write/registration joins. Fan-out is checked before copying large join arrays. Token scans and source identities retain the existing 256-file, 256 KiB/file, 8 MiB source and aggregate token bounds. Budget overflow rejects the report rather than truncating a graph.

No new imported-report authority or installed UI route accepts this schema, and the existing seven-analysis bundle remains unchanged. A future app inspector still needs strict imported-report validation, stale-state handling and safe text rendering. The JSON/source-offset checks here are not a browser XSS or Electron layout test. Reports can contain source-derived names/paths and the embedded source review; sharing still requires appropriate rights.

## Developer command and cleanup

```powershell
node tools/sqf-review/cross-file.cjs --source-set "A:/Reviews/function-source-set.json" --output "A:/Reviews/new-cross-file-report.json"
```

`crossfile` selects a fixed allowlisted worker entry. Existing input/worker-memory limits, cancellation/deadlines, awaited termination, regular UTF-8 input, source-byte rechecks and exclusive fresh report creation apply. It reads no referenced script paths automatically, fetches no dependencies and executes no imported source. Worker isolation is not a sandbox for arbitrary JavaScript.

## Evidence and performance

25 new focused cases and 54 affected regression cases passed. These cover direct/namespace writes, cross-file call/registration joins, competing writes, explicit domain partitions, dynamic/private/locality barriers, computed keys, local names and explicit underscore keys, nested code, comments/strings/comparisons/directives, raw conditional evidence, malformed-file isolation, Unicode/CRLF/CR spans, case-colliding owners, deterministic reports, scan reuse, strict inputs, fan-out/token/operation budgets, cancellation/deadlines and no-overwrite output. After the underscore-key correction, only the affected local/namespace checks were rerun locally.

Five pinned private source sets were read without downloads or edits. Their prior registration and all four expansion-profile reports match deeply. The samples retain 186 literal registration candidates and 119 lexical calls. New review evidence found 21 function-write candidates in the sampled mission collection, 19 call sites with a unique write-name candidate and two call sites with multiple write-name candidates. Other sampled projects had no recognized writes in their selected text, not proven absence of dynamic writes. None of these joins resolves a binding or converts a mod.

The same 203-file synthetic source set contains 200 registrations, 220 writes and 400 calls. It yields 360 unique-write-name call candidates and 40 multiple-write-name call candidates; all IDs/source spans round-trip and the embedded registration review matches the standalone producer. Two warmups and six measured pairs gave median 8.03 ms for registration/call inventory alone, 11.91 ms for the added shared-scan write/join/hazard work, and 70.50 ms through a fresh worker including startup/return/termination. Inputs remained unchanged and direct/worker reports matched. These are developer-core cost samples for added capability, not speedup, renderer/FPS, broad stability or native behavior claims. Evidence: `docs/test-evidence/sqf-cross-file.json`; both hosted Windows Node 22 and Linux Node 24 compiler suites passed for source e436f0746dce75729ca3ee51f9595f3c4d3f57e5: [CI run 38764008634](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/actions/runs/38764008634). Hosted results are recorded separately from local focused cases.

## Remaining work

Typed control-flow/context IR can now consume explicit source write/call candidates and their unresolved contexts. It still needs a supported statement/assignment subset, runtime namespace/scope/load-order semantics, definite initialization, callback lifetime/effects and adapter contracts before reviewed target generation. Broader preprocessing remains incomplete. The in-app author workflow, Sarge, Settings and EN/FR/DE app guidance will be updated when these developer capabilities ship in the application. Developer EN/FR/DE usage is included now. All existing roadmap goals remain intact.
