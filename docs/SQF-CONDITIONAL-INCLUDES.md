# Explicit marker conditions and guarded includes

## Delivered boundary

The developer compiler now has an opt-in `buildConditional(files, mounts, entries, environment)` profile in `planner/sqf-include-expansion.js`. It selects a bounded conditional subset, assembles literal includes and preserves original UTF-16 spans for every emitted character. The previous `build()` API, literal CLI, schema and cached reports are unchanged. This is source-only tooling, not an installed app feature or runnable mod conversion.

The model is informed by [Bohemia's config preprocessor reference](https://community.bistudio.com/wiki/Config_Parser) and the [documented include-guard pattern](https://gcc.gnu.org/onlinedocs/cpp/Once-Only-Headers.html). These references do not establish native Arma preprocessing equivalence. No engine/compiler/game was launched for this step.

## Caller-declared environment

Input JSON has exactly `files`, `mounts`, `entries` and `environment`. The first three retain the literal tool's shape. Environment must be `{ "mode": "explicit-closed-set", "defined": ["FEATURE"] }`. The caller explicitly declares every initially defined marker; all other supported names are absent in this model. This is a review assumption, never automatic detection of server/client/platform/build macros. Do not treat an empty set as a verified engine environment.

Names are case-sensitive ASCII identifiers, at most 128 characters each. Names starting with `__` are reserved and rejected. Up to 256 names are allowed; duplicates, sparse/extended arrays, getters and unexpected fields reject without evaluating source or coercing input. Names are sorted for deterministic context hashing. Each selected entry starts with a fresh copy; marker mutations follow its include order without leaking to other entries. Final reports set `environmentVerified:false`.

## Exact supported grammar

- Lowercase `#ifdef NAME`, `#ifndef NAME`.
- `#if` / `#elif` with exactly `0`, `1`, `defined(NAME)`, `defined NAME`, or `!defined` in either spelling; whitespace around parentheses/negation is accepted.
- `#else` / `#endif` with no payload. Nesting is local to each file; branches cannot open in one file and close in another.
- Empty marker `#define NAME` and `#undef NAME`. Active definitions affect subsequent conditions only. No token replacement is implemented.
- Existing literal quoted/angle includes with exact supplied-source resolution when active. Inactive literal includes are recorded as skipped and do not require a supplied target. Computed/malformed include operands still block even while inactive.

Inactive branches still have their directives checked against this grammar. Unsupported replacement/function macros, expressions, pragmas, builtin directives, uppercase directives and line splices block the entire entry. Inactive ordinary text is omitted. Preflight still rejects unclosed lexical regions and unmodeled hash syntax across the whole visited file. The lexical model remains bounded and is not a full Arma CPP implementation.

Active emitted text is scanned against currently defined markers and reserved `__` tokens; occurrences block because substitution has not been implemented. Comments are masked. Strings are conservatively included in this check, so a string containing a marker word can be blocked even where a native preprocessor would leave it alone. This deliberate restriction avoids presenting an unsupported substitution path as completed.

## Guard recursion, origins and limits

Recursion is keyed by original file plus its sorted marker state on entry. A classic `ifndef` / empty `define` guard may re-enter once with changed state, skip its body and terminate. Repeating the same active file/state blocks. Include depth, occurrence, text, source, segment, finding, report and registration-projection budgets from the existing include engine still apply.

Additional limits: 64 condition nesting levels per file, 256 live markers and 8,192 aggregate conditional/marker/skipped-include trace steps across selected entries, including repeated visits. Exceeding structural/report budgets rejects the report. A blocked entry exposes no partial text, map or registration report; its bounded diagnostic trace may remain.

No replacement text or synthetic line directives are emitted. Retained characters keep their original file/span and include occurrence; original line endings around removed directives are preserved where active. Conditional trace entries retain original directive locations, active state, predicate value when relevant and include occurrence. Selected config declarations reuse the existing synthetic registration review and project their origins back into guarded headers. Original SQF lexical call inventory is still separate and does not gain preprocessing/runtime binding authority.

Reports use `command-conditional-include-review` v1 and `closed-set-marker-v1`. Context SHA-256 includes original source-set identity, selected entries/roots and the canonical declared environment under its own domain. `conditionsEvaluated:true` means this restricted profile was enabled; it does not promise all entries completed. `macrosExpanded`, `preprocessingComplete`, `symbolBindingsResolved`, `executable` remain false and `summary.executionReady` stays zero. Existing review gates remain. No new app-import authority or review-bundle format is introduced.

## Developer usage

```powershell
node tools/sqf-review/conditional.cjs --source-set "A:/Reviews/conditional-source-set.json" --output "A:/Reviews/new-conditional-report.json"
```

The fixed `conditions` worker profile reuses bounded input, memory, timeout/cancellation, awaited termination, UTF-8/source-byte rechecks and exclusive new-file output. Imported source is never executed; a worker is not a security sandbox for arbitrary JavaScript. The seven-analysis bundle remains unchanged. Reports contain source text; retain third-party rights and keep private fixtures private.

## Checks and performance

20 new focused cases and 33 affected literal/worker/CLI cases passed. Two initial test assertions expected the wrong budget message; the fixtures were corrected to exercise the intended limits, and only the affected checks were rerun. A final narrow check covered the added trace occurrence context and cycle diagnostic. Coverage includes malformed branches, inactive parents, include guards/self-recursion, unchanged-state cycles, entry isolation, strict environment handling, macro barriers, source-map round trips, guarded registration origins, budgets, worker cancellation/deadlines and no-overwrite output.

Five previously captured author-permitted source sets were read without downloads or source changes. All previous literal reports remain deeply identical. Ten selected real entries still produce three completed units and seven blockers, retaining 186 registration candidates; the blocked projects use replacement macros outside this subset. This is boundary evidence, not increased whole-mod conversion coverage. A separate guarded 102-file synthetic fixture now exposes 100 registration candidates; the original literal profile correctly blocks it.

On the same unguarded 102-file fixture, two warmups and six measured pairs gave median 4.03 ms for the existing literal profile and 4.54 ms for the new conditional profile. A fresh worker, including startup/return/cleanup and equality assertion, measured 52.15 ms median. Direct/worker reports and source-map substrings matched. These are developer-core overhead measurements, not app frame-rate, memory-pressure, native behavior or broad hardware claims. Evidence: `docs/test-evidence/sqf-conditional-includes.json`. Both hosted Windows Node 22 and Linux Node 24 compiler suites passed for source ca6f9bd1ebbefacf28fe0eae67d0329149a2d134: [CI run 38758215225](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/actions/runs/38758215225). Hosted results are recorded separately from the focused local cases.

## Next work

Replacement macro compatibility needs explicit semantics, expansion-origin maps and corpus fixtures before broader preprocessing claims. Cross-file symbol/write candidates, typed control-flow/context IR, target adapter verification, reviewed Enforce generation and the author-operated in-app intake remain ahead. Sarge/Settings and EN/FR/DE app guidance will be updated when these capabilities reach the app; this developer command has EN/FR/DE documentation now. Every existing roadmap item remains intact.
