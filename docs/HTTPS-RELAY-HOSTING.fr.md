# Hébergement du relais et approbation automatique

Paramètres → Pont en direct propose Connexion rapide — cet ordinateur et Relais dédié — géré par le serveur. La connexion rapide s’arrête avec COMMAND. Déconnecter le tableau de bord conserve la session distante ; Terminer la session révoque son association. Copiez sa clé privée avant de partir. La reconnexion exige la même adresse HTTPS et cette clé ; protocole de suivi 3 requis. L’hôte ou l’administrateur autorise séparément les ordres IA, les créations et les suppressions automatiques. Les instantanés restent manuels. Le mode confirmé apparaît près de la connexion ; un mode non confirmé n’accorde aucun droit. WebSockets, persistance après redémarrage et droits multi-administrateurs restent distincts.

Guide technique et configuration / Technische Konfiguration: [HTTPS-RELAY-HOSTING.md](HTTPS-RELAY-HOSTING.md).


## Public HTTPS readiness

La connexion rapide vérifie son accès HTTPS public avant d’afficher un code. L’enregistrement du tunnel ne prouve pas que son adresse est accessible. En cas d’échec DNS ou d’accès au relais, aucun code n’est émis et COMMAND ferme son processus de tunnel. Réessayez plus tard ou utilisez un relais serveur fonctionnel. Les paramètres DNS et la mission restent inchangés.

COMMAND waits up to two minutes for public HTTPS health before issuing a pairing code. Public diagnostic command exchange passed on 20 October; real multiplayer acceptance remains separate.
