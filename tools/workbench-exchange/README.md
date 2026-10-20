# Workbench exchange review — development only

This original COMMAND tool prepares a declared placement baseline and reviews a returned snapshot. It neither launches Workbench nor writes a scene or mission. `canApply` is always `false`. A valid JSON report does not authenticate an editor, prove addon availability or establish permission to use resources.

From the repository root:

```text
node tools/workbench-exchange/cli.cjs prepare --mission mission.json --configuration configuration.json --out NEW-baseline.json
node tools/workbench-exchange/cli.cjs review --mission mission.json --baseline NEW-baseline.json --snapshot editor-snapshot.json --out NEW-review.json
node --test tools/workbench-exchange/contract.test.cjs tools/workbench-exchange/cli.test.cjs tools/workbench-exchange/candidate.test.cjs
```

Outputs must be new files. Preparation prints the canonical baseline SHA-256 for the snapshot header. Inputs remain unchanged. Success means a development report was written, not that native import or Apply is ready.

See [the contract and remaining acceptance gates](../../docs/WORKBENCH-EXCHANGE-CONTRACT.md). Tests use synthetic metadata, not game models or an observed Workbench export.


Native-format development review uses `review-native` with the same file arguments. Its rows supply opaque managed IDs, never planner IDs; the baseline owns that binding. Missing/null/empty IDs are rejected. This still produces a non-applying report.

```text
node tools/workbench-exchange/prepare-native-probe.cjs --out NEW_PROJECT_DIRECTORY
```

This creates a standalone Game-module JSON probe project, including its own world and profile paths. Nothing is launched. Only use the isolated diagnostic server/project for this fixture; do not install its startup probe in the bridge or a live mission. Seven native scalar-read cases were reproduced on engine1.8.0.13. This is not a Workbench importer or editor round-trip test.


`candidate.cjs` is a development-only module: `prepare(missionText, baselineText, nativeText, resourceIndexTextOrNull, choicesText)`. Choices use schema `command-workbench-candidate-choices`, version1: exact `confirmedMovedIds`, `confirmedRemovedIds` arrays and `added` rows with `managedId`, optional/null `name`, explicit `side`, `unitType`, `phaseId`, `parentId`, `resourceId`. A resource index is required for additions. It returns a non-applying candidate and trusted assigned-ID mapping. See the synthetic `fixtures.cjs` and contract guide; there is no product importer or candidate Apply CLI.

Full reviewed poses live on units, separately from shared prefab catalog definitions. Candidates with this optional data need plan format5; ordinary plans remain format4. This is last-reviewed provenance, never native ownership authority. New/tactical classifications do not infer prefab geometry. Existing conflicting definitions block additions.

`candidate-benchmark.cjs` measures preparation with a 1,000-managed-unit synthetic fixture. `verify-desktop.cjs --candidate OWNED_DEVELOPMENT_FOLDER --out NEW_FOLDER --playwright-module MODULE_FOLDER [--bulk]` requires current source hashes, opens a fresh isolated offline COMMAND profile, verifies the existing generic batch edit and exact Undo/Redo, then closes it. Native-format input is synthetic. This does not certify an editor importer, layer identities or native round-trip. Never point the verifier at an active user profile. All outputs stay outside the repository.


`prepare-inventory-probe.cjs --out NEW_PROJECT_DIRECTORY` prepares an original read-only WorkbenchGame inventory plugin and a synthetic five-entity world. It launches nothing and refuses existing directories. The plugin runs only through explicitly selected diagnostic Workbench arguments with installed base-game addons and a fresh profile. It refuses to overwrite its report. Output is `profile/COMMANDWorkbenchInventory.json` beneath the selected profile root. Native compilation and two scans passed; unpersisted IDs rebound under text-layer reorder, so they are never trusted as durable managed IDs. Workbench shutdown emitted instance-leak diagnostics; cleanup acceptance is still pending. No importer or Apply is enabled. See the contract guide for exact scope.
