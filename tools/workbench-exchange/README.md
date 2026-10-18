# Workbench exchange review — development only

This original COMMAND tool prepares a declared placement baseline and reviews a returned snapshot. It neither launches Workbench nor writes a scene or mission. `canApply` is always `false`. A valid JSON report does not authenticate an editor, prove addon availability or establish permission to use resources.

From the repository root:

```text
node tools/workbench-exchange/cli.cjs prepare --mission mission.json --configuration configuration.json --out NEW-baseline.json
node tools/workbench-exchange/cli.cjs review --mission mission.json --baseline NEW-baseline.json --snapshot editor-snapshot.json --out NEW-review.json
node --test tools/workbench-exchange/contract.test.cjs tools/workbench-exchange/cli.test.cjs
```

Outputs must be new files. Preparation prints the canonical baseline SHA-256 for the snapshot header. Inputs remain unchanged. Success means a development report was written, not that native import or Apply is ready.

See [the contract and remaining acceptance gates](../../docs/WORKBENCH-EXCHANGE-CONTRACT.md). Tests use synthetic metadata, not game models or an observed Workbench export.


Native-format development review uses `review-native` with the same file arguments. Its rows supply opaque managed IDs, never planner IDs; the baseline owns that binding. Missing/null/empty IDs are rejected. This still produces a non-applying report.

```text
node tools/workbench-exchange/prepare-native-probe.cjs --out NEW_PROJECT_DIRECTORY
```

This creates a standalone Game-module JSON probe project, including its own world and profile paths. Nothing is launched. Only use the isolated diagnostic server/project for this fixture; do not install its startup probe in the bridge or a live mission. Seven native scalar-read cases were reproduced on engine1.8.0.13. This is not a Workbench importer or editor round-trip test.
