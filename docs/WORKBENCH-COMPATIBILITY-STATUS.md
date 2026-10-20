# Workbench compatibility checkpoint — 15 October 2026

This describes the checked development source, not a guarantee that every public download or Workshop session has the matching capabilities. The current diagnostics/scaffold build does not change the in-game mod. Earlier milestone notes retain their historical test/version scopes.

| Workbench area | Implemented connection | Remaining compatibility |
| --- | --- | --- |
| World Editor | Reviewed prefab spawn/remove through the bridge; planning transforms, landmark alignment, world-identity and height-review contracts. | Full scene/layer import/export, terrain conversion and complete world-editing round trips. Terrain sampler fixture evidence does not prove full Everon height accuracy. |
| Script Editor | Original bridge Enforce scripts have bounded native compilation/runtime evidence. Legacy SQF has structural AST/context IR, dependency/function/type/effect diagnostics, combined export and comments-only scaffolds. | Executable SQF-to-Enforce emission, proven target mappings, full control flow and general integration into Script Editor. Comment-only files are not runnable conversions. |
| Resource Manager | Selected .gproj/.meta identity readers, GUID/path/addon provenance, resource indexes, vanilla asset catalog workflow and targeted native resource lookup. | Universal resource-content parsing, complete resource dependency discovery and asset conversion. Metadata identity is not proof of native loadability. |
| Particle Editor | No dedicated native editing/conversion adapter delivered. | Particle graphs, emitters, effect lifecycle and runtime validation. |
| Animation Editor | No dedicated animation graph/skeletal conversion adapter delivered. | Motion/graph bindings, source asset rights, compilation and behavior validation. |
| Audio Editor | Radio SQF has been used as a read-only diagnostic corpus. | Native sound resources, mixers, playback/lifecycle/network adapters and audio conversion. Successful radio analysis is not audio-system migration. |
| Behavior Editor | Bounded Move/timed Hold/Defend/cancel-owned-waypoint adapters for bridge-created infantry AI groups. Defend's native activity/tree selection was observed in an isolated server. | Full behavior-tree conversion/editing, other command families, normal-terrain travel/combat outcomes and broader group/vehicle control. |
| Procedural Animation Editor | No dedicated procedural-motion adapter delivered. | Runtime motion policies, component wiring and native validation. |
| String/Localization Editor | COMMAND's interface, Settings and 55 Sarge topics have EN/FR/DE coverage. | Native string-table import/export and automatic legacy localization migration. App localization is separate from native string-table compatibility. |
| Layout Editor | The bridge has native pairing, roster and GM .layout screens; desktop UI is separate. | Importing/converting arbitrary game layouts, resource binding and complete UI round trips. |
| Workbench extensions/plugins | Targeted vanilla-index tooling and diagnostic/resource lookup workflows exist. | A general COMMAND Workbench importer/plugin, automated project assembly and broad batch conversion across editors. |

The strongest current paths are resource identity, reviewed entity deployment, bounded native AI orders and offline source diagnostics. Broad media/editor conversion remains future work. There is no evidence-based overall compatibility percentage; these areas have different adapters and validation gates.

## Evidence and boundaries

- [Metadata identity reader](WORKBENCH-METADATA-READER.md) and [project identity](PROJECT-IDENTITY-COMPATIBILITY.md): observed field subset, source provenance and explicit missing/empty/dependency limits.
- [Native orders pilot](NATIVE-AI-ORDERS-PILOT.md), [tactical checkpoint](TACTICAL-CANDIDATE-CHECKPOINT.md) and [command expansion](AI-COMMAND-EXPANSION.md): native waypoint/activity selection and ownership lifecycle, with travel/combat and other command families pending.
- [Terrain context](MIGRATION-TERRAIN-CONTEXT.md): planning contracts and bounded native sampler, including the empty-fixture elevation limitation.
- [Combined diagnostics/scaffolds](COMBINED-DIAGNOSTIC-EXPORT.md): actual desktop exports and comment-only output; no green emitter.
- Native bridge layout sources remain under the existing internal compatibility paths in reforger-mod/dedicated-candidate. Those identifiers are not a product-branding change.
- [Native references](NATIVE-REFERENCE-SOURCES.md): installed docs and official samples are references, not proof of completed adapters or imported dependencies.

This checkpoint adds status information. It removes or replaces no roadmap goal. Next conversion gate is a narrowly defined target mapping with typed/source-context requirements and native evidence before any green emission.


Subsequent checkpoint: the [pure Boolean expression mapping](BOOLEAN-EXPRESSION-MAPPING.md) now emits optional typed bool value helpers with headless native evidence. Whole statements/functions/missions remain unconverted. The Workbench startup failure is retained; no additional Workbench-module compatibility follows from this primitive Game-script proof.
