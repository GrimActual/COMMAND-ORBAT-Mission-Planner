# Operation Watchtower - démarrage

Sauvegardez le plan actuel. Assets -> importer **02-MISSION-ASSET-CATALOG.json**. Plan files -> Import plan : **01-MISSION-PLAN.json**. Game controls -> Deploy -> charger l'index **03-MISSION-RESOURCE-INDEX.json**. Sélectionnez les 12 marqueurs amis, vérifiez les références/positions, envoyez puis approuvez une fois en jeu. Importer ne crée rien automatiquement.

Les équipages et passagers apparaissent à côté des véhicules : embarquement séparé, vérifié et approuvé. Deux véhicules au sol et un UH-1H sont prévus. COMMAND ne fournit pas de commandes de vol : pilote joueur/Game Master requis. Les délais d'embarquement restent non résolus.

04 contient seulement deux équipes ennemies facultatives ; elles peuvent engager immédiatement. 05 est un scénario de répétition **hors ligne**, sans commandes au jeu. Le briefing complet est dans Brief ; les ordres et étapes sont dans 06-ORDERS-AND-RADIO.md. N'envoyez pas deux fois le déploiement ami en revenant au fichier 01.

Recommended bridge: **0.12.1**, containing the native approval-control repair. The original plan contract remains compatible with 0.12.0, but use the patched bridge for acceptance.
