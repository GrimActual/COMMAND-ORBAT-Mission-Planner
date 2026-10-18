# COMMAND squad transport — development pilot

The original transport adapter adds separately advertised `ai-transport-v1` support. It uses the existing explicitly GM-enabled pairing and in-game approval. It is source development work until a matching candidate release is identified; the previously installed Companion and Workshop release do not acquire these controls automatically.

Open **Squad transport** in Units or through Settings/Sarge. Refresh targets, choose the controlled squad and an owned vehicle, then choose **Embark squad** or **Dismount squad**. Set a 5–120 second timeout. For embark, explicitly allow driver, gunner and/or passenger seats. All roles start unapproved except passenger seats. Review, send, approve in Reforger and refresh results. Each local review expires after 60 seconds and becomes invalid when inputs, mission or pairing change.

An embark request requires enough currently available permitted seats for every member. The host checks exact squad and vehicle identity, native faction, current AI membership, human control, existing waypoints and seat eligibility immediately before execution. Occupied, reserved, locked and inaccessible seats do not count as available. Vehicle ownership is required for both original and restored COMMAND batches. Recruited squad authority remains independently checked.

Dismount affects only members aboard the selected vehicle. Members already on foot stay on foot; members in another vehicle block the request. It does not create a new boarding assignment. No occupant is teleported, forcibly ejected or given forced input.

Results distinguish observed completion from installation. **Executed** means every required member was observed aboard the exact selected vehicle, or on foot after dismount. A timeout reports the actual completed count and stops the owned task. This can leave a partly boarded squad; request dismount to recover supported mounted members. Cancellation also stops the owned task. A native transition already underway may finish. Cancellation does not forcibly undo completed boarding.

The adapter cancels only its own waypoint, generated boarding activities, exact native assignment and original member reservations. Pre-existing assignments, unrelated waypoints and reservations from other systems are retained. It rechecks faction, membership, vehicle identity and human protection during the bounded task. Pairing shutdown removes the active transport task and COMMAND registration.

Transport is distinct from vehicle driving and convoy control. Read-only vehicle inspection remains a snapshot; it does not reserve seats or guarantee a later request can run. Missions, normal exports, undo history and offline rehearsal remain separate from live transport.

## Local validation

- A real four-member AI fireteam boarded an M1025 using driver plus passenger seats, then physically dismounted. A passenger-only request for four members was rejected because the vehicle has only three passenger seats.
- Timeout and cancellation cleared owned reservations, preserved a foreign waypoint and rejected changed membership.
- A delayed cancellation test retained another system's reservation without later starting new boarding. A deliberate partial completion reported 3 of 4; recovery dismounted those three while keeping the fourth on foot. Faction mismatch and pairing-stop cleanup passed.
- Offline Electron checks covered exact reviewed requests, safe display, cancellation, English/French/German, stale input/mission/pairing and old-mod gating, with the mission unchanged.
- A matched short offline sample used 60 markers and 25 tiles in each build: both recorded p95 frame time of 16.8 ms with no frame over 100 ms. This does not certify sustained performance or multiplayer.

Receipts: `docs/test-evidence/transport-orders-native.json`, `transport-safety-native.json`, `transport-extended-native.json`, `transport-orders-desktop.json` and `transport-performance.json`. The native fixtures use actual terrain/navigation and AI, with no connected humans. They do not certify real-player or combat acceptance. Missing radio callsigns in the plain test mode are classified narrowly in those receipts; radio behavior is not tested.

## Français

Dans **Transport d’escouade**, actualisez les cibles, choisissez l’escouade et son véhicule contrôlé, puis Embarquer ou Débarquer. Autorisez explicitement les rôles de siège pour l’embarquement et fixez un délai de 5 à 120 secondes. Vérifiez, envoyez, puis approuvez dans Reforger. Actualisez les résultats pour voir la fin réellement observée ou le nombre de membres ayant terminé avant l’échec.

Le débarquement ne concerne que les membres du véhicule choisi ; ceux déjà à pied restent à pied. Les véhicules occupés par des joueurs sont protégés. L’annulation ne déplace aucun occupant de force et préserve les réservations étrangères. Après un embarquement partiel, une demande de débarquement peut faire sortir les membres pris en charge. Les données de mission restent inchangées. La conduite et les convois sont des fonctionnalités distinctes ; les essais avec de vrais joueurs restent à réaliser.

## Deutsch

In **Gruppentransport** Ziele aktualisieren, Gruppe und eigenes Fahrzeug wählen und Einsteigen oder Aussteigen auswählen. Für das Einsteigen Sitzrollen ausdrücklich erlauben und ein Zeitlimit von 5 bis 120 Sekunden festlegen. Prüfen, senden und in Reforger genehmigen. Ergebnisse aktualisieren, um den tatsächlich beobachteten Abschluss oder die Zahl der bis zum Fehler erfolgreichen Mitglieder zu sehen.

Aussteigen betrifft nur Mitglieder im gewählten Fahrzeug; bereits zu Fuß befindliche Mitglieder bleiben zu Fuß. Fahrzeuge mit Spielern sind geschützt. Abbrechen bewegt keine Insassen zwangsweise und erhält fremde Reservierungen. Nach teilweisem Einsteigen können unterstützte Insassen durch einen Aussteigebefehl aussteigen. Missionsdaten bleiben unverändert. Fahren und Konvois sind eigene Funktionen; Tests mit echten Spielern stehen noch aus.
