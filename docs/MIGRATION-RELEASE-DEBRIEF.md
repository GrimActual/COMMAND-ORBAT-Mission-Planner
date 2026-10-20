# COMMAND 2.9.1-dev.gm.8 — reviewed Arma 3 mappings and mission drafts

Extract the entire Windows ZIP and open COMMAND Planner.exe inside COMMAND-Mission-Migration. Close the older Companion before switching builds; back up your saved operation. Previous packages and test copies remain unchanged.

## Workflow

1. Open Assets → Arma 3 migration review, or the Settings → Game Master shortcut.
2. Select/drop SQF/SQM/EXT/HPP text files and inspect the paged findings.
3. Expand Arma 3 asset mappings. Load a verified deployment resource index, search/filter prefab types, select a source class and explicitly confirm its target. Alternatively load a previously reviewed mapping JSON.
4. Expand Prepare migration mission draft, then click Prepare mission draft. Review source references, mapped assets, dependency links, proposed coordinates and blockers.
5. Export mission draft through the validated native Save dialog. Source or mapping changes disable export until you prepare again.

Mapping libraries can be exported and reused. Exact addon/GUID/path identities and dependencies are retained; class names are never guessed into prefabs. Sarge and EN/FR/DE guidance cover the workflow and keep the active review context.

## Scope and limitations

The bounded parser supports straight-line literal declarations/aliases, modern group createUnit, unary and literal-class binary createVehicle, doMove and basic addWaypoint. Conditions, loops, dynamic calls, preprocessing and unsupported statements remain unresolved. SQM/config files are inventory-only. Coordinates are provisional axis proposals, not terrain calibration. Source group semantics, placement, locality, lifecycle and native availability require review.

Every draft stays non-executable. This release does not apply imported units to a plan, execute SQF, unpack PBOs, convert whole missions, generate executable Enforce/native scenes or send game commands from imported files. Saved mission data, Undo, rehearsal and bridge state remain untouched. All prior roadmap content is retained; future conversion milestones are additive.

Existing reviewed spawn/remove and native tactical controls remain available separately. Matching Workshop 0.6.0 is needed for Defend/cancellation; the offline migration features need no Workshop update. The optional clean Workbench project is included. This release does not publish the Workshop addon.

## Validation

247/247 full release regression tests passed. The final isolated offline Electron package passed startup/version checks, portable mapping import, real worker draft preparation, linked spawn/movement intents, validated native JSON Save with automated dialog selection and a real file write, stale-export locking, unchanged mission state and no renderer errors.

Retained focused checks cover rejected input retention, late worker isolation, 500-intent bounds, safe text display, EN/FR/DE context and strict mapping/draft schemas. Native production source is unchanged; package hashes are compared against the clean project and retained native compilation evidence. Earlier bounded native tests establish bindings/acceptance, not arrival or extended navigation/combat stability. No new game-client launch was required.

Measured on this PC: 2,721-resource cached search median 0.234 ms / p95 0.341 ms over 100 samples; supported-pattern hashing/parsing/validation of 200 mapped spawns + 200 linked moves + 200 definitions (21,559 source bytes), median 16.32 ms / p95 18.17 ms over 20 warmed samples. These retained measurements cover unchanged feature code, not universal app FPS, RAM, network latency or full conversion speed. Workers and paged lists bound UI work; preparation does not write missions.

Windows app, exact full source, optional clean Workbench project, sanitized evidence, manifest and SHA-256 checksums accompany this development prerelease. See Documentation/SQF-CLASS-MAPPINGS.md and Documentation/SQF-MISSION-INTENT-DRAFTS.md for detailed limits.
