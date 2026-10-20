# Reviewed deployment preview

1. In Assets, prepare reviewed prefabs from a matching resource index; assign them to units.
2. In Units, select 1–16 units and open Deployment preview (also available through Settings and Sarge).
3. Load the matching index, set heading, Review selected units. Inspect exact GUID/path, world X/Z, provenance and required addons.
4. Export reviewed deployment JSON creates an intention package; exporting does not execute game commands. Changes to the plan, heading or index require fresh review.

The GM development pilot adds a separate Send reviewed spawn request button, explicit connection permission, in-game host approval and result/removal controls. See [Host GM pilot steps and validation scope](HOST-GM-PILOT.md). Published RC2 remains intention-only.

Selection captured during review defines the package. Later selection does not silently replace its entities. Terrain elevation is resolved by the native executor. Missing addon metadata is flagged; native resource validation remains mandatory.

CLI export: `node deployment-cli.js mission.json index.json "[1,2]" 90 output.json`. Existing files are not overwritten. Offline plan/undo compatibility is preserved.

## Placement correction

Use desktop 2.9.1-dev.gm.2 for native spawning: deployment reverses the +50 m map imagery offset in each axis without moving saved plan markers. Discard old pending requests and review again. No Workshop mod update is required. See [GM-PLACEMENT-FIX.md](GM-PLACEMENT-FIX.md).
