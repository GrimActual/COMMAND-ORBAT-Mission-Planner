# Desktop source dependency inspector

This COMMAND development checkpoint adds an offline inspection view under **Assets → Arma 3 migration review → Source dependency inspector**. Settings has **Open source dependency inspector**, and Sarge has a matching English/French/German topic. It does not modify mission data, Undo history, live connections or game files.

## English

1. Choose **Choose and inspect source files**. Select the needed loose SQF/SQM/EXT/HPP/INC/CPP files together, or select one prepared source-package JSON containing exactly `files` and `mounts`. A working example is `planner/examples/dependency-source-package.json`.
2. Loose files use paths relative to their common directory. The inspector reads only your selection. It does not follow an include onto disk. Virtual paths such as `/myaddon/file.hpp` require an explicit prefix/root mount in a source package.
3. Choose **Unresolved includes** to find missing, computed, unsafe or ambiguous paths. Search by source name, requested path or status; results are paged in groups of 40.
4. Choose **View source** to inspect the captured line and nearby text. This is an in-app text preview, not an external editor or source modification.
5. Cancelling or rejecting a selection retains the previous review. **Clear dependency review** removes only this session view. Inspection never starts automatically.

Exact supplied-source matches are candidate dependency edges. Preprocessor activation, guards and load order are not evaluated by this view; potential cycles remain review candidates. This is a paged list, not an interactive dependency graph. Export of combined diagnostics and later compiler passes remain separate work.

## Français

Dans **Assets → Revue de migration Arma 3 → Inspecteur des dépendances source**, choisissez les fichiers source ensemble ou un paquet JSON contenant exactement `files` et `mounts`. Seuls les fichiers choisis sont lus ; aucune inclusion n’est chargée automatiquement. Les chemins virtuels nécessitent des points de montage explicites. Filtrez les **Inclusions non résolues**, recherchez et utilisez **Voir la source** pour lire les lignes capturées. Les résultats sont paginés par 40. Annulation ou refus conserve la revue précédente ; **Effacer la revue des dépendances** ne supprime que cette vue de session. Paramètres et Sarge fournissent un accès et des instructions. Aucun changement de mission ni exécution du code. Une correspondance exacte ne prouve pas l’activation, l’ordre des inclusions ou la compilation.

## Deutsch

Unter **Assets → Arma-3-Migrationsprüfung → Quelltext-Abhängigkeitsinspektor** Quelldateien gemeinsam oder ein JSON-Paket mit genau `files` und `mounts` auswählen. Nur ausgewählte Dateien werden gelesen; Includes werden nicht automatisch nachgeladen. Virtuelle Pfade benötigen explizite Zuordnungen. **Ungeklärte Includes** filtern, suchen und über **Quelle anzeigen** erfasste Zeilen lesen. Pro Seite werden 40 Ergebnisse angezeigt. Abbruch oder Ablehnung erhält die vorherige Prüfung; **Abhängigkeitsprüfung löschen** entfernt nur die Sitzungsansicht. Einstellungen und Sarge bieten Zugriff und Anleitung. Keine Mission wird geändert und kein Quelltext ausgeführt. Ein exakter Treffer beweist weder Aktivierung, Include-Reihenfolge noch Kompilierbarkeit.

## Verification and delivery

Eight native-selection/worker tests, the updated route test, three localization tests and two desktop lifecycle tests passed. The real renderer was exercised in headless Chrome with 2,000 includes / 4,000 rows, safe script-like Unicode source display, filtering/search/paging, source preview, FR/DE switching, cancellation, late-result rejection and clearing. The native picker was mocked in that browser check and tested separately with actual temporary source files and real workers.

One automation click-to-render sample was 39.58 ms; it includes browser automation overhead and is not a map FPS, sustained stability or speedup claim. No map-rendering code changed. Evidence: `docs/test-evidence/dependency-inspector-ui.json`.

Input limits reuse the existing dependency core: 256 files, 256 KiB per loose file and 8 MiB source text. Analysis is on demand in a worker. The renderer has no filesystem path API. Native selection accepts only the owning app frame, and cancellation/navigation closes the worker. Reports are session-only and are not written to mission JSON.

The separate packaged Companion candidate passed startup and the sample package workflow using an isolated profile, actual file reads and the real native worker. Only the operating-system file chooser was substituted by automation. Source preview and unchanged local storage were verified; no game was launched. Evidence: `docs/test-evidence/dependency-inspector-desktop.json`.

Development executable: `A:/Everon-ORBAT-Development/work/dependency-inspector/COMMAND-Dependency-Inspector-Candidate/COMMAND Planner.exe`. The internal dev.gm.8 version label is retained for this checkpoint; this is not a new public release. The previous candidate remains intact.

Hosted compiler and worker checks passed on Windows/Node 22 and Linux/Node 24 for source commit `43fb81c5ffe0ba6cb81927d24dcc51631088c99c`: [run 38773147889](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/actions/runs/38773147889).

Current navigation: Assets → Arma 3 migration review → Open source diagnostics → Dependencies. The Settings shortcut opens the same window; its session-only dependency behavior is unchanged. FR : Ouvrir les diagnostics source → Dépendances. DE: Quelltextdiagnose öffnen → Abhängigkeiten.
