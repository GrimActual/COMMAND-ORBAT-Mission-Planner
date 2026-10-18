# Optional 3D terrain preview

Open 3D preview from the map toolbar or Settings. Choose the elevation JSON and click **Read world from selected file**, review the displayed identity/alignment, acknowledge authorization, then open. Reading metadata is not live engine attestation. Exact world matching remains enforced.

Known base-game Eden.ent, EmptyEden.ent and GM_Eden.ent identities can reuse the app’s existing offline Everon base-map imagery. The atlas uses the same +50-metre map offset and north/south tile mapping as the 2D planner. The texture is an image on the terrain, not building or tree geometry. Other worlds must supply their own matching imagery. Existing-provider map rights remain separate from COMMAND source licensing.

For your own authorized satellite image, select PNG or JPEG, maximum 20 MiB and 4096 pixels per edge. The elevation package must contain explicit north-up imagery metadata: westWorldX, eastWorldX, southWorldZ, northWorldZ and topEdge: north. These extents must cover the terrain section. Missing or conflicting metadata is rejected; the app does not infer alignment from a filename. Satellite texture and Water surface can be switched off; preferences stay outside the plan.

Water is shown at world elevation zero where the terrain lies below it. Ground inspection distinguishes the visible water surface from seabed height. Terrain heights are unchanged. A fitted overview camera and Focus selection help navigation; wheel zooms, F focuses, R resets and Escape closes.

The local Everon overview dataset uses a 50-metre grid over 0–12,750 metres. It is coarse planning data, not precise building placement. The original sampler remains capped at 300 points per query; the separately requested overview was assembled from bounded diagnostic queries. World-specific server modifications need their own data. Elevation JSON remains limited to 4 MiB and 257 samples per edge.

Game Master and Workbench stay in separate windows. This optional preview selects existing plan proxies; it does not embed an engine viewport or send edits. See [the three workflows](06-THREE-WORKFLOWS.md). Workbench editor-change import remains planned until the importer, identities, added/moved/removed review and one-step Undo are tested.

[Start](00-START-HERE.md) · [Compatibility](04-COMPATIBILITY.md)

Public packages do not include the locally generated Everon elevation file. Keep your existing local copy, or supply an authorized package for your own world. The program does not substitute invented heights when data is missing.
