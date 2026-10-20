# COMMAND — complete component review

## English

In **Assets → Arma 3 migration review → Open source diagnostics**, choose **Review source package in all tabs** and select a prepared `source-package.json`. Dependencies, Functions, Types and Effects use one captured source selection and run sequentially in bounded workers. Success replaces all four native export snapshots together. Cancellation or failure preserves previous reviews. Clear/manual inspection in a tab can subsequently change that tab; exports still list separate or missing source selections honestly.

Settings opens the same Source diagnostics dialog through its existing inspector shortcuts. Sarge's **Review a complete source package** topic opens Dependencies. Review context survives language changes. There is no persistent preference or saved-mission change.

### Prepare a package from unpacked components (developer tool)

Use Node 18+ from a source checkout. Create a UTF-8 JSON manifest with exactly `components`; each component has an absolute local `folder`, relative logical `root` and explicit virtual `prefix`. Example:

```json
{"components":[{"folder":"A:/Sources/weather","root":"addons/weather","prefix":"/z/example/addons/weather"},{"folder":"A:/Sources/main","root":"addons/main","prefix":"/z/example/addons/main"}]}
```

```powershell
node tools/sqf-review/project.cjs --manifest "A:/Reviews/components.json" --output "A:/Reviews/New-Component-Review"
```

The output folder must be new, have an existing parent, and sit outside the selected component folders. Explicitly selected unpacked folders are traversed, preserving nested paths. Component roots cannot overlap. Links are rejected. Limits: 16 components, 64 source files, 256 KiB/file, 2 MiB combined, 4,096 visited entries and depth 24. Strict UTF-8 decoding applies to SQF/SQM/EXT/HPP. CPP/INC and binary config/SQFC/PBO/media are **inventory-only**, not renamed or decoded as SQF. No extraction is performed by COMMAND. Missing includes stay unresolved; virtual mounts never fetch files. Sources and the input manifest are rechecked before output.

Outputs: `source-package.json`, `combined-review.json`, offline `combined-review.html`, `source-receipt.json` and `REVIEW.md`. The developer tool already runs all four reviews. Loading its package into the desktop is optional and reruns them to populate the live inspectors. The report has no full sources by default, but contains source excerpts; the package contains full selected source text. Keep third-party/private source packages local unless sharing is permitted.

This prepares diagnostic context. It does not expand macros, prove runtime types, execute SQF, convert a complete mod or start the game. Previous Boolean helper proof and restrictions remain unchanged.

## Français

Dans **Assets → Arma 3 migration review → Diagnostic des sources**, choisissez **Analyser le paquet source dans tous les onglets**, puis `source-package.json`. Dépendances, Fonctions, Types et Effets utilisent la même capture, successivement. Les quatre analyses sont remplacées ensemble après réussite ; un échec ou une annulation conserve les analyses précédentes. Les raccourcis des paramètres ouvrent le même dialogue et Sarge fournit un guide. Changer de langue conserve le contexte ; aucune mission n’est modifiée.

L’outil développeur ci-dessus prépare le paquet à partir de dossiers décompressés explicitement choisis et de préfixes virtuels déclarés. Les chemins sont conservés ; liens, racines superposées, UTF-8 invalide et dépassements sont refusés. Limites : 16 composants, 64 sources, 256 Kio/fichier, 2 Mio au total, 4 096 entrées, profondeur 24. Seuls SQF/SQM/EXT/HPP sont lus comme texte source. CPP/INC, configurations binaires, SQFC, PBO et médias restent au stade d’inventaire. Aucune extraction, exécution ou conversion de mod n’est effectuée. Les includes manquants restent visibles. Le dossier de sortie doit être nouveau et extérieur aux sources. Les rapports peuvent contenir des extraits ; le paquet contient le texte complet sélectionné. Vérifiez les droits avant partage.

## Deutsch

Unter **Assets → Arma 3 migration review → Quelltextdiagnose** **Quellpaket in allen Registern prüfen** wählen und `source-package.json` öffnen. Abhängigkeiten, Funktionen, Typen und Effekte prüfen dieselbe Erfassung nacheinander. Alle vier Prüfungen werden bei Erfolg gemeinsam ersetzt; Fehler und Abbruch behalten bisherige Ergebnisse bei. Einstellungen öffnen denselben Dialog; Sarge erklärt den Ablauf. Sprachwechsel behalten den Kontext. Missionsdaten bleiben unverändert.

Das Entwicklerwerkzeug oben erstellt das Paket aus ausdrücklich gewählten entpackten Ordnern und virtuellen Zuordnungen. Pfade bleiben erhalten; Links, überlappende Wurzeln, ungültiges UTF-8 und überschrittene Grenzen werden abgelehnt. Grenzen: 16 Komponenten, 64 Quellen, 256 KiB je Datei, insgesamt 2 MiB, 4.096 Einträge, Tiefe 24. Nur SQF/SQM/EXT/HPP werden als Quelltext gelesen. CPP/INC, binäre Konfigurationen, SQFC, PBO und Medien bleiben Inventar. Keine Entpackung, Ausführung oder vollständige Mod-Konvertierung. Fehlende Includes bleiben sichtbar. Der Ausgabeordner muss neu sein und außerhalb der Quellen liegen. Berichte enthalten möglicherweise Auszüge, das Paket vollständigen ausgewählten Quelltext. Vor Weitergabe die Rechte prüfen.
