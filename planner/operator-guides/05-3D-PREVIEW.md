# Optional 3D preview

Open 3D preview on the map toolbar, or Settings → 3D planning preview. Import an authorized elevation JSON file, verify its expected world, scale and alignment, acknowledge permission and open the preview. Everon's canonical Eden.ent identity is prefilled. Other supported Everon world identities, including raw EmptyEden point observations, must match their own exact resource; they are not silently renamed.

You can import a command-terrain-heightmap package or an existing command-terrain-observation whose points form a complete regular rectangular grid. The native sampler remains capped at 300 points; it does not export the whole world. A 17-by-17 local grid uses 289 points. Missing samples or irregular spacing are rejected. Heights must use Enfusion world metres. Preview files are limited to 4 MiB and 257 samples per edge. No game models or full terrain dataset are bundled.

Click a tactical proxy to select its existing planned unit in 2D. Colors and the inspection line show its planned faction. Sizes and shapes are approximate; structure metadata can produce a box proxy, not a reconstructed building. F focuses selection, R resets and Escape closes. Left/right mouse dragging orbits/pans; the alternate scheme swaps them. Wheel zooms toward the cursor. Settings stores mouse scheme and zoom speed outside mission files.

This first milestone changes selection only. Position editing, game commands, full .ent scene imports, satellite-image loading and detailed models are separate work. A named world file does not itself supply a browser heightmap. The renderer loads on demand and its graphics resources are disposed on close. The last imported dataset stays only in application memory for reopening.

[Start](00-START-HERE.md) · [Compatibility](04-COMPATIBILITY.md)
