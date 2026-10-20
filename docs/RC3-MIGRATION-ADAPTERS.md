# COMMAND — RC3 migration adapters

## English

Unpack the whole Windows ZIP into a new folder and open **COMMAND Planner.exe**. Keep its `resources` folder alongside it. Existing saved plans remain compatible. A new Workshop upload is not required for these desktop diagnostics; reviewed game deployment still requires the matching existing bridge and separate in-game host approval.

### Preprocessing to fresh review

1. Open **Source diagnostics** through Assets or Settings. Capture the source package in Dependencies, Functions, or all four inspectors. Include only the source/header files you explicitly want inspected and declare virtual mounts when needed.
2. Open **Export & scaffolds → Preprocessing and owned jobs**. Refresh sources, choose the source review and entry, and list any known closed-set markers.
3. Choose **Review function-style preprocessing**. This subset supports single-line selected object/function definitions, nested arguments, identifier token concatenation, identifier-only stringification, explicit includes and bounded marker conditions. Macro names are case-sensitive.
4. Missing headers/mounts, recursion, conflicting definitions, variadics, empty arguments, single-quoted preprocessing, line splicing, reserved built-ins and broader conditional expressions remain explicit blockers. No files are discovered or downloaded automatically.
5. Export the diagnostic report, or **Export expanded source review package** after a successful expansion. The fresh package contains only the chosen derived entry, an origin report and complete selected-source copies with an index. Original files are unchanged; retain their licences. Load `source-package.json` for fresh inspection. Its hashes describe derived text, not the original input.

SQF entries can receive all four desktop reviews. CPP/INC still use the dependency/function inspection path. Expansion is not proof of native Arma 3 preprocessing parity, source runtime equivalence or complete mod conversion. Conditional contexts must be reviewed explicitly.

### Explicit owned job scaffolds

Complete a Types or Effects review. Choose **Scaffold mode**, open **Preprocessing and owned jobs**, select the matching review, choose the poll interval/attempt limit and acknowledge owner lifetime and policy. Then export the owned-job scaffolds.

Supported entry shapes are deliberately narrow:

```sqf
[] spawn { sleep 0.25; ["done"] call DEMO_fnc_result; };
[] spawn { waitUntil { [true] call DEMO_fnc_ready }; ["ready"] call DEMO_fnc_result; };
```

The called functions must be uniquely selected, supported pure scalar functions with literal arguments. Captures, script-handle use, additional side effects, engine predicates and arbitrary scheduling remain manual.

Export includes a fresh `addon.gproj`, `Scripts/Game/COMMAND_MigrationJob.c`, generated job classes, the closed scalar helper module, source maps, a checklist and native-family evidence. Open addon.gproj in Workbench to compile the isolated generated project. Nothing starts automatically. In your integrating component, retain the generated job, call its `Begin(owner)` explicitly and call `Cancel()` during component/session teardown. Inspect status before reading its result. Delays use world-time deadlines; readiness is a separate bounded polling mode. Restart invalidates stale generations, and cancellation removes only that instance’s callback. Owner deletion prevents the action from running.

Bounds: literal delays 1–600000 ms, poll intervals 100–60000 ms and 1–128 attempts. Timeout is a reviewed policy change from an unbounded SQF wait. Native 1.8.0.13 passed 24 lifecycle checks, including no early completion, cancellation isolation, restart, owner deletion, readiness transitions and bounded timeout. Arbitrary selected output is still marked as requiring its own native compilation and manual lifecycle wiring.

### Imported units to game review

Map legacy classes to reviewed prefab identities, prepare the mission draft, review terrain placement and add the selected units to the plan. Choose an **Imported deployment batch** and **Review imported batch for deployment**. COMMAND selects the imported IDs and installs their reviewed index in the existing deployment preview. Up to 60 imports are split into explicit groups of at most 16.

Review heading and placement before exporting or sending. The existing game-side adapter validates the exact prefab resource and coordinates; each game request still needs host approval. Native movement/defend/hold/cancel controls retain their existing capability and bridge-owned group restrictions. Selection changes invalidate an old deployment review. Mission edits and Undo invalidate the import handoff. The handoff is session-only and does not add runtime state to mission JSON or Undo history.

Faction/type planning labels do not rewrite prefabs. Legacy group structure, vehicle crews, behaviour and proposed route timing are not inferred or automatically executed. This is a connected review workflow for supported literal placement, not a general SQF game-command compiler.

## Français

Décompressez entièrement le ZIP dans un nouveau dossier, puis ouvrez **COMMAND Planner.exe** en conservant `resources` à côté. Les plans existants restent compatibles. Aucune nouvelle publication Workshop n’est nécessaire pour ces diagnostics ; le déploiement en jeu utilise toujours le pont existant et l’approbation séparée de l’hôte.

Dans **Diagnostic source → Export et squelettes → Prétraitement et tâches liées à un propriétaire**, actualisez les sources, choisissez l’analyse et le fichier d’entrée, puis déclarez les marqueurs connus. Analysez les macros. Le sous-ensemble accepte définitions sélectionnées sur une ligne, arguments imbriqués, concaténation d’identifiants, conversion d’un identifiant en chaîne, inclusions explicites et conditions bornées. En-têtes absents, récursion, variantes non prises en charge et contexte externe restent bloqués.

Après expansion, exportez l’analyse ou un nouveau paquet à vérifier. `source-package.json` contient uniquement l’entrée dérivée ; rapport d’origine et copies complètes des sources sélectionnées sont conservés. Les originaux sont inchangés. Une nouvelle analyse est obligatoire. SQF peut utiliser les quatre inspecteurs ; CPP/INC restent sur le parcours Dépendances/Fonctions. Aucune parité avec le préprocesseur Arma 3 ni conversion complète de mod n’est revendiquée.

Pour les tâches liées, terminez une analyse Types/Effets, choisissez le mode squelette et vérifiez propriétaire, intervalle et nombre maximal de tentatives. Les blocs `[] spawn` acceptés contiennent un délai littéral ou un appel pur de disponibilité, puis un appel scalaire pur sélectionné avec arguments littéraux. Les captures et commandes moteur restent manuelles. Rien ne démarre automatiquement : conservez l’instance, liez son propriétaire et appelez `Cancel()` lors du nettoyage du composant/de la session. Délais : 1–600000 ms ; vérifications : 100–60000 ms, 1–128 tentatives. Le timeout borné modifie l’attente source illimitée et exige votre revue. Le moteur 1.8.0.13 a passé 24 vérifications de cycle de vie ; votre sortie nécessite encore sa compilation native et son intégration.

Après l’ajout des unités importées au plan, choisissez un lot et ouvrez sa vérification de déploiement. Jusqu’à 60 unités sont réparties en lots de 16 maximum. IDs et provenance des prefabs sont conservés. Vérifiez orientation et emplacement ; chaque envoi exige l’approbation de l’hôte en jeu. Changement de sélection : ancienne revue invalidée. Modification de mission ou Annuler : transfert invalidé. Groupes historiques, équipages, comportements et chronologie des routes proposées restent manuels. Sarge et Paramètres ouvrent les mêmes espaces.

## Deutsch

Das gesamte ZIP in einen neuen Ordner entpacken und **COMMAND Planner.exe** mit dem benachbarten `resources`-Ordner starten. Vorhandene Pläne bleiben kompatibel. Für diese Desktopdiagnose ist kein neuer Workshop-Upload nötig; Spielbereitstellung nutzt weiterhin die vorhandene Bridge und separate Hostzustimmung.

Unter **Quelltextdiagnose → Export und Gerüste → Vorverarbeitung und eigentümergebundene Aufgaben** Quellen aktualisieren, Prüfung und Einstieg wählen und bekannte Marker deklarieren. Der begrenzte Makropfad unterstützt ausgewählte einzeilige Definitionen, verschachtelte Argumente, Identifikatorverkettung, Identifikator-Stringifizierung, explizite Includes und begrenzte Bedingungen. Fehlende Header, Rekursion, nicht unterstützte Varianten und externer Kontext bleiben gesperrt.

Nach Expansion den Bericht oder ein neues Quellprüfungspaket exportieren. `source-package.json` enthält nur den abgeleiteten Einstieg; Ursprungsbericht und vollständige ausgewählte Originalquellen bleiben erhalten. Originaldateien werden nicht geändert. Die abgeleitete Quelle muss neu geprüft werden. SQF kann alle vier Inspektoren nutzen; CPP/INC verbleiben bei Abhängigkeiten/Funktionen. Keine bestätigte Arma-3-Präprozessorparität oder vollständige Modkonvertierung wird behauptet.

Für gebundene Aufgaben zuerst Typen/Effekte prüfen, Gerüstmodus wählen und Eigentümer, Intervall und Versuchslimit bestätigen. Unterstützte `[] spawn`-Blöcke enthalten eine literale Verzögerung oder einen reinen Bereitschaftsaufruf, gefolgt von einem ausgewählten reinen skalaren Aufruf mit Literalargumenten. Captures und Motorbefehle bleiben manuell. Kein automatischer Start: Instanz halten, Eigentümer binden und beim Komponenten-/Sitzungsabbau `Cancel()` aufrufen. Verzögerung: 1–600000 ms; Prüfung: 100–60000 ms, 1–128 Versuche. Der begrenzte Timeout ändert das unbegrenzte Quellwarten und muss geprüft werden. Motor 1.8.0.13 bestand 24 Lebenszyklusprüfungen; die jeweilige Ausgabe braucht weiterhin native Kompilierung und Integration.

Nach dem Import von Einheiten einen Bereitstellungsstapel wählen und prüfen. Bis zu 60 Einheiten werden in Stapel von höchstens 16 geteilt. IDs und Prefab-Herkunft bleiben erhalten. Richtung und Platzierung prüfen; jede Spielanfrage benötigt Hostzustimmung. Auswahlwechsel machen die alte Bereitstellungsprüfung ungültig. Missionsänderungen oder Rückgängig machen die Übergabe ungültig. Historische Gruppen, Besatzungen, Verhalten und Routenzeitabläufe bleiben manuell. Sarge und Einstellungen öffnen dieselben Arbeitsbereiche.
