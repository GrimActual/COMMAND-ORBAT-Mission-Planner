# Third-party software and sources

**milsymbol 3.0.4** — Måns Beckman / Spatial Illusions, MIT license. The complete license is included at `vendor/milsymbol-LICENSE.txt`. The pinned browser bundle is included locally at `vendor/milsymbol.js`.

- Project: https://github.com/spatialillusions/milsymbol
- Documentation: https://github.com/spatialillusions/milsymbol/tree/master/docs
- Package: https://registry.npmjs.org/milsymbol/-/milsymbol-3.0.4.tgz
- Published SHA-512 integrity: `Jrs1RBCag2IzyEJwI476i2+pNHdi8WMwAp2mDD23g3TR48ERdHmdQgPXZUosRKyhPMr58/eOPyyLE53lMPPAgw==`

The app selects APP-6 rendering and uses the library's verified letter SIDCs for its unit types. Custom colors and the green independent faction are game-planning conventions, not a claim that every user configuration conforms to a military standard.

**Leaflet 1.9.4** — BSD-2-Clause, loaded from unpkg with jsDelivr fallback. Project and license: https://github.com/Leaflet/Leaflet/tree/v1.9.4

**Terrain tiles** — Reforger Maps / Bewilderbeest, served from https://reforger.recoil.org/. Original attribution is retained on the map. The imagery requires network access and remains hosted by its provider.

**Coordinate reference** — Bohemia Interactive's SCR_MapEntity documentation describes world X/Z grid coordinates and horizontal/vertical grid labels: https://community.bistudio.com/wikidata/external-data/arma-reforger/ArmaReforgerScriptAPIPublic/interfaceSCR__MapEntity.html

This app uses the existing Everon mapper's game-meter coordinate transform, with easting (X) first and northing (Z) second. It does not connect to a running game or claim global MGRS/UTM coordinates. In-game alignment has not been independently surveyed against terrain control points.

**JSOC crest** — supplied by the user and included unchanged. Asset pictograms are locally defined SVG artwork from the previous planner build.

Leaflet 1.9.4 (BSD-2-Clause), bundled with its license in vendor/leaflet/LICENSE. Source: https://github.com/Leaflet/Leaflet
Offline base terrain: 16 existing-provider tiles from https://reforger.recoil.org/map-tiles/everon/ ; attribution retained: Reforger Maps / Bewilderbeest. Lower-detail fallback only.

cloudflared 2026.10.0 (unmodified portable Windows executable), Cloudflare, Apache-2.0. License: bridge-runtime/CLOUDFLARED-LICENSE.txt. Source: https://github.com/cloudflare/cloudflared/tree/2026.10.0

**Optional 3D terrain imagery (followon.11)** — the local preview may reuse the existing offline Everon base-map tile files through a temporary GPU atlas. No extra provider images are downloaded or written. Attribution remains visible. Matching uses the existing 2D map transform, not a claim of exact scene reconstruction. Map/image rights remain separate from COMMAND code licensing; existing attribution does not by itself establish additional asset redistribution rights. Custom image imports require the user’s authorization and explicit world extents.
