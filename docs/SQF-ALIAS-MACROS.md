# Bounded macro aliases and complete definition chains

## Developer-only scope

The opt-in `buildAliases(files, mounts, entries, environment)` export in `planner/sqf-include-expansion.js` adds single-identifier aliases to the scalar replacement profile. Example: `#define COUNT BASE`, followed by `#define BASE 12`, lets a later `COUNT` use emit the original `12` spelling. The report retains the invocation, every alias definition body and the terminal scalar definition. No source execution, target generation, installed app capability or native verification is added.

The [GCC object-like macro reference](https://gcc.gnu.org/onlinedocs/cpp/Object-like-Macros.html) documents use-time rescanning and current-definition behavior. This restricted implementation follows those concepts for chains ending in the supported scalar literals. It is not full GNU/Arma preprocessing: native recursive-macro suppression is not implemented, and used cycles are blocked instead. General replacement-token rescanning, function macros, computed includes, token pasting and full conditional expressions remain unsupported. No source was obtained from the inspiration-only `landaire/enfusion_tools` repository.

## Supported semantics

An alias body must be exactly one case-sensitive ASCII identifier under the existing 128-character name limit, without a reserved `__` prefix. Terminal literals follow the existing scalar grammar and body budget. Empty definitions remain condition markers, not substitution values. The caller-declared closed-set environment remains unverified and contains only initial markers, not replacement values.

Definitions store their replacement spelling without resolving aliases immediately. At each active use, resolution follows the definitions currently in effect. Forward definitions work if the target exists by the time the alias is used. Active `undef` and permitted redefinition change subsequent results; use before a scalar target exists blocks. Conflicting redefinition still requires explicit `undef`. Same-spelling redefinition refreshes origin locations. Inactive definitions are grammar-checked without changing state. Each selected entry has independent definitions and cache.

Successful resolutions are cached per requested root name for the current definition state. Any active definition or `undef` invalidates the cache, including same-spelling definitions, so both values and provenance stay current. Include recursion retains its sorted replacement-spelling state hash; aliases do not bypass existing include depth/cycle controls.

Missing targets, empty-marker targets, direct/indirect cycles and chains exceeding 32 definitions block the entry with distinct findings at the original invocation. The 32-definition bound includes the terminal scalar. Chain resolution is lazy: unused aliases, including unresolved/cyclic ones, are not exhaustively audited. Inactive uses do not trigger resolution. An unrecognized ordinary identifier outside an alias chain retains the prior lexical behavior and is not proof of a runtime binding.

Double-quoted strings/comments, exact identifier handling, preprocessing-number boundaries, active single-quote barriers, token-fusion checks, literal includes, per-file conditional scopes and predicate grammar retain the scalar profile's restrictions. `#if ALIAS` and `#include ALIAS` remain blocked. Alias support does not imply arbitrary text substitution or engine compatibility.

## Origins, bounds and report contract

Reports use `command-alias-macro-review` v1, `aliasMacroProfile:"scalar-alias-v1"`, a separate context-hash domain and `aliasMacrosExpanded:true`. Units can complete as `alias-macro-subset-expanded`. Base scalar/conditional capability flags remain; broad `macrosExpanded`, `preprocessingComplete`, `symbolBindingsResolved`, `executable` stay false, `environmentVerified` stays false and `summary.executionReady` remains zero. Older literal, marker-only and scalar-only APIs/CLI reports keep their previous behavior, including rejecting aliases.

Replacement segment `source` still identifies the exact copied terminal literal span. Existing `macro.invocation` identifies the root use; `macro.definition` and its occurrence identify the terminal scalar definition. The new `macro.aliasChain` records ordered `{name,source,includeOccurrenceId}` entries for every definition body, including the terminal scalar. Adjacent links can come from different headers/occurrences. Config registration origin projections preserve the same chain. No alias-origin span is misrepresented as directly copied output text.

Limits add 32 definitions per used chain and 16,384 aggregate chain-origin references across all selected entries, alongside 4,096 replacements and existing name/include/source/text/map/trace/finding/report/projection caps. Direct scalar substitutions in this profile contribute one origin reference each. Counts can include a processed diagnostic prefix for a subsequently blocked entry; blocked entries still expose no partial text, map or registration report. Structural budget overflow rejects the whole report. Cached chain arrays are shared internally rather than rebuilt for every repeated use, while the aggregate output-reference budget counts each reported use.

No report-import authority, app data contract or seven-analysis review-bundle format changes. Source-containing reports remain private unless sharing is authorised. The fixed worker remains bounded processing, not a sandbox for arbitrary JavaScript.

## Developer command

```powershell
node tools/sqf-review/alias.cjs --source-set "A:/Reviews/alias-source-set.json" --output "A:/Reviews/new-alias-report.json"
```

Input is exactly `{files,mounts,entries,environment}`, unchanged from the scalar source-set shape. `aliases` selects a hard-coded worker profile. Existing UTF-8 regular-file checks, input/memory limits, timeout/cancellation, awaited termination, original-byte recheck and exclusive new report creation apply. No dependency fetching, referenced-file reads or imported source execution is introduced.

## Verification and measured cost

19 new cases and 72 affected regression cases passed. Coverage includes forward/use-time resolution, changed/removed target definitions, cache invalidation for same-spelling origins, cycles, missing/empty targets, inactive/unused aliases, source maps and header occurrences, strings/comments, unsupported grammar, guards, entry isolation, depth/reference limits, registration projections, deterministic hashes, worker cleanup and no-overwrite output.

All three older report profiles match their cached reports across five private source sets, and original input bytes remain unchanged. The ten real selected config entries still yield three completed units, seven blockers and 186 registration candidates, with no alias substitutions before their unsupported constructs. This step demonstrates bounded capability with synthetic fixtures; it does not increase claimed whole-mod conversion coverage. No downloads or native launches were used for these corpus checks.

A 102-file synthetic fixture retains 100 registration candidates after 101 substitutions, with 202 origin links through two-definition chains. Output/source substrings, invocation names, each alias-body-to-next-name link, terminal literals and direct/worker reports matched. Two warmups and six measured sets on this PC gave median 5.72 ms for the previous scalar profile and 5.85 ms for the alias profile on the same direct-scalar fixture. A separately modified two-definition-chain fixture took 7.21 ms directly and 70.66 ms through a fresh worker including startup/return/termination. These are short developer-core cost samples, not renderer/FPS, native stability or speedup claims. Evidence is in `docs/test-evidence/sqf-alias-macros.json`; both hosted Windows Node 22 and Linux Node 24 compiler suites passed for source 5ab2bb389907e49628134ef78f21cc138143bce5: [CI run 38761965911](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/actions/runs/38761965911). Hosted results are recorded separately from local focused cases.

## Next work

Cross-file function/write candidates and typed control-flow/context IR remain the next compiler stages. Broader preprocessing needs explicit token/rescanning semantics and native compatibility fixtures before claims of full conversion. The author-operated app workflow, Sarge/Settings integration and EN/FR/DE app guides remain planned when these developer capabilities ship in the desktop app. EN/FR/DE developer instructions are included now. All existing roadmap goals are preserved.
