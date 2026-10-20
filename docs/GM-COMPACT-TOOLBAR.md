# Compact GM toolbar — 15 October 2026

The toolbar sizes to its contents instead of stretching across the map. Assets, Inspector, Editor and live status stay visible; GM actions opens existing deployment, AI-order, results and rehearsal controls. The English closed toolbar measured approximately 388×44 px at desktop sizes. Commands and approval boundaries are unchanged.

EN: Open GM actions for secondary controls. Selecting an action closes the menu. Escape closes the menu before closing the editor; Full map restores with the menu closed. Settings opens the same workspace. Sarge’s Game Master settings topic explains the menu.

FR : Ouvrez Actions GM pour les commandes secondaires. Choisir une action ferme le menu. Échap ferme d’abord le menu, avant l’éditeur. Full map revient avec le menu fermé. Les paramètres ouvrent le même espace GM ; Sarge décrit ce menu.

DE: GM-Aktionen öffnet weitere Befehle. Eine gewählte Aktion schliesst das Menü. Escape schliesst zuerst das Menü und danach den Editor. Full map kehrt mit geschlossenem Menü zurück. Einstellungen öffnen denselben GM-Arbeitsbereich; Sarge erklärt das Menü.

Actual packaged-app checks passed at 1920/1440/700/520 px, including EN/FR/DE, menu positioning, deployment-review delegation, Escape focus, Full map and unchanged mission data. No renderer errors or game launch. Four workspace/localization tests passed. Evidence: docs/test-evidence/gm-compact-toolbar.json.

Same 400-unit offline fixture and approximately 3.5-second pan sample as the prior layout check: median 16.7 ms, p95 16.8 ms, maximum 83.3 ms, no frame above 100 ms, 400 markers and two loaded tiles. Mission unchanged. The prior completed sample had the same median/p95 but a lower maximum; these short separate runs do not establish causation or a speedup. No passing baseline was repeated. Evidence: docs/test-evidence/gm-toolbar-performance.json and gm-layout-performance.json.

Development executable: A:/Everon-ORBAT-Development/work/gm-compact-toolbar/COMMAND-Compact-Toolbar-Candidate/COMMAND Planner.exe

Existing dev.gm.8 version label is retained. Previous candidates remain intact; this is a development checkpoint, not a new public release.
