# COMMAND — typed function modules, revision 2

## English

Open **Source diagnostics → Export & scaffolds → Block / function family → Typed scalar functions (explicit params)**. Inspect coverage, choose Scaffold mode and confirm the declared invocation contracts before export. Settings and Sarge open this same workspace; language changes preserve the matching review context.

Supported source is a closed selected module of `TAG_fnc_name = { ... };` definitions and/or standalone bodies with unique, literal `CfgFunctions` registrations. Virtual paths need explicit mounts; relative registration paths need explicit `configRoots`. Missing files, inheritance, duplicate names/paths, preprocessing, opaque configs and automatic initialization flags do not establish verified registrations. No external config merges or runtime registration are performed.

Each function starts with 1–3 explicit `params` descriptors: literal local name, literal default, and one matching type exemplar. Supported values are Boolean, exact integers in `[-16777215,16777215]`, and printable ASCII strings of at most 256 characters. Integers and strings can be copied, passed and returned; arithmetic, floating-point operations and string manipulation remain manual. Callers must obey these contracts; emitted methods are not a dynamic SQF runtime.

```sqf
DEMO_fnc_choose = {
    params [["_flag",false,[true]],["_value",12,[0]]];
    if (_flag) exitWith { _value };
    7;
};
DEMO_fnc_ready = {
    params [["_flag",false,[true]]];
    private _ready = _flag;
    if (_flag) then { private _branch = not _flag; _ready = _branch; };
    for "_index" from 2 to -2 step -2 do { _ready = not _ready; };
    _ready;
};
```

Initialized branch locals remain inside their branches. Shadowing, reads before initialization, type-changing writes and mismatched return types are rejected. Root guard returns are supported; nested exits are manual. Closed nonrecursive calls can be grouped, nested in argument arrays, or composed with Boolean operators. Unknown or unsupported callees reject their callers.

Literal range loops permit at most 32 iterations. Bounds/step must be small literal integers, step must be nonzero, and the source counter cannot be read, written or captured. Zero-iteration bodies are still reviewed. There are at most 16 loops/function and a conservative 4096-step bound including nested loops and callee costs. These are conservative source-statement/callee cost units, not measured CPU instructions. This does not support arbitrary loops, scheduling or AI behaviour.

Native engine **1.8.0.13** compiled 16 generated methods and checked 82 invocations. A synthetic selected-source package also passed through the actual project preparer and native server, with its exact generated module hash checked against the log. This proves the tested mapping family and that selected synthetic package; arbitrary user input is still marked `selectedSourceNativelyCompiled:false`.

### Developer native handoff

`tools/boolean-mapping/prepare-selected.cjs` accepts an absolute source-package JSON and a **new** absolute project folder. It prepares generated Game scripts, a fresh `.gproj`, source/parameter/output maps and an honest native-review receipt. It does not launch Workbench, a server or a game client. Existing output is not overwritten. The programmatic `prepare(package, folder, cases)` API accepts explicit typed invocation checks; without cases, a later native run can establish compilation only.

```text
node tools/boolean-mapping/prepare-selected.cjs --source-set <absolute-package.json> --output <absolute-new-project>
```

The preparer can inspect selected literal CPP registration configs. The desktop Types/Effects source pipeline still accepts SQF/SQM/EXT/HPP; full CPP/INC preprocessing is a separate pending stage. Do not rename original files to imply their preprocessing context is complete.

Generated helper class, report filenames and manifest compatibility keys retain their earlier names. Runtime source registration, external initialization, scheduling, engine command adapters, ownership, prefab/GUID bindings and mission integration remain manual. No complete third-party mod conversion or public release is claimed by this checkpoint.

## Français

Dans **Diagnostic source → Export et squelettes**, choisissez **Famille de blocs / fonctions → Fonctions scalaires typées (params explicites)**. Vérifiez la couverture et les contrats, puis exportez en mode squelette. Les raccourcis Paramètres et Sarge restent synchronisés ; le changement de langue conserve le contexte correspondant.

Les modules sélectionnés peuvent contenir des définitions `TAG_fnc_name` ou des corps autonomes avec enregistrements `CfgFunctions` littéraux et uniques. Les chemins virtuels exigent des montages explicites ; les chemins relatifs exigent des `configRoots`. Héritage, doublons, fichiers absents, prétraitement et initialisation automatique restent manuels. Aucun enregistrement actif n’est effectué.

Paramètres explicites, variables et retours prennent en charge booléens, entiers exacts entre -16777215 et 16777215 et chaînes ASCII imprimables jusqu’à 256 caractères. Copie, passage et retour sont possibles ; calculs numériques et traitement des chaînes restent manuels. Variables privées initialisées de branche, appels fermés composés et retours de garde à la racine sont pris en charge. Masquage, lectures non initialisées et changements de type sont rejetés.

Les boucles à bornes entières littérales acceptent 32 itérations maximum sans utiliser le compteur source, 16 boucles par fonction et un plafond conservateur de 4096 étapes incluant les appels. Les corps de boucles vides sont aussi vérifiés. Les boucles générales et la planification restent manuelles.

Le serveur natif 1.8.0.13 a vérifié 82 appels sur 16 méthodes, ainsi qu’un projet synthétique issu du préparateur réel. Cette preuve ne signifie pas que toute source sélectionnée a été compilée. `prepare-selected.cjs` prépare un nouveau projet isolé sans lancer de programme ni écraser les sorties existantes. CPP littéral est accepté par cet outil de développement ; le pipeline Types/Effets du bureau reste limité à SQF/SQM/EXT/HPP. Intégration moteur, cycle de vie et conversion complète de mod restent à faire.

## Deutsch

Unter **Quelltextdiagnose → Export und Gerüste** die **Block- / Funktionsfamilie → Typisierte skalare Funktionen (explizite params)** wählen. Abdeckung und Verträge prüfen und im Gerüstmodus exportieren. Einstellungen und Sarge öffnen dieselbe Ansicht; Sprachwechsel behalten den passenden Prüfungskontext.

Ausgewählte Module dürfen `TAG_fnc_name`-Definitionen oder eigenständige Körper mit eindeutigen literalen `CfgFunctions`-Registrierungen enthalten. Virtuelle Pfade benötigen explizite Mounts, relative Pfade explizite `configRoots`. Vererbung, doppelte Einträge, fehlende Dateien, Vorverarbeitung und automatische Initialisierung bleiben manuell. Keine Laufzeitregistrierung wird vorgenommen.

Explizite Parameter, Variablen und Rückgaben unterstützen Boolesche Werte, exakte Ganzzahlen von -16777215 bis 16777215 sowie druckbare ASCII-Zeichenfolgen bis 256 Zeichen. Kopieren, Übergeben und Zurückgeben sind möglich; Zahlenrechnung und Zeichenfolgenbearbeitung bleiben manuell. Initialisierte zweiglokale Variablen, zusammengesetzte geschlossene Aufrufe und Guards auf Funktionsebene werden unterstützt. Verdeckung, uninitialisierte Lesezugriffe und Typwechsel werden abgelehnt.

Literale Ganzzahlschleifen erlauben höchstens 32 Durchläufe ohne Quellzählerzugriff, 16 Schleifen je Funktion und eine konservative Grenze von 4096 Schritten einschließlich Aufrufen. Auch nicht ausgeführte Körper werden geprüft. Allgemeine Schleifen und Scheduling bleiben manuell.

Der native Server 1.8.0.13 prüfte 82 Aufrufe von 16 Methoden sowie ein synthetisches Projekt aus dem tatsächlichen Vorbereiter. Dies behauptet keine Kompilierung beliebiger ausgewählter Quellen. `prepare-selected.cjs` erstellt ein neues isoliertes Projekt, ohne Programme zu starten oder vorhandene Ausgaben zu überschreiben. Literale CPP-Konfigurationen sind im Entwicklerwerkzeug möglich; der Desktop-Typen-/Effektpfad unterstützt weiterhin SQF/SQM/EXT/HPP. Motorintegration, Lebenszyklus und vollständige Modkonvertierung stehen noch aus.
