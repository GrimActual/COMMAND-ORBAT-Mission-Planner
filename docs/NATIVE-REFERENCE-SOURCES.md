# Native adapter reference sources

The user supplied the following references while the control/context IR work was in progress. They supplement the existing roadmap; they are not imported code, app dependencies, API inventories or proof of native adapter behavior.

## Installed Tools documentation

Verified local indexes:

- `A:/SteamLibrary/steamapps/common/Arma Reforger Tools/Workbench/docs/EnfusionScriptAPI/html/index.html`
- `A:/SteamLibrary/steamapps/common/Arma Reforger Tools/Workbench/docs/ArmaReforgerScriptAPIPublic/html/index.html`

The installed indexes identify themselves as Enfusion Script API and Arma Reforger Script API documentation, generated with Doxygen 1.16.1. That is the documentation generator version, not an inferred game/Tools API version. The paths are specific to this developer PC; future tooling must not assume every user has the same installation.

Two engine API pages were read selectively as reference:

- `interfaceScriptCallQueue.html`: scheduling and deferred-call interfaces, useful when evaluating ownership, cancellation and callback lifetime adapters. A documented call-queue API is not proof of equivalence to SQF scheduled/unscheduled execution.
- `interfaceEntitySpawnParams.html`: transform-mode and spawn-transform interfaces, useful when reviewing coordinate/transform adapters. Documentation availability alone does not verify terrain, placement, replication or Game Master integration.

The public Reforger API index was verified; specific gameplay API entries still need targeted reading when each adapter is implemented. No broad documentation crawl, extraction, bundled HTML, Workbench/game launch or native test was performed. Index/page hashes in `docs/test-evidence/native-reference-locations.json` record what was read, not adapter readiness.

## Official modding samples

[Bohemia Interactive's Arma Reforger samples](https://github.com/BohemiaInteractive/Arma-Reforger-Samples) include modded-script, Workbench-plugin, entity/faction and other modding examples in the repository overview. These are potential references for later native adapter/project structure review; no sample source was copied, cloned, bundled or executed during this step.

The repository declares [Arma Public License](https://github.com/BohemiaInteractive/Arma-Reforger-Samples/blob/main/LICENSE). Those materials retain their own terms. COMMAND's original GPL-3.0-only code declaration does not relabel third-party samples or game assets. Current use is reference/inspiration only, as requested by the user; no dependency or code import is proposed by this note.

## Roadmap use

Use targeted installed documentation plus official examples to check actual API names, argument shapes, ownership and lifecycle when implementing each native adapter. Then compile and run an isolated relevant test before calling that adapter verified. Current SQF control/context reports keep all native/target/execution gates unresolved. All existing roadmap goals remain.
