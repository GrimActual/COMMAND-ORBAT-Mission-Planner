# Arma 3 archive inventory and WRP identity resolver (planned)

This is a separate planned pipeline. The current SQF inspector accepts selected text files only; it neither opens PBO archives nor decodes WRP terrain. No terrain recreation/export feature is claimed by this plan. Existing mission migration and broader roadmap goals remain retained.

## Pipeline boundary

```text
Selected PBO / loose WRP
  -> bounded container/header inspection
  -> normalized virtual-file manifest and content fingerprints
  -> config/terrain identity resolver
  -> source-world metadata and dependency inventory
  -> explicit link to the mission migration context

Selected SQF / extracted text sources
  -> text lexer / structural AST
  -> future semantic analysis / typed control-flow IR
  -> verified command adapters / future Enforce output
```

PBO is a container. WRP is versioned binary world data, not a script or a generic file listing. Reading its identity/metadata/placements does not create an Enfusion world. Config.bin also needs its own binary configuration decoder; it must not be passed to the SQF lexer as text. No script, config expression or archive content runs during inspection.

## Separate inspector and evidence states

| State | What the inspector may report | What remains unproved |
| --- | --- | --- |
| Listed | PBO entry name, declared stored/uncompressed sizes, compression method and archive properties/prefix when present | Payload meaning, integrity of decoded content or dependency resolution |
| Header inspected | Recognized WRP/config header signature and supported version information | Terrain/object content not decoded by that stage |
| Decoded | Fields or object references actually read by a version-specific bounded decoder | Gameplay equivalence or native Enfusion availability |
| Unsupported / unresolved | Unknown format/version/compression, ambiguous prefix, missing config/dependency or failed bounds checks | No fabricated fallback content is produced |

The initial manifest view should classify entries such as config.cpp/config.bin, .wrp, material/texture references and .p3d model resources, offer search/category filters and paged findings, and retain raw virtual paths and provenance. A filename/category is a classification hint, not proof of decoded semantics. An object-placement list inside WRP requires the WRP decoder; it cannot be inferred from a PBO directory manifest. External layer/material/model files are listed only when actually present or referenced by decoded data.

## Planned implementation increments

1. **Read-only archive manifest.** Native-selected local files, bounded header reading, normalized entry paths, archive properties/prefix, sizes and compression flags. Unknown variants reject or stay unresolved. Do not unpack a whole terrain just to list its entries. No implicit extraction or input-file modification.
2. **Content identity.** Compute streaming SHA-256 for explicitly inspected archives/selected entries, with a versioned canonical manifest fingerprint. Retain exact archive-byte identity separately from normalized manifest identity, so incidental archive ordering/timestamps are not confused with identical logical inventories. Mark whether a digest covers stored or decoded bytes. A hash is change detection, not publisher or live-session authentication.
3. **Configuration/world binding.** Parse supported text configs and, separately, supported binary config versions. Resolve CfgWorlds world class and worldName virtual WRP path through the actual PBO prefix/manifest and declared dependencies. Mission-folder suffixes or map labels are hints until matched; Altis as a display name is insufficient. Conflicting/missing bindings stay unresolved.
4. **WRP header and metadata.** Recognize specific signatures/versions, then read only fields supported and tested for that version. Record available map dimensions, cell/elevation conventions and dependencies with field-level evidence. Never assume one historical WRP layout works for every Arma 3 world.
5. **Optional object/reference inventory.** Implement version-aware placement/model-reference decoding as a separate stage, with declared versus decoded counts, checked bounds and source provenance. Unsupported sections remain explicit; no fabricated object list or collision mesh is emitted.
6. **Mission-context link.** Preserve source-world class/path/archive and entry hashes beside SQF/source provenance. Link to the separately verified Enfusion addon/GUID/world path through an explicit terrain/alignment review. Real Virtuality resource paths are not Enfusion GUIDs. Reading an Arma 3 height sample does not establish a target-world height, safe placement or matching terrain.

Any later selected-entry extraction must validate relative paths and reject traversal/rooted/drive/UNC paths, duplicate case-folded names, ambiguous prefixes, invalid offsets and excessive decoded sizes. Compression decoding must be bounded before allocation and run away from the renderer/map thread. Maintain cancel/stale-source behavior and do not trust a cache hit based only on filename or modified time. Use explicit controls; never inventory/extract automatically at application startup.

## Explicitly separate terrain-conversion work

Recreating a full source world in Enfusion would require its own verified heightfield/projection, surface/material, object/prefab substitution, terrain-tool import/build, collision and navigation workflow. Archive/WRP metadata inspection does not complete any of those stages. It must not be advertised as a native Altis conversion. That larger effort can remain an additive future goal without silently enlarging the current archive inventory feature or replacing the mission compiler roadmap.

Acceptance tests should include synthetic good/truncated/malformed PBO headers, prefix/path collisions, unsupported compression, decoded-size limits, known WRP header versions, config-to-WRP conflicts, stable fingerprints and cancelled/stale results. Real-file read-only tests and representative memory/time measurements are required before advertising format/version support. No such binary-format support is delivered by the current AST checkpoint.

Primary references: [PBO file format](https://community.bohemia.net/wiki/PBO_File_Format), [Real Virtuality file formats](https://community.bohemia.net/wiki/Category:BIS_File_Formats), [CfgWorlds configuration](https://community.bohemia.net/wiki/CfgWorlds_Config_Reference). These inform format discovery; implementation support must be established by version-specific tests.
