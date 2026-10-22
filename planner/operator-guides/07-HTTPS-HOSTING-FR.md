# Politique actuelle

Dans Reforger, ouvrez les contrôles COMMAND. Le mode Complet approuve automatiquement les 27 types pris en charge : vol, transport, soins, véhicules, ravitaillement et sauvegardes serveur inclus. Le mode Personnalisé conserve les trois catégories ; vol, ravitaillement et sauvegardes y restent manuels. Seul l’hôte ou l’administrateur privé accorde cette autorité. Désactiver arrête les futures approbations ; une demande en attente devient manuelle. Les opérations déjà approuvées ou en cours continuent et nécessitent leur annulation distincte. Activer Complet peut approuver une demande déjà en attente. Un nouvel appairage revient au mode manuel, sauf autorisation privée explicite pour cet appairage exact. Vérification, expiration, propriété, protection des joueurs, limites et ordonnancement restent actifs. Un ancien relais affiche Complet indisponible. Attendez l’accusé du relais ; COMMAND affiche le mode confirmé.

# Hébergement du relais et approbation automatique

Paramètres → Pont en direct propose Connexion rapide — cet ordinateur et Relais dédié — géré par le serveur. La connexion rapide s’arrête avec COMMAND. Déconnecter le tableau de bord conserve la session distante ; Terminer la session révoque son association. Copiez sa clé privée avant de partir. La reconnexion exige la même adresse HTTPS et cette clé ; protocole de suivi 3 requis. L’hôte ou l’administrateur autorise séparément les ordres IA, les créations et les suppressions automatiques. Les instantanés restent manuels. Le mode confirmé apparaît près de la connexion ; un mode non confirmé n’accorde aucun droit. WebSockets, persistance après redémarrage et droits multi-administrateurs restent distincts.

Guide technique et configuration / Technische Konfiguration: [HTTPS-RELAY-HOSTING.md](HTTPS-RELAY-HOSTING.md).


## Public HTTPS readiness

La connexion rapide vérifie son accès HTTPS public avant d’afficher un code. L’enregistrement du tunnel ne prouve pas que son adresse est accessible. En cas d’échec DNS ou d’accès au relais, aucun code n’est émis et COMMAND ferme son processus de tunnel. Réessayez plus tard ou utilisez un relais serveur fonctionnel. Les paramètres DNS et la mission restent inchangés.

COMMAND waits up to two minutes for public HTTPS health before issuing a pairing code. Public diagnostic command exchange passed on 20 October; real multiplayer acceptance remains separate.


Les boutons natifs AI ORDERS, SPAWNING et REMOVAL affichent ON/OFF. Activez chaque catégorie séparément. Disable All remet tout sur OFF et les approbations en mode manuel ; ALL AUTO-APPROVAL OFF est inactif lorsque tout est déjà désactivé. Attendez la confirmation du relais et vérifiez le même état dans Companion. Les instantanés restent manuels ; une opération déjà en cours n’est pas annulée.
