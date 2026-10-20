# COMMAND — images locales facultatives

Aucune image satellite ni donnée d’élévation n’est distribuée. La grille, les symboles, l’édition, les sauvegardes et les exports fonctionnent hors ligne. Dans Paramètres → Général, choisissez les images locales ou la grille pour désactiver les requêtes de terrain en ligne. Extrayez le candidat dans un dossier distinct ; vos anciens fichiers restent intacts.

Utilisez uniquement des images autorisées et conservez les mentions exigées. Une installation du jeu, une attribution ou la licence d’un générateur ne suffit pas à autoriser la redistribution.

Pour Everon en 2D, fermez COMMAND puis ajoutez seize JPEG carrés de dimensions égales dans COMMAND-Windows/resources/app/terrain/everon : x-y.jpg, chaque x et y allant de 0 à 3. x augmente vers l’est, y vers le nord ; 0-3 est en haut à gauche, 3-0 en bas à droite. La carte 2D couvre 0 à 12801.024 mètres sur les deux axes. Pour réutiliser les tuiles en 3D, chaque côté doit avoir 2 à 1024 pixels. Vérifiez le monde, l’étendue et des repères connus ; renommer une image quelconque ne l’aligne pas. Redémarrez. Supprimez uniquement les images ajoutées pour retrouver la grille.

En 3D, choisissez votre JSON d’élévation autorisé puis éventuellement un PNG/JPEG correspondant (2 à 4096 pixels par côté, 20 Mio maximum). Le JSON doit définir imagery : westWorldX, eastWorldX, southWorldZ, northWorldZ et topEdge: "north" pour cette image orientée au nord. Vérifiez le monde, les mètres et l’alignement puis confirmez la déclaration. Sans image, le relief est ombré ; sans élévation valide, la prévisualisation ne s’ouvre pas. Aucun modèle de jeu n’est fourni. Les fichiers importés ne sont pas intégrés au JSON de mission. Voir [le guide détaillé](08-IMAGERY.md).
