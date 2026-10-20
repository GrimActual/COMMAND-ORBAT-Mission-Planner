# COMMAND textured terrain preview — followon.11

Desktop **2.9.1-dev.followon.11**. Existing production bridge **0.11.2** remains unchanged. This preview update is desktop-only and requires no new Workshop publication. Keep older installations and back up your plan before switching; run one Companion at a time.

## Open the supplied Everon terrain

1. Run the executable in COMMAND-Planner-2.9.1-dev.followon.11-Windows.
2. Open **3D preview** and choose **Terrain-Data/Everon-Base-Terrain-Elevation.json** from this bundle.
3. Click **Read world from selected file**, verify the displayed identity/alignment, acknowledge, then open.
4. **Satellite texture** reuses the existing offline Everon base map. **Water surface** shows the coastline; Reset fits the section and Focus selection zooms to a planned unit.

The dataset identifies the actual source `worlds/Eden/EmptyEden.ent`, GUID 55A3176BBDD01AAE, addon58D0FB3206B6F859. It contains 65,536 measured native heights at 50-metre spacing over0–12,750 metres. Invalid outer-boundary fallback values were excluded rather than filled. This is a coarse local overview, not precise building placement or a universal match for server modifications. Server owners supply their own matching data. The local data is not included in the public source archive and no redistribution grant is asserted.

## What changed

- Existing offline imagery is aligned using the same map offset and tile orientation as COMMAND’s 2D map. Provider attribution is visible. No new imagery asset is downloaded.
- Authorized custom PNG/JPEG images can use explicit north-up world extents in their elevation package. File sizes and encoded image dimensions are bounded before decode. Missing metadata is rejected; unavailable base imagery falls back to explained shaded terrain.
- Water at zero elevation distinguishes the coastline from the seabed. Inspection reports visible surface and seabed separately. Reset fits the actual viewport, without modifying or exaggerating heights.
- Texture/water settings are persistent preferences outside mission files. Selection, AI controls, server snapshots and the existing bridge are preserved. Invalid reloads clear the old renderer; close releases atlas, geometry, controls and graphics context.
- New EN/FR/DE controls, Sarge help and guides cover texture import. The experimental window-capture code was removed; it is not shipped.

## Three separate workflows

Reforger renders the live game in its own window. COMMAND keeps its tactical map, tracking, reviewed spawning and AI controls. Workbench remains a separate editor. Reviewed placement export into a dedicated COMMAND layer and explicit editor-change import are planned exchange work; they are not enabled by this texture update. Import must validate managed identities, review added/moved/removed entities, and apply them in one Undo step before being described as working. The optional 3D preview remains lightweight and read-only. It does not supply 3D building/tree geometry or embed Enfusion’s renderer.

## Verification and unfinished work

Fresh source regression: **895 passed, zero failed, one optional skip**. Actual offline Electron tests matched three landmark source pixels to the 2D map, verified custom-image north/south alignment and rejected missing metadata. Eight textured close/reopen cycles disposed graphics resources without mission changes. Matched 900×450 samples with the same native grid, 60 proxies and a 30-step orbit drag had 16.8ms p95 frames and zero stalls above100ms in both prior and candidate builds; these short samples do not guarantee all hardware or lifetime memory use.

Eight additional native embark/dismount cycles completed four of four members each. The prior intermittent boarding timeout did not recur; its cause remains unresolved and no fix is claimed. Real connected-human multiplayer and combat acceptance remain pending. No normal game client was launched or controlled. Nothing was pushed or published to GitHub/Workshop.
