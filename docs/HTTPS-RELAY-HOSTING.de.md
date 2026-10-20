# Relay-Betrieb und automatische Genehmigung

Einstellungen → Live-Bridge bietet Schnellverbindung — dieser Computer und Dediziertes Relay — serververwaltet. Die Schnellverbindung endet mit COMMAND. Dashboard trennen erhält die Serversitzung; Sitzung beenden widerruft die Kopplung. Kopieren Sie vorher den privaten Dashboard-Schlüssel. Zum Wiederverbinden sind dieselbe HTTPS-Adresse und dieser Schlüssel sowie Tracking-Protokoll 3 erforderlich. Host oder Serveradministrator erlaubt automatische KI-Befehle, Erzeugung und Entfernung getrennt. Snapshots bleiben manuell. Der bestätigte Modus steht beim Verbindungsstatus; ein unbestätigter Modus erteilt keine Rechte. WebSockets, Neustart-Persistenz und mehrere Administratorrollen bleiben getrennte Fähigkeiten.

Guide technique et configuration / Technische Konfiguration: [HTTPS-RELAY-HOSTING.md](HTTPS-RELAY-HOSTING.md).


## Public HTTPS readiness

Eine Schnellverbindung prüft den öffentlichen HTTPS-Zugang, bevor ein Kopplungscode erscheint. Die Tunnel-Registrierung allein bestätigt keine Erreichbarkeit. Bei DNS- oder Relay-Fehlern wird kein Code erzeugt und COMMAND beendet seinen Tunnelprozess. Versuchen Sie es später erneut oder nutzen Sie ein funktionierendes Server-Relay. DNS-Einstellungen und Mission bleiben unverändert.

COMMAND waits up to two minutes for public HTTPS health before issuing a pairing code. Public diagnostic command exchange passed on 20 October; real multiplayer acceptance remains separate.
