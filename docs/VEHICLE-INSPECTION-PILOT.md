# Vehicle seat inspection — source checkpoint, 17 October 2026

Step 71 is implemented in development source. Existing desktop followon.6 and bridge 0.10.1 releases are unchanged and do not deliver this inspection feature. The isolated desktop candidate is a test copy, not a new release.

## English

Use a matching development mod advertising `vehicle-inspection-v1` with a GM-enabled pairing. Open Native AI orders, refresh targets, choose a bridge-created vehicle and Inspect vehicle seats. Review, send and approve in Reforger, then refresh results. The snapshot reports capacity, occupied/available seats, player/AI/other occupants, reserved/locked/inaccessible seats and available driver/gunner/cargo seats. Counts can become stale immediately; inspection neither reserves seats nor moves occupants. Recruited infantry and other nonvehicles are not supported. Failed inspection or pairing changes clear the displayed snapshot. No new persistent preference is introduced; mission JSON and editor history remain separate.

## Français

Utilisez un mod de développement compatible annonçant `vehicle-inspection-v1`, avec un jumelage GM activé. Ouvrez les ordres IA natifs, actualisez les cibles, choisissez un véhicule créé par le pont puis Inspecter les sièges du véhicule. Vérifiez, envoyez et approuvez dans Reforger, puis actualisez les résultats. Les nombres indiquent un instantané des sièges et occupants, sans réservation ni déplacement. Ils peuvent devenir obsolètes immédiatement. Les unités d’infanterie recrutées et autres cibles sans véhicule sont exclues. Un échec ou un nouveau jumelage efface l’instantané. Les missions et leur historique restent séparés.

## Deutsch

Eine passende Entwicklungsmod mit `vehicle-inspection-v1` und eine Kopplung mit GM-Freigabe sind erforderlich. Native KI-Befehle öffnen, Ziele aktualisieren, ein von der Bridge erstelltes Fahrzeug und Fahrzeugsitze prüfen auswählen. Kontrollieren, senden, in Reforger genehmigen und Ergebnisse aktualisieren. Die Zahlen sind eine Momentaufnahme der Sitze und Insassen; niemand wird bewegt und kein Sitz reserviert. Die Werte können sofort veralten. Rekrutierte Infanterie und andere Ziele ohne Fahrzeug werden abgewiesen. Fehler und neue Kopplungen löschen die Anzeige. Missionsdaten und Bearbeitungsverlauf bleiben getrennt.

## Verification and limits

- Native isolated diagnostic server and loopback relay: empty M1025 capacity 4/available 4; AI occupant occupied 1/AI 1/available 3; one reserved and one inaccessible seat leaves one available; nonvehicle rejected. Exact seeded occupant identity is asserted on the next request, after the occupied inspection completes. The earlier immediate assertion failed and remains recorded privately; it was not removed or counted as a pass.
- Four focused contract/queue tests and three affected localization tests passed. Malformed counts, capability negotiation, exact owned identity, host approval, result restrictions and distribution copy equality are covered. Test registered in the planner test command.
- Offline Electron with mocked IPC: review/send, safe target text, twelve seat rows, EN/FR/DE labels, stale review blocking, pairing cleanup, old-mod gating and unchanged mission snapshot passed. Native server and desktop were tested separately, not as a new end-to-end client session.
- Matched three-second idle samples: prior/candidate p95 16.8/16.8 ms, no stalls above 100 ms, DOM 1948/1955 stable within each sample; reported JavaScript heap 11.9/15.2 MB. These short idle samples establish neither an improvement nor sustained performance.
- Evidence: test-evidence/vehicle-inspection-native.json and test-evidence/vehicle-inspection-desktop.json. No normal game client or public tunnel launched.
- Live human occupants, locked-seat behavior in a gameplay scenario, gunner seats, mixed-occupant safety, boarding, dismounting, driving and transport remain unverified or unimplemented. Seat availability is never an embark authorization. Combat, real-player Follow and sustained 60-entity acceptance remain pending.
