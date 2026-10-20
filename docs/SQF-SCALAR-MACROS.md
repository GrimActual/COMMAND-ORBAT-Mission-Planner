# Bounded scalar macro replacements with dual source origins

## Scope

`planner/sqf-include-expansion.js` now exports opt-in `buildScalar(files, mounts, entries, environment)`. It extends the existing guarded-include model with numeric and double-quoted scalar definitions. This is a developer core and fixed Node-worker CLI; no installed app capability, Enforce output or native adapter is added. Existing literal and marker-only profiles retain their schemas, behavior and cached report output.

An object-like macro's replacement list is the text after its name, as described in the [GCC preprocessor reference](https://gcc.gnu.org/onlinedocs/cpp/Object-like-Macros.html). Arma has its own preprocessing details: [Bohemia documents different macro handling in single- and double-quoted strings](https://community.bistudio.com/wiki/PreProcessor_Commands). This implementation deliberately supports a narrower grammar and is not asserted to be an Arma/GNU-compatible preprocessor. No imported code is executed or numerically evaluated.

## Supported scalar grammar

Active source can declare `#define COUNT 12`, `#define MASK 0xF0`, `#define RATE 2.5e-3`, or `#define DIR "functions"`, then use those names as complete identifiers outside strings/comments. Decimal integer parts are zero or start with 1â€“9; decimal fractions require digits on both sides of the point. Hex digits and decimal exponents retain their original spelling. Strings use double quotes and may contain doubled quotes and Unicode. Backslashes and C0 control characters in replacement strings are excluded from this subset. Each replacement body is at most 4,096 UTF-16 code units.

No signs, leading-zero octal forms, type suffixes, aliases, expressions, function parameters, token pasting, stringification or recursive rescanning are implemented. Replacements are scalar literals, not expressions evaluated by the compiler. A negative source expression may still use an unsigned scalar after a minus token; this stage does not evaluate it.

Double-quoted source strings and comments are left untouched. Active single-quoted strings block the profile until their Arma-specific substitution behavior is implemented. Identifier suffixes and preprocessing-number tokens are not partially substituted. A macro use beside an identifier/number, dot, dollar sign, quote or non-ASCII character is conservatively blocked if output tokens could merge or their boundary is uncertain. This can reject otherwise valid engine input; it does not guess a meaning.

The caller-declared environment is unchanged: exactly `{mode:"explicit-closed-set",defined:[]}` or an explicit initial marker list. Initial entries are markers without replacement values. It is never auto-detected or engine-verified. Each selected entry starts independently. Empty marker definitions remain useful for guards but cannot be substituted into emitted code. `ifdef`/`ifndef`/`defined` see scalar definitions; `#if COUNT` is still outside the predicate subset. Computed include operands remain blocked even if the macro holds a string. Literal include resolution, line-splice barriers, inactive-directive grammar checks and per-file condition scopes retain the prior policy.

Inactive definitions are syntax-checked but do not mutate state. Identical redefinitions are allowed; changing an existing marker/literal requires `undef` first. Macro definitions follow include order, are not retroactive and are removed by active `undef`. File recursion keys include a SHA-256 of sorted marker names and scalar spellings, so the same names with different values do not falsely represent an identical state. Cycles, depth and work budgets still apply.

## Output provenance and gates

Reports use `command-scalar-macro-review` v1 and `scalarMacroProfile:"literal-scalar-v1"`, with an independent domain-separated context hash over original source identity, entries/roots and canonical environment. Units can complete as `scalar-macro-subset-expanded`. `scalarMacrosExpanded:true` advertises only this profile; broad `macrosExpanded`, `preprocessingComplete`, `symbolBindingsResolved`, `executable` remain false. `environmentVerified:false`, existing review gates and `summary.executionReady:0` remain explicit. All entries still need later syntax, binding, typing, full preprocessing and native validation.

Ordinary segments retain their previous original-source spans. Replacement segments copy the literal spelling directly from its definition span, with no synthetic source text. Each adds `macro` metadata: name, full invocation span, literal definition span, definition include occurrence and invocation include occurrence. The segment's `includeOccurrenceId` identifies the invocation traversal; its `source` identifies the copied definition text. These roles may refer to different files/occurrences. Config registration projections carry this metadata rather than losing the invocation's identity. Segment substrings still exactly match the original text at their source spans, even when the replacement differs in length from its name.

Up to 256 live names, 4,096 aggregate replacements and the existing include/text/map/finding/trace/report/projection limits apply. Per-chunk replacement discovery is also capped before allocating an unbounded result list. `scalarMacroReplacements` counts processed substitutions, including a diagnostic prefix if an entry later blocks. Blocked entries expose no partial text, map or registration report. Budget overflow rejects the report. This producer-only schema adds no imported-report authority or app execution route, and the existing seven-analysis review bundle stays unchanged.

## Developer command

```powershell
node tools/sqf-review/scalar.cjs --source-set "A:/Reviews/scalar-source-set.json" --output "A:/Reviews/new-scalar-report.json"
```

Input has exactly `{files,mounts,entries,environment}`, as in the prior conditional profile. `scalars` is a fixed allowlisted worker entry. The existing worker memory/input bounds, cancellation/deadline, awaited termination, regular UTF-8 input, source-byte recheck and exclusive fresh report creation apply. It fetches no dependencies and executes no imported source. Worker isolation is not a sandbox for arbitrary JavaScript. Reports contain source text and must only be shared with appropriate permission.

## Evidence and performance

19 new focused cases and 53 affected regression cases passed. Checks cover numeric/string literals, Unicode/CRLF maps, header definitions and both occurrence roles, comments/strings, exact identifiers, guard recursion, undef/redefinition, inactive branches, state isolation, macro barriers, token-fusion rejection, budgets, config registration origins, worker cleanup and no-overwrite output. Earlier literal and conditional reports from five cached source sets match deeply and their input bytes remain unchanged.

The ten sampled real config entries still yield three completed units, seven blockers and 186 registration candidates. No real entry needed a scalar replacement before encountering its unsupported macro usage; these results do not establish broader mod conversion. A 102-file synthetic config fixture demonstrates 101 replacements and 100 registration candidates with definition/use origins. Private fixture text is kept outside the public repository.

Two warmups and six measured sets on this PC: the same unmodified 102-file fixture took median 4.29 ms through the prior conditional profile and 4.32 ms through the new scalar profile without substitutions. A separate modified fixture with 101 substitutions took 6.53 ms directly and 71.03 ms through a fresh worker including startup, return and cleanup. Direct and worker reports matched; output/source and invocation/name round trips passed. These short developer-core samples are not a speedup, renderer/FPS, app stability or native behavior claim. See `docs/test-evidence/sqf-scalar-macros.json`; both hosted Windows Node 22 and Linux Node 24 compiler suites passed for source 8a7fa8418fd8b4aef854e42b4876e080cd115818: [CI run 38760273420](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/actions/runs/38760273420). Hosted results are recorded separately from local focused cases.

## Next stages

Alias chains, general replacement tokens, computed includes, function-like macros and full conditional expressions require explicit rescanning rules and additional origin mappings. Cross-file symbol/write candidates and typed control-flow/context IR remain upcoming before any reviewed Enforce generation. Author-operated app intake, Sarge, Settings and EN/FR/DE app guidance will be integrated when a user-facing capability ships. EN/FR/DE developer instructions are added now. Every existing roadmap goal remains.
