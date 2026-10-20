# Optional 3D planning view — roadmap proposal

Status: first read-only milestone implemented in the followon.10 development source; see [operator and verification guide](THREE-D-PLANNING-VIEW.md). Larger tiled terrain, editing and full scene reconstruction remain planned. This adds a staged roadmap track without replacing the 2D planner, changing existing milestones or claiming complete Workbench scene support. First milestone: **read-only 3D terrain preview with selectable tactical proxies and synchronized 2D selection**. Current AI-control correctness work remains ahead of this implementation.

## Existing foundations and limits

Reuse mission entity identities, prefab references, positions, selection, terrain alignment and the native elevation sampler. The current desktop terrain-context MAX_SAMPLES and native sampler both cap a query at 300 selected points. This is a bounded point sampler, not a complete heightmap. Do not silently raise that limit or imply it already supplies full terrain.

## Staged delivery

1. **Authorized terrain section.** Define an import contract containing source/provenance and permission, exact world identity, dimensions, sample count, metre spacing, origin/extent, axis direction, height scale/offset and satellite-image alignment. Declare the vertical reference and no-data treatment. Reject inconsistent dimensions, unsupported worlds and malformed/unbounded data. Start with a small section before larger tiles and multiple detail levels. Across approximately 13.45 km, 256 mesh segments imply about 52.54 m between vertices (257 vertices per edge): adequate for overview, not precise building placement.
2. **Read-only geometry and alignment.** Build actual mesh vertices from the elevation data so displayed terrain, picking and ground inspection share the same heights. Calculate appropriate normals and verify texture orientation/alignment against known landmarks. Test both geometry and raycast elevations rather than accepting a visually plausible surface. Material displacement is an optional later rendering choice; it must not create a mismatch between visible terrain and selection.
3. **Lightweight tactical proxies.** Reuse existing stable IDs and mission data. Infantry, vehicles and buildings use clear inexpensive shapes, faction labels and explicitly approximate dimensions. Repeated geometry/materials can use Three.js InstancedMesh to reduce draw calls, with correct per-instance transforms and picking identity. Prefab GUID metadata supplies neither game-model geometry nor reliable dimensions. Exact model import remains a separate permission-dependent path; no protected extraction is implied.
4. **Synchronized selection.** Clicking a proxy selects the same entity in the 2D planner and existing inspector; 2D selection highlights the matching proxy. Distinguish planned, tracked and rehearsal identities and freshness. First milestone does not edit positions, send bridge requests or alter mission JSON.
5. **Camera and lifecycle.** Orbit, pan, cursor-directed zoom, focus selection and reset view have visible shortcuts and configurable bindings. Consider OrbitControls' documented mouse bindings and zoomToCursor. Lazy-load the renderer only on opening 3D. Close stops rendering and removes listeners, controls, geometries, materials, textures, instancing and renderer resources as applicable. Verify repeated open/close and context-loss handling; retain ordinary offline 2D operation when 3D is closed/unavailable.
6. **Later editing gate.** Only after transform/alignment/picking acceptance, route 3D movement through existing editing, validation and Undo/Redo. A viewport edit remains a plan edit. Affecting the game still needs the normal separately reviewed bridge command and approval. No automatic two-way editing is implied.

## Transform contract and acceptance

Coordinate conversion covers position, heading/orientation, parent/local transforms, handedness, units and texture alignment. Bohemia documents the angle convention as yaw, pitch, roll in degrees; do not assume a pitch/roll/yaw input order or treat position-axis flips as the whole conversion. Establish explicit conversions and check known headings at 0/90/180/270 degrees, landmarks, scale, parented poses and round trips before whole-scene ingestion.

First-milestone acceptance requires authorized data with matching world identity; known heights/landmarks within declared tolerances; consistent terrain rendering/picking; stable proxy IDs and synchronized selection; unchanged plan/Undo history and zero game commands; offline 2D fallback; repeatable camera controls; bounded data/GPU use and release on close. Compare representative 2D-only and 3D-open frame time, stalls, draw calls, memory and repeated-open lifecycle. Record actual limits rather than promising all hardware or full terrain detail.

A complete .ent scene importer is a separate project: metadata inspection is not scene reconstruction. Detailed models, 3D editing, full terrain capture, scene import and broader Workbench compatibility remain later milestones.

## Independently checked references

- [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html): repeated geometry/material instancing, per-instance matrices, bounds and resource disposal.
- [Three.js OrbitControls](https://threejs.org/docs/pages/OrbitControls.html): orbit/pan/zoom, configurable mouse bindings and zoomToCursor.
- [Bohemia vector API](https://community.bistudio.com/wikidata/external-data/arma-reforger/EnfusionScriptAPIPublic/interfacevector.html): documented yaw/pitch/roll convention; also checked in the installed Enfusion API.
- [Three.js MeshStandardMaterial](https://threejs.org/docs/pages/MeshStandardMaterial.html): displacement is a rendering mechanism, not a substitute for validating the terrain/picking geometry contract.

References checked 18 October 2026. Recheck the selected library/engine versions when implementation begins. The original roadmap addition installed no renderer. The later followon.10 implementation pins MIT-licensed Three.js 0.186.1 with its license and imports it on demand.
