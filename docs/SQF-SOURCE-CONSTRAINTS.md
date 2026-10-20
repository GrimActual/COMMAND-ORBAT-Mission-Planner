# Source constraints and initialization review

COMMAND developer tooling now records source-shape requirements and unresolved initialization evidence on top of the source-built control/context IR. This is a preparatory constraint inventory, not a type solver, definite-assignment analysis or executable conversion.

Run `node tools/sqf-review/source-constraints.cjs --source-set <files.json> --output <new-report.json>` from the repository. The UTF-8 input must contain exactly `{ "files": [{ "name": "init.sqf", "text": "..." }] }`. Existing structural source bounds apply: 64 files, 256 KiB per file and 2 MiB total. The fixed Node worker supports cancellation and deadlines, has a 256 MiB heap limit, and terminates after either success or failure. Output is exclusively created; source bytes are checked again before publication. No referenced file is loaded implicitly and no imported code executes.

The `command-sqf-source-constraint-review` v1 report retains the complete original control/context IR and adds:

- Assignment syntax shapes with candidate binding IDs and enclosing branch/loop/exit/barrier region IDs. These describe possible writes, with `initializationGuaranteed: false`.
- Parameter default, allowed-type exemplar array and array-count syntax evidence. Exemplar shapes are recorded, but neither accepted argument types nor default execution is proven. No argument is supplied or evaluated.
- Command signature alternatives from the existing immutable source rule registry, plus operator overload review requirements. Return types are candidates, never propagated into reads or native types.
- Boolean condition requirements and literal syntax mismatch hints for recognized condition slots. No condition is folded or branch removed.
- Read-to-declaration candidates with initialization and runtime type explicitly unresolved. Binding records index possible writes once; reads do not duplicate every preceding write.

Selected expression slots are the coverage boundary. Unsupported expressions, namespace/global bindings, dynamic declarations, caller environments and opaque statement regions remain in the embedded IR. Stored code retains its detached context and is never invoked or treated as initialized by its owner. Branch and loop regions do not establish dominance, reachability, iteration counts, joins or definite values. The analysis performs no flow-sensitive propagation or general command type checking.

`build(files)` builds from captured source. `reviewImported(ir, files)` first applies the existing strict source-bound replay validator and analyzes the newly reconstructed canonical IR. Imported constraint reports are not an authority or a supported direct input. Hashes identify captured source and the rule registry; they do not establish authorship, executable correctness or native validation. Producer changes can require rebuilding reports.

Bounds additionally cap constraints at 50,000, aggregate links at 50,000, parameter expression nodes at 30,000, and the compact combined report at 16 MiB. Reports contain source-derived text; share them only with the required rights. This pass does not alter old IR, review bundles, app mission contracts, Sarge, Settings or the desktop executable. Its EN/FR/DE developer instructions are in the tool README.

Validation on 15 October 2026: 17 focused cases and six shared runner regression cases passed. Thirty cached SQF samples across five revision-pinned projects produced 686 constraints, 438 binding records, 354 possible writes and 197 selected reads. Direct and worker reports matched; original source bytes and earlier IR were unchanged. Third-party source bodies remain in private development fixtures.

The same 16-file/160-stored-function fixture used for earlier IR measurements produced medians of 131.97 ms for IR alone, 166.52 ms for IR plus this review, and 350.63 ms through a fresh worker including startup/return/termination. Two warmups and six measured sets per path. These measure additional developer analysis cost, not map FPS, native runtime performance or a universal speed guarantee. Evidence: `docs/test-evidence/sqf-source-constraints.json`.

The next semantic work remains a source-version-aware type domain, verified binding resolution, control-flow joins and definite initialization, followed by typed lowering and independently verified native adapters. This inventory preserves the evidence needed for that work without marking it complete.

Hosted full compiler checks passed on Linux/Node 24 and Windows/Node 22 for source commit `02c171196700ea3b70ade3256b6c1cd39dd768e1`: [run 38770660354](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/actions/runs/38770660354). No native/game execution was part of that workflow.
