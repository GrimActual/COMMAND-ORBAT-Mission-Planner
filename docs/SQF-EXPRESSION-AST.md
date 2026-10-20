# Bounded SQF expression syntax checkpoint

This developer-only core is available as `require('./planner/sqf-expression-ast')`. It does not change the desktop UI, Sarge, Settings, existing structural export contract, mission data or game commands. The current desktop candidate remains the structural AST build. No new executable is needed for this source-only increment.

## Delivered

`parse(text)` recognizes numeric/string/boolean literals, unresolved underscore-prefixed symbols, nested arrays, explicit grouping, unary plus/minus and binary plus/minus/multiplication/division/modulo. Multiplication/division/modulo bind more tightly than plus/minus; equal-precedence binary operations associate left to right. It preserves grouping and unary nodes rather than evaluating or folding them. A separate tokenizer correctly separates compact arithmetic such as `1+2*3`, exponent signs, doubled quote escapes and comments. The existing migration lexer is unchanged.

The returned tree is a flat postorder node table with relative UTF-16 spans and backward child references. `build(files)` first captures plain data properties before asynchronous hashing, then uses the structural builder to validate source packages, classify configuration files and compute decoded-text hashes. It parses complete expression part spans from original source, never the 160-character previews. Targets/range counter declarations are excluded. File roots and structural node IDs locate the source context. The review is not a complete structural AST and omits opaque statements without expression parts.

The report uses `command-sqf-expression-review`, version 1. It is an internal output contract, not an accepted import or deployment format. Every report requires `executable:false`, `syntaxOnly:true`, the review gates and `executionReady:0`. Recognized syntax still has unresolved semantics; symbols have unresolved bindings. Unsupported syntax returns a located issue, null root and an empty node table, never a partly successful expression. Arrays may be syntactically mixed; no claim of equivalent Enforce array typing is made.

## Deliberate boundaries

Commands and non-local names, comparison/logical/power operators, code-valued operands, dynamic calls, preprocessing, SQM scene reconstruction and binary archives remain unsupported here. Command signatures, source scope/bindings, type inference, namespace lookup, scheduling/locality, typed IR and `.c` emission remain future increments. This module is not loaded into the app or its worker yet; desktop export remains unchanged. Before UI integration, add an independent strict export validator/schema and stale-source/localization/export tests. Do not connect this development report to a native action.

Per expression: 256 Ki UTF-16 characters, 8,192 tokens/nodes, nesting depth 64. Package: structural source limits, at most 10,000 expression entries and 8 MiB serialized report. Package source records are snapshotted without invoking accessors. No supplied source is evaluated. The module does not read/write files or contact the network.

## Evidence and reference

Fifteen focused tests cover compact arithmetic, associativity/grouping, decimal/exponent boundaries, nested arrays, inert Unicode/script-like strings, unknown syntax, malformed/non-finite inputs, resource limits, coercion avoidance, full-span parsing, deterministic ordering, binary/configuration separation, asynchronous input mutation and graph containment. Scoped parser performance is recorded separately in `docs/test-evidence/sqf-expression-ast.json`; this core-only change does not add work to map frames.

Private external-source test details are withheld. The general implementation goals and supported contracts remain unchanged.

Primary references: [SQF syntax](https://community.bohemia.net/wiki/SQF_Syntax), [Operators](https://community.bohemia.net/wiki/Operators). Source precedence must be verified before adding each further operator or command family; Enforce precedence is not a substitute.


## Unpacked radio compatibility sample

After the user supplied `A:/Sqf-enscript test`, a read-only check consumed four SQF files and two HPP inventory files. The current input allowlist excludes `config.cpp`; it was not renamed or parsed as SQF. The structural report contains 106 nodes, 29 code blocks, 15 conditions, two loops, one stored code assignment and one unsupported control statement (`waitUntil`). The expression report recognizes four of 31 selected expression parts and leaves 27 unsupported. This is not whole-mod conversion coverage: opaque commands and configuration semantics are not represented as expression parts.

Before/after SHA-256 comparisons of all seven script/config files matched. Audio files were not read/copied and nothing was executed or compiled. Private reports, which include the user's source previews, stay outside the public source tree at `A:/Everon-ORBAT-Development/work/sqf-expression-ast/radio-compatibility`. Two original synthetic regression fixtures cover radio-like callbacks and long string tables without distributing the supplied radio source or music. Next semantic families exposed by the sample include command signatures (`isNull`, UI controls, variables), comparison/logical expressions, params/bindings, deferred event callbacks, client locality, scheduler waits and explicit handler/action cleanup. These remain unresolved until individually implemented and tested.


## Subsequent developer checkpoint

See docs/SQF-BINDING-VALUE-IR.md for separate declaration/reference evidence, opt-in expression report v2, partial source-value IR and review-folder tools. The existing app inspector and arithmetic profile keep their documented behavior. These additions do not complete runtime binding/type resolution, general SQF grammar, native adapters or Enforce generation. No prior roadmap goals are removed.
