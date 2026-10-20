Implementation update, 14 October 2026: the compact shell is delivered in development pilot 2.9.1-dev.gm.4. [Current controls and limits](COMPACT-GM-WORKSPACE.md). The original proposal below is retained as design history; future behavior/waypoint/native-property controls are not claimed as delivered.

# Package 14.1 — optional Game Master workspace plan

User clarification reviewed 13 October 2026. This is a proposed design milestone inside the existing COMMAND — ORBAT / Mission Planner, not a separate app, replacement interface or implemented feature. MagicPath is the proposed design workspace for panel hierarchy and component boundaries; no MagicPath prototype has been created in this increment.

## Design target
- Compact GM toolbar using verified existing planning/rehearsal commands.
- Collapsible asset drawer using the existing imported catalogue and placement workflow.
- Selection inspector backed by current planner selection and validated edits.
- Existing Everon map controls, dark theme, branding, keyboard access and full-map behavior remain available. Switching workspace modes must not reload or modify the mission.
- Layout preferences belong in the existing preferences system, separately from mission JSON. Narrow windows collapse panels into accessible tabs/overlays.

## Component boundaries
The workspace shell manages layout only. Selection, asset catalogue, GM command and future property adapters read the authoritative planner/core model and request existing validated commands. No component owns a second unit model or writes mission objects directly. A design tool may generate prototypes or assets for review; it is not a required production runtime and introduces no native-engine dependency.

## Stages
1. Audit actual selection, assets, layout and command APIs; reuse existing passing fixtures and baseline evidence. Do not restart testing from scratch.
2. Use MagicPath to prototype hierarchy, spacing, collapsed states and narrow/full-map variants using our visual identity. Review the layout before integrating it.
3. Add a reversible optional workspace shell and existing asset search/category/placement controls.
4. Add the inspector for currently supported offline properties. Planned route assignment, behavior, morale, readiness or other fields must not be exposed as implemented unless their data model and command behavior exist and pass their scoped checks.
5. Connect the compact toolbar to existing operations. Resume/Advance are manual rehearsal clock controls; replay playback and synthetic simulation remain visibly distinct. Avoid labelling manual advance as automatic scenario playback.
6. Run affected layout, focus, import/export, undo, selection and asset-browsing checks. New rendering/layout changes get a representative prior-build performance comparison; unrelated passing gates stay complete.

## Roadmap mapping and limits
Primary owner: package 14. Supporting work: 03 (ORBAT/assets), 05 (authoring), 07 (GM), 12 (resource metadata). Native properties and deployment additionally depend on 10 (permissions/protocol), 11 (Enfusion adapter) and 16 (release assurance). The current roadmap has 16 packages; the proposal's “Package 20” is not an existing package and is mapped to these integration/deployment responsibilities rather than added silently.

Separate offline planning, synthetic rehearsal and verified native-game attributes. A catalogue entry's presence does not establish installation on the game server. Native writes, spawning and deployment controls remain unavailable until separately implemented, authorised, tested and acknowledged by the game server. The independent offline planner remains useful without Reforger or MagicPath.
