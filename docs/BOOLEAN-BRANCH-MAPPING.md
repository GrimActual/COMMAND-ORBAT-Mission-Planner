# COMMAND — verified Boolean if/else blocks

## English

Open **Assets → Arma 3 migration review → Source diagnostics → Export & scaffolds**. Complete a Types or Effects review, choose Scaffold mode and set **Boolean block family → If / else over existing locals**. Review the complete isolated block and its effective source/caller context, confirm the acknowledgment and choose **Export verified Boolean branch blocks**. Family, source and profile changes clear this acknowledgment; language changes retain matching context. Existing Settings shortcuts and Sarge open this same export view. The default family remains straight-line locals.

Supported: complete isolated SQF files with initialized private Boolean locals, pure Boolean conditions, statement-form `if ... then {...}` with optional `else`, bounded nested branches, assignments to existing locals, and a final explicit Boolean expression. Both arms are checked even if a condition is known. A missing else retains the incoming local state. Earlier Boolean expression rules still apply: literal Boolean values, initialized local reads, NOT and explicitly grouped AND/OR. Limits: 128 statements including the final expression, 32 branch nodes and nesting depth 8.

Declarations inside branches, shadowing, unknown/uninitialized locals, type changes, value-form if, early exits, loops, callbacks, global writes, engine commands and selected preprocessing directives remain manual. Any unsupported statement rejects that file as a whole. Another independent fully supported file can still qualify. No dead-code elimination hides unsupported operations. Dynamic SQF scope or caller context is not inferred.

```sqf
private _flag = true;
private _ready = false;
if (_flag) then {
    _ready = not _ready;
} else {
    _ready = false;
};
_ready;
```

The fresh scaffold folder adds `Fragments/COMMAND_BooleanBranchBlocks.c` and `boolean-branch-blocks.json`. Every emitted statement and branch delimiter retains source/output locations; source hashes, condition spans and generated local names remain explicit. Original sources/notices and the manual checklist are retained. Helpers are detached bool-returning methods: source function naming, arguments, caller/lifecycle wiring and complete mission conversion remain manual. Ordinary comment-only export and both earlier Boolean export families are unchanged.

The **1.8.0.13 headless diagnostic server** compiled and executed 32 cases covering true/false arms, optional else, nested branches and later conditions affected by branch writes. Expected outcomes were checked against independent Boolean truth tables. The fixed native proof binds the branch emitter, reused local-expression mapper, parsers and fixture hashes. No source SQF or Arma 3 runtime comparison was performed. No game client, Workbench, real entity or public tunnel was used; the server was stopped afterward. Peak sampled working set: 667.59 MiB.

Prepare the exact fixture in a new isolated directory without starting anything:

```powershell
node tools/boolean-mapping/prepare-branches.cjs "A:/Tests/NewBooleanBranchProject"
```

This source-checkout tool writes Game scripts and expected cases. Existing folders are not overwritten. Native execution is a separate operator action.

## Français

Dans **Diagnostic des sources → Export et squelettes**, terminez une analyse Types ou Effets, choisissez le mode squelette, puis **Famille de blocs booléens → If / else sur variables locales existantes**. Vérifiez le bloc isolé et son contexte, confirmez l’accord, puis exportez les blocs conditionnels booléens vérifiés. Changer de famille, source ou profil efface l’accord ; changer de langue conserve le contexte correspondant. Paramètres et Sarge ouvrent la même vue.

Seuls les fichiers SQF complets avec variables booléennes private déjà initialisées, conditions pures, if/else sous forme d’instructions et résultat booléen final sont acceptés. Else est optionnel ; l’imbrication est bornée. Les deux branches sont vérifiées, même inaccessibles. Une branche sans else conserve l’état entrant si sa condition est fausse. Limites : 128 instructions avec résultat final, 32 branches, profondeur 8. Déclarations dans les branches, valeurs inconnues, changements de type, if comme valeur, sorties, boucles, rappels, variables globales, commandes moteur et directives sélectionnées restent manuels. Aucun bloc partiel n’est généré.

La sortie conserve sources et notices, cartes source/sortie et checklist. Les helpers bool sont indépendants ; intégration appelante, cycle de vie et mission complète restent manuels. Les exports précédents restent disponibles. Le serveur de diagnostic natif 1.8.0.13 a compilé et vérifié 32 cas, puis a été arrêté. Aucun SQF source ni client de jeu n’a été exécuté. La commande ci-dessus prépare uniquement une fixture dans un nouveau dossier.

## Deutsch

Unter **Quelltextdiagnose → Export und Gerüste** eine Typen- oder Effektprüfung abschließen, Gerüstmodus und **Boolesche Blockfamilie → If / else über bestehende lokale Variablen** wählen. Den isolierten Block und seinen Kontext prüfen, bestätigen und verifizierte Verzweigungsblöcke exportieren. Familien-, Quellen- und Profilwechsel setzen die Bestätigung zurück; Sprachwechsel behalten passenden Kontext. Einstellungen und Sarge öffnen dieselbe Ansicht.

Nur vollständige SQF-Dateien mit bereits initialisierten privaten booleschen Variablen, reinen Bedingungen, if/else-Anweisungen und abschließendem booleschem Wert werden akzeptiert. Else ist optional; Verschachtelung ist begrenzt. Beide Zweige werden geprüft, auch unerreichbare. Ohne else bleibt bei falscher Bedingung der eingehende Zustand erhalten. Grenzen: 128 Anweisungen einschließlich Ergebnis, 32 Zweige, Tiefe 8. Deklarationen in Zweigen, unbekannte Werte, Typwechsel, if als Wert, Ausstiege, Schleifen, Callbacks, globale Variablen, Motorkommandos und ausgewählte Direktiven bleiben manuell. Keine Teilblöcke.

Ausgaben behalten Quellen, Hinweise, Quell-/Ausgabekarten und Checkliste. Die bool-Helfer sind unabhängig; Aufrufer, Lebenszyklus und vollständige Mission bleiben manuell. Frühere Exportarten bleiben verfügbar. Der native Diagnoseserver 1.8.0.13 kompilierte und prüfte 32 Fälle und wurde beendet. Kein Quell-SQF oder Spielclient wurde ausgeführt. Der obige Befehl erstellt nur eine Fixture in einem neuen Ordner.
