# COMMAND deployment compositions — development milestone

Units → Deployment compositions: select units and save JSON. Load a saved file, choose planner anchor easting/northing and clockwise heading, preview the count, coordinates and unresolved identities, then insert. First selected unit is the saved anchor; internal command parents remap, external parents become top-level, phases become shared and copies start unlocked. Supported unit fields, explicit affiliation and prefab provenance survive; runtime handles do not. One Undo/Redo removes/restores the instance. Preview again after mission/placement edits. Open deployment review separately with a matching resource index; its 16-unit limit still applies. Saved per-unit headings take precedence over the deployment heading field. No automatic batches, occupied seating or flight is added.

## Français

Unités → Deployment compositions : sélectionnez des unités et enregistrez le JSON. Chargez-le, définissez l’ancrage dans les coordonnées du plan et le cap horaire, puis prévisualisez le nombre, les positions et les références non résolues avant insertion. Les identifiants sont renouvelés et les parents internes réaffectés ; les affiliations explicites sont conservées. Une seule annulation rétablit le plan. Ouvrez séparément la revue de déploiement avec l’index correspondant (16 unités maximum). Les caps enregistrés priment sur le champ de cap du déploiement. Aucune création automatique, occupation de véhicule ou capacité de vol ajoutée.

## Deutsch

Units → Deployment compositions: Einheiten auswählen und als JSON speichern. Datei laden, Anker in Plankoordinaten und Kurs im Uhrzeigersinn festlegen, Anzahl, Positionen und ungeklärte Ressourcen prüfen, dann einfügen. Neue Kennungen und interne Elternverweise werden erzeugt; gewählte Zugehörigkeiten bleiben erhalten. Ein Rückgängig-Schritt entfernt die Instanz. Deployment review separat mit passendem Ressourcenindex öffnen (höchstens 16 Einheiten). Gespeicherte Einzelkurse haben Vorrang vor dem Kursfeld der Bereitstellung. Kein automatisches Erzeugen, Besetzen oder Fliegen.

Evidence: focused Node contracts cover round trip, pose, hierarchy, fresh identifiers, immutability, missing identities and existing reviewed deployment conversion. Synthetic resource fixtures are not native acceptance. The isolated offline Electron load/preview/insert/Undo/Redo check passed. Final consolidated-package and connected-player acceptance remain separate. Existing release artifacts are unchanged.

Validation on 20 October: 18 existing core/deployment contracts and 5 composition tests passed. The latter invoke production editor commit/travel for one-step Undo/Redo. A 256-unit capture/preview sample took 17.9 ms; this is a bounded contract timing, not a frame-rate or packaged UI claim. No game client was launched.
