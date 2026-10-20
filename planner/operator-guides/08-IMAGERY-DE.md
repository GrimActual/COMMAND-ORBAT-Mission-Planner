# COMMAND — optionale eigene Kartenbilder

Keine Satellitenbilder oder Höhendaten werden mitgeliefert. Gitter, Symbole, Bearbeitung, Speichern und Exporte funktionieren offline. Einstellungen → Allgemein: lokale Bilder oder Koordinatengitter wählen, um Online-Geländeanfragen auszuschalten. Den Kandidaten separat entpacken; bisherige Dateien bleiben erhalten.

Nur erlaubte Bilder verwenden und erforderliche Hinweise erhalten. Spielinstallation, Namensnennung oder die Lizenz eines Generators begründen allein kein Weiterverbreitungsrecht.

Für Everon in 2D COMMAND schließen und sechzehn gleich große quadratische JPEG-Kacheln nach COMMAND-Windows/resources/app/terrain/everon kopieren: x-y.jpg, x und y jeweils 0 bis 3. x läuft nach Osten, y nach Norden; 0-3 liegt oben links, 3-0 unten rechts. Die 2D-Karte umfasst 0 bis 12801.024 Meter auf beiden Achsen. Für 3D-Wiederverwendung sind 2 bis 1024 Pixel je Kante zulässig. Welt, Ausdehnung und bekannte Landmarken prüfen; beliebige Bilder umzubenennen erzeugt keine Ausrichtung. Neu starten. Nur die selbst hinzugefügten Bilder entfernen, um zum Gitter zurückzukehren.

Für 3D erlaubte Höhen-JSON und optional ein passendes PNG/JPEG wählen (2 bis 4096 Pixel je Kante, höchstens 20 MiB). Die JSON muss imagery mit westWorldX, eastWorldX, southWorldZ, northWorldZ und topEdge: "north" für das nordorientierte Bild enthalten. Welt, Meter und Ausrichtung prüfen, dann die Erklärung bestätigen. Ohne Bild erscheint schattiertes Gelände; ohne gültige Höhen bleibt die Vorschau geschlossen. Keine Spielmodelle enthalten. Importierte Dateien gelangen nicht in die Missions-JSON. Siehe [ausführliche Anleitung](08-IMAGERY.md).
