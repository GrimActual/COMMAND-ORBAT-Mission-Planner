# Initialization paths and source symbol provenance

This is advisory analysis inside **Source diagnostics → Types & initialization → Initialization paths (advisory)**. It does not prove runtime initialization, infer native types or authorize code generation.

## English

Capture a Types source review or review a source package in all four tabs. Expand the advisory panel, refresh context and choose **Analyze initialization paths**. The pass runs in a bounded background worker over the native-owned captured report; it does not read more files, run SQF or touch mission state.

Disk edits after capture are not watched. Capture sources again to inspect a changed revision; an existing report remains tied to its captured hashes.

Use the row selector to inspect possible uninitialized locals, all reviewed reads, manual effect barriers, symbol identities or nested `forEach` scopes. Source buttons jump to the matching captured file and line. Search includes names, source paths and symbol IDs; results are paged.

For the supported subset, literal writes on both arms of a branch can cover a later read. A missing arm retains the incoming path. Writes only inside a loop do not establish initialization after a loop that may execute zero times. Unknown values, calls, unsupported expressions, code-form loop execution and control transfers remain conservative barriers. Parameters, dynamic scope and detached callback bindings remain manual. Constant conditions are not used to prove general reachability. Warnings after a barrier are review candidates, not proof that the source has a bug.

`written-on-all-reviewed-paths` is a source-path candidate classification, not a runtime or target-language guarantee. The original Types report still states that general definite initialization is unproved. The optional advisory result has its own versioned schema, keeps `runtimeVerified`, `targetTypesResolved` and `loweringAuthorized` false, and is not an importable execution contract.

Symbol IDs use SHA-256 over the exact decoded source-file revision, relative path, canonical source name, declaration span, kind and lexical source-scope position. They remain stable when unrelated files are added or selection order changes. Editing the owning source revision deliberately changes its identities. Different declarations with the same global name keep separate provenance; no runtime winner is invented. These IDs are neither signatures nor Enfusion resource GUIDs and confer no authority.

Nested `forEach` bodies expose separate body/parent scope candidates and revision-bound identities for implicit array-iteration names. The actual iterable type and entry values remain unresolved. `_x` and `_forEachIndex` are **array-iteration candidates**, not a promise that a dynamic or HashMap iterator has array semantics. Outer lexical candidates are retained; detached caller context is never silently inferred. Bohemia documents the array iteration variables in [Control Structures](https://community.bistudio.com/wiki/Control_Structures?useskin=vector) and the target syntax differences in [From SQF to Enforce Script](https://community.bistudio.com/wiki/Arma_Reforger%3AFrom_SQF_to_Enforce_Script).

**Export local initialization review** writes a new JSON file only after your save selection. It contains captured source names, hashes, locations and findings. It is not uploaded. Keep reports for private projects out of public repositories and evidence; the distribution gate rejects captured review-report schemas under public evidence. Clearing or replacing Types context invalidates the advisory view and export. Saved plans, Undo and live bridge state are unchanged.

Limits: existing Types source budgets still apply (64 files / 2 MiB for the shared review). The advisory pass additionally bounds visits, nested traversal, loop checks, symbols and output to 16 MiB. A rejected analysis leaves the captured Types review intact.

## Français

Dans **Diagnostic source → Types et initialisation → Chemins d’initialisation (indicatifs)**, actualisez le contexte capturé puis lancez l’analyse. Elle utilise un worker borné, n’exécute aucune source et ne modifie pas la mission.

Choisissez les lectures possiblement non initialisées, toutes les lectures, les effets manuels, les identités de symboles ou les portées `forEach`. Les liens ouvrent le fichier et la ligne capturés. Les deux branches peuvent établir une écriture littérale ; une boucle peut s’exécuter zéro fois. Appels inconnus, paramètres, valeurs inconnues et contextes dynamiques restent à revoir. Un avertissement ne prouve pas un défaut du script et n’autorise aucune génération native.

Les identités sont liées à la révision exacte du fichier et à sa portée source. Elles ne changent pas si un fichier sans rapport est ajouté, mais changent avec leur propre révision. Elles ne sont ni des signatures ni des GUID moteur. Les noms implicites des boucles restent des candidats pour tableaux ; le type itérable réel n’est pas résolu.

L’export JSON est local, contient noms/empreintes/emplacements capturés et n’est pas téléversé. Les rapports de projets privés doivent rester privés. Effacer ou remplacer l’analyse Types invalide cette vue et son export ; les plans et Annuler restent inchangés.

## Deutsch

Unter **Quelltextdiagnose → Typen und Initialisierung → Initialisierungspfade (Hinweise)** den erfassten Kontext aktualisieren und analysieren. Die begrenzte Hintergrundprüfung führt keinen Quelltext aus und verändert keine Mission.

Wählen Sie mögliche uninitialisierte Lesezugriffe, alle Lesezugriffe, manuelle Effektbarrieren, Symbol-IDs oder `forEach`-Bereiche. Verweise öffnen die erfasste Datei und Zeile. Beide Zweige können eine Literalzuweisung etablieren; eine Schleife kann nullmal laufen. Unbekannte Aufrufe, Parameter, Werte und dynamische Kontexte bleiben manuell. Ein Hinweis beweist keinen Skriptfehler und erlaubt keine native Generierung.

IDs sind an genaue Dateirevision und Quellbereich gebunden. Unabhängige zusätzliche Dateien ändern sie nicht; Änderungen der eigenen Revision schon. Sie sind weder Signaturen noch Engine-GUIDs. Implizite Schleifennamen bleiben Arraykandidaten; der tatsächliche iterierte Typ ist ungeklärt.

JSON-Export erfolgt nur lokal und enthält erfasste Namen, Hashes und Positionen. Private Projektberichte müssen privat bleiben. Löschen oder Ersetzen der Typenprüfung macht Ansicht und Export ungültig; Pläne und Rückgängig bleiben unverändert.

Unresolved control transfers or unknown effects taint the remainder of that captured source context. Later literal assignments do not restore an all-path claim; those reads remain manual. This can be deliberately conservative.
