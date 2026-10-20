# COMMAND usability review — 18 October 2026

The reported errors identify actual limitations and interface defects, rather than simply incorrect use.

## Findings

- **Lone soldier orders:** approved spawn accepts generic supported prefab roots. Squad orders and execution checks cast the stored root to SCR_AIGroup. A character root is not a group, so a spawned lone soldier can appear in the target chooser yet fail movement or execution inspection. Lone-character control is not implemented by this update. Deploy an AI group prefab for the current squad order path.
- **Names:** deployment review blocked blank names even though unit IDs already supplied stable identity. This desktop update gives blank entries stable Unit labels in the reviewed intent, including batches, without editing mission data. Explicit oversized or unsafe labels remain invalid.
- **Cancel:** the button previously remained available after terminal outcomes. It now enables only for the last pending request, rechecks game-request status before cancellation, and explains how Cancel owned movement differs from cancelling a pending request. A racing cancellation failure gets readable refresh guidance.
- **Existing game squads:** recruitment already resolves a currently tracked editable AI member to its existing group and requires approval, valid same-faction membership, no human occupants and no foreign waypoints. It does not require that COMMAND originally spawned the group. The new Control existing in-game squad button exposes this path directly. Tracking scope changes can revoke it.
- **Two-way editing:** live tracking shows reported entity state, but planner edits do not automatically modify arbitrary live objects, and Game Master edits do not rewrite the saved planning mission. Universal entity adoption, lone-character grouping, live property editing and persistent plan/live identity reconciliation remain development work. Existing vehicle transport/control requires bridge-created vehicles.

## New desktop workflow

1. For existing troops, select the intended faction/tracking scope in Reforger, then refresh command targets.
2. Click Control existing in-game squad, choose a tracked AI member, review and send, then approve recruitment in Reforger.
3. Select the resulting controlled squad and review a Move. Approve it in Reforger.
4. Use Check squad execution for activation, waypoint, position and authority. Order installed alone does not prove movement.

For new troops, use a verified AI group prefab if squad orders are needed. One group entry may spawn several soldiers. Deployment review accepts up to 16 selected planning entries at once. Names can be left blank in desktop followon.9.

## Scope and evidence

This is a desktop usability update compatible with bridge 0.11.1. It does not fix the lone-character native gap or certify the user's hosted mission. Focused tests cover stable generated labels, strict intent validation, unchanged mission data, request validation and synchronized EN/FR/DE instructions. Isolated desktop IPC checks cover the recruitment shortcut and pending-only cancellation. No game control is used.

The existing native grouping and parent-agent APIs were independently checked against the installed bindings and [Bohemia AIGroup API](https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceAIGroup.html). Their existence does not establish a tested singleton-group lifecycle or automatic bidirectional editing.


## Presentation update

The new shell uses COMMAND's existing logo and colors, the actual saved operation name and actual bridge status. Left navigation separates planning, live Game controls and Offline rehearsal. Game controls groups the existing panels under Deploy, Orders and Server. Deploy shows a non-interactive select/review/approve guide; it does not assert execution progress. Plan files and secondary deployment tools remain accessible in labeled disclosures. No example mission, fictional activity, copied art, new command, automatic approval or automatic connection was introduced.

All existing forms and their handlers are reused rather than cloned. Settings, Sarge, module shortcuts, compact workspace, full-map mode, languages and narrow layouts remain available. Mission data formats, command validation and native bridge source are unchanged by the presentation work. UI state does not become mission data.

Validation: full regression after the layout change: 880 passed, zero failed, one optional skip. Isolated Electron presentation checks covered every module destination, settings, plan file controls, full map, compact workspace, EN/FR/DE, original logo, actual plan name and unchanged mission JSON. Screenshots were inspected at desktop, laptop and narrow widths. Native gameplay acceptance is carried forward with the same limitations; this desktop update is not a new native gameplay validation.

The final successful-cancellation feedback adjustment was checked separately through the isolated desktop command fixture. It displays the returned cancelled state immediately.
