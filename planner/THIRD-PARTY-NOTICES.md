# COMMAND — third-party notices

Original COMMAND code is GPL-3.0-only; see LICENSE. Separate dependencies and asset rights retain their own terms. Attribution alone does not establish permission to reuse or redistribute protected material.

## Electron 44.9.1 and Chromium

Electron, MIT: https://github.com/electron/electron/tree/v44.9.1. The official Windows distribution is verified against its upstream SHASUMS256.txt. The distributed runtime contains LICENSE and LICENSES.chromium.html; preserve these with the application. Dependency provenance and hashes are recorded in the release manifest. This replaces unsupported Electron 30 for the consolidated candidate. Upstream support policy: https://www.electronjs.org/docs/latest/tutorial/electron-timelines.

## Bundled interface libraries

- milsymbol 3.0.4, Måns Beckman / Spatial Illusions, MIT. License: vendor/milsymbol-LICENSE.txt. Source: https://github.com/spatialillusions/milsymbol. COMMAND uses APP-6 rendering; custom colors are game-planning conventions, not a universal standards-compliance claim.
- Leaflet 1.9.4, BSD-2-Clause. License: vendor/leaflet/LICENSE. Source: https://github.com/Leaflet/Leaflet/tree/v1.9.4. It is bundled for offline operation.
- Three.js 0.186.1 and OrbitControls, MIT. Preserve the bundled vendor/three licence. Source: https://github.com/mrdoob/three.js. Loaded only when optional read-only 3D opens.
- cloudflared 2026.10.0, Cloudflare, Apache-2.0. Unmodified portable helper; license: bridge-runtime/CLOUDFLARED-LICENSE.txt. Source: https://github.com/cloudflare/cloudflared/tree/2026.10.0.

## Branding, terrain and game material

COMMAND logo supplied by the user and retained unchanged. Locally defined asset pictograms retain their original notices. Technical legacy schema/configuration identifiers are preserved for compatibility; they are not old product branding or permission grants.

Legacy local and online Everon tiles are attributed to Reforger Maps / Bewilderbeest (https://reforger.recoil.org/). The public provider links map-generation source at https://github.com/nickludlam/EnfusionMapMaker, whose stated project licence is APL-SA. A generator's code licence must not be assumed to grant all underlying game-image rights. This consolidation does not establish a new or broader imagery redistribution grant. The consolidated distribution excludes all sixteen legacy offline JPEG tiles from both runtime and corresponding source archive. Preserved local installations are unchanged. See operator-guides/08-IMAGERY.md for the permitted user-supplied workflow; no image redistribution permission is asserted.

Optional 3D can reuse user-supplied permitted local tiles through a temporary GPU atlas without extra image downloads. Imported elevation/custom imagery requires authorization and matching world extents. No local-use elevation package or exact game models are included in the public candidate content.

Bohemia Interactive engine/game material, Workshop mods and trademarks retain their owners' rights. Native API references and exact prefab GUID/path metadata do not supply model geometry or grant asset redistribution rights. The original Enfusion adapter code and the third-party/game material it references have separate licensing scopes.
