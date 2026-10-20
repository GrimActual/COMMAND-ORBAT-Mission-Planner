# Build identity and corresponding source

MANIFEST.json records the exact immutable local source revision, desktop/bridge versions, source archive hash, dependency origins and exclusions. SOURCE-MANIFEST.json maps packaged application/native/relay files to that source. Guide links can be rewritten for offline distribution and are explicitly recorded. Electron is the verified preserved 44.9.1 runtime; the actual packaged executable must confirm it.

Source/COMMAND-Source-2.10.0-rc.2.zip contains original COMMAND source, tests, roadmap and developer tools under their existing licenses. Generated raw diagnostic outputs, profiles, credentials, private samples, protected game assets and unauthorized legacy imagery are excluded. Original tests and the test-output directory note remain. Licenses/ and component notices accompany the runtime.

FILE-MANIFEST.json and SHA256SUMS.txt cover the frozen operator package; the ZIP checksum is supplied beside the download. Any fix after freeze reopens the relevant acceptance gates and requires updated source/manifests/checksums. No stable GitHub or Workshop publication is inferred from local files.
