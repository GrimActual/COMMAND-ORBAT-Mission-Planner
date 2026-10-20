# Read-only vanilla index extraction

The supplied files in examples/vanilla-assets are ready to import. They cover the ArmaReforger project namespace, not core engine internals or modded projects.

To regenerate, open the isolated workbench/addon.gproj extraction project with the installed base-game addon directory. Its COMMAND_VanillaIndex Workbench plugin runs in ResourceManager and prints one exact GUID/path identity per .et entry. Run it with -wbModule=ResourceManager -run -plugin=COMMAND_VanillaIndex and an isolated -profile directory. Steam must be running. Do not use -wbsilent for this plugin; it does not execute ResourceManager plugins in this tool version. This project is not the Workshop bridge and must not be published in its place.

The plugin only calls ResourceDatabase.SearchResources and writes diagnostic output. It does not load a world or instantiate prefabs. ResourceDatabase caches belong in the isolated project/profile, not game assets.

Build files with Node.js: node tools/vanilla-assets/build-catalog.cjs <script.log> <output-directory>. The log must contain the complete-query marker, matching entry count and ArmaReforger namespace for every resource. Generated files retain existing importer limits. Folder-based planning icons are hints; native availability and prefab internal dependencies remain unverified. Run the returned catalog and resource-index files through the importer before distribution. Update snapshot dates and documentation counts when regenerating for a newer game version.
