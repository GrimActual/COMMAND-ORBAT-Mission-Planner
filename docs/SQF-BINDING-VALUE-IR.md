# SQF declarations, command expressions and value IR checkpoint

## Delivered source tools

This unreleased developer checkpoint adds conservative source binding evidence, an opt-in command-expression grammar, source-value IR and a reproducible review-folder workflow. It does not update the installed desktop executable, app inspector, Sarge, Settings, mission JSON, Undo or native mod. The developer guide is tools/sqf-review/README.md (EN/FR/DE). No game/Workbench/server launch was required.

### Declaration and reference evidence

`planner/sqf-binding-review.js` captures plain source records before asynchronous work and builds located file/code contexts. It recognizes simple private initializers, quoted private names, literal private-name arrays and unary params lists/descriptors. Params preserve default/type/array-count source spans without evaluating them. Empty string slots are skipped. Malformed descriptor/name lists reject as a whole; binary/dynamic params remains unresolved.

References are located word tokens with read/write evidence and candidate declaration IDs. Matching uses case-folded SQF names, declaration order and explicit code contexts. Same-scope redeclarations remain ambiguous. Reads before declarations and self-initializers remain unresolved. Normal control blocks may have inherited syntactic candidates, but stored code and unclassified nested code operands stop automatic outer capture. Dynamic private/params, privateAll/import, compile/execVM and preprocessing conservatively block candidate lookup in affected contexts. forEach implicit names and range counters are syntactic loop candidates only, not initialized values or proven lifetime behavior.

Every reference has bindingResolved:false; every declaration has typeResolved:false and initializationResolved:false. A summary's candidateReferences counts only syntactic candidates. Even unresolvedReferences:0 cannot establish runtime bindings, valid event arguments, definite initialization or closure conversion. File contexts never leak local names across files. The module does not resolve dynamic caller scopes or execute callbacks.

Bounds: 10,000 scopes/declarations, 20,000 references and total candidate edges, 2,000 findings, 8 MiB compact output, plus existing structural source limits. An explicit edge budget prevents repeated declarations from multiplying reference graphs. Limit errors are not swallowed by unsupported-declaration handling.

### Opt-in command syntax

The default `CompanionSQFExpressions.parse/build` arithmetic profile and expression report version 1 remain available. `parseExtended/buildExtended` opt into expression report version 2. The parser adds comparisons, logical operators/aliases, unary !/not and a fixed registry of 18 documented command names/arities. It follows verified SQF precedence: unary 10, multiply/divide/remainder 7, add/subtract 6, generic binary commands 4, comparisons 3, and 2, or 1, with equal-precedence binary operators associating left to right. Source arity recognition is not argument-type or behavior validation.

Covered names: player, hasInterface, objNull, nil, playableUnits, switchableUnits, isNull, isNil, vehicle, findDisplay, count, displayCtrl, lbAdd, getVariable, arrayIntersect, select, addAction and addEventHandler. lbAdd accepts its documented unary and binary forms; unregistered forms/commands remain unsupported. Command nodes retain source references, unresolved operand types and nativeAdapterVerified:false. Callback/lazy code operands become opaque CodeValue spans with contextResolved:false and bodyStatus:opaque-not-invoked. Their bodies are not executed or assumed immediate; the structural stage still checks complete source delimiters and inventories nested code separately.

The outer expression token/depth/node budgets still apply. Opaque code bodies are character/depth bounded; buildExtended additionally applies the complete structural tokenizer's token/delimiter limits. Recognizing a code value does not validate its internal expression grammar. Unknown namespaces/functions, arbitrary command signatures, preprocessing and full SQF grammar remain unsupported.

### Source value IR prototype

`planner/sqf-value-ir.js` consumes the original limited expression profile plus binding evidence. It preserves literal values, exact numeric lexemes, groups, arrays and basic arithmetic dependency edges as a flat postorder value graph. Symbols link by exact source span to candidate binding IDs but retain unknown source types; no type is propagated from an initializer through later writes. Numeric-only operand shapes may be labeled source-number, while arithmetic precision/domain review remains required. Array/string overloads stay unresolved; mixed arrays do not fabricate a homogeneous Enforce type. Numeric literals retain unverified-source-precision and are not folded, including division by zero.

This is partial source-value IR, not complete typed statement/control-flow IR. All targetType values remain null, evaluationPerformed:false and controlFlowLowered:false. The richer command grammar is not silently lowered through this numeric IR. Aggregate limits: 20,000 value nodes and 8 MiB compact report. Calls, branches, loop execution, scheduling, events, native output and authority remain blocked.

### Review bundle and integrity

`planner/sqf-review-package.js` combines structure, original expressions, bindings, adapter requirements, limited value IR and extended command expressions. It checks that all stages refer to identical source hashes. Current review-bundle version 3 includes six JSON analyses, REVIEW.md, manifest.json and a CLI source receipt. Earlier private v1/v2 bundles are preserved and remain verifiable; these are internal report versions, not three app releases.

The manifest hashes exact UTF-8 artifact bytes in sorted name order with a versioned, domain-separated bundle fingerprint. Input selection order and absolute install/output directories do not affect review artifacts. Source text hashes describe decoded UTF-8; the separate CLI receipt records original byte hashes. The manifest detects artifact differences, not authorship, native behavior or execution authority, and is not the future compiler-wide build manifest. The receipt is separate from the listed-artifact integrity scope.

The CLI reads 1-64 top-level loose SQF/SQM/EXT/HPP files only, at most 256 KiB/file and 2 MiB total; it bounds directory entries at 1,024. It does not recurse, unpack archives, read/copy audio, expand includes or reinterpret config.cpp as SQF. It rejects malformed UTF-8, source links/non-regular selections and unsafe source names. Source byte hashes are rechecked before publication. Output must be separate from the source tree and absent; staged writes avoid publishing a partial review, and failed staging is cleaned up. Fixed artifact paths are never renderer/user-selected report paths. Serialized publication and verification limits agree: 32 MiB per listed artifact, 1 MiB manifest and 128 MiB aggregate.

verify.cjs checks known artifact names, manifest gates/metadata consistency, byte counts and hashes, non-executable version claims and an optional independently retained expected fingerprint. It does not import reports, resolve their semantics, authenticate their origin or authorize deployment. Reports cannot pass the existing structural native-export validator and new developer modules are not public browser routes.

## Actual evidence

70 focused checks passed: 55 new checks across binding (17), value IR (9), command grammar (12), package/CLI/integrity boundaries (17), plus 15 affected legacy expression checks. Earlier unchanged UI/native gates were not repeated. A real-sample duplicate finding from nested params was corrected and covered by a synthetic regression. Legacy arithmetic report output exactly matches source checkpoint db6f9a1 for both the radio and synthetic fixtures.

Read-only radio sample: four SQF files, two HPP inventory files, 33 contexts, 30 declaration candidates, 50 reference candidates, 11 explicit code-context boundary findings, 12 adapter families. Extended syntax recognizes all 31 selected expression parts with 31 command nodes and seven opaque code values. This is not whole-mod conversion coverage. The limited value IR contains 56 nodes and still leaves 27 of those parts unsupported in its narrower profile. No adapter is native-verified or execution-ready. Seven script/config SHA-256 comparisons matched; audio was not processed and source files were not modified.

Private current bundle: A:/Everon-ORBAT-Development/work/sqf-binding-radio-review-v3-20261015. Public source evidence excludes supplied script bodies/audio: docs/test-evidence/sqf-binding-value-ir.json.

Same-fixture headless sample (five warmups, 20 measurements): exact prior db6f9a1 three-core radio review median 8.86 ms / p95 9.89 ms; new six-analysis bundle including hashes/serialization median 30.13 ms / p95 41.19 ms. The 18,289-byte / 200-block fixture measured 86.41 / 98.22 ms prior versus 304.23 / 327.65 ms current. The current workflow performs substantially more analysis and emits more data. Only the changed current code was remeasured after the final nested-declaration guard; the unchanged old baseline was retained. Repeated structural preparation remains a possible future optimization through an immutable shared analysis context, rather than reusing mutable imported reports. Sequential heap snapshots are GC-sensitive; these results are not app FPS, causal speedup or sustained stability/leak claims. Analysis is not loaded into the desktop map path.

## Next unfinished gate

Implement source operand/type/effect checks for the bounded command registry, retaining uncertainty at callbacks and dynamic calls. Resolve target representations and explicit lifecycle/locality before full typed statement/control-flow IR. Add strict validators/schemas and stale-context/locale tests before desktop review/export integration. Then compile and behavior-test one bounded native adapter with actual layout/audio/resource evidence. PBO/WRP inventory remains separate. No earlier roadmap goals are removed.

Primary references: [private](https://community.bohemia.net/wiki/private), [params](https://community.bohemia.net/wiki/params), [variables](https://community.bohemia.net/wiki/Variables), [operator precedence](https://community.bohemia.net/wiki/Operators), plus the per-command official source references in the fixed registry. Documentation evidence does not establish installed-engine adapter equivalence.


## Subsequent source-shape/effect review

See docs/SQF-SOURCE-SEMANTICS.md for a bounded operand-shape/potential-effect pass, strict report validator/schema and additive folder-review output. This does not complete flow-sensitive types, whole-statement effects or native equivalence, and does not change the installed desktop UI.
