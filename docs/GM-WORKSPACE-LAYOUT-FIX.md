# GM workspace layout correction — 15 October 2026

The floating editor could cover the bottom-right map toolbar. This was reproduced in the previous packaged app: Fit ORBAT could not receive a click because the editor intercepted it. The fix keeps the editor and drawers above the actual toolbar height, including wrapped tool rows at narrow widths. Existing placement work is still coalesced into one animation frame; the toolbar now shares the existing resize observer.

Long controls, source previews and button rows wrap within the floating editor rather than extending its horizontal scroll area. No mission, bridge, command or resource contract changed. Existing Settings and Sarge instructions remain accurate; there are no new preferences or controls.

## English

Use the existing GM workspace toggle. Editor opens the usual planning forms; its bottom edge now leaves map tools accessible. Assets and Inspector remain reversible drawers. Full map hides the workspace panels, and leaving Full map restores the editor. Narrow windows and translated labels may make toolbars wrap; panel spacing follows them automatically. Continue to scroll the editor vertically for long reviews.

## Français

Utilisez le bouton GM workspace existant. L’éditeur conserve les formulaires habituels et laisse désormais les outils de carte accessibles sous le panneau. Les tiroirs Assets et Inspector restent réversibles. Full map masque les panneaux ; quitter ce mode restaure l’éditeur. L’espacement suit automatiquement les barres d’outils lorsqu’elles passent sur plusieurs lignes. Faites défiler verticalement les longues revues.

## Deutsch

Den bestehenden GM-workspace-Schalter verwenden. Der Editor enthält weiterhin die gewohnten Planungsformulare und lässt die Kartenwerkzeuge unter dem Panel erreichbar. Assets und Inspector bleiben umschaltbare Bereiche. Full map blendet Panels aus; beim Verlassen kehrt der Editor zurück. Der Abstand passt sich automatisch an mehrzeilige Werkzeugleisten an. Lange Prüfungen weiterhin vertikal scrollen.

## Application checks

Actual packaged Companion, isolated profiles, six read-only user SQF/HPP files. Five layout combinations passed: 1920×1000 EN, 1280×800 EN, 900×800 FR, 700×820 DE and 520×760 DE with large text. No horizontal panel/page overflow; editor stays below the GM toolbar and above the map tools. Full map restoration, narrow drawer exclusivity, Escape focus and unchanged saved mission passed, with no renderer errors. Existing workspace preference test passed. Evidence: `docs/test-evidence/gm-layout-fix.json`.

The screenshot’s horizontal scrollbar was not reproduced in the empty baseline; the correction nevertheless constrains long controls, and the loaded-source cases above passed. The toolbar obstruction was directly reproduced. A screenshot alone does not establish every cause of overflow.

Matched 400-unit, offline 1440×900, approximately 3.5-second pan samples: previous/fixed median frame time 16.7/16.7 ms and p95 16.8/16.8 ms. Both retained 400 markers and two loaded tiles, with unchanged missions and no frame over 100 ms. These short single-run observations show no obvious regression; they are not a causal speedup, long-session stability or universal FPS guarantee. Evidence: `docs/test-evidence/gm-layout-performance.json`.

The Assets panel remains dense when many migration sections are expanded. Consolidating diagnostic navigation is a future usability improvement, not part of this small layout correction. Native/game execution was not tested or launched.

## Development copy

`A:/Everon-ORBAT-Development/work/gm-layout-fix/COMMAND-Workspace-Layout-Candidate/COMMAND Planner.exe`

This retains the existing dev.gm.8 runtime/version label and all dependency-inspector work. It is a separate development checkpoint, not a new public release. Previous candidates are preserved.
