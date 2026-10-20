# COMMAND loose-source review (developer tool, unreleased)

Requires Node.js 18+ and this source checkout. No npm dependencies or engine launch are required. Run from the repository root. This is separate from the desktop app; its JSON reports are not app import/deployment files.

## English

Select a folder containing 1-64 loose .sqf/.sqm/.ext/.hpp text files. Nested folders, config.cpp, PBO/WRP and audio are not inspected. Sources are never executed or changed. Output must be a new folder outside the source tree with an existing parent directory.

```powershell
node tools/sqf-review/review.cjs --input "A:/LegacySource" --output "A:/Reviews/LegacyReview"
node tools/sqf-review/verify.cjs --review "A:/Reviews/LegacyReview"
```

Open REVIEW.md for the summary. The seven analysis JSON files contain source locations/previews and unresolved findings. manifest.json records review artifact hashes. source-receipt.json records original file byte hashes and ignored directory entries. Keep source-linked reports private unless you intend to share them.

The review prints a bundleSHA256 fingerprint. Retain it separately if you need to detect replacement of the complete bundle, then verify with `--expected-sha256` followed by that exact lowercase value. Without an independently trusted expected value, verification establishes self-consistency only. It does not authenticate authorship, validate semantics or allow execution. The source receipt is outside the listed review-artifact hash scope.

All reports remain non-executable. Syntactic declaration/command candidates and source-value shapes are not proven runtime bindings, native types or converted behavior. Nothing generates .c files or sends requests to Reforger. To repeat a review after source changes, choose another output directory; existing outputs are never intentionally overwritten.

## Francais

Outil de developpement separe de l'application, avec Node.js 18+. Choisissez un dossier contenant 1 a 64 fichiers texte .sqf/.sqm/.ext/.hpp. Les sous-dossiers, config.cpp, PBO/WRP et fichiers audio ne sont pas analyses. Les sources ne sont ni executees ni modifiees. Le dossier de sortie doit etre nouveau, hors du dossier source, avec un dossier parent existant.

Utilisez les commandes ci-dessus, puis ouvrez REVIEW.md. Les rapports JSON contiennent des emplacements/extraits de source et des points non resolus. Le manifeste conserve les empreintes des rapports; source-receipt.json conserve les empreintes des fichiers source et les entrees ignorees. Ne partagez ces rapports que volontairement.

Conservez separement bundleSHA256 pour utiliser --expected-sha256 avec cette valeur exacte. La verification ne prouve ni l'origine, ni la validite du comportement, ni une autorisation d'execution. Sans empreinte de confiance, elle controle seulement la coherence interne. Le recu source est distinct des rapports couverts par le manifeste. Aucun code Enforce n'est genere; aucune commande n'est envoyee au jeu. Pour une nouvelle analyse, choisissez un autre dossier de sortie.

## Deutsch

Entwicklerwerkzeug ausserhalb der Desktop-App, mit Node.js 18+. Waehlen Sie einen Ordner mit 1 bis 64 losen Textdateien .sqf/.sqm/.ext/.hpp. Unterordner, config.cpp, PBO/WRP und Audiodateien werden nicht untersucht. Quelldateien werden weder ausgefuehrt noch veraendert. Der Ausgabeordner muss neu sein, ausserhalb des Quellordners liegen und einen vorhandenen Elternordner haben.

Fuehren Sie die Befehle oben aus und oeffnen Sie REVIEW.md. Die JSON-Berichte enthalten Quellpositionen/Ausschnitte und offene Befunde. Das Manifest enthaelt Bericht-Pruefsummen; source-receipt.json enthaelt Quelldatei-Pruefsummen und ignorierte Eintraege. Teilen Sie diese Berichte nur bewusst.

Bewahren Sie bundleSHA256 getrennt auf und uebergeben Sie den exakten Wert mit --expected-sha256. Die Pruefung bestaetigt weder Urheberschaft noch Verhaltensgleichheit oder Ausfuehrungsrechte. Ohne vertrauenswuerdigen Vergleichswert wird nur die interne Konsistenz geprueft. Der Quellbeleg ist vom Pruefumfang der Bericht-Artefakte getrennt. Es wird kein Enforce-Code erzeugt und kein Befehl an das Spiel gesendet. Fuer eine erneute Analyse waehlen Sie einen anderen Ausgabeordner.

## Implementation and tests

See docs/SQF-BINDING-VALUE-IR.md and docs/test-evidence/sqf-binding-value-ir.json. The default full source test script includes these new gates; focused commands are:

```powershell
node --test planner/sqf-source-semantics.test.js planner/sqf-source-semantics-validation.test.js planner/sqf-binding-review.test.js planner/sqf-command-expressions.test.js planner/sqf-value-ir.test.js planner/sqf-review-package.test.js tools/sqf-review/review.test.cjs tools/sqf-review/verify.test.cjs
```

Do not repeat passing gates without a relevant change, failure or unresolved concern. Native behavior is untested in this checkpoint. The current installed app and its guides/settings remain unchanged; the developer workflow is documented here in EN/FR/DE.


## Source shape and potential-effect review (English / Francais / Deutsch)

English: source-semantics.json distinguishes compatible known shapes, unresolved operands and known mismatches. It records possible effects and callback scheduling/cleanup requirements. This is not whole-mod behavior verification; no code or condition string is evaluated and no target type is authorized. Strict JSON validation is structural, not proof of native equivalence. Old review formats remain readable.

Francais : source-semantics.json distingue les formes connues compatibles, les operandes non resolus et les incompatibilites connues. Il conserve les effets possibles et les obligations de planification/nettoyage des rappels. Aucun code ni texte de condition n'est execute. La validation structurelle ne prouve pas l'equivalence native; les anciens formats restent lisibles.

Deutsch: source-semantics.json unterscheidet kompatible bekannte Formen, ungeklaerte Operanden und bekannte Unvereinbarkeiten. Moegliche Effekte sowie Callback-Zeitpunkt und Aufraeumpflichten bleiben sichtbar. Code und Bedingungstexte werden nicht ausgefuehrt. Strukturelle Pruefung beweist keine native Verhaltensgleichheit; aeltere Berichtsformate bleiben lesbar.


## Include dependency review / Dependances / Abhaengigkeiten (developer-only)

**English:** Prepare a UTF-8 JSON file with exactly `files` (relative `{name,text}` records) and `mounts` (`{prefix,root}` records, empty array allowed). Example: `{"files":[{"name":"addons/main/init.sqf","text":"#include \"script_component.hpp\""},{"name":"addons/main/script_component.hpp","text":"#define DEMO 1"}],"mounts":[{"prefix":"/z/demo/addons/main","root":"addons/main"}]}`. Supply your own local text; this tool does not traverse directories or fetch missing dependencies. Names preserve package-relative paths. No macro expansion, config symbol resolution or Enforce generation is performed.

```powershell
node tools/sqf-review/dependencies.cjs --source-set "A:/Reviews/source-set.json" --output "A:/Reviews/new-dependencies.json"
```

Review unresolved/case/unsafe-path results and potential cycles. Exact include paths do not prove active branches, function bindings or conversion readiness. Processing uses a cancellable bounded Node worker. The new report must not overwrite an existing file and is not an app import/deployment contract. See docs/SQF-SOURCE-DEPENDENCIES.md for limits and examples.

**Francais :** Creez un fichier JSON UTF-8 avec seulement `files` (noms relatifs et textes) et `mounts` (prefixes virtuels et racines relatives, tableau vide autorise). Utilisez la commande ci-dessus avec un nouveau fichier de sortie. Aucun dossier ou fichier manquant n'est charge automatiquement. Le worker Node analyse les directives sans executer les sources ni developper les macros. Examinez les chemins manquants, ambigus ou dangereux et les cycles potentiels. Un chemin trouve ne prouve ni une branche active, ni une fonction resolue, ni une conversion executable. Outil de developpement, pas une nouvelle fonction de l'application.

**Deutsch:** Erstellen Sie eine UTF-8-JSON-Datei nur mit `files` (relative Namen und Texte) sowie `mounts` (virtuelle Praefixe und relative Wurzeln; leeres Array erlaubt). Verwenden Sie den obigen Befehl mit einer neuen Ausgabedatei. Keine automatische Ordnersuche oder Beschaffung fehlender Dateien. Ein begrenzter Node-Worker untersucht Direktiven ohne Quellcodeausfuehrung oder Makroexpansion. Pruefen Sie fehlende, mehrdeutige oder unsichere Pfade und moegliche Zyklen. Gefundene Pfade beweisen keine aktiven Zweige, aufgeloesten Funktionen oder ausfuehrbare Konvertierung. Dies ist ein Entwicklerwerkzeug, keine neue App-Funktion.


## Function registration candidates / Fonctions / Funktionskandidaten (developer-only)

English: Add `configRoots` to an explicit source-set JSON, for exactly `{files,mounts,configRoots}`. Example root: `{"file":"mission/description.ext","root":"mission"}`. Each file is an existing selected source; roots are package-relative (empty string means the selected package root). Relative function file properties are anchored there; header folders are not guessed as mission roots. Virtual paths still require mounts. The tool inventories literal CfgFunctions declarations and lexical call/spawn name candidates, without preprocessing, function execution or runtime binding. Choose a new report filename.

```powershell
node tools/sqf-review/registrations.cjs --source-set "A:/Reviews/function-source-set.json" --output "A:/Reviews/new-registrations.json"
```

A unique name or exact source path is only a candidate. Review missing/ambiguous paths, macro/inheritance blockers and supplied-file coverage. The Node worker supports bounded analysis, deadline and cancellation. This new report is not an app import or deployable mission. See docs/SQF-FUNCTION-REGISTRATIONS.md.

Francais : Ajoutez `configRoots` au JSON de sources, avec exactement `files`, `mounts` et `configRoots`. Exemple : `{"file":"mission/description.ext","root":"mission"}`. Utilisez la commande ci-dessus et un nouveau fichier de sortie. Les racines sont relatives au paquet; aucun dossier de mission n'est devine. Les declarations litterales CfgFunctions et noms call/spawn restent des candidats, sans developpement des macros, resolution d'execution ou conversion native. Examinez les chemins manquants, ambigus et les limites de couverture. Outil de developpement separe de l'application.

Deutsch: Fuegen Sie `configRoots` zur Quelldatei-JSON hinzu, mit genau `files`, `mounts` und `configRoots`. Beispiel: `{"file":"mission/description.ext","root":"mission"}`. Nutzen Sie den obigen Befehl mit einer neuen Ausgabedatei. Wurzeln sind paketrelativ; Missionsordner werden nicht geraten. Literale CfgFunctions-Deklarationen und call/spawn-Namen bleiben Kandidaten, ohne Makroexpansion, Laufzeitbindung oder native Konvertierung. Pruefen Sie fehlende und mehrdeutige Pfade sowie Abdeckungsgrenzen. Dies ist ein Entwicklerwerkzeug ausserhalb der App.


## Literal include expansion / Inclusions / Include-Erweiterung (developer-only)

English: Prepare an explicit source-set JSON with exactly `files`, `mounts` and `entries`. An entry is `{"file":"mission/description.ext","configRoot":"mission"}`; use null for configRoot when no relative config path context is declared. The command copies only exact literal supplied-source includes and returns original UTF-16 source maps. Macro definitions, conditions, unknown directives, missing/ambiguous paths, cycles and line splicing block the entry. No partial text/candidates are returned for blocked entries. Complete literal units remain non-executable and are not full preprocessed/native output. Reports contain source text: keep them private unless you have sharing rights.

```powershell
node tools/sqf-review/expand-includes.cjs --source-set "A:/Reviews/include-source-set.json" --output "A:/Reviews/new-include-review.json"
```

The bounded Node worker supports deadline/cancellation. Output must be a new filename. The tool never automatically reads referenced files or fetches missing dependencies. Config candidate declarations can retain exact original header spans through a clearly labelled synthetic expanded file. See docs/SQF-INCLUDE-EXPANSION.md for limits and remaining gates; this is not an installed app feature or app import contract.

Francais : Le JSON contient exactement `files`, `mounts` et `entries`. Exemple d'entree : `{"file":"mission/description.ext","configRoot":"mission"}`; null signifie aucun contexte relatif declare. La commande ci-dessus insere uniquement des inclusions litterales fournies et conserve les origines UTF-16. Macros, conditions, chemins manquants/ambigus et cycles bloquent l'entree sans texte partiel ni candidats. Le resultat reste non executable et ne prouve pas une conversion native. Les rapports contiennent du code source : ne les partagez qu'avec les droits necessaires. Outil de developpement hors application.

Deutsch: Die JSON-Datei enthaelt genau `files`, `mounts` und `entries`. Beispiel: `{"file":"mission/description.ext","configRoot":"mission"}`; null bedeutet keinen deklarierten relativen Config-Kontext. Der obige Befehl fuegt nur gelieferte literale Includes ein und erhaelt UTF-16-Quellurspruenge. Makros, Bedingungen, fehlende/mehrdeutige Pfade und Zyklen blockieren den Eintrag ohne Teiltext oder Kandidaten. Das Ergebnis ist nicht ausfuehrbar und keine native Konvertierung. Berichte enthalten Quelltext; teilen Sie sie nur mit entsprechenden Rechten. Entwicklerwerkzeug ausserhalb der App.


## Conditional subset / Sous-ensemble conditionnel / Bedingte Teilmenge

EN: Use `conditional.cjs --source-set <input.json> --output <new-report.json>` with exactly `{files,mounts,entries,environment}` and `environment: {mode:"explicit-closed-set",defined:["FEATURE"]}`. The caller declares the starting marker set; it is not engine-verified. Supports lowercase ifdef/ifndef, if/elif 0/1/defined/!defined, else/endif, empty define/undef and literal includes. Includes preserve original spans; unsupported macros/expressions and malformed branches block without partial output. No source execution, replacement macros or native conversion. The older literal command is unchanged. Developer-only; reports contain source text and must only be shared with appropriate rights. See docs/SQF-CONDITIONAL-INCLUDES.md for grammar, budgets and evidence.

FR : Utiliser `conditional.cjs --source-set <entree.json> --output <nouveau-rapport.json>` avec exactement `{files,mounts,entries,environment}` et `environment: {mode:"explicit-closed-set",defined:["FEATURE"]}`. Le demandeur déclare les marqueurs initiaux ; cet environnement n'est pas vérifié dans le moteur. Prend en charge ifdef/ifndef, if/elif avec 0/1/defined/!defined, else/endif, define vide/undef et les inclusions littérales, en minuscules. Les positions d'origine sont conservées. Les macros/expressions non prises en charge et les branches incorrectes bloquent la sortie partielle. Aucun code source n'est exécuté ; aucune conversion native ni substitution de macros. L'ancienne commande littérale reste inchangée. Outil développeur ; partager les rapports contenant du code uniquement avec les droits nécessaires.

DE: `conditional.cjs --source-set <eingabe.json> --output <neuer-bericht.json>` mit genau `{files,mounts,entries,environment}` und `environment: {mode:"explicit-closed-set",defined:["FEATURE"]}` verwenden. Der Aufrufer deklariert die anfänglichen Marker; keine Prüfung der Engine-Umgebung. Unterstützt kleingeschriebene ifdef/ifndef, if/elif mit 0/1/defined/!defined, else/endif, leeres define/undef und literale Includes. Ursprüngliche Quellpositionen bleiben erhalten. Nicht unterstützte Makros/Ausdrücke und ungültige Zweige sperren Teilausgaben. Keine Ausführung, Makroersetzung oder native Konvertierung. Der bisherige literale Befehl bleibt unverändert. Entwicklerwerkzeug; Berichte mit Quelltext nur mit entsprechenden Rechten weitergeben.


## Scalar macros / Macros scalaires / Skalare Makros

EN: `scalar.cjs --source-set <input.json> --output <new-report.json>` accepts the same exact `{files,mounts,entries,environment}` shape as the conditional tool. The environment is caller-declared, not engine-verified. Supports bounded numeric/double-quoted scalar definitions and exact uses outside double-quoted strings/comments. Both definition and use locations remain available. Single-quoted active strings, aliases, function macros, token pasting, computed includes and full predicates stay blocked. No source execution or native conversion. Existing profiles are unchanged; this command is developer-only. Reports contain source; share only with appropriate rights. See docs/SQF-SCALAR-MACROS.md for grammar, limits and evidence.

FR : `scalar.cjs --source-set <entree.json> --output <nouveau-rapport.json>` utilise exactement `{files,mounts,entries,environment}`, comme l'outil conditionnel. L'environnement est déclaré par le demandeur, sans vérification dans le moteur. Les constantes numériques et les chaînes entre guillemets doubles sont remplacées hors chaînes/commentaires. Les positions de définition et d'utilisation sont conservées. Les chaînes actives entre apostrophes, alias, macros avec paramètres, concaténation de jetons, inclusions calculées et conditions générales restent bloqués. Aucune exécution ni conversion native. Profils précédents inchangés ; outil développeur. Partager les rapports contenant du code uniquement avec les droits nécessaires.

DE: `scalar.cjs --source-set <eingabe.json> --output <neuer-bericht.json>` verwendet genau `{files,mounts,entries,environment}` wie das bedingte Werkzeug. Die Umgebung wird vom Aufrufer deklariert, nicht durch die Engine bestätigt. Unterstützt begrenzte Zahlen- und Zeichenkettenkonstanten in doppelten Anführungszeichen sowie exakte Verwendungen ausserhalb solcher Zeichenketten/Kommentare. Definitions- und Verwendungspositionen bleiben erhalten. Aktive Zeichenketten in einfachen Anführungszeichen, Aliase, Funktionsmakros, Token-Verkettung, berechnete Includes und allgemeine Bedingungen bleiben gesperrt. Keine Ausführung oder native Konvertierung. Vorherige Profile unverändert; Entwicklerwerkzeug. Quelltextberichte nur mit entsprechenden Rechten weitergeben.


## Macro aliases / Alias de macros / Makro-Aliase

EN: `alias.cjs --source-set <input.json> --output <new-report.json>` uses exactly `{files,mounts,entries,environment}`, with the same caller-declared closed-set environment. Supports single-name chains ending at a supported scalar literal, resolved using current definitions at each active use. Retains every definition and invocation origin. Cycles, missing/empty targets and chains beyond 32 definitions block; aggregate origin references are capped. Cache invalidation follows define/undef. General/function macros, computed includes and full predicates remain unsupported. Developer-only, no source execution or native conversion; older profiles unchanged. Reports contain source; share only with appropriate rights. See docs/SQF-ALIAS-MACROS.md.

FR : `alias.cjs --source-set <entree.json> --output <nouveau-rapport.json>` utilise exactement `{files,mounts,entries,environment}`, avec le même environnement fermé déclaré par le demandeur. Les chaînes de noms doivent aboutir à une constante scalaire prise en charge, selon les définitions courantes au moment de l'utilisation active. Toutes les positions de définition et d'utilisation sont conservées. Les cycles, cibles absentes/vides et chaînes dépassant 32 définitions sont bloqués ; les références d'origine sont limitées. Le cache est invalidé par define/undef. Macros générales/avec paramètres, inclusions calculées et conditions générales non prises en charge. Outil développeur, sans exécution ni conversion native ; profils précédents inchangés. Partager les rapports contenant du code uniquement avec les droits nécessaires.

DE: `alias.cjs --source-set <eingabe.json> --output <neuer-bericht.json>` verwendet genau `{files,mounts,entries,environment}` mit derselben vom Aufrufer deklarierten geschlossenen Umgebung. Namensketten müssen anhand der beim aktiven Aufruf gültigen Definitionen in einer unterstützten skalaren Konstante enden. Alle Definitions- und Verwendungspositionen bleiben erhalten. Zyklen, fehlende/leere Ziele und Ketten mit mehr als 32 Definitionen werden gesperrt; Herkunftsreferenzen sind begrenzt. Define/undef invalidieren den Cache. Allgemeine/Funktionsmakros, berechnete Includes und allgemeine Bedingungen bleiben nicht unterstützt. Entwicklerwerkzeug ohne Ausführung oder native Konvertierung; ältere Profile unverändert. Quelltextberichte nur mit entsprechenden Rechten weitergeben.


## Cross-file review / Analyse entre fichiers / Dateiübergreifende Prüfung

EN: `cross-file.cjs --source-set <input.json> --output <new-report.json>` accepts exactly `{files,mounts,configRoots}`. Inventories lexical function assignments and literal namespace writes, joins names to calls/config registrations and flags competing writes, namespace uncertainty and dynamic-source barriers. A unique name match is not a binding; source load order, private scope, types, preprocessing and native behavior remain unresolved. No source execution or implicit file loading. Fixed bounded worker, cancellation and new-file-only output. Developer-only; old reports/bundles unchanged. Source-derived reports may only be shared with appropriate rights. See docs/SQF-CROSS-FILE.md.

FR : `cross-file.cjs --source-set <entree.json> --output <nouveau-rapport.json>` accepte exactement `{files,mounts,configRoots}`. Inventorie les affectations de fonctions et écritures littérales dans les espaces de noms, relie les noms aux appels/enregistrements de configuration et signale les écritures concurrentes, domaines incertains et sources dynamiques. Un nom unique n'est pas une liaison prouvée ; ordre de chargement, portée privée, types, prétraitement et comportement natif restent non résolus. Aucune exécution ni lecture implicite des fichiers référencés. Traitement borné, annulation et nouveau fichier de sortie uniquement. Outil développeur ; anciens rapports inchangés. Partager les rapports uniquement avec les droits nécessaires.

DE: `cross-file.cjs --source-set <eingabe.json> --output <neuer-bericht.json>` akzeptiert genau `{files,mounts,configRoots}`. Erfasst lexikalische Funktionszuweisungen/literale Namespace-Schreibvorgänge, verknüpft Namen mit Aufruf-/Konfigurationskandidaten und meldet konkurrierende Schreibvorgänge, unklare Namensräume und dynamische Quellen. Ein eindeutiger Namensvergleich ist keine bestätigte Bindung; Ladereihenfolge, privater Geltungsbereich, Typen, Vorverarbeitung und natives Verhalten bleiben ungeklärt. Keine Ausführung oder implizites Laden referenzierter Dateien. Begrenzter Worker, Abbruch und ausschliesslich neue Ausgabedateien. Entwicklerwerkzeug; ältere Berichte unverändert. Berichte nur mit entsprechenden Rechten teilen.


## Control/context IR / IR de contrôle et contexte / Kontroll- und Kontext-IR

EN: `control-flow.cjs --source-set <input.json> --output <new-report.json>` accepts exactly `{files}` under the existing 64-file/2 MiB structural source contract. It records branch/loop regions, unresolved exit targets, detached stored/callback code, assignment binding candidates and expression syntax/type slots. It is not an executable CFG or inferred runtime/Enfusion type system. No imported source is run; invocation, effects, initialization and native adapters remain unresolved. Fixed bounded worker, cancellation and fresh-output-only policy. Developer-only; older reports/bundles unchanged. Share source-derived reports only with appropriate rights. See docs/SQF-CONTROL-CONTEXT.md.

FR : `control-flow.cjs --source-set <entree.json> --output <nouveau-rapport.json>` accepte exactement `{files}`, avec la limite structurelle de 64 fichiers/2 Mio. Décrit les régions de branches/boucles, sorties non résolues, code stocké/callbacks séparés, candidats de liaison et emplacements de syntaxe/type. Ce n'est ni un graphe exécutable ni une inférence de types d'exécution/Enfusion. Aucun code importé n'est exécuté ; invocation, effets, initialisation et adaptateurs natifs restent non résolus. Traitement borné, annulation et nouveau fichier uniquement. Outil développeur ; anciens rapports inchangés. Partager uniquement avec les droits nécessaires.

DE: `control-flow.cjs --source-set <eingabe.json> --output <neuer-bericht.json>` akzeptiert genau `{files}` unter dem bestehenden Limit von 64 Dateien/2 MiB. Erfasst Verzweigungs-/Schleifenregionen, ungeklärte Ausstiegsziele, getrennte gespeicherte/Callback-Kontexte, Bindungskandidaten und Syntax-/Typfelder. Kein ausführbarer Kontrollflussgraph und keine abgeleiteten Laufzeit-/Enfusion-Typen. Importierter Code wird nicht ausgeführt; Aufruf, Effekte, Initialisierung und native Adapter bleiben ungeklärt. Begrenzter Worker, Abbruch und ausschliesslich neue Ausgabe. Entwicklerwerkzeug; ältere Berichte unverändert. Berichte nur mit entsprechenden Rechten teilen.


## Source-bound IR verification and effects / Vérification IR et effets / Quellgebundene IR-Prüfung und Effekte

EN: `verify-control-flow.cjs --source-set <files.json> --report <ir.json>` reads both regular UTF-8 files, checks the imported IR against exact source replay and rechecks raw bytes. It writes nothing and prints a non-executable source-match receipt, not native/authorship proof. `statement-effects.cjs --source-set <files.json> --output <new-effects.json>` accepts exactly `{files}` and records potential node/context/command/callback effects. Detached code stays uninvoked; operand types, full statement effects and native behavior remain unresolved. Fixed bounded workers, cancellation and fresh-output policy apply. Developer-only; older IR/bundles unchanged. Share source-derived reports only with appropriate rights. See docs/SQF-IR-VALIDATION-AND-EFFECTS.md.

FR : `verify-control-flow.cjs --source-set <fichiers.json> --report <ir.json>` compare l'IR importé à une reconstruction depuis les sources UTF-8 et revérifie les octets. Aucune écriture ; le reçu confirme la correspondance des sources, pas l'exécution native ni l'auteur. `statement-effects.cjs --source-set <fichiers.json> --output <nouveaux-effets.json>` accepte exactement `{files}` et décrit les effets potentiels des nœuds/contextes/commandes/callbacks. Le code séparé reste non invoqué ; types des opérandes, effets complets et comportement natif non résolus. Workers bornés, annulation et nouveau fichier uniquement. Outils développeur ; anciens IR inchangés. Partager uniquement avec les droits nécessaires.

DE: `verify-control-flow.cjs --source-set <dateien.json> --report <ir.json>` vergleicht die importierte IR mit einer Rekonstruktion aus UTF-8-Quelldateien und prüft die Rohdaten erneut. Keine Schreibvorgänge; der Beleg bestätigt Quellenübereinstimmung, nicht natives Verhalten oder Urheberschaft. `statement-effects.cjs --source-set <dateien.json> --output <neue-effekte.json>` akzeptiert genau `{files}` und erfasst mögliche Knoten-/Kontext-/Kommando-/Callback-Effekte. Getrennter Code bleibt unaufgerufen; Operandentypen, vollständige Effekte und natives Verhalten bleiben ungeklärt. Begrenzte Worker, Abbruch und ausschliesslich neue Ausgaben. Entwicklerwerkzeuge; ältere IR unverändert. Berichte nur mit entsprechenden Rechten teilen.


## Source constraints / Contraintes source / Quelltextbedingungen

EN: `source-constraints.cjs --source-set <files.json> --output <new-report.json>` accepts exactly `{files}` under the existing structural source limits. Records syntax shapes, possible writes, parameter default/exemplar evidence, command/operator requirements and unresolved initialization. It does not infer runtime types, propagate values, prove initialization or execute source. Detached callbacks remain uninvoked. Fixed bounded worker, cancellation and new-file-only output. Developer-only; older IR/bundles and the app executable are unchanged. Share source-derived reports only with appropriate rights. See docs/SQF-SOURCE-CONSTRAINTS.md.

FR : `source-constraints.cjs --source-set <fichiers.json> --output <nouveau-rapport.json>` accepte exactement `{files}`, avec les limites structurelles existantes. Décrit les formes syntaxiques, écritures possibles, valeurs par défaut/exemples des paramètres, exigences des commandes/opérateurs et initialisation non résolue. Aucune inférence des types d'exécution, propagation des valeurs, preuve d'initialisation ni exécution du code. Les callbacks séparés restent non invoqués. Worker borné, annulation et nouveau fichier uniquement. Outil développeur ; anciens IR et application inchangés. Partager uniquement avec les droits nécessaires.

DE: `source-constraints.cjs --source-set <dateien.json> --output <neuer-bericht.json>` akzeptiert genau `{files}` unter den bisherigen Quelltextgrenzen. Erfasst Syntaxformen, mögliche Schreibvorgänge, Parameter-Standardwerte/Typbeispiele, Kommando-/Operatoranforderungen und ungeklärte Initialisierung. Keine Laufzeittyp-Inferenz, Wertweitergabe, Initialisierungsgarantie oder Quelltextausführung. Getrennte Callbacks bleiben unaufgerufen. Begrenzter Worker, Abbruch und ausschliesslich neue Ausgabe. Entwicklerwerkzeug; ältere IR und Anwendung unverändert. Berichte nur mit entsprechenden Rechten teilen.


## Complete unpacked component review

The additive `project.cjs` command preserves recursive component paths and explicit virtual mounts, then runs Dependencies, Functions, Types and Effects on one capture. The desktop can load the resulting source-package JSON into all four tabs with one action. See [the EN/FR/DE guide](../../docs/COMPONENT-SOURCE-REVIEW.md). Earlier single-folder commands keep their existing limits.


## Additive Boolean local block export

The separate opt-in local-block export now supports complete flat initialized Boolean locals, reads and assignments, with an explicit final result. Previous mode descriptions remain valid for their own formats. See [the EN/FR/DE local-block guide](../../docs/BOOLEAN-LOCAL-MAPPING.md). No general SQF-to-Enforce conversion is claimed.


## Additive Boolean branch family

The block-family selector now offers a separate bounded if/else mapper over existing initialized Boolean locals. Earlier straight-line rules remain unchanged for their own family. See [the EN/FR/DE branch guide](../../docs/BOOLEAN-BRANCH-MAPPING.md).


## Coverage preview and exact integer value family

A read-only preview now explains supported/mixed/manual files before exporting. Exact integer expression helpers extend value-only emission; existing Boolean families remain unchanged. See [the EN/FR/DE guide](../../docs/MIGRATION-COVERAGE-AND-INTEGERS.md).


## Typed pure function module family

Coverage and helper export now include a separate pure Boolean function-module compiler with explicit params/defaults and closed cross-file calls. External registration and caller/lifecycle integration stay manual. See [the EN/FR/DE guide](../../docs/TYPED-BOOLEAN-FUNCTIONS.md). Previous families remain unchanged.


## Function-style macro review

Run macros.cjs --source-set <package.json> --output <new-report.json>. The package contains files, mounts, entries and an explicit-closed-set environment. See [RC3 guide](../../docs/RC3-MIGRATION-ADAPTERS.md). No source execution, automatic dependency discovery or native preprocessor parity is claimed.
