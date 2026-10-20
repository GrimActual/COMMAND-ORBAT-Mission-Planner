V2.8.2: Searchable Sarge guide with Show me where navigation. See UPDATE-2.8.2.md.

V2.8.1: See UPDATE-2.8.1.md. Scaling: Settings. Side missions: Draw. Clock and CSV: Brief.

# COMMAND ORBAT / Mission Planner 2.6.1

Extract **the whole Windows ZIP** into a fresh folder and run **COMMAND Planner.exe**. Keep all bundled files and folders together.

For source development, install Node.js 18 or later, run `npm ci`, then `npm start` for the desktop app. For the browser edition, run `npm run server` and open **http://127.0.0.1:8787**. The editor and bundled lower-detail terrain work offline; Workshop and online detail require internet.

## Presentation exports and community defaults

Open **Presentation export** for PNG, JPEG, SVG or an A4 PDF. Choose current view, full canvas or selected visible objects (units, routes and areas). Use **Preview** before **Create export**. PNG and SVG support a transparent background; terrain and logos remain raster images within an SVG. PDF is an image-based page.

Expand **Presentation branding** for title, community name, operation date, logo, watermark and exercise stamp. Enable **Include title and legend** to show the title, community, date and logo. **Save community defaults** remembers the community name, logo, watermark, opacity and stamp on this device. It deliberately excludes the mission title and date. **Reset branding** clears the current session; **Forget saved defaults** removes stored defaults without changing the current export. JSON projects do not include these defaults.

Generated brief labels and presentation legends follow the interface language in Settings. Your own names, phases and imported equipment names remain unchanged. Copied briefs use the selected distance units. Native-speaker review and full technical-error localization remain pending.

## Units and factions

1. Open **Units**, set the callsign, faction, and military unit type.
2. Choose **Military vector (APP-6)**, **Asset pictogram**, or **Text**.
3. Use the color picker, HEX field, or preset swatches. **Faction color** removes a custom override. Green is Independent / Guerrilla / FIA.
4. Assign a phase and optional commander. Click **Place new unit**, then click the map.
5. Select an existing unit to edit it and click **Apply changes**. Drag the map marker to move it.

Import your own equipment/mod catalog in **Assets**. Named assets are never added automatically. Workshop opens an official Reforger item link or searches its name.

## Paths, arrows and areas

Set a name, phase, color, thickness and line style in **Draw** before choosing a tool.

| Tool | How to draw |
|---|---|
| Waypoint path | Click each bend or waypoint. Click **Finish** or press **Enter**. |
| Directional arrow | Click along the movement axis, then **Finish**. Arrowheads follow the direction of drawing. |
| Polygon AO | Click at least three boundary vertices, then **Finish**. Crossing boundaries are rejected. |
| Rectangle AO | Click two opposite corners. |
| Radius area | Click the center, then the edge. Select the circle later to type an exact radius in meters. |
| Ruler | Click the start, move the pointer to preview, then click the endpoint to hold the measurement. |

Select a path or area on the map or in the drawing list to change its style. Drag its white edit handles to move waypoints or change a radius. **Append waypoints** extends a path; waypoint **Remove** buttons simplify it. Arrowheads apply to paths; area outlines can be solid, dashed or dotted.

**Escape** cancels a draft. **Remove last point** corrects a draft before saving. **Undo/Redo** restores saved changes, including geometry, colors, phase assignments and hierarchy. Undo history lasts for the session.

## Briefing, grids and navigation

- **Brief:** rename Phase I/II/III and show or hide them. “Shared / all phases” controls items without a specific phase. Visibility does not delete anything.
- Toggle **Grid overlay**, **Unit markers**, **Tactical routes**, **Area boundaries**, and **Unit callsign labels** independently.
- The inspector shows a local **easting–northing** grid: `064-064` at 100 m precision or `0645-0645` at 10 m precision for X=6450, Z=6450.
- The ruler reports straight-line ground distance and clockwise bearing from north. A path’s listed distance includes all its segments. These are game-map calculations, not an artillery ballistic solution.
- Hold **WASD** or **arrow keys** to pan. **Shift** pans faster. `+` and `-` zoom. Zoom in if the entire map already fills the allowed bounds. Typing in a field does not pan the map.
- **Copy brief** includes units, routes, areas and grid references from the currently visible phases. Layer switches control map clutter, not brief content.

## Chain of command

Drag a roster entry onto its commander. Expand/collapse its children with the triangle. Drop on **Top level** to detach. The **Reports to** selector provides the same operation on touch devices and with the keyboard. A unit cannot report to itself or one of its descendants. Hidden-phase entries remain dimmed in the tree so the chain stays understandable.

## Save and test

**Project JSON** includes all items and phases, including hidden ones. **Import plan** validates before replacing your current plan; Undo restores the previous plan. Local browser saves are convenient, but keep JSON exports as backups.

Existing plans (versions 1–3) import into this build. New exports use **version 4** to preserve waypoint paths, areas, styles, phases and command relationships. Older builds cannot open version 4. The app also keeps a one-time browser backup under `everonOrbat-v3-backup` when migrating an older local save.

An optional `feature-tour.json` illustrates the new tools. It contains generic game-planning markers and no equipment catalog. It is never loaded automatically.

Run **`npm test`** from the source folder for the included validation and regression checks. Stop the browser server with **Ctrl+C** when finished.
