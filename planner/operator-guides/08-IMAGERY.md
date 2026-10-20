# COMMAND — optional user-supplied imagery

This distribution includes no Everon satellite-image tiles or elevation dataset. Offline planning, coordinate grid, symbols, save/load and exports work without them. Settings → General → Use local imagery or coordinate grid disables online terrain requests. Existing installations and their local images are preserved; extract this candidate into a separate folder.

## 2D Everon imagery

Obtain imagery you are permitted to use. Do not assume that installing a game, attribution, or a map-generator licence grants redistribution rights. Keep any provider's required notices. Do not redistribute someone else's images with COMMAND without the necessary permission.

Close COMMAND. In COMMAND-Windows/resources/app/terrain/everon place sixteen square JPEG tiles, named x-y.jpg for every x and y from 0 through 3 (0-0.jpg through 3-3.jpg). Each tile must have equal square dimensions. For optional 3D reuse, each edge must be 2–1024 pixels. x increases eastwards; y increases northwards. The north-up atlas places 0-3 at its top left and 3-0 at its bottom right. The existing 2D map spans eastings/northings 0 through 12801.024 metres. Do not rename arbitrary imagery into this layout: its world, coverage and alignment must actually match. Restart and verify known landmarks before relying on placement. Remove only your added files to return to grid planning. Other worlds need separately verified mappings; these Everon paths do not convert them.

## Optional read-only 3D

Open 3D planning preview. Choose your authorized elevation JSON and, optionally, a matching PNG/JPEG (2–4096 pixels per edge, at most 20 MiB) using Optional matching satellite PNG/JPEG. The elevation package must contain its matching north-up imagery bounds: westWorldX, eastWorldX, southWorldZ, northWorldZ and topEdge: "north" under imagery. Confirm world, metre units, extent and landmarks; then tick the permission/alignment declaration and open the preview. An image alone supplies neither terrain heights nor game models. Without imagery the preview shows shaded terrain; without valid elevation it stays closed. No imported files are automatically distributed or stored in mission JSON.

Online map access retains the provider's terms and requires internet; this guide grants no rights to download, extract or redistribute content. No extraction tools or protected game assets are provided.
