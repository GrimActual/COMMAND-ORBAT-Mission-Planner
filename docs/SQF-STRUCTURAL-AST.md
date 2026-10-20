# Structural SQF syntax inspector (unreleased)

## Using the desktop candidate

Open Assets → Arma 3 migration review and select or drop supported SQF/SQM/EXT/HPP source files. Open SQF syntax inspector and choose Inspect SQF structure. The worker builds a source-linked structural AST and presents 40 rows per page. Settings → Game Master → Open SQF syntax inspector opens the same view. Sarge's Import assets and mods guide and EN/FR/DE controls describe this workflow.

Supported structural forms are brace-style if/then/else, if/exitWith, while code conditions and bodies, range for/from/to/step, the three-code-block for form, forEach bodies/iterables, code-valued assignments and assignments containing supported control structures. Quoted command names/braces stay text. Stored code blocks are not invoked. The exported source spans use UTF-16 code-unit offsets with line/column locations; files also carry decoded UTF-8 text SHA-256 values. Input filenames are normalized and sorted to produce the same package regardless of selection order.

Export syntax review saves COMMAND-SQF-Structural-AST.json through a guarded native Save dialog. It is a syntax review, not an executable mission package. Source changes stale the review and disable export; changing the asset map does not stale this syntax-only view because it has no asset bindings. Cancelled/timed-out workers cannot repopulate a newer source context. Clearing a review leaves the mission unchanged. The entire workflow is session-only, offline-capable and separate from editor Undo/rehearsal/live state. No automatic inspection, game connection or game command is added.

## What remains unresolved

This is a structural AST checkpoint, not the complete grammar or a compiler. Expressions are opaque source spans/previews; no operand typing, evaluation, command precedence validation, scope/locality resolution, scheduler emulation or typed control-flow IR exists here. Recognizing a loop does not prove that it terminates or reproduce its execution. exitWith explicitly retains unresolved code-scope exit semantics. The alternative then-array form, switch/try and unsupported control constructs remain flagged and their nested code is preserved. SQM/EXT/HPP remain inventory-only; the parser does not reconstruct a mission/configuration scene graph or expand preprocessing. It does not parse PBO/WRP binaries or config.bin.

Every package requires executable:false, syntaxOnly:true and all review gates. Nodes retain mandatory semantic blockers. Existing supported-pattern intent drafts still reject control-flow statements rather than flatten them; this inspector is not connected to native deployment or generated .c output. The next compiler increments are expression/scope analysis and a typed IR with explicit control flow, effects and scheduling/locality requirements, followed by verified native lowering and code generation.

## Contracts and validation

The schema is planner/schemas/sqf-structural-ast-v1.schema.json. The JS validator additionally enforces dense plain-data records/arrays, sequential stable node IDs, forward-only singly owned edges, connected per-file roots, source-span containment, kind-specific child/part roles, mandatory gates/blockers and summary consistency. Accessor/coercion tricks reject before invocation. This validates the report structure; an editable imported JSON file is not proof of source correctness, native behavior or runtime authority.

Limits: 64 files, 256 KiB/file, 2 MiB total decoded source, 50,000 lexical tokens/file, delimiter depth 64, 10,000 AST nodes, 1,000 findings and 8 MiB report. UI shows 40 rows and enforces a 15-second worker deadline. Source previews are bounded to 160 UTF-16 code units and displayed with textContent, including Unicode and HTML-like text. Native Save validates before opening the dialog, accepts no renderer-selected path, and handles cancellation, window reset and write failure.

27 focused checks cover parser/graph boundaries, coercion safety, native export, translated guidance/locale behavior, Save lifecycle and public routes. Nine independent schema cases include the actual desktop-exported document. Actual offline Electron checks passed real migration/AST workers, nested source spans, three loop families, paging, inert script-like/Unicode source, native JSON Save, Settings shortcut, EN/FR/DE context/status, stale-source lockout, cancellation and unchanged mission JSON. No renderer errors or game execution occurred.

The UI harness initially tried the Settings shortcut without selecting the existing Game Master section. Correcting that navigation completed the test; it was not an app defect. See docs/test-evidence/sqf-structural-ast.json and examples/SQF-STRUCTURAL-AST-EXAMPLE.json.

## Performance sample

Same 60-unit / 60-route / 240-movement-point mission and 17,889-byte SQF input in previous terrain-context/current AST candidates, offline terrain/reduced motion/default viewport: both median 16.7 ms / p95 16.8 ms, maximum 16.9 ms over 180 steady-state frames, no frame above 50 ms. Both retained 60 markers, 60 route paths, 16 tiles and identical 318,825-byte saved missions. This is a short local sample, not a sustained FPS/stability guarantee.

Main-process private snapshots were 74,052 / 73,804 KiB and approximate JS heaps 17.1 / 17.1 MB. Startup/import long tasks were 438/53/163/64 ms versus 355 ms; their causes are not established and these are not causal speedup claims. Only the new candidate has the AST feature: its automated click-to-worker-result sample was 97.96 ms. Headless AST preparation, including hashing and structural validation, for 200 nested range-loop/branch blocks produced 1,401 nodes / 529,301 report bytes: five warmups, 20 samples, median 23.88 ms / p95 27.55 ms / maximum 32.72 ms. These explicit inspection costs are not per-frame work. Indexed graph lookup avoids repeated scans during validation; workers, bounded previews and paged rendering keep this separate from map updates.

Primary syntax references: [Control Structures](https://community.bohemia.net/wiki/Control_Structures), [if](https://community.bohemia.net/wiki/if), [while](https://community.bohemia.net/wiki/while), [exitWith](https://community.bohemia.net/wiki/exitWith). No source code is evaluated by this feature.


## Subsequent developer checkpoint

See docs/SQF-BINDING-VALUE-IR.md for separate declaration/reference evidence, opt-in expression report v2, partial source-value IR and review-folder tools. The existing app inspector and arithmetic profile keep their documented behavior. These additions do not complete runtime binding/type resolution, general SQF grammar, native adapters or Enforce generation. No prior roadmap goals are removed.
