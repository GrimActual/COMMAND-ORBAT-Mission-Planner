# COMMAND — migration coverage and exact integer values

## English

Open **Assets → Arma 3 migration review → Source diagnostics → Export & scaffolds** after completing a Types or Effects review. Existing Settings shortcuts open the same view. Sarge has **Conversion coverage preview** and **Verified exact integer values** topics, with EN/FR/DE guidance.

### Check coverage before exporting

Choose an expression or block family, then **Check expression coverage** or **Check block coverage**. This explicit read-only action runs a bounded worker on the selected captured native review. It opens no save dialog, writes nothing and starts no engine. Search file paths/reasons, filter supported/mixed/manual rows and page through 20 files at a time. Configuration sources remain inventory-only. Counts distinguish expression values from complete isolated blocks. Expression support does not mean parent statements or complete files have been converted.

A matching zero-coverage preview disables that family's helper export even after acknowledgment. Changing source, profile or family discards obsolete coverage; changing language keeps matching results. A native source change/reset also rejects late worker results. Preview and export share the existing single-job guard. Critical export controls are disabled while a job or save is in progress, so the displayed family/profile cannot drift during the operation. Previous reviews, mission JSON, undo and offline planning remain unchanged.

### Exact integer expression helpers

Choose **Expression value family → Exact integer values**, check coverage, choose Scaffold mode and review/confirm the expression-value acknowledgment. Then **Export verified integer expression helpers** adds `Fragments/COMMAND_IntegerFragments.c` and `integer-fragments.json` to a new scaffold folder. Original sources/notices and the manual checklist are retained. Every expression records original UTF-16 source spans, source hashes and output lines. Ordinary scaffold export stays comments-only; the earlier Boolean value/local/branch families remain available.

Accepted: decimal integer literal syntax, unary minus and explicitly grouped `+`, `-` and `*`. Every literal and intermediate result must remain within **−16,777,215 to +16,777,215**, an intentionally conservative exact-integer subset shared by single-precision source values and target integer arithmetic. Source grouping is preserved semantically through fully parenthesized generated operations; redundant numeric-literal parentheses are removed to avoid the Enforce parser's cast ambiguity.

```sqf
private _count = (7 + 2) * 3;
```

This can supply a detached `static int` helper returning 27. The parent private declaration, its inferred type, source function and mission remain manual. Decimals (including `1.0`), exponent/hex forms, division, modulo, variables, comparisons, commands, ungrouped mixed operators and out-of-range intermediates are rejected. A later operation returning into range cannot rescue an earlier out-of-range value. This is not a general numeric transpiler.

The **1.8.0.13 headless diagnostic server** compiled and executed 42 cases checked against independent integer arithmetic. A compiler-detected numeric grouping issue was fixed before the final passing proof; no failed attempt is counted as a pass. The proof binds the current mapper, parser dependencies and fixture hashes. No source SQF or Arma 3 runtime comparison was performed. No game client, Workbench, real entity or public tunnel was used. The server was stopped afterward; peak sampled working set was 667.11 MiB.

Prepare the exact isolated fixture without launching anything or overwriting an existing folder:

```powershell
node tools/boolean-mapping/prepare-integers.cjs "A:/Tests/NewIntegerProject"
```

## Français

Dans **Diagnostic des sources → Export et squelettes**, terminez une analyse Types ou Effets. Les raccourcis des paramètres ouvrent la même vue. Sarge explique l’aperçu de couverture et les entiers exacts en EN/FR/DE.

Choisissez une famille puis vérifiez la couverture des expressions ou blocs. Cet aperçu explicite est en lecture seule : aucun dialogue d’enregistrement, aucune écriture ni lancement de moteur. Recherchez chemins/raisons, filtrez les résultats et parcourez des pages de 20 fichiers. Les configurations restent un inventaire. La couverture des valeurs ne prouve pas la conversion des instructions parentes ou fichiers complets. Un aperçu correspondant sans valeur/bloc pris en charge désactive l’export de cette famille. Changer de source, profil ou famille invalide l’aperçu ; changer de langue conserve le contexte. Les contrôles critiques sont verrouillés pendant les tâches.

Pour les entiers, choisissez **Famille de valeurs d’expression → Valeurs entières exactes**, vérifiez la couverture puis, en mode squelette, confirmez le contexte et exportez les helpers entiers vérifiés. Littéraux entiers décimaux, négation et opérations `+`, `-`, `*` explicitement groupées sont acceptés. Chaque littéral et résultat intermédiaire reste dans ±16 777 215. Décimales, exposants/hexadécimal, division, modulo, variables, comparaisons, commandes et dépassements restent manuels. L’export conserve sources/notices, cartes source/sortie et checklist ; les instructions parentes et missions ne sont pas converties. Les modes précédents restent disponibles.

Le serveur de diagnostic natif 1.8.0.13 a compilé et vérifié 42 cas, puis a été arrêté. Une ambiguïté de parenthèses numériques a été corrigée avant le test final réussi. Aucun SQF source ni client de jeu n’a été exécuté. La commande ci-dessus prépare uniquement une fixture dans un nouveau dossier.

## Deutsch

Unter **Quelltextdiagnose → Export und Gerüste** eine Typen- oder Effektprüfung abschließen. Einstellungen öffnen dieselbe Ansicht. Sarge erklärt Abdeckungsvorschau und exakte Ganzzahlen in EN/FR/DE.

Eine Familie wählen und Ausdrucks- oder Blockabdeckung prüfen. Die ausdrückliche Vorschau ist schreibgeschützt: kein Speicherdialog, keine Dateiausgabe, kein Motorstart. Pfade/Gründe durchsuchen, Ergebnisse filtern und durch Seiten mit je 20 Dateien blättern. Konfigurationen bleiben Inventar. Unterstützte Werte beweisen keine Konvertierung übergeordneter Anweisungen oder vollständiger Dateien. Ohne unterstützte Werte/Blöcke deaktiviert die passende Vorschau den Familienexport. Quellen-, Profil- und Familienwechsel verwerfen die Vorschau; Sprachwechsel behalten passenden Kontext. Kritische Bedienelemente sind während Aufgaben gesperrt.

Für Ganzzahlen **Ausdruckswertfamilie → Exakte Ganzzahlwerte** wählen, Abdeckung prüfen und im Gerüstmodus Kontext bestätigen und verifizierte Ganzzahlhelfer exportieren. Unterstützt sind dezimale Ganzzahlliterale, Negation und explizit gruppierte `+`, `-`, `*`. Jedes Literal und Zwischenergebnis bleibt innerhalb ±16.777.215. Dezimalwerte, Exponenten/Hexadezimalwerte, Division, Modulo, Variablen, Vergleiche, Kommandos und Grenzüberschreitungen bleiben manuell. Quellen/Hinweise, Quell-/Ausgabekarten und Checkliste bleiben erhalten; übergeordnete Anweisungen und Missionen werden nicht konvertiert. Frühere Modi bleiben verfügbar.

Der native Diagnoseserver 1.8.0.13 kompilierte und prüfte 42 Fälle und wurde beendet. Eine Mehrdeutigkeit numerischer Klammern wurde vor dem endgültigen erfolgreichen Test behoben. Kein Quell-SQF oder Spielclient wurde ausgeführt. Der obige Befehl erstellt lediglich eine Fixture in einem neuen Ordner.


## Typed pure function module family

Coverage and helper export now include a separate pure Boolean function-module compiler with explicit params/defaults and closed cross-file calls. External registration and caller/lifecycle integration stay manual. See [the EN/FR/DE guide](TYPED-BOOLEAN-FUNCTIONS.md). Previous families remain unchanged.
