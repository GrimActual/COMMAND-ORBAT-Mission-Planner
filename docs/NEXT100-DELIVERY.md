# COMMAND roadmap development preview

This guide describes `2.9.1-dev.followon.1`. It adds to RC3; it is not a stable-release approval or a whole-mod converter.

## English — install and preserve your work

Keep the published RC3 folder. Extract a later complete package into a separate folder and keep `resources` beside `COMMAND Planner.exe`. Save a plan backup before switching versions. Do not delete or rename the existing application profile to update: its historical internal name is retained for compatibility. The app keeps preferences separately from mission data. A fresh application profile is useful for isolation testing, but does not count as a clean Windows account test.

Open **Settings → Compatibility and limits**. The panel reports the actual desktop package version, last matching scheduling-family receipt, protocol 3 and the current 60-entity cap. It does not connect automatically or claim that your current game/server is compatible. Match the existing Workshop bridge project and advertised order capabilities; the desktop additions here require no Workshop update. An engine update needs new native checks before extending the verified version claim.

Open **Assets → Open source diagnostics**:

1. Expand **Source folder preview**, choose a component folder, search its relative paths and select the source files to inspect. Read the skipped-entry count before reviewing. Only `.sqf`, `.sqm`, `.ext`, `.hpp`, `.inc` and `.cpp` are admitted. Folder preview admits up to 256 supported file names; all four inspectors accept at most 64 checked files and 2 MiB. Larger previews start with no checked files so a subset is never silently chosen. Folder nesting, file count and byte limits reject incomplete captures rather than silently truncating them. Links, version-control/dependency folders and other file types are skipped. Original files are never modified.
2. Choose **Review selected files in all tabs**. Dependencies, Functions, Types and Effects publish together. A cancelled or failed review preserves previous snapshots. Unchanged complete input can reuse existing reports; changing any source or context currently reruns all four passes. Per-file incremental invalidation remains pending.
3. Expand **Resolve source context**, refresh, and inspect missing includes. To include an external shared header, choose its package folder explicitly and use **Choose and add shared headers**. Conflicting identities are rejected. For virtual paths, add an exact prefix and select its captured package folder, then re-review. There is no automatic download or search for missing files. Include connections jump between captured sources; cycle markers are potential cycles because conditional activation is not evaluated by the inventory.
4. Open **Export & scaffolds → Preprocessing and owned jobs**. Compare the original selected entry with the expanded entry. Click a finding to inspect its exact captured source location. Previews are bounded; exported reports retain the full reviewed output.
5. Function-macro review additionally accepts bounded decimal `#if` expressions with parentheses, `defined`, unary `!/+/-`, `+ - * / %`, comparisons and `&& / ||`. Logical evaluation short-circuits. Values and arithmetic results must stay within ±16,777,215. Only explicit decimal literals and declared marker membership are resolved; named macro values, bit operations, ternaries, hexadecimal/octal literals and engine built-ins remain manual. The older marker-only profile is unchanged. Line continuations remain blocked rather than normalized, including continuations in comments or strings. Variadics remain blocked pending an explicit argument/empty-token policy. An independent C-preprocessor fixture comparison does not prove native Arma preprocessing parity.
6. **Save review preferences** saves only profile choices, marker names and polling controls locally. It does not store source code, source paths, source identities, mission data, Scaffold mode or approval consent.
7. In Scaffold mode, select a current Types/Effects review and **Preview generated project**. Inspect individual files before exporting. Preview writes nothing and starts no jobs. Export still requires the existing ownership/policy acknowledgment. Keep each job instance, call `Begin(owner)` explicitly, call `Cancel()` during owner/session teardown, and inspect `GetStatus()` before reading `GetResult()`. Export adds per-job INTEGRATION.md, a manual ownership pattern outside Scripts/Game, and Validate-GeneratedProject.ps1. Run that helper yourself with the diagnostic executable path after opening local Steam at the Library; it uses an isolated temporary profile and never launches the game client. The helper itself is not native validation evidence; inspect its compilation logs. The ownership example is not a registered or natively compiled component. Existing terminal states distinguish completion, cancellation, owner deletion and timeout. A bounded wait changes unbounded source scheduling semantics.

Asset search now recognizes category synonyms. Type choices show counts for the current query, faction and variant controls. Infantry and armour remain exclusive family filters. Naval and support-vehicle categories are catalog hints; neither rewrites prefabs nor verifies spawn availability.

Public source/release checks reject private export folders, common secret/binary inputs, embedded source-package evidence and private corpus records. They do not replace a human review of release contents. Exporting your own local source review does not upload it anywhere. Public examples and regression fixtures must remain original and neutral.

## Français — parcours rapide

Conservez RC3 et sauvegardez votre plan. Installez la nouvelle version dans un autre dossier complet ; ne supprimez pas le profil utilisateur pour mettre à jour. **Paramètres → Compatibilité et limites** affiche la version et les limites vérifiées des adaptateurs, pas la compatibilité de votre session de jeu actuelle.

Dans **Diagnostic source**, ouvrez **Aperçu du dossier source**, choisissez un composant, filtrez les chemins relatifs et cochez les fichiers. Les quatre analyses sont publiées ensemble. Dans **Résoudre le contexte source**, ajoutez explicitement les en-têtes partagés et les montages virtuels puis réanalysez. Les liens des inclusions donnent accès aux sources sélectionnées ; les cycles indiqués restent potentiels.

Dans **Export et squelettes**, comparez l’original à l’expansion et cliquez sur un résultat pour voir sa source capturée. Les conditions numériques bornées acceptent uniquement les décimaux, marqueurs déclarés et opérateurs documentés. Les constantes nommées, fonctions moteur, arguments variadiques et continuations restent manuels. Aucune parité native Arma n’est revendiquée. Les préférences locales ne conservent ni source ni consentement. L’aperçu du projet généré n’écrit rien et ne lance aucune tâche. Vérifiez propriétaire, annulation, timeout et compilation native avant intégration.

## Deutsch — Kurzablauf

RC3 behalten und den Plan sichern. Die neue vollständige Version in einen anderen Ordner entpacken; das Benutzerprofil beim Aktualisieren nicht löschen. **Einstellungen → Kompatibilität und Grenzen** zeigt Paketversion und geprüfte Adaptergrenzen, nicht die Kompatibilität der aktuellen Spielsitzung.

In **Quelltextdiagnose → Quellordnervorschau** einen Komponentenordner wählen, relative Pfade suchen und Dateien markieren. Alle vier Prüfungen werden gemeinsam veröffentlicht. Unter **Quellkontext auflösen** gemeinsame Header und virtuelle Zuordnungen explizit hinzufügen und erneut prüfen. Include-Verbindungen öffnen erfasste Quellen; angezeigte Zyklen bleiben mögliche Zyklen.

Unter **Export und Gerüste** Original und Expansion vergleichen und Befunde zur erfassten Quelle verfolgen. Begrenzte numerische Bedingungen unterstützen nur die dokumentierten Dezimalwerte, Marker und Operatoren. Benannte Makrowerte, Engine-Built-ins, variadische Argumente und Zeilenfortsetzungen bleiben manuell. Keine bestätigte native Arma-Präprozessorparität. Lokale Prüfungseinstellungen speichern weder Quellen noch Zustimmung. Die Projektvorschau schreibt nichts und startet keine Aufgaben. Eigentümer, Abbruch, Timeout und native Kompilierung vor der Integration prüfen.

## Verified boundaries and integration matrix

| Area | Current boundary | Additional acceptance required |
| --- | --- | --- |
| Desktop diagnostics | Offline selected-source analysis and review only | Large-source and desktop regression checks for changes |
| Native scheduling | Matching family receipt for engine 1.8.0.13; 24 lifecycle cases | Compile each generated project and wire explicit owner lifetime |
| Typed pure helpers | Existing supported bool/int/string subset and family receipts | Validate the selected emitted source in its intended project |
| Live tracking | Protocol 3; shared cap of 60 authorised entities | Mixed human/AI multiplayer and lifecycle acceptance |
| Game orders | Advertised `ai-orders-v1` and `ai-tactical-v1`; bridge-owned targets | Host approval and engine-side ownership checks remain mandatory |
| Generated placement | Reviewed GUID/path/addon provenance and terrain context | Loaded-addon/world validation and host approval |
| PBO/WRP | Inventory and identity context only | No binary terrain conversion is claimed |

| Workbench module | COMMAND handoff | Manual integration boundary |
| --- | --- | --- |
| World Editor | Reviewed placement intent and source-linked metadata | World assembly, terrain building and scenario integration |
| Script Editor | Supported generated helpers, job classes and source maps | Selected-project compilation, ownership and lifecycle binding |
| Resource Manager | Resource indexes and explicit GUID/path/addon provenance | Import/reimport, dependency availability and resource validation |
| Particle Editor | Requirements and unresolved source effects | Rebuild particle assets and behavior |
| Animation Editor | Asset identity/requirements only | Rigging, animation graphs and asset authoring |
| Audio Editor | Explicit event/asset/authority requirements | Native sound resources, mixer/event wiring and playback checks |
| Behavior Editor | Verified supported order adapters only | New AI semantics, behavior-tree wiring and navigation validation |
| Procedural Animation Editor | Requirements only | Procedural movement authoring and validation |
| String Editor | Locale/key/fallback requirements | Native string-table creation, references and localization validation |
| Layout Editor | UI action/widget/locality requirements | Native layouts, callbacks, focus/input and widget lifetime |

Localization adapters must declare stable source keys, target locale/key identity, fallback rules, missing-key diagnostics and ownership of translated text. Do not invent native string resource paths from source labels.

Audio adapters must declare the target native event/resource, owner entity, spatial playback policy, authority/locality, start/stop lifetime and dependency availability. A legacy sound filename alone is not a native event binding.

UI action adapters must declare action identity, intended input context, widget owner, focus rules, registration/removal lifetime and authority. A legacy addAction callback is not directly interchangeable with an Enfusion layout/action binding.

Multiplayer integration uses explicit server authority and reviewed targets. An original neutral example is a host-approved spawn request that names an indexed prefab, receives a request/group identity, and permits later orders only against that bridge-owned group. Never infer ownership from matching display names. Runtime tracking, approval and request results stay outside mission JSON and editor Undo.

## Future 120-player compatibility proposal

The current contract rejects more than 60 entities; it is not increased by this document. A future extension must negotiate sender/relay/desktop capacity before accepting a larger roster, retain stable IDs and authoritative allowlists, distinguish full snapshots from deltas/heartbeats, and recover explicitly after sequence gaps. Older protocol-3 peers must keep their present cap. Select a new negotiated capability or protocol version only after 120-entity server and desktop measurements. Do not silently split a larger authoritative roster into ambiguous partial snapshots. Mixed-player, connection and packet-loss acceptance remains pending.

## Rebuild an asset index for your own addon

Use tools/vanilla-assets/README.md as the read-only extraction walkthrough. Open its separate extraction project in Workbench with the relevant installed addon directories; do not republish that tool as the bridge. Run the documented ResourceManager plugin with an isolated profile and local Steam already open. Feed the complete diagnostic log into build-catalog.cjs, then review the generated catalog/index through the desktop importer. Never invent GUIDs or treat folder classification as native spawn proof. Mod authors must supply their own resource namespace/dependency context; the bundled vanilla snapshot is not a modded-asset index.

### Asset browser organization — 16 October 2026

Complete-vehicle filters now exclude vehicle components, wrecks and base templates. These technical entries have separate categories and remain hidden by default; selecting a technical category enables their visibility. Props and structures take precedence over imported vehicle icon hints. Existing resource identities and assigned-unit snapshots are unchanged. Sarge and French/German guidance describe the filters. Classification remains a catalog hint, not proof of native spawnability.

Validation: six browser tests and three localization tests passed. An isolated offline Electron fixture passed vehicle/part separation, technical-category visibility, locale switching and unchanged mission data with no page errors. On the same 2,721-entry vanilla catalog, the default vehicle list narrowed from 570 to 198 candidates. The short local classification/filter measurements are recorded in docs/test-evidence/asset-browser-organization.json; they are not sustained-performance or native-spawning certification.
