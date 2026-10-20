# COMMAND 2.9.1-rc.3 — migration adapters

RC3 consolidates the recent migration/compiler work into a tested Windows development prerelease.

- Source diagnostics now reviews selected function-style macros, nested arguments, identifier concatenation and bounded include/marker contexts. Successful entries can export a fresh review package with original source copies and origin metadata.
- Explicit owned delay/readiness scaffolds add cancellation, restart generations, owner-deletion checks, bounded polling and world-time deadlines. Jobs never start automatically; component ownership and teardown remain explicit developer integration.
- Imported planning units can enter the existing reviewed prefab deployment workflow in batches of up to 16, retaining source IDs, hashes, prefab GUIDs and addon provenance. Game requests still require in-game host approval. Selection changes invalidate old deployment reviews.
- Includes the previous typed scalar functions, literal registrations, closed calls, branch locals, bounded loops and selected-project native preparation.
- Sarge, Settings destinations and English/French/German guidance are synchronized.

Validation: 796 checks in the full regression run plus two later focused package-export checks; 82 existing typed-function native invocations and 24 new scheduling lifecycle checks on engine 1.8.0.13; actual packaged offline UI workflows and atomic Undo. The short matched 400-marker sample was about 60.12 FPS, median 16.7 ms, p95 16.8 ms, with no frames above 100 ms. These are local observations, not sustained guarantees. No game client was launched; the isolated native scheduler used two disposable generic owner entities and was stopped afterward.

Private external-source test details are withheld. The general implementation goals and supported contracts remain unchanged.

Unpack the entire Windows ZIP into a new folder and run COMMAND Planner.exe. Keep resources alongside it. Read RC3-MIGRATION-ADAPTERS.md for workflows, EN/FR/DE steps and supported contracts. No Workshop republish is required for these desktop additions; existing live game features still need the matching bridge.

This is a prerelease of supported subsets. Native Arma 3 preprocessor parity, arbitrary scheduling/captures, engine predicates, UI/audio/event adapters, crew/group reconstruction and complete mod conversion remain manual or future roadmap work. Generated output still needs its own native compilation and project/lifecycle integration. The wider roadmap remains additive and intact.

Original project code is GPL-3.0-only. Third-party code, assets and tested mod sources retain their own terms. The Source ZIP and GitHub tag contain the matching project source; private test corpora and Bohemia tools/game binaries are excluded.
