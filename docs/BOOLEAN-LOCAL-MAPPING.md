# COMMAND — verified Boolean local blocks

## English

Open **Assets → Arma 3 migration review → Source diagnostics → Export & scaffolds**. Complete a Types or Effects review, choose Scaffold mode, confirm the **separate isolated-block acknowledgment**, and choose **Export verified Boolean local blocks**. Existing Settings shortcuts open this same dialog; Sarge has a matching topic. No new stored preference is required.

The supported family is intentionally small: a complete, flat SQF source file containing initialized `private` Boolean locals, optional later assignments, and an explicit final Boolean expression. Each local must be initialized before reading. Names are matched without case and rewritten to generated target names. Expressions accept Boolean literals, already-initialized locals, NOT, and explicitly grouped AND/OR. Global writes, implicit locals, duplicate declarations, unknown values, type changes, commands, branches, loops, callbacks and selected preprocessing directives remain manual. No partial local block is generated when any statement in that file is unsupported. Another independent complete file can still qualify; unresolved files remain listed.

Example source:

```sqf
private _ready = true;
private _blocked = false;
_ready = (_ready and (not _blocked));
_ready;
```

The new output adds `Fragments/COMMAND_BooleanLocalBlocks.c` and `boolean-local-blocks.json` to a fresh scaffold folder. Source SHA-256 values, original UTF-16 statement/expression spans, generated local names and output lines remain visible. Original source copies/notices and the existing manual checklist are retained. Each helper is detached; source function naming, arguments, caller wiring, dynamic scope and lifecycle integration are not inferred. Ordinary scaffold export stays comments-only, and the existing literal-expression export is unchanged. Neither a complete mod nor a mission is claimed runnable.

The native **1.8.0.13 headless diagnostic server** compiled and executed 24 fixture cases covering initialized declarations, reads, copies, later writes and mixed-case names. No source SQF was executed or compared in an Arma 3 runtime. No Workbench/game-client launch, real entity or public tunnel was used. The server was stopped afterward; peak sampled working set was 668.09 MiB. A fixed proof receipt binds the emitter, parser modules and deterministic fixture hashes; unavailable/mismatched proof blocks export.

Reproduce the fixture without launching anything:

```powershell
node tools/boolean-mapping/prepare-locals.cjs "A:/Tests/NewBooleanLocalProject"
```

This command requires a new directory and writes the isolated Game-script project plus expected cases. It never starts an engine or overwrites an existing folder. Native execution remains a separate operator action.

## Français

Dans **Diagnostic des sources → Export et squelettes**, terminez une analyse Types ou Effets, choisissez le mode squelette, confirmez l’accord distinct pour le bloc isolé et exportez les blocs booléens locaux vérifiés. Les raccourcis des paramètres et Sarge ouvrent la même vue. Changer de langue conserve l’accord lié à la même analyse ; changer de source ou de profil l’efface.

Seuls les fichiers SQF plats complets avec variables private booléennes initialisées, affectations ultérieures et valeur booléenne finale sont acceptés. Chaque lecture exige une déclaration antérieure. Noms comparés sans tenir compte de la casse, noms cibles générés. Valeurs inconnues, changements de type, variables globales, redéclarations, commandes, branches, boucles, rappels et directives sélectionnées restent manuels. Aucun bloc partiel n’est émis. Le dossier ajoute un helper indépendant et une carte source/sortie ; droits, appelants et cycle de vie exigent une vérification humaine. L’export ordinaire reste composé de commentaires. Aucun mod ou mission complet n’est déclaré exécutable.

Le serveur de diagnostic natif 1.8.0.13 a compilé et vérifié 24 cas, puis a été arrêté. Aucun SQF source ni client de jeu n’a été exécuté. Le reçu lie les empreintes du code, des analyseurs et de la fixture. La commande ci-dessus prépare uniquement un projet isolé dans un nouveau dossier, sans lancer le moteur.

## Deutsch

Unter **Quelltextdiagnose → Export und Gerüste** eine Typen- oder Effektprüfung abschließen, Gerüstmodus wählen, die gesonderte Bestätigung für isolierte Blöcke setzen und verifizierte boolesche lokale Blöcke exportieren. Einstellungen und Sarge öffnen dieselbe Ansicht. Sprachwechsel behalten die Bestätigung für dieselbe Prüfung; Quellen- oder Profilwechsel setzen sie zurück.

Nur vollständige flache SQF-Dateien mit initialisierten privaten booleschen Variablen, nachfolgenden Zuweisungen und abschließendem booleschem Wert werden akzeptiert. Lesezugriffe benötigen vorherige Initialisierung. Quellnamen werden ohne Beachtung der Großschreibung verglichen und Zielnamen erzeugt. Unbekannte Werte, Typwechsel, globale Variablen, erneute Deklarationen, Kommandos, Zweige, Schleifen, Callbacks und ausgewählte Direktiven bleiben manuell. Keine Teilblöcke. Die Ausgabe ergänzt unabhängige Helfer und Quell-/Ausgabekarten; Rechte, Aufrufer und Lebenszyklus erfordern menschliche Prüfung. Der normale Gerüstexport bleibt kommentarbasiert. Keine vollständige Mod oder Mission wird als ausführbar bezeichnet.

Der native Diagnoseserver 1.8.0.13 kompilierte und prüfte 24 Fälle und wurde anschließend beendet. Kein Quell-SQF und kein Spielclient wurde ausgeführt. Der Beleg bindet Code-, Parser- und Fixture-Prüfsummen. Der obige Befehl erstellt lediglich ein isoliertes Projekt in einem neuen Ordner und startet keinen Motor.


## Additive Boolean branch family

The block-family selector now offers a separate bounded if/else mapper over existing initialized Boolean locals. Earlier straight-line rules remain unchanged for their own family. See [the EN/FR/DE branch guide](BOOLEAN-BRANCH-MAPPING.md).
