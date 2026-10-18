# COMMAND Control and Terrain — local development candidate

Desktop: **2.9.1-dev.followon.10**. Production bridge: **0.11.2**. This candidate is not publicly published. Keep previous installations and export your plan before switching; run one Companion at a time.

## Two separate requirements

**Read-only terrain-section preview — desktop only.** Open 3D preview on the map toolbar or in Settings. Import a separately generated, authorized elevation file and verify its world identity, metre scale and alignment. No Workshop update is needed for the preview. No complete Everon heightmap, satellite image, scene reconstruction or exact game models are bundled. Eden.ent identifies the world, not a ready-to-render mesh or spawnable prefab. The diagnostic sampler remains separate and limited to 300 points; a 17 × 17 grid uses 289 samples and covers only the extent determined by its spacing.

**AI controls, reconnect recovery and target reporting — bridge 0.11.2.** These production bridge changes require the matching server/host mod. The prepared Workbench project is included under Operator-Content/Bridge-0.11.2 and at the separate publish location. Workshop publication is a separate user operation; this package does not establish that the item has been updated. An older bridge does not gain these capabilities by installing the desktop.

## Changes

- Approved, supported living on-foot individual AI can use an original managed one-member control group. Group prefabs retain their existing path. Deployment and recruited actors retain their physical identity and original prefab references.
- Approved reconnect recovery transfers only the selected retired target. Other batch members remain untouched. Active duplicate control, players, changed membership and foreign waypoints are protected. Recruited actors can be released; they are not treated as newly owned deployments.
- In-game target choices show server-reported infantry/vehicle support and unavailable explanations. Approval, delivery and execution remain distinct. Pending cancellation rechecks state, and terminal requests avoid misleading remote-method errors.
- Names remain optional: reviewed deployments receive stable automatic labels, including the full sixteen-entry selection. Mission names are not rewritten.
- Terrain previews use validated complete regular grids, actual vertex heights and matching raycasts. Approximate instanced tactical proxies share existing 2D selection. Orbit/pan, cursor zoom, focus/reset and mouse preferences are available. Closing releases renderer resources. Preview inspection does not edit mission data or send orders.
- EN/FR/DE Settings, Sarge and operator guides cover the delivered controls. Operator-Content includes the separate vanilla catalog/index collections and server guides; catalogs are imported explicitly.

## Verification and limits

Fresh automated regression: **890 passed, zero failed, one optional skip** (891 total). Native diagnostic-server checks physically observed individual movement, stance, hold/route behavior, restart snapshot restore, recruitment/release, reconnect protection, treatment, boarding and convoy lifecycle. Safety tests with simulated player signals and injected failures are marked as diagnostic simulations, not real connected-human tests.

Terrain checks rejected missing/conflicting samples, irregular spacing, wrong identity and invalid heights. Native resource lookup confirmed Eden.ent and the distinct GM_Eden.ent. In the configured Everon Game Master world, 27 ground samples around Morton, Montignac and Le Moule were compared through the actual offline desktop/WebGL preview: all sampled vertices matched, and landmark map/world coordinates round-tripped. Three sections were each 40 × 40 metres; this is not whole-world precision. Entity origin height is not assumed to equal terrain height. Axis/UV metadata tests passed; real satellite-image alignment remains dataset acceptance because image importing is not delivered.

On this machine, twenty repeated offline open/close cycles removed canvases, disposed geometry and destroyed graphics contexts without mission changes. The coarse heap reading stayed at 23.1 MB. A short maximum-grid test (66,049 vertices, 60 proxies) used three draw calls with 16.8 ms p95 frames and no stalls above 100 ms. These measurements do not guarantee lifetime memory behavior or performance on every PC.

**Still unverified or unfinished:** real connected-human multiplayer/permissions, combat acceptance, universal two-way live editing, building garrison/clearing, and general vehicle suitability. The earlier intermittent boarding timeout did not recur in the traced native rerun; its cause remains unresolved and no root-cause fix is claimed. Full-world terrain, tiled LOD, 3D editing, .ent reconstruction and exact game models remain separate roadmap work.

See [gameplay acceptance checklist](Operator-Content/Guides/GAMEPLAY-ACCEPTANCE.md). Packaging checks do not certify those gameplay outcomes.
