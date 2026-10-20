# SQF semantic adapter requirements checkpoint

## Available developer core

`require('./planner/sqf-adapter-requirements').build([{name:'init.sqf',text}])` returns a source-linked, non-executable requirements report. It captures plain input records before asynchronous hashing through the shared expression source helper, uses the structural AST for source validation/provenance and scans word tokens for a fixed registry of source mechanics. Source comments and strings cannot create command hits. Nested callbacks are inventoried without invocation. Unclassified non-local names are explicitly retained as unresolved identifiers or commands.

This is a lexical requirements review, not semantic call/signature resolution. Even a word matching a registered command on an assignment left side remains an unverified occurrence. It does not resolve scopes, variables, types, event names, callback arguments, locality or execution order. Missing names in this intentionally limited registry are not evidence of successful translation. Configuration headers remain inventory-only; config.cpp/PBO/WRP are rejected by the existing text contract.

The internal report is `command-sqf-adapter-requirements` v1 with decoded UTF-8 source hashes, UTF-16 locations, per-family counts, requirements, documented target candidates and behavior-test obligations. It always reports `executable:false`, `semanticResolution:not-performed`, `evidenceLevel:lexical-occurrences-only`, zero verified adapters and zero execution-ready items. The immutable registry cannot be promoted through a mutable result. This report is not an accepted import/deployment contract; strict validation/schema and stale-context UI/export gates are required before such integration.

Bounds: existing structural source limits; 4,096 registered occurrences, 4,096 unclassified tokens and 8 MiB serialized output. There is no file I/O, network request or code execution in the core. It is Node-only and not exposed by the app/server. Existing executable, desktop inspector, Sarge, Settings and translations do not change in this developer-only checkpoint.

## Registry families and documentation candidates

| Family | Target investigation | Outstanding semantic obligation |
| --- | --- | --- |
| UI layout | WorkspaceWidget.CreateWidgets | Explicit layout/control mapping, selection and close behavior |
| Context actions | ScriptedUserAction.PerformAction | Registration ownership, eligibility, authority and cleanup |
| Audio playback | BaseSoundComponent.PlayStr and Terminate | Resource/handle mapping; player-local music equivalence is unproven |
| Audio mix | No API selected | Preserve fade channel, baseline and overlapping owners |
| Lifecycle events | No API selected | Event-specific owner, callback signature and unsubscribe lifecycle |
| Scheduled waits | ScriptCallQueue.CallLater and Remove | Explicit wait policy, scheduler semantics and cancellation |
| Typed state | No API selected | Object/namespace identity, defaults, type and broadcast semantics |
| Parameters and calls | No API selected | Params/defaults, private binding, code identity and return behavior |
| Client/player context | No API selected | Client/server/headless, controlled entity and vehicle transitions |
| Value tests | No API selected | Undefined binding versus null object; code-valued predicates |
| Collections | No API selected | Operator types/precedence, implicit loop bindings, deduplication |
| Serialization context | No API selected | UI handle lifetime; no silent no-op substitution |

All candidates are documentation evidence only, not compiled adapters or verified one-to-one mappings for installed engine 1.8.0.13. In particular, queued callbacks are not an automatic waitUntil replacement, component playback is not automatically equivalent to local music, and component-wide audio termination is not an owned-handle cleanup policy.

Official references checked 15 October 2026:

- [WorkspaceWidget](https://community.bistudio.com/wikidata/external-data/arma-reforger/EnfusionScriptAPIPublic/interfaceWorkspaceWidget.html)
- [ScriptedUserAction](https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceScriptedUserAction.html)
- [BaseSoundComponent](https://community.bistudio.com/wikidata/external-data/arma-reforger/EnfusionScriptAPIPublic/interfaceBaseSoundComponent.html)
- [ScriptCallQueue](https://community.bistudio.com/wikidata/external-data/arma-reforger/EnfusionScriptAPIPublic/interfaceScriptCallQueue.html)

## Radio sample and validation

Read-only review of four user SQF files plus two inventory headers found 80 registered lexical occurrences across all 12 families and four unclassified non-local tokens. Seven before/after source/config hashes matched. Audio was not read or copied. Private source-linked reports remain at A:/Everon-ORBAT-Development/work/sqf-adapter-requirements/RADIO-ADAPTER-REVIEW.md and RADIO-ADAPTER-REVIEW.json. They are not release assets. Public evidence contains hashes and aggregate counts, not the supplied script bodies or audio.

Nine new checks plus 15 expression checks affected by the shared snapshot refactor passed (24 total). Coverage includes inert comments/strings, nested deferred bodies, lexical ambiguity, immutable unverified status, source ordering/hashes/Unicode spans, inventory boundaries, accessor/concurrent-mutation defenses and bounded report rejection.

Same six text inputs, five warmups and 20 samples: structural baseline median 2.95 ms / p95 3.80 ms; structural-plus-requirements median 3.17 ms / p95 3.86 ms. This is a small headless sample, not a UI FPS/stability guarantee or proof of causal performance differences. No app code path changed. Evidence: docs/test-evidence/sqf-adapter-requirements.json.

## Next gate

Implement source declarations/params and scope/binding evidence with explicit uncertainty at dynamic callback/call boundaries. Resolve signatures and types before typed IR. Then select one bounded lifecycle adapter, validate required target resources, compile it in an isolated diagnostic project and exercise ownership/cancellation/cleanup. A runnable radio conversion requires all relevant families and configured layout/audio resources; generating a syntactically valid .c file alone cannot establish equivalence. Existing migration/native deployment safeguards and all earlier roadmap goals remain intact.


## Subsequent developer checkpoint

See docs/SQF-BINDING-VALUE-IR.md for separate declaration/reference evidence, opt-in expression report v2, partial source-value IR and review-folder tools. The existing app inspector and arithmetic profile keep their documented behavior. These additions do not complete runtime binding/type resolution, general SQF grammar, native adapters or Enforce generation. No prior roadmap goals are removed.


## Subsequent source-shape/effect review

See docs/SQF-SOURCE-SEMANTICS.md for a bounded operand-shape/potential-effect pass, strict report validator/schema and additive folder-review output. This does not complete flow-sensitive types, whole-statement effects or native equivalence, and does not change the installed desktop UI.
