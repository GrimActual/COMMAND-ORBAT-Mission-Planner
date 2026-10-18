# Squad treatment — development pilot

Open Squad treatment in Units, Settings or Sarge. Refresh, choose an owned or currently authorized recruited squad, set 15–120 seconds, review and send, then approve in Reforger. Review expires after 60 seconds and changes to input, plan or pairing invalidate it.

The approved scope is one wounded member of the selected squad. At execution the bridge chooses a living, on-foot, bleeding AI member with a treatable wound. It requires at least one squad mate and a real native bandage. It freezes the patient and exact membership for the bounded task. It rejects unresolved/mixed factions, humans, mounted members, healthy targets, changed membership or authority, and foreign waypoints. Native medic behavior performs treatment; COMMAND does not write health, supply equipment or resurrect actors.

Executed means the selected native medic behavior was observed for the exact patient and owned waypoint, bleeding stopped and a real bandage was consumed. Other injuries may remain. Missing equipment, native treatment conditions or terrain can cause failure/timeout. Cancellation stops only the owned task; a native item-use action already underway can finish. It does not undo treatment or restore consumed items. Pairing shutdown stops the owned task. Saved mission data and offline workflows are unchanged.

Local gates: healing-orders-native.json proves healthy-target rejection, actual native treatment and cancellation; healing-safety-native.json proves timeout and foreign-waypoint preservation; healing-orders-desktop.json covers offline UI, exact requests, EN/FR/DE, stale reviews, Sarge/Settings and unchanged mission. These are isolated diagnostics, without connected humans or multiplayer certification. The fixture's wound creation exists only in private diagnostics.

## Français

Ouvrez Soins d’escouade dans Unités, Paramètres ou Sarge. Actualisez, choisissez une escouade contrôlée, réglez 15–120 secondes, vérifiez, envoyez puis approuvez dans Reforger. La vérification expire après 60 secondes et devient invalide si la demande, la mission ou le jumelage change.

L’autorisation concerne un seul membre IA blessé de l’escouade. Le pont choisit à l’exécution un membre vivant, à pied, qui saigne et peut être soigné, avec un camarade et un vrai bandage disponibles. Il protège les joueurs et vérifie la faction, les membres et les ordres existants. Le succès exige un traitement natif observé, l’arrêt du saignement et un bandage consommé ; d’autres blessures peuvent rester. L’annulation arrête seulement la tâche autorisée ; une utilisation d’objet déjà engagée peut finir. Aucun point de vie ni objet n’est créé ou restauré. Les tests locaux ne certifient pas le multijoueur.

## Deutsch

Gruppenbehandlung unter Einheiten, Einstellungen oder Sarge öffnen. Ziele aktualisieren, kontrollierte Gruppe wählen, 15–120 Sekunden einstellen, prüfen, senden und in Reforger freigeben. Die Prüfung verfällt nach 60 Sekunden sowie bei Änderungen an Anfrage, Plan oder Kopplung.

Die Freigabe gilt für ein verwundetes KI-Mitglied dieser Gruppe. Bei Ausführung wählt die Bridge ein lebendes, blutendes und behandelbares Mitglied zu Fuß. Ein Kamerad und ein echter Verband sind nötig. Spieler, Fraktion, Mitglieder und fremde Wegpunkte werden geschützt. Erfolg erfordert beobachtete native Behandlung, gestoppte Blutung und verbrauchten Verband; andere Verletzungen können bleiben. Abbruch stoppt nur die eigene Aufgabe; begonnene Gegenstandsbenutzung kann enden. Keine direkten Gesundheitsänderungen, Wiederbelebung oder erzeugten Verbände. Lokale Tests bestätigen keinen Mehrspielerbetrieb.
