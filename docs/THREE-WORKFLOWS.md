# Three explicit COMMAND workflows

## Live Game Master

Reforger renders the full world in its own window. COMMAND supplies its tactical map, tracking and supported controls. Send to game keeps reviewed placement/AI requests, exact ownership and administrator approval. An order’s delivery/approval is not proof of execution. No automatic scene editing or renderer embedding is implied.

## Workbench — planned exchange

Export to Workbench is a reviewed placement exchange into a dedicated COMMAND scene layer through an original importer. It must preserve stable plan/exchange IDs, exact prefab/addon references, positions and headings, and leave base-game/foreign layers untouched. Exported placements are not a complete reconstructed .ent scene. Workbench remains its own editor window.

Import editor changes is **planned**, not implemented/accepted. Before enabling Apply, its importer must pass tests for exact world/plan/exchange identity, duplicate/conflicting IDs, stale baselines, unauthorized prefab changes, bounds and managed-layer scope. The review must separately show **added, moved and removed COMMAND-managed entities**; unmanaged editor entities stay outside the change set. Apply only the reviewed changes, atomically, through the existing mission editing API, with **one Undo step**. Explicitly review removals; never silently delete plan entries. Continuous two-way editing follows only after identity mapping and conflict handling are verified.

## Optional in-app 3D preview

A lightweight offline view uses sampled elevations, matching satellite textures and approximate tactical proxies. Selecting a proxy selects the existing 2D plan entity. This is not the Enfusion renderer or exact game models. It does not send live commands or replace Workbench. Renderer resources are released on close; missing imagery falls back to shaded terrain with a visible explanation.

## Français

Trois flux séparés et vérifiés : Game Master rend le jeu dans sa propre fenêtre ; COMMAND envoie les opérations prises en charge après vérification et approbation. L’échange Workbench vers une couche COMMAND dédiée reste prévu. L’import des changements doit montrer les entités COMMAND ajoutées, déplacées et supprimées, vérifier identités et conflits, puis appliquer en une seule étape Annuler. L’aperçu 3D facultatif emploie altitudes, textures correspondantes et symboles, sans intégrer le moteur ni modifier le jeu.

## Deutsch

Drei getrennte, geprüfte Abläufe: Game Master rendert in seinem eigenen Fenster; COMMAND sendet unterstützte Aktionen nach Prüfung und Genehmigung. Der Workbench-Austausch in eine eigene COMMAND-Szenenebene ist geplant. Der Änderungsimport muss hinzugefügte, verschobene und entfernte COMMAND-Entitäten anzeigen, Identitäten und Konflikte prüfen und alles in einem Rückgängig-Schritt anwenden. Die optionale 3D-Vorschau nutzt Höhen, passende Texturen und Platzhalter, ohne den Engine-Viewport einzubetten oder das Spiel zu ändern.


Development milestone: a source-only [identity and change-review contract](WORKBENCH-EXCHANGE-CONTRACT.md) is tested. Native Workbench exchange and Import editor changes remain planned; Apply is disabled. A source-only candidate now passed exact one-step Undo/Redo through the existing desktop edit path using synthetic data. Native editor identity and complete exchange acceptance remain pending.

Français : le contrat de revue des identités est testé uniquement dans les outils de développement. Annuler/Rétablir est vérifié pour le candidat synthétique hors ligne ; l’échange natif et l’import restent prévus, Appliquer est désactivé.

Deutsch: Der Identitäts- und Änderungsvertrag ist nur in den Entwicklungswerkzeugen getestet. Rückgängig/Wiederholen ist für den synthetischen Offline-Kandidaten geprüft. Nativer Austausch und Import bleiben geplant; Anwenden ist deaktiviert.
