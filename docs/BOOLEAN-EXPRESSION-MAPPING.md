# First native-verified expression mapping: pure Booleans

## English

Open **Assets → Arma 3 migration review → Open source diagnostics**. Select the example `Examples/boolean-fragments-source-package.json` in **Types & initialization** or **Effects** and run that review. Open **Export & scaffolds**, choose **Scaffold mode (comments only)** and the matching source review. Read and tick **I reviewed effective source preprocessing and understand that green applies only to expression values**, then **Export verified Boolean expression helpers**. Choose a parent folder. Settings' diagnostic export shortcut opens the same view; Sarge has the matching new topic.

This is a separate opt-in export action. Ordinary **Export comment-only scaffold folder** remains entirely comments-only, even if the acknowledgment is checked. Review mode is still the default. No source script or generated code runs in COMMAND, no game action is sent and no plan/Undo/live state is edited.

### Exact mapping scope

`command-pure-boolean-v1` accepts only Boolean literals `true`/`false`, NOT (`!`/`not`), explicit groups and AND/OR (`&&`/`and`, `||`/`or`). A binary operand must be a literal or an explicit group; a unary operand must be a literal or explicit group. Thus `(true and false) or (not false)` is supported, while `true and false or true`, `!true and false` and ungrouped repeated NOT are rejected. The target is rendered from the existing parsed expression tree using fixed, fully parenthesized target operators. No user source text is evaluated or pasted as executable code.

Variables, engine commands, equality, numbers, strings, arrays, code-valued operands, callbacks, scheduling and assignments are outside this family. The map does not declare or initialize the original variable. A pure value found inside a stored/unsupported context can be extracted, but that context is never invoked or marked migrated. Selected preprocessing directives block all Boolean extraction. External defines/includes and effective source context still require the explicit developer review; COMMAND does not certify external preprocessing.

Source rationale: Bohemia documents Boolean [AND and its code-valued alternative](https://community.bohemia.net/wiki/and), [Boolean OR](https://community.bohemia.net/wiki/or), [source operators](https://community.bohemia.net/wiki/Operators) and [target operators](https://community.bistudio.com/wiki/Arma_Reforger:Scripting:_Operators). Some direct pages returned HTTP 403; available primary indexed text was used alongside the retrieved AND page. This family excludes code-valued alternatives and all effects, so eager/short-circuit differences do not change observable Boolean results in the accepted literal-only subset. There was no Arma 3 runtime comparison.

### Output and meaning of green

The normal handoff files, original source copies, source notices and yellow/red parent-node checklist remain. The optional export adds:

- `Fragments/COMMAND_BooleanFragments.c`: a typed `bool` helper library with generic `Value_0001` methods. These are extracted values, not inferred source function signatures. Callers must be integrated manually; no startup hook is emitted.
- `boolean-fragments.json`: expression slot/node IDs, exact UTF-16 source locations and decoded UTF-8 source hashes, generated method line ranges, unresolved expression slots, proof receipt and engine version.
- An optional fragment summary in `manifest.json` and guidance in the checklist. The existing whole-statement `summary.green` stays zero.

**Green means only native-verified pure expression values.** It does not mean the parent assignment, function, loop, callback, source module or mission has been converted. The demo extracted three green expression fragments and retained an unresolved command slot, with zero green statements and zero execution-ready missions. Review source rights and preserve OriginalSources/notices before redistribution. Compile/integrate the final helper in the intended target project; a primitive mapping proof is not whole-project compatibility.

The bundled receipt is tied to the normalized mapping module and deterministic native fixture hash. A mapping mismatch locks verified export. It is local build/test evidence, not a signed attestation or deployment credential. Native proof is for engine 1.8.0.13; the target project's version/integration remains a required review. The existing 32 MiB bundle and 64 MiB output caps include optional helper output. New exports use a fresh subfolder and never overwrite existing files.

## Français

Inspectez l’exemple dans **Types et initialisation** ou **Effets**, puis **Export et structures → Mode structure**. Confirmez le contexte effectif et cliquez **Exporter les helpers booléens vérifiés**. Le bouton de structure ordinaire reste limité aux commentaires. Le mode revue est le choix initial.

Seuls true/false, NON et ET/OU explicitement groupés sont pris en charge. Variables, commandes, code, types non booléens, groupements ambigus et directives sélectionnées sont refusés. Le vert concerne uniquement les valeurs pures ; aucune instruction parente, fonction, boucle ou mission n’est convertie. La bibliothèque bool et sa carte source nécessitent une intégration manuelle. Aucune exécution source, action de jeu ni modification de mission. Préservez les copies et mentions source. Le serveur de diagnostic 1.8.0.13 a validé 46 cas ; le plantage Workbench n’est pas compté comme succès. Paramètres et Sarge sont à jour.

## Deutsch

Das Beispiel unter **Typen und Initialisierung** oder **Effekte** prüfen, dann **Export und Gerüste → Gerüstmodus**. Wirksamen Quellkontext bestätigen und **Verifizierte boolesche Ausdruckshelfer exportieren** wählen. Der normale Gerüstexport bleibt ausschließlich kommentiert. Standard ist der Prüfmodus.

Nur true/false, NICHT und explizit gruppierte UND/ODER-Ausdrücke werden unterstützt. Variablen, Kommandos, Codewerte, andere Typen, mehrdeutige Gruppierung und ausgewählte Direktiven werden abgelehnt. Grün gilt nur für reine Werte; übergeordnete Anweisungen, Funktionen, Schleifen und Missionen sind nicht konvertiert. Bool-Bibliothek und Quellkarte müssen manuell integriert werden. Keine Quellausführung, Spielaktion oder Missionsänderung. Originalkopien und Hinweise erhalten. Der Diagnoseserver 1.8.0.13 bestätigte 46 Fälle; der Workbench-Absturz gilt nicht als Erfolg. Einstellungen und Sarge sind aktualisiert.

## Native evidence and limitations

Workbench crashed at **Workbench Create Game**, before any mapping test result, with an access violation and co-occurring shader-cache warnings. This does not identify the root cause or establish a source compilation pass. It was not repeatedly relaunched. No crash report was manually submitted; the engine log reported its own automatic crash analytics.

The same generated 46-case fixture was then compiled/executed as Game scripts in the actual **ArmaReforgerServerDiag 1.8.0.13**, using isolated EmptyEden. All 46 results matched the expected Boolean truth tables; there were no script errors, spawned entities, real players, public tunnel or game-client launch. Sampled peak working set was 667.88 MiB against a 1,200 MiB sampled bound. The process stopped afterward. Workbench verification remains failed/unproven; the successful evidence is the headless diagnostic server, not a JavaScript mock. See `docs/test-evidence/pure-boolean-native.json` and the reproducible fixture tool in `tools/boolean-mapping`.

42 unique new/affected local cases passed, plus a focused real-worker follow-up after output scope/budget labels changed. Tests cover the Boolean family/rejections, native receipt identity, source/preprocessor mismatch, fragment/parent scope separation, source maps, non-overwriting output, bounded optional output, reproduction, existing exports, parser behavior, localization, routes and lifecycle. The packaged app passed opt-in gating, ordinary comments-only behavior, macro rejection, source notices/maps, EN/FR/DE retention, narrow layout, Sarge destination and unchanged mission/source data. Only native file dialogs were substituted. Evidence: `docs/test-evidence/boolean-fragments-desktop.json`.

One demo export took about 162 ms click-to-saved including automation, worker and disk output; this is not universal timing. The matched short 400-marker sample is in `boolean-mapping-performance.json`, compared with the retained diagnostic-export baseline without rerunning that completed baseline. No native launches are performed by the normal app or CI.

Development executable: `A:/Everon-ORBAT-Development/work/boolean-mapping/COMMAND-Boolean-Mapping-Candidate/COMMAND Planner.exe`. Existing dev.gm.8 runtime/version label is retained; this is a development checkpoint, not a public release or Workshop update. Earlier candidates remain available. Future families still need their own source/type/context proof and native tests.

The acknowledgment is bound to the selected native review identity. A different source review or profile clears it; language changes retain it when the identity still matches. The native handler rejects stale identities before opening an export dialog. A focused packaged-app check confirmed both transitions and explicit UTF-16/decoded-UTF-8 source-map metadata.

Hosted checks passed on Ubuntu 24.04 / Node 24 and Windows 2022 / Node 22 for final scope-gate source `13250c2c780bc0e917d38f3d3745c84cbc5a58ec`: [run 38795208660](https://github.com/GrimActual/COMMAND-ORBAT-Mission-Planner/actions/runs/38795208660). CI does not launch native tools or claim a Linux GUI test. The short 400-marker offline sample measured median/p95 16.7/16.8 ms, maximum 33.22 ms, no frame above 100 ms, two tiles and unchanged mission data. Approximate renderer heap was 19.3 MB; these single-run metrics do not prove a causal speedup or sustained FPS. The prior completed export sample is retained as the comparison, not repeated.


## Additive Boolean local block export

The separate opt-in local-block export now supports complete flat initialized Boolean locals, reads and assignments, with an explicit final result. Previous mode descriptions remain valid for their own formats. See [the EN/FR/DE local-block guide](BOOLEAN-LOCAL-MAPPING.md). No general SQF-to-Enforce conversion is claimed.
