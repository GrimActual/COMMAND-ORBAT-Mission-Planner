# Desktop Function Explorer and source diagnostics

## English

Open **Assets → Arma 3 migration review → Open source diagnostics → Functions**. Settings has **Open Function Explorer**, and Sarge has a matching topic. The Dependencies tab contains the existing inspector; each tab retains its own review, search and source context.

Choose loose source files together or one source-package JSON with `files` and `mounts`, plus optional `configRoots`. Paths are relative to the common selected folder. No referenced file is read automatically. `Examples/function-source-package.json` demonstrates explicit config roots and competing writes. This function-specific example includes configRoots; the dependency picker retains its existing two-field package format.

Search by function name or source path. Filter function names, definitions/registrations, calls, warnings or dynamic-code/scope operations. **Show matching rows** filters by the selected name, including associated warnings. **View source** shows captured lines beside the list on wide screens and below it on narrow screens. Forty rows are rendered per page. Cancel/rejection retains the prior review; Clear removes only the active tab’s session view.

The analysis inventories supported `TAG_fnc_name` patterns, literal CfgFunctions declarations and lexical call/spawn adjacency. A name match, code-shaped assignment or registration is a candidate, not a resolved function or verified signature. It does not reconstruct a complete call graph. Private scope, namespaces, load order, preprocessing, callbacks, parameters and native behavior remain unresolved. Missing config roots remain visible instead of inventing a source path. Known analysis limits and unsupported source regions remain in the underlying report.

This feature neither edits mission data nor executes source, connects the bridge or emits Enforce code. Closing/reopening diagnostics does not clear a review; restarting the app does. Review export/scaffold generation remain separate milestones.

## Français

**Assets → Revue de migration Arma 3 → Ouvrir les diagnostics source → Fonctions**. Également disponible dans les paramètres et Sarge. Sélectionnez les fichiers ensemble ou un paquet JSON avec `files`, `mounts` et `configRoots` facultatif. Recherchez noms ou chemins, filtrez définitions/appels/avertissements et utilisez **Voir la source**. **Afficher les résultats correspondants** filtre le nom choisi. Les onglets Dépendances/Fonctions gardent leur contexte ; annulation ou refus conserve la revue. Effacer ne retire que cette vue de session. Les résultats sont des candidats syntaxiques, pas des liaisons ou signatures prouvées. Aucun fichier référencé n’est chargé automatiquement ; aucune mission modifiée, exécution SQF ou génération Enforce.

## Deutsch

**Assets → Arma-3-Migrationsprüfung → Quelltextdiagnose öffnen → Funktionen**. Auch über Einstellungen und Sarge erreichbar. Quelldateien gemeinsam oder JSON-Paket mit `files`, `mounts` und optional `configRoots` auswählen. Nach Namen/Pfaden suchen, Definitionen/Aufrufe/Hinweise filtern und **Quelle anzeigen** verwenden. **Passende Zeilen anzeigen** filtert den gewählten Namen. Die Tabs Abhängigkeiten/Funktionen behalten ihren Kontext; Abbruch oder Ablehnung erhält die Prüfung. Löschen entfernt nur die Sitzungsansicht. Ergebnisse sind syntaktische Kandidaten, keine bewiesenen Bindungen oder Signaturen. Keine automatische Dateisuche, Missionsänderung, SQF-Ausführung oder Enforce-Erzeugung.

## Verification and scope

Six new native/worker cases passed, alongside thirteen affected dependency/native-lifecycle/localization cases and the updated public-script route check. Later config-root, translation-route and source-pane edits were checked narrowly. Full compiler checks on hosted Windows/Linux are recorded separately after publication.

The packaged app inspected seven selected user radio files and displayed four function-name candidates and six calls. A synthetic 200-name / 1,000-row review exercised warning/search filters, paging, inert script-like Unicode source, independent tabs, EN/FR/DE switching, cancellation, clearing and unchanged mission/source input. Only the native OS file chooser was substituted; actual selected-file reads and the real worker were used. Source side-by-side/stacked layout passed at wide/narrow widths. No renderer errors or game launch. Evidence: `docs/test-evidence/function-explorer-desktop.json`.

One synthetic click-to-result automation observation was 147.06 ms; this is not a universal parsing time or FPS claim. The same 400-unit offline map fixture as the prior compact-toolbar check retained median/p95 frame times of 16.7/16.8 ms, 400 markers and two tiles, with no frame over 100 ms and unchanged mission data in the short sample. The previous passing baseline was reused; these separate short runs do not establish a speedup or sustained stability. Evidence: `docs/test-evidence/function-explorer-performance.json` and `gm-toolbar-performance.json`.

Development executable: `A:/Everon-ORBAT-Development/work/function-explorer/COMMAND-Function-Explorer-Candidate/COMMAND Planner.exe`. Existing dev.gm.8 runtime/version label is retained for this checkpoint; previous candidates remain intact. This is not a new public release.

Hosted full compiler/worker checks passed on Windows/Node 22 and Linux/Node 24 for source `714d60a91e454256e2c6cec745fea3ee44031045`: [run 38781768739](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/actions/runs/38781768739).
