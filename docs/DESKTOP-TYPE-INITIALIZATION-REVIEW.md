# Desktop type and initialization review

## English

Open **Assets → Arma 3 migration review → Open source diagnostics → Types & initialization**. Settings provides **Open type and initialization review**; Sarge has the matching topic. Dependencies and Functions remain in the same window with independent review state.

Select SQF/SQM/EXT/HPP files together or a source-package JSON containing exactly `files` and `mounts`. This pass retains the structural limits: 64 files, 256 KiB per file and 2 MiB total. CPP/INC are not accepted here; use Dependencies or Functions for their inventory. SQM/EXT/HPP remain inventory-only. No includes/macros are expanded and referenced files are never auto-loaded.

Search by variable or source path. Filter declarations, possible writes, reads, parameters, writes inside branches/loops, unresolved syntax or source requirements. Parameter defaults and allowed-type exemplar arrays are displayed as syntax evidence. Source-shape hints such as Number syntax are not verified runtime/Enfusion types. A declaration match does not establish initialization, and a missing declaration candidate does not prove a variable bug. Stored code/callbacks retain unresolved invocation environments.

**Writes inside branches or loops** highlights possible execution paths without claiming reachability, iteration count, flow joins or definite values. **Unresolved syntax** keeps unsupported expressions/control constructs visible. Command and operator requirements are candidates, not resolved overloads. This pass is not a full type checker or a green-emission decision.

**View source** shows captured lines beside the list on wide screens and below it on narrow screens. Forty rows are rendered per page; redundant assignment requirements are omitted from the display because their writes already have rows. Switching tabs/language preserves the review and selected source. Cancel or rejection keeps the prior review; Clear removes only the active session view. No mission/Undo/live-state edits, source execution, Enforce generation or automatic game connection occurs.

## Français

**Assets → Revue de migration Arma 3 → Ouvrir les diagnostics source → Types et initialisation**, également dans les paramètres et Sarge. Choisissez SQF/SQM/EXT/HPP ou un JSON avec `files` et `mounts`. CPP/INC sont exclus de cette passe ; les configurations restent un inventaire. Recherchez une variable/un chemin et filtrez déclarations, lectures, paramètres, écritures de branches/boucles ou syntaxe non résolue. Formes et valeurs par défaut sont des indices syntaxiques, pas des types ou initialisations prouvés. Une déclaration absente ne prouve pas un bug. Voir la source affiche les lignes capturées. Onglets et langue gardent le contexte ; annulation/refus conserve la revue et Effacer ne retire que cette vue. Aucun changement de mission, développement de macros, exécution SQF ou génération Enforce.

## Deutsch

**Assets → Arma-3-Migrationsprüfung → Quelltextdiagnose öffnen → Typen und Initialisierung**, auch über Einstellungen und Sarge. SQF/SQM/EXT/HPP oder JSON mit `files` und `mounts` auswählen. CPP/INC sind hier ausgeschlossen; Konfigurationen bleiben Inventardaten. Nach Variable/Pfad suchen und Deklarationen, Lesevorgänge, Parameter, Schreibvorgänge in Zweigen/Schleifen oder ungeklärte Syntax filtern. Formen und Standardwerte sind Syntaxbelege, keine bewiesenen Laufzeittypen oder Initialisierungsgarantien. Fehlende Deklarationen beweisen keinen Fehler. Quelle anzeigen zeigt erfasste Zeilen. Tabs und Sprache behalten den Kontext; Abbruch/Ablehnung erhält Daten, Löschen entfernt nur die Sitzungsansicht. Keine Missionsänderung, Makroexpansion, SQF-Ausführung oder Enforce-Erzeugung.

## Verification and limits

Four new native/worker cases and nineteen affected picker, function-worker, localization and app-lifecycle cases passed; the expanded public-script route check passed. The new UI script is available through the browser route; native worker modules remain unavailable through browser routes. The underlying source-constraint producer and older report formats are unchanged.

The packaged app inspected six radio source files: 35 declarations and 34 selected read candidates. A larger 120-stored-function fixture exercised 600 declarations, 240 control-region writes and 120 parameter rows, filters/paging, inert script-like Unicode source, source previews, independent tabs, EN/FR/DE switching, narrow layout, cancellation/clearing and unchanged mission/source input. Additional checks verified unsupported syntax, rejection retaining prior data, unmodified source text under localization and the existing Function Explorer source layout. Actual native reads/workers were used; only the OS file chooser was substituted. No renderer errors or game launch. Evidence: `docs/test-evidence/type-review-desktop.json`.

One larger-fixture click-to-result sample was 460.60 ms, including automation, worker analysis and result delivery. It is not a universal parser time or renderer stall measurement. The same short 400-unit map fixture retained median/p95 frame times of 16.7/16.8 ms, 400 markers and two tiles, with no frame above 100 ms and unchanged mission data. The previous completed Function Explorer baseline had the same median/p95; these separate short samples do not establish a speedup or sustained guarantee. Evidence: `docs/test-evidence/type-review-performance.json` and `function-explorer-performance.json`.

Development executable: `A:/Everon-ORBAT-Development/work/type-initialization-review/COMMAND-Type-Review-Candidate/COMMAND Planner.exe`. This keeps the existing dev.gm.8 runtime/version label and prior compact-toolbar/diagnostic features. Previous candidates are preserved; this is not a new public release. Scaffold export and verified Enforce emission remain later milestones.

Hosted full compiler/worker checks passed on Linux/Node 24 and Windows/Node 22 for source `5fde616a861eea618d9c8f338859e9cbf9333b3a`: [run 38784785237](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/actions/runs/38784785237).
