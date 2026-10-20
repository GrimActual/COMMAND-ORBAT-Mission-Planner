# Bounded literal include insertion and original-source maps

## Delivered scope

`planner/sqf-include-expansion.js` assembles literal includes from explicitly supplied source text, records the insertion order and maps every emitted UTF-16 code unit back to an original file span. Complete config units can feed the existing literal function-registration reader; declarations receive original-source spans in addition to their clearly named synthetic source identity. No imported source is executed. This is a source-only developer core/Node-worker CLI, not an installed desktop change or a full preprocessor/transpiler.

The supported model follows the literal-copy concept in [Bohemia's preprocessor documentation](https://community.bistudio.com/wiki/Config_Parser). Quoted and angle-delimited includes use the existing explicit source/virtual-mount resolver. The tool has not been proven equivalent to the native Arma preprocessor: macro expansion, conditionals, builtin macros, configuration merges, runtime binding and code generation remain unfinished. `preprocessingComplete`, `macrosExpanded`, `conditionsEvaluated`, `symbolBindingsResolved` and `executable` remain false. A completed literal-include stage is not native readiness or proof that all preprocessor semantics have been handled.

## Fail-closed entries

Input has exactly `{files,mounts,entries}`. Each entry has `{file,configRoot}`; file is an explicitly selected source identity and configRoot is a package-relative root or null. Roots are validated, entry records reject accessors/extra fields/duplicates and ordering is deterministic. Existing dependency and registration CLI shapes remain unchanged.

Only exact literal includes can be inserted. Missing files, ambiguous mounts/case, unsafe paths, computed/continued operands, cycles, depth limits, unclosed independent source lexical regions and unmodeled directive syntax block the entry. Every directive except a supported literal include blocks the entry: even `#if 0`, include guards, #define, #undef, #line and #pragma. No inactive branch or macro value is guessed. Raw line splices are conservatively blocked, including those in comments/strings, rather than assuming the engine's comment/continuation ordering.

The first blocking traversal finding is recorded; this is not an exhaustive error audit. A blocked entry exposes no partial expanded text, source map or registration candidates. Traversal occurrences/findings can remain as diagnostic evidence. Separate selected entries can complete independently, but none gains execution authority. Unreferenced files remain in source identity metadata without poisoning an otherwise literal entry; this is explicit entry-closure coverage, not whole-project preprocessing.

## Output and origin tracking

Reports use `command-literal-include-expansion` v1 and a domain-separated context hash over original source-set identity and selected entry/root metadata. Complete unit text is hashed as decoded UTF-8; original files keep their own identities. Content hashes are not authorship or native behavior proof. Expanded output contains source text and must be kept private unless its authors have authorised sharing.

Ordered map segments contain output start/end, original file/start/end and an include-occurrence ID. Segments cover the full emitted output with no gaps; source/segment substrings are checked in tests. Occurrences retain parent links and directive locations, so repeated includes are separate insertions. Original line endings and source characters are retained around removed include directives; no synthetic line directives or token substitutions are emitted. Empty output is allowed for an empty literal unit.

Config registration review uses `_command_expanded/unit-N.cpp` as a synthetic filename, not an original source claim. An explicit entry config root anchors relative function properties; virtual paths still require mounts. Declared classes wholly inside a header map back to that header. A declaration crossing an include boundary retains multiple original spans with exact UTF-16 locations. Original SQF file sources retain their own lexical-call identities. Downstream registration limits/syntax can reject that review separately while leaving a bounded completed include unit visible; rejected downstream reviews contain no partial candidate report.

Limits: 16 entries, depth 32, 4,096 aggregate findings, 4,096 include occurrences, 8,192 emitted segments, 1,048,576 attempted characters per unit, 2,097,152 aggregate attempted characters, 16,384 projected declaration-origin references and a 16 MiB compact report. Original supplied-source budgets also apply. Attempts in blocked entries still consume work budgets. Structural/output-budget overflow rejects the report rather than silently truncating it. Line indexes are built lazily and cached only for files needing location lookup; directive/edge lookup and lexical preflight are indexed/cached per source set.

No new report-import route accepts this format. Full strict imported-report validation is still required before any future app import authority. The producing core and worker are trusted project code; worker isolation does not make arbitrary imported JavaScript safe.

## Worker and developer command

The `includes` profile uses a fixed worker entry and the existing 16 MiB source-JSON limit, bounded Node worker, timeout/cancel handling and awaited cleanup. The CLI rechecks original JSON bytes and exclusively creates a new report filename. It reads no referenced local files automatically and fetches no missing dependencies. Unsupported source returns an explicit blocked report, not a converted script. The older seven-analysis review bundle is unchanged. EN/FR/DE developer usage is appended to tools/sqf-review/README.md; Sarge/Settings have no new app capability to advertise.

## Evidence

22 new focused cases passed, plus 11 affected worker/CLI regression cases. Coverage includes nested/repeated includes, source-map round trips, Unicode/LF/CRLF/CR origins, comment/string masking, literal path policy, missing/ambiguous/unsafe/computed includes, macro/conditional barriers, cycles/guards, separate-entry results, malformed inputs, occurrence/depth/character/finding caps, source projection across boundaries, downstream budget rejection, worker completion/cancel/deadline and no-overwrite output. No game/server/native compiler was launched.

The five pinned author-permitted source sets supplied ten selected config entries. Sources remain private and unchanged; no new dependency downloads were performed for this pass.

Private external-source test details are withheld. The general implementation goals and supported contracts remain unchanged.

The three completed real entries needed no nontrivial include insertion and retained the prior 186 literal registration candidates. Seven macro-dependent entries were blocked with original-source findings. This is useful boundary evidence, not proof of mod conversion. New include-fragment composition is demonstrated by synthetic cases, including one 102-file fixture where a previously opaque include exposes 100 registration candidates with original header origins. All remain non-executable and unbound.

On that same 102-file fixture, prior unexpanded registration inventory median was 2.70 ms; include insertion/maps plus registration composition was 6.97 ms; a fresh worker including startup/return/termination was 60.21 ms. Two warmups and six measured pairs; direct/worker reports and segment substring round trips matched. This quantifies added functionality and worker overhead, not a speedup, FPS result or old/new app comparison. See docs/test-evidence/sqf-include-expansion.json. Both hosted Windows Node 22 and Linux Node 24 jobs passed on source 8230192f14187493008a04c1dc4c1c4dcb6cb3c2: [CI run 38755842213](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/actions/runs/38755842213). Hosted evidence is recorded separately from the focused local cases.

## Remaining work

Next: source-mapped macro/conditional compatibility fixtures and an explicit bounded preprocessing strategy, then cross-file symbol/write candidates and typed control-flow/context IR. GNU CPP and external grammar adoption still require actual corpus/engine compatibility evidence. Native adapters, author-operated in-app intake/review/export, Sarge/Settings integration and every existing roadmap goal remain pending as applicable.
