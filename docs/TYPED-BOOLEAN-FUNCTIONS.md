# COMMAND — typed pure Boolean function modules

Historical revision 1 guide. Current revision 2 adds scalar types, selected literal registrations, composed calls, branch locals and bounded loops: see [FUNCTION-MODULES.md](FUNCTION-MODULES.md).

## English

This stage converts a selected **closed, pure Boolean function module** into callable Enforce methods. It adds real parameter/default handling, local state, branches, root guard returns and cross-file calls within that selected module. It does not register the original SQF global names in Reforger or wire game components, external callers, scheduling, replication or lifecycle hooks.

Open **Assets → Arma 3 migration review → Source diagnostics → Export & scaffolds** after a Types or Effects review. Choose **Boolean block family → Typed Boolean functions (explicit params)**, check block coverage, select Scaffold mode and review the **immutable selected definitions / Boolean-only invocation contract** acknowledgment. Then choose **Export verified typed Boolean functions**. Existing Settings shortcuts and Sarge open the same view; EN/FR/DE and source/family/profile acknowledgment rules are retained.

### Explicit source contract

Selected SQF files must contain only `TAG_fnc_name`-style named, top-level code-valued global assignments. This conservative name rule prevents reserved engine commands from masquerading as identifiers; it does not supply type evidence. Each function starts with 1–3 explicit `params` descriptors containing a literal local name, Boolean literal default and one Boolean type exemplar. No type is inferred from a name or an untyped parameter.

```sqf
TAG_fnc_allow = {
    params [["_enabled", false, [true]], ["_blocked", true, [true]]];
    private _ready = _enabled;
    if (_blocked) then { _ready = false; };
    _ready;
};

TAG_fnc_gate = {
    params [["_enabled", true, [true]], ["_blocked", false, [true]]];
    if (_blocked) exitWith { false };
    private _ready = [_enabled, _blocked] call TAG_fnc_allow;
    _ready;
};
```

Supported body statements: initialized Boolean locals, assignments to declared locals/parameters, pure Boolean conditions and branches, a function-root `if (...) exitWith { value }` guard, and an explicit final Boolean result. Branch-local declarations/shadowing and nested scope exits stay manual. Both branch arms are checked even when one is dormant. Existing literal/local Boolean expression grouping rules apply.

Selected-module calls must be whole expressions of the form `[Boolean arguments] call LiteralFunctionName`. The callee must be a unique supported selected definition. Calls can appear in initializers, assignments, conditions, guard results or final results. Zero through N Boolean arguments are allowed; omitted trailing arguments use literal defaults. Nil, mismatched types and extra arguments are outside the supported invocation contract. Parenthesized/composed call syntax, nested/dynamic calls and first-class function values remain manual in this checkpoint; the accepted call must be the unwrapped whole expression.

Definitions and competing writes are scanned before binding. A bounded depth-first dependency pass rejects self/mutual recursion, missing/ambiguous callees and unsupported dependencies, and reuses compiled shared callees. A failing callee rejects its callers; independent valid functions may still export. Selected top-level runtime statements or preprocessing block the module. Dynamic scope, captured outer locals, implicit context parameters, global writes, callbacks, engine commands, loops, remote execution and runtime rebinding are not guessed.

Limits: 32 candidate functions, 3 parameters/function, 128 body statements/function, 32 branches/function, branch depth 8 and 128 inspected call edges, within the existing 64-file/2 MiB structural source budget. No input source is executed or changed.

### Handoff and verification

Export adds `Fragments/COMMAND_TypedBooleanFunctions.c` and `typed-boolean-functions.json` to a new scaffold folder. Each accepted source name maps to a generated static `bool Function_XXXX(...)` method. The report includes literal defaults/type evidence, original UTF-16 parameter/statement/call-argument spans, source/definition hashes, output lines and selected-module call edges. Source registration and external caller/lifecycle integration are explicitly manual. `selectedSourceNativelyCompiled` is false: the native receipt proves this mapper family and fixture, not arbitrary user source compilation. Original sources/notices and the base comment-only checklist remain intact. Ordinary scaffold export does not add these methods.

The **1.8.0.13 headless diagnostic server** compiled six methods and executed **42 Boolean/default invocation cases**, including cross-file calls, optional defaults, local/parameter mutation, branches and root guard returns. Expected results come from separate reference Boolean functions, not execution of source SQF. No Arma 3 runtime comparison, game client, Workbench, real entity or public tunnel was used. The server was stopped afterward; peak sampled working set was 667.37 MiB. A receipt binds mapper/parser hashes and the exact native fixture. Earlier Boolean/integer proofs remain unchanged.

Prepare the exact isolated project without launching anything or overwriting an existing folder:

```powershell
node tools/boolean-mapping/prepare-functions.cjs "A:/Tests/NewTypedFunctionProject"
```

This is a supported pure-function compiler subset, not a complete mod converter. Arbitrary function files, runtime registration, object/number/string parameters, loops, callbacks and engine adapters remain roadmap work.

## Français

Cette étape compile un module sélectionné fermé de fonctions booléennes pures en méthodes Enforce appelables : paramètres/défauts explicites, état local, branches, sorties de garde au niveau fonction et appels entre fichiers. Aucun enregistrement des noms SQF dans Reforger ni intégration automatique des composants, appelants externes, planification, réplication ou cycles de vie.

Dans **Diagnostic des sources → Export et squelettes**, terminez une analyse Types ou Effets, choisissez **Famille de blocs booléens → Fonctions booléennes typées (params explicites)**, vérifiez la couverture puis, en mode squelette, confirmez le contrat des définitions immuables et arguments booléens. Paramètres et Sarge ouvrent la même vue. Changer de source/famille/profil efface l’accord ; changer de langue conserve le contexte correspondant.

Les identifiants suivent le schéma TAG_fnc_name pour éviter les noms de commandes réservées, sans en déduire le type. Les fichiers SQF sélectionnés contiennent uniquement des affectations globales nommées de code au niveau racine. Chaque fonction commence par 1–3 descripteurs params : nom local littéral, défaut booléen et un exemple de type booléen. Aucun type deviné. Variables booléennes initialisées, affectations locales, branches, garde exitWith au niveau fonction et résultat booléen final sont pris en charge. Les appels utilisent un tableau littéral d’expressions booléennes vers une définition pure sélectionnée unique ; les arguments finaux omis prennent les défauts. Nil, arguments supplémentaires ou types incompatibles restent manuels.

Cycles, identités ambiguës, cibles absentes ou dépendances non prises en charge bloquent les appelants. Déclarations dans les branches, sorties imbriquées, portée dynamique, captures, variables globales, callbacks, boucles et commandes moteur restent manuels. Limites : 32 fonctions, 3 paramètres, 128 instructions, 32 branches, profondeur 8, 128 arêtes d’appel. Le rapport conserve cartes source/méthodes/paramètres/appels et empreintes. Les sources utilisateur ne sont pas déclarées compilées nativement ; enregistrement et intégration externe restent manuels.

Le serveur de diagnostic natif 1.8.0.13 a compilé six méthodes et vérifié 42 appels booléens/avec défauts, puis a été arrêté. Aucun SQF source ni client de jeu n’a été exécuté. La commande ci-dessus prépare uniquement le projet isolé. Ce sous-ensemble ne convertit pas un mod complet.

## Deutsch

Diese Stufe kompiliert ein ausgewähltes geschlossenes Modul reiner boolescher Funktionen in aufrufbare Enforce-Methoden: explizite Parameter/Standardwerte, lokalen Zustand, Zweige, Guard-Rückgaben auf Funktionsebene und dateiübergreifende Aufrufe. Keine automatische Registrierung von SQF-Namen in Reforger oder Integration von Komponenten, externen Aufrufern, Zeitplanung, Replikation und Lebenszyklus.

Unter **Quelltextdiagnose → Export und Gerüste** eine Typen- oder Effektprüfung abschließen, **Boolesche Blockfamilie → Typisierte boolesche Funktionen (explizite params)** wählen, Abdeckung prüfen und im Gerüstmodus unveränderliche Definitionen und booleschen Aufrufvertrag bestätigen. Einstellungen und Sarge öffnen dieselbe Ansicht. Quellen-/Familien-/Profilwechsel setzen die Bestätigung zurück; Sprachwechsel behalten passenden Kontext.

Bezeichner folgen dem Schema TAG_fnc_name, um reservierte Kommandonamen auszuschließen; daraus wird kein Typ abgeleitet. Ausgewählte SQF-Dateien enthalten nur benannte globale Codezuweisungen auf Dateiebene. Jede Funktion beginnt mit 1–3 params-Deskriptoren: lokaler Literalname, boolescher Standardwert und ein boolesches Typexemplar. Keine geratenen Typen. Initialisierte boolesche Variablen, lokale Zuweisungen, Zweige, exitWith-Guards auf Funktionsebene und abschließender boolescher Wert sind unterstützt. Aufrufe nutzen ein Literalarray boolescher Ausdrücke und eine eindeutige ausgewählte reine Definition; ausgelassene letzte Argumente verwenden Standardwerte. Nil, zusätzliche oder falsche Argumenttypen bleiben manuell.

Zyklen, mehrdeutige Identitäten, fehlende Ziele und unzulässige Abhängigkeiten blockieren Aufrufer. Deklarationen in Zweigen, verschachtelte Ausstiege, dynamischer Gültigkeitsbereich, Captures, globale Variablen, Callbacks, Schleifen und Motorkommandos bleiben manuell. Grenzen: 32 Funktionen, 3 Parameter, 128 Anweisungen, 32 Zweige, Tiefe 8, 128 Aufrufkanten. Quell-/Methoden-/Parameter-/Aufrufkarten und Prüfsummen liegen bei. Beliebige Benutzerquellen werden nicht als nativ kompiliert bezeichnet; Registrierung und externe Integration bleiben manuell.

Der native Diagnoseserver 1.8.0.13 kompilierte sechs Methoden und prüfte 42 boolesche/Standardargument-Aufrufe und wurde beendet. Kein Quell-SQF oder Spielclient wurde ausgeführt. Der obige Befehl erstellt nur das isolierte Projekt. Keine vollständige Modkonvertierung.
