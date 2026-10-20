# Compact GM workspace — optional layout

Use GM workspace in the header, or enable it in Settings → Game Master and Save settings. It starts disabled for existing users. Layout and drawer preferences live in local settings, separately from mission JSON.

Assets opens the existing searchable chooser in a left drawer. Inspector shows up to 16 selected planned objects, their IDs, grid, assigned resource GUID/path and lock state. It does not claim to inspect live native components. Editor opens the existing forms, retaining unapplied values. On narrow windows, drawer controls choose one visible panel at a time. Escape closes a panel outside text fields; full-map/fullscreen behavior stays with the existing controls.

Review deployment opens the current reviewed request workflow; Request results performs its explicit result check. Execution still needs in-game host approval. Pause rehearsal and Advance rehearsal delegate to the existing offline clock and stay disabled when unavailable. No automatic connection, simulation start, spawn or result polling is added.

Turning the workspace off restores the standard sidebar and the same chooser node, including search and filter state. Switching layouts does not change the mission, selection, Undo history, saved plans or asset provenance. No native mod update is needed; the existing 0.4.1 bridge remains experimental.

Design hierarchy follows the existing MagicPath project 461104450405294080. The current design is named COMMAND and shows only supported controls. No React/UI framework or engine rendering dependency was added.


Layout-only preference changes also skip unrelated map/asset rebuilding and do not pause active replay. Changing actual rehearsal settings retains the existing pause/reconfiguration behavior.
