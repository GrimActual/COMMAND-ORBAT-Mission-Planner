# COMMAND 2.10.0 — consolidated release candidate

**Acceptance pending: this package is not labelled stable.** Desktop 2.10.0-rc.1, matching bridge publication project 0.12.1 and the matching HTTP relay source are included together. No public release or Workshop publication is inferred.

1. Back up your plan in your current version and keep the old installation. Extract this entire ZIP into a new folder; do not overlay an old build. Run [COMMAND Planner.exe](COMMAND-Windows/COMMAND%20Planner.exe).
2. Read [the current guide](Guides/00-START-HERE.md), [compatibility](Guides/04-COMPATIBILITY.md), [release notes](RELEASE-NOTES.md) and [upgrade/recovery](UPGRADE-AND-RECOVERY.md).
3. Import [the operational catalog](Vanilla-Assets/Start-Here/01-Operational-Assets-Catalog.json) through Assets → Import catalog JSON. Load [its resource index](Vanilla-Assets/Start-Here/01-Operational-Assets-Resource-Index.json) for deployment review. Other matched collections are identified in Vanilla-Assets/COLLECTIONS.json.
4. Live features are pilots. [Bridge publication project](Bridge-0.12.1/addon.gproj) and [HTTPS hosting instructions](Guides/07-HTTPS-HOSTING.md) are included. Finish [the acceptance checklist](ACCEPTANCE-CHECKLIST.md) before stable promotion.

Offline planning is core. Native Workbench Apply, two-way scene editing, exact game models, WebSockets and relay persistence are not delivered. Optional 3D needs your own authorized elevation package for the exact world. No local-use heightmap, private samples, real keys or raw diagnostic profiles are included.

Keep LICENSE and notices with the app. Corresponding source is in Source. Verify FILE-MANIFEST.json and SHA256SUMS.txt before distribution. Full roadmap remains in source.

Electron 44.9.1 is pinned and the final packaged executable is checked directly. No satellite tiles or elevation dataset are bundled. Offline coordinate-grid planning remains available; add permitted local imagery using [Imagery setup](Guides/08-IMAGERY.md). Existing local copies are preserved.
