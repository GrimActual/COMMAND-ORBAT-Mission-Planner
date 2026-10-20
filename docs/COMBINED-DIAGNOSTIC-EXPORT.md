# Combined diagnostic export and comments-only scaffolds

## English

Use the new development executable, then **Assets → Arma 3 migration review → Open source diagnostics**. Inspect the desired source files in Dependencies, Functions, Types & initialization and/or Effects. Open the fifth tab, **Export & scaffolds**. Settings has **Open diagnostic export**; Sarge has **Combined diagnostic export and scaffolds**.

**Export combined review JSON** packages completed reviews, their summaries, complete underlying findings and source references. **Export offline review HTML** creates a self-contained readable summary with expandable full reviews and source identity inventory. It requires no network or JavaScript. Missing reviews are explicitly listed; a partial bundle is allowed. The exports preserve the existing report schemas inside a new `command-combined-diagnostic-review` v1 wrapper.

Tabs may inspect different files. Each source set is identified independently using SHA-256 of sorted decoded UTF-8 source identities; identical sets are deduplicated, while different sets remain separate. Each review also records selection context (mounts/config roots), its context hash and report hash. The bundle has a reproducible identity without wall-clock timestamps or absolute local source paths. Hashes establish identity, not authorship, correctness or native validation. Reports from different snapshots are not silently merged into one analysis.

Exports use completed native snapshots, not a later reread of source files on disk. Review again to capture later edits. Cancellation or rejected selection retains the previous snapshot. **Clear** in a diagnostic tab removes its native snapshot from subsequent exports; navigation/app exit clears them too. Active analyses block export. Native handlers accept export options only, never renderer reports or output paths, and serialize in a bounded worker that terminates on completion/cancel/deadline. Limits are 32 MiB for a combined JSON bundle and 64 MiB for generated output; existing per-review source/node limits still apply.

**Include full captured sources in diagnostic reports** is off by default. Existing reports may contain excerpts even when this is off. Enabling it includes complete captured source text; inspect the output before sharing. HTML escapes all source-derived text and has no active scripts, embedded remote resources or network dependencies. Export identifiers and review tags remain portable technical English.

### Optional next step: comment-only scaffolds

**Review mode** is the default and creates no files until an explicit export. To prepare a developer handoff, choose **Scaffold mode (comments only)** and select a completed **Types** or **Effects** review, then **Export comment-only scaffold folder**. Choose a parent folder. A fresh `COMMAND-scaffold-*` subfolder is created each time. Existing files are never overwritten, including single-file JSON/HTML outputs; choose a new filename if one already exists.

The folder contains:

- `manifest.json`: every selected structural region or inventory-only file, node/context ID, yellow/red tier, exact source span/hash, output line range, reasons, unresolved requirements and native status.
- `MIGRATION-CHECKLIST.md`: source-linked TODOs and retained source findings.
- `Scaffolds/source-0001.c`, etc.: comment-only placeholders, one per selected source file. There are no guessed function signatures, parameter types, declarations or behavior bodies.
- `OriginalSources/source-0001.sqf`, etc.: exact captured source copies, including their original notices. The manifest maps safe output names to logical input names; the app does not recreate arbitrary input paths.
- `diagnostic-review.json`: the combined diagnostic snapshot, including other completed review selections with their separate identities.

**Yellow** means a structural placeholder needing verified target types/signatures/semantics. **Red** means a manual body or inventory mapping: unsupported syntax, unresolved expression regions and selected scheduling/dynamic/ownership operations remain explicit. Containers containing such operations may also be red. This is conservative review classification, not a percentage of working conversion. **Green remains zero**: this tool has not acquired a verified semantic emitter. No source runs, no mission changes, no addon project is generated and nothing is compiled or claimed native-ready. Workbench remains the integration and validation stage.

Original source copies preserve notices; permission to inspect is not automatic permission to redistribute. Review source licenses/attribution before sharing. A failed folder write reports the incomplete new folder for inspection, without deleting or modifying input files. No private test corpus is distributed in the app.

## Français

**Assets → Revue de migration Arma 3 → Ouvrir les diagnostics source → Export et structures**. Terminez les revues souhaitées puis exportez JSON combiné ou HTML hors ligne. Les sélections différentes gardent leurs identités SHA-256 et les revues absentes sont listées. Le texte capturé est utilisé, pas les modifications ultérieures sur disque. Effacer une revue la retire des futurs exports ; annulation/refus conserve le contexte. L’option sources complètes est désactivée par défaut ; les rapports peuvent déjà contenir des extraits.

Le mode revue est le choix initial. Le mode structure facultatif utilise une revue Types ou Effets et crée un nouveau sous-dossier avec manifeste, liste de contrôle, fichiers `.c` de commentaires et copies source originales. Jaune = adaptation structurelle à examiner, rouge = corps manuel ou inventaire. Zéro conversion verte, aucune signature devinée, exécution SQF, modification de mission ou validation native. Préservez les mentions originales et vérifiez les droits avant partage. Aucun fichier existant écrasé. Paramètres et Sarge ouvrent la même vue.

## Deutsch

**Assets → Arma-3-Migrationsprüfung → Quelltextdiagnose öffnen → Export und Gerüste**. Gewünschte Prüfungen abschließen, dann kombiniertes JSON oder Offline-HTML exportieren. Unterschiedliche Auswahlen behalten SHA-256-Identitäten; fehlende Prüfungen werden genannt. Erfasster Text wird verwendet, keine späteren Dateiänderungen. Löschen entfernt eine Prüfung aus künftigen Exporten; Abbruch/Ablehnung erhält den Kontext. Vollständige Quellen sind standardmäßig aus; Berichte können bereits Auszüge enthalten.

Standard ist der Prüfmodus. Der optionale Gerüstmodus verwendet eine Typen- oder Effektprüfung und erzeugt einen neuen Unterordner mit Manifest, Prüfliste, `.c`-Kommentaren und Originalquellkopien. Gelb = strukturelle Anpassung prüfen, rot = manuelle Implementierung oder Inventar. Null grüne Konvertierungen, keine erratenen Signaturen, SQF-Ausführung, Missionsänderung oder native Validierung. Originalhinweise erhalten und Weitergaberechte prüfen. Vorhandene Dateien werden nie überschrieben. Einstellungen und Sarge öffnen dieselbe Ansicht.

## Verification and build

38 new/affected export, worker, picker, snapshot, localization, lifecycle and route tests passed after updating two changed-handler test expectations. Packaged-app checks used six actual radio sources across all four reviews, plus a separate larger source fixture. The real native reads, workers and disk writers ran; only OS dialogs were substituted. JSON source-set deduplication and mixed selections, opt-in source text, later disk edits, offline HTML escaping, comments-only scaffolds, notice preservation, exact manifest locations, cancel/overwrite handling, native snapshot clearing, EN/FR/DE state, narrow layout and Settings/Sarge destinations passed. No renderer errors, mission changes or game launch. A headless browser also rendered the exported HTML without executing source text.

The larger fixture produced 364 checklist entries: 362 yellow, two red, zero green. One radio JSON click-to-saved sample was about 208 ms; one larger scaffold export was about 437 ms, including automation, worker startup, serialization and disk writes. These are single observations, not universal parser or UI-stall timings. Evidence: `docs/test-evidence/diagnostic-export-desktop.json`. The matched short 400-marker map sample is in `diagnostic-export-performance.json`; the previous completed Effects Inspector sample is the comparison baseline and was not rerun.

Development executable: `A:/Everon-ORBAT-Development/work/diagnostic-export/COMMAND-Diagnostics-Scaffold-Candidate/COMMAND Planner.exe`. Includes the four diagnostics tabs and compact GM workspace. Existing dev.gm.8 runtime/version label is retained; this is a development checkpoint, not a new public release. Previous builds remain available. Demo: `Examples/diagnostic-export-source-package.json`. Inspect this package in the desired tabs, then export.

Next: select and prove a small typed target mapping before enabling any green emission. Full SQF translation, lifecycle/network semantics, native integration and all prior mission-planner roadmap goals remain pending/intact.

Hosted compiler/worker/export checks passed for source `f207a30f9f3cd0e27240808ffcb3699d33a5931f` on Ubuntu 24.04 / Node 24 and Windows 2022 / Node 22: [run 38791469510](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/actions/runs/38791469510). This is not a Linux GUI test. The completed short map sample measured 400 markers, two tiles, median/p95 16.7/16.8 ms, maximum 16.9 ms and no frame above 100 ms; mission data stayed unchanged. Approximate renderer heap was 20.5 MB versus 18.2 MB in the retained prior sample; these coarse single-run readings do not isolate feature memory cost or establish a speedup. The performance harness initially reloaded before startup had completed; waiting for the page load resolved that harness race before measurement.


## Additive Boolean local block export

The separate opt-in local-block export now supports complete flat initialized Boolean locals, reads and assignments, with an explicit final result. Previous mode descriptions remain valid for their own formats. See [the EN/FR/DE local-block guide](BOOLEAN-LOCAL-MAPPING.md). No general SQF-to-Enforce conversion is claimed.


## Additive Boolean branch family

The block-family selector now offers a separate bounded if/else mapper over existing initialized Boolean locals. Earlier straight-line rules remain unchanged for their own family. See [the EN/FR/DE branch guide](BOOLEAN-BRANCH-MAPPING.md).


## Coverage preview and exact integer value family

A read-only preview now explains supported/mixed/manual files before exporting. Exact integer expression helpers extend value-only emission; existing Boolean families remain unchanged. See [the EN/FR/DE guide](MIGRATION-COVERAGE-AND-INTEGERS.md).


## Typed pure function module family

Coverage and helper export now include a separate pure Boolean function-module compiler with explicit params/defaults and closed cross-file calls. External registration and caller/lifecycle integration stay manual. See [the EN/FR/DE guide](TYPED-BOOLEAN-FUNCTIONS.md). Previous families remain unchanged.
