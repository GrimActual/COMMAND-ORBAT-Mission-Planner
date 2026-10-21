# COMMAND — Einstieg

COMMAND 1.1.0 stabile Offline-Planung; experimentelle Live-Steuerung. Bridge bleibt 0.15.0. Exakte Desktop-Kompatibilität unter Einstellungen → Kompatibilität und Grenzen und im endgültigen Manifest prüfen. Nur das durch Manifest und Prüfsummen bezeichnete Paket verwenden. Offline-Planung ist Kernprodukt; Live-Steuerung und Hubschrauberhilfe bleiben experimentell.

1. Game Master öffnen. Suche vereint Assets, geplante, aufgestellte und verfolgte Einheiten. Statusanzeigen trennen Daten. Suche und Filter bleiben bei der Auswahl.
2. Mission importieren lädt vollständige `.command-mission.json` mit Plan, Referenzen und Aufstellung. Erzeugt nichts im Spiel. Vor Ersetzen Sicherung speichern. Ein Rückgängig stellt vorherigen Plan her. Bisheriger Planaustausch bleibt unter Plandateien.
3. Asset zum Platzieren, geplante Einheit zum Bearbeiten oder Spielziel für passende Aktionen wählen. B/N bereitet Pilot/Passagiere vor, ohne etwas im Spiel zu erzeugen. Automatische Namen sind möglich.
4. Mission und Aufstellung wählt standardmäßig Ganze Mission mit allen erklärten Phasen und Fraktionen. Warteschlange und Gruppen/Fahrzeuge prüfen, dann senden. Pakete werden nacheinander mit Host-Freigabe gesendet. Eine Gruppe ist kein einzelner Soldat. Besetzte Phasen behalten Sitzzuweisungen.
5. Jedes Paket verfolgen: Warteschlange, Host-Freigabe, Ausführung, Ergebnis. Befehl installiert bestätigt keine Ankunft. Anfrage abgeschlossen bestätigt nicht die ganze Mission. Flug zeigt gemessenen Fortschritt separat.
6. Bei unbestätigter Zustellung ursprüngliches Ergebnis prüfen; Wiederholung behält Kennung. Keine Ersatzanfrage erstellen. Stoppen verhindert spätere Pakete, bricht aktuelle Anfrage aber nicht ab. Änderungen und Ablauf erklären erneute Prüfung.
7. Geprüfte Missionsentfernung listet nur passende bekannte COMMAND-Pakete dieser Desktop-Kopplung. Rekrutierte und fremde Objekte ausgeschlossen; Plan bleibt. Neue Mission leert Planung bei bestehender Verbindung, Assets und Verfolgung. Rückgängig stellt Plan her. Diese Aktionen sind kein Hubschrauber-Notstopp.

## Verbindung und Wiederherstellung

Schnellverbindung startet eigenes Relay und Tunnel. Adresse/Code können während öffentlicher Hintergrundprüfung erscheinen. Relay bereit bestätigt keine aktuellen Positionen. Kopplungscode bleibt bis Anzeige verborgen. Dediziertes Relay nutzt berechtigte Serversitzung. Dashboard trennen erhält sie; Sitzung beenden widerruft nach Bestätigung. Kein automatisches Verbinden oder Fortsetzen beim Start. Schließen warnt vor offenen Anfragen; zuerst Plan sichern. Keine privaten Schlüssel oder Codes teilen.

## Bestehende Infanterie und Flug

In Reforger Fraktionsverfolgung aktivieren und KI-Mitglied wählen. Aktualisieren, Rekrutierung prüfen und im Spiel freigeben. Spieler, aufgesessene Gruppen und fremde Befehle bleiben geschützt. Freigabe löscht keine Soldaten. Verfolgung allein erteilt keine Kontrolle. Allgemeine Registrierung bestehender Fahrzeuge/Luftfahrzeuge bleibt unvollständig.

Flug gilt nur für exakt aktivierte Katalogprofile. Erforderliche Addons separat installieren. Luftfahrzeug und Passagiere oder unterstützten Nur-Pilot-Modus wählen. Aufstellung und Flug separat prüfen; Flug braucht manuelle Host-Freigabe. Geschwindigkeit, Wegpunkte, Landezone und unterstützten Patrouillenmodus wählen. Keine künstlichen Distanz- oder Wegpunktabstandsgrenzen; Weltgrenzen und Spielprüfungen bleiben. Optionale Höhen sind Mindesthöhen über Grund; höchste Mindesthöhe gilt im gesamten Reiseflug. Vorprüfung kann Höhe erhöhen oder Hindernis ablehnen; keine garantierte Freihaltung, reaktive Vermeidung oder automatische Landeplatzverlegung. Gesamte Route prüfen. Menschliche Übernahme und Mehrspielerabnahme bleiben offen. Historische Zeitüberschreitung beim Einsteigen zu Fuß bleibt ungeklärt.

## Anleitungen

Siehe 02-ASSETS, 03-SERVER, 04-COMPATIBILITY, 07-HTTPS-HOSTING-DE, 10-HELICOPTER-DE und 11-DEPLOYMENT-OPERATIONS-DE. Sarge öffnet passende Bedienung. Optionale schreibgeschützte 3D-Vorschau benötigt erlaubte weltpassende Höhen und Bilder; keine Spielmodelle oder Bilddaten enthalten. Native Workbench-Anwendung, Relay-Neustartpersistenz, WebSockets und Mehradmin-Rollen bleiben geplant oder deaktiviert. Kurze native Tests sind keine menschliche Mehrspielerabnahme.
