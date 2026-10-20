# COMMAND asset browser pilot — 2.9.1-dev.gm.3

Close only Companion before opening this version; your game can stay open. Launch COMMAND Planner.exe inside COMMAND-Asset-Browser, keeping its supporting files alongside it. Your existing saved-profile location is retained. Bridge sessions must be paired again after reopening.

In Assets, import Vanilla-Assets/Start-Here/01-Operational-Assets-Catalog.json. In Units, choose Military unit type, then Browse assets. Infantry shows troops; Armor shows armoured vehicles. Mechanized, Motorized, Rotary Wing, Fixed Wing and Logistics use matching filters. All asset types overrides the linked filter.

Search readable names, prefab paths or GUIDs. Filter prefab faction separately from the planned unit faction. Recognised helper/base/damaged variants are hidden by default; Include base templates and damaged variants shows them. Results are limited to 20 cards per page, with exact prefab paths beneath names.

Select a card, then Apply changes for an existing unit or Place new unit. Search and filtering do not change saved plans. A blank deployment name now explains how to fix it. GM review still needs the matching resource index and host approval; native availability is not guaranteed by classification.

Sarge and Settings are updated, with English/French/German support. No native bridge changes; keep Workshop 0.4.1. The shared 60-entity cap and reviewed GM spawn/remove pilot remain unchanged.

Tests: catalog import/search/type links/assignment/reload passed in the actual desktop app; exact GUIDs and saved-state safety retained. Imported HTML-like names stayed plain text. Final Settings and translated guidance checks passed. Filter DOM rendering p95 was 1.7 ms for the 2,721-entry sample, with at most 20 cards. Matched 400-unit, six-second offline map samples: previous 57.8 FPS / p95 17.4 ms; new 58.5 FPS / p95 16.9 ms. These short samples show no evident regression and are not universal FPS claims. No live spawn test or game connection was performed for this desktop-only change.
