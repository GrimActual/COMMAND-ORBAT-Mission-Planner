# COMMAND control pilot — 2.9.1-dev.followon.7 / bridge 0.11.0

This development pair adds reviewed squad transport, independent vehicle routes, bounded convoy pursuit, native treatment of one wounded squad member, and server-side COMMAND scenario save/review/restore. Building door metadata was assessed read-only; building entry is not enabled.

Keep older packages. Close the current Companion, extract the entire new desktop ZIP into a new folder and run COMMAND Planner.exe there. Back up existing mission JSON before switching builds. Existing settings and autosave use the same application profile. Start a fresh GM-enabled pairing with the matching bridge project. Older bridge capabilities keep unsupported controls disabled; no startup auto-connect or auto-restore is added.

The new bridge project uses the existing Workshop identity 6A969EB0C5012BB9. Its project ZIP is a source/Workbench package; Workshop publication remains a separate administrator action. Do not load two projects with the same addon identity. Server snapshots are written by the running bridge under its server profile, not by direct desktop filesystem access. See SERVER-SCENARIO-SNAPSHOTS.md for the supported package and two-stage approved restore.

Native isolated diagnostics verified actual boarding/dismounting and partial recovery; vehicle arrivals, timeout and cancellation; moving-leader convoy pursuit, cycle rejection, detach, expiry and pairing shutdown; native treatment with a real consumed bandage, healthy-target rejection, timeout, cancellation and preservation of a foreign waypoint; and snapshot writes plus restoration after process restart. Desktop checks verified offline workflows, reviews, exact identities, localization/help and unchanged mission data.

Integrated regression: 877 passed, zero failed, one skipped because an independent C preprocessor was unavailable. The matched short offline 60-marker/25-tile sample measured p95 16.8ms in both prior and candidate, with no >100ms stalls and stable DOM. This is not sustained, mixed-human, multiplayer, combat or universal performance certification. No speedup is claimed. Connected-player protection uses current native ownership/control checks; actual connected-human acceptance remains an external gate.

Read SQUAD-TRANSPORT-PILOT.md, VEHICLE-ROUTE-DEVELOPMENT.md, SQUAD-TREATMENT-PILOT.md and SERVER-SCENARIO-SNAPSHOTS.md before live testing. Native AI and terrain can prevent travel or treatment. Installation acknowledgements for formations, follow and convoy are not arrival or combat guarantees. Review results and use separate cancellation/detach commands.

## Français

Ce couple de développement ajoute transport d’escouade, itinéraires de véhicules, poursuite en convoi limitée, soins natifs d’un membre blessé et sauvegarde/vérification/restauration de scénarios COMMAND sur le serveur. Les métadonnées de portes ne permettent pas encore l’entrée dans les bâtiments.

Conservez les anciens paquets. Fermez Companion, extrayez tout le nouveau ZIP dans un autre dossier et lancez son EXE. Sauvegardez vos missions JSON. Démarrez un nouveau jumelage GM avec le pont compatible ; aucun jumelage ni restauration automatique au démarrage. Le projet du pont doit être publié séparément sur Workshop par l’administrateur. Ne chargez pas deux projets portant le même identifiant.

Les contrôles locaux ont vérifié des résultats natifs réels et les interfaces hors ligne. Les tests avec joueurs connectés, le multijoueur soutenu et le combat restent à faire. Consultez les guides du transport, des véhicules, des soins et des scénarios serveur. La navigation et les conditions natives peuvent empêcher une demande d’aboutir.

## Deutsch

Dieses Entwicklungspaar ergänzt Truppentransport, eigene Fahrzeugrouten, begrenzte Konvoiverfolgung, native Behandlung eines verwundeten Gruppenmitglieds sowie serverseitiges Speichern, Prüfen und Wiederherstellen von COMMAND-Szenarien. Türmetadaten schalten keinen Gebäudeeintritt frei.

Alte Pakete behalten. Companion schließen, das vollständige neue ZIP in einen anderen Ordner entpacken und dessen EXE starten. Missions-JSON sichern. Neue GM-Kopplung mit passender Bridge starten; keine automatische Verbindung oder Wiederherstellung beim Start. Der Bridge-Projektordner muss separat vom Administrator im Workshop veröffentlicht werden. Keine zwei Projekte mit gleicher Addon-ID laden.

Lokale Prüfungen bestätigten reale native Ergebnisse und die Offline-Oberfläche. Verbundene Spieler, anhaltender Mehrspielerbetrieb und Kampf benötigen externe Abnahme. Transport-, Fahrzeug-, Behandlungs- und Server-Szenario-Anleitungen beachten. Native Navigation und Behandlungsbedingungen können Anfragen verhindern.
