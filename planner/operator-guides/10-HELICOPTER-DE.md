# Hubschraubersteuerung — experimentell

COMMAND 1.1.3 mit Bridge 0.15.7 verwenden. Luftfahrzeug und Abhängigkeiten müssen auf Server und Clients installiert sein.

Flugziele aktualisieren und das Luftfahrzeug auswählen. **Nur fliegen — Passagiere behalten** steht für jedes unterstützte Profil zur Verfügung. Erforderlich ist ein lebender, bei Bewusstsein befindlicher KI-Pilot auf dem Pilotensitz. Ein Passagiertrupp ist nicht erforderlich.

Zum Absetzen eines Trupps diese Option ausschalten und den Trupp wählen. Nur dessen tatsächlich an Bord sitzende Frachtpassagiere werden zum Aussteigen vorgesehen. Bereits ausgestiegene Mitglieder verhindern den Start nicht. Nach der Landung kann dasselbe Luftfahrzeug eine neu geprüfte Route erhalten, ohne die Mission neu zu laden.

Geländeebenheit und geringfügige Anfangsbewegung verhindern den Start nicht mehr. Keine künstliche Begrenzung von Flugstrecke, Wegpunktabstand oder Wegpunktanzahl; gültige unterstützte Koordinaten und Nachrichtengröße bleiben erforderlich. Eine Route mit einem Punkt liefert den Landeplatz. Geschwindigkeiten: 4, 8, 12, 57 oder 66 m/s.

Anfragen können warten, während eine andere läuft. Die aktuelle Bridge führt jeweils eine Anfrage aus. Eine Schleifenpatrouille belegt diesen Platz bis zum Stoppen. Die Sperre nach 100 Anfragen entfällt. Belege bleiben während der Sitzung gegen doppelte Ausführung erhalten.

Der Host bestimmt die Freigabe. Ein menschlicher Insasse beendet die Assistenz. Kollisionskontrollen und tatsächlich gemessene Landung bleiben erhalten; keine reaktive Hindernisvermeidung oder garantierte Freiheit. Für diese Änderung erfolgten nur Code- und Syntaxprüfung, keine automatisierten Tests oder Spiel-/App-Starts. Native Kompilierung, Menü und Flug müssen noch geprüft werden.
