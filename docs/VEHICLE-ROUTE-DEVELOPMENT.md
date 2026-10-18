# Vehicle routes — development source checkpoint

A separately approved vehicle route uses an exact COMMAND-owned crew and wheeled vehicle. All members must finish boarding; a conscious AI driver, compatible faction and protected occupants are checked. The bridge observes ordered arrival at up to 16 destinations, with a fixed timeout and cancellation. It does not teleport actors or force player input.

The isolated native route check reached both destinations with all four AI members aboard. Offline desktop checks cover map selection, exact request identities, review invalidation, languages and mission preservation. These checks do not certify connected-human or multiplayer behavior.

Convoy controls require separately advertised convoy-v1 support. Original bounded pursuit samples a native move destination behind the leader with a nominal 20m gap; it renews completed segments rather than forcing steering or replacing the destination every frame. It stops at the fixed expiry or changed eligibility. Separate approval is required to detach. The installation receipt is not a live convoy status or arrival guarantee. Native tests confirmed a moving leader followed across multiple segments, all four occupants retained, cycle rejection, detach, expiry and pairing shutdown. See convoy-native.json and convoy-lifecycle-native.json. Treatment is described in SQUAD-TREATMENT-PILOT.md.

This is uncommitted development source. Final integrated performance, distribution checks and packaging remain required; existing installed Companion and published bridge packages are unchanged.

## Français

Les itinéraires des véhicules utilisent une validation et une approbation distinctes. Le test natif a confirmé deux destinations avec quatre soldats IA à bord. Le suivi en convoi utilise des destinations natives successives derrière le véhicule de tête. Déplacement réel, rejet des cycles, détachement, expiration et arrêt du jumelage ont été vérifiés localement. Les soins sont décrits dans SQUAD-TREATMENT-PILOT.md ; la publication reste soumise aux derniers contrôles.

## Deutsch

Fahrzeugrouten benötigen eine eigene Prüfung und Freigabe. Der native Test bestätigte zwei Ziele mit vier KI-Soldaten im Fahrzeug. Konvois nutzen aufeinanderfolgende native Ziele hinter dem Führungsfahrzeug. Tatsächliche Folgefahrt, Zyklusablehnung, Trennung, Ablauf und Kopplungsende wurden lokal geprüft. Behandlung beschreibt SQUAD-TREATMENT-PILOT.md; Veröffentlichung benötigt die abschließenden Prüfungen.

The resumed isolated safety gate passed on a land-route fixture: the fixed deadline produced a timed-out result, approved cancellation removed the running owned route, and both retained four AI occupants. See test-evidence/vehicle-routing-safety-native.json. The earlier very distant route instead triggered protective rejection after native occupant state changed; that failure remains an unsupported-path observation, not a successful arrival. Fixtures now wait for the native delayed crew-spawn event rather than assuming a fixed delay is sufficient.
