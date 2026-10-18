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
