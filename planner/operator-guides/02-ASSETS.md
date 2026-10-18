# Vanilla assets and deployment

The optional operator bundle contains Vanilla-Assets/Start-Here/01-Operational-Assets-Catalog.json and 01-Operational-Assets-Resource-Index.json. Import the Catalog through Assets → Import catalog JSON, not Import plan. Select an asset under Units, set its faction separately, then Place new unit or Apply changes.

For deployment choose 1–16 planned entries, open Game controls → Deploy → Deployment preview and load the matching Resource-Index.json. Review the batch, send the reviewed request and approve it in Reforger. Secondary export, planned server save, cancellation and removal are under More deployment tools. Names are optional in desktop followon.9: blank entries receive Unit labels in reviewed data without changing the saved plan.

For squad orders choose a supported AI group prefab. One group entry can spawn several soldiers. A lone character prefab is not an AI group; the current bridge cannot control it through the squad order path. Do not assume a catalogue Infantry label means a group.

The recommended operational pair contains 2,721 identities. Complete-Catalog contains the 19,438 base-game prefab identities in bounded collections. COLLECTIONS.json identifies matching pairs. These are the existing metadata snapshot from 14 October 2026, not a new game scan. GUID/path identity does not prove standalone spawnability. Base templates, damaged variants and technical helpers may be unsupported. Modded resources are outside the vanilla snapshot.

Importing another catalog replaces the chooser list; assigned markers retain saved snapshots. Reimport the desired catalog after restarting. Older rifleman test snapshots have matching files under Compatibility; reselect and apply an asset to migrate it rather than merging conflicting old/new identities. No catalogue is loaded automatically by this bundle.

[Start](00-START-HERE.md) · [Server](03-SERVER.md)
