# Compatibility and known issues

| Component | Matching content |
|---|---|
| Desktop | 2.9.1-dev.followon.11, separate local development candidate |
| Bridge project | 0.11.2, required for individual AI and writer-reported target roles |
| Separate relay | Matching source with entity-control-v1 support; old negotiation can fall back |
| Vanilla metadata | Existing 14 October 2026 snapshot; matching Catalog/Resource-Index pairs |
| 3D renderer | Bundled Three.js 0.186.1 with MIT license, loaded only on request |

The new native individual control and snapshot support requires the updated bridge. Desktop UI alone does not update a running server or Workshop item. Check the actual published item/version, restart the hosted scenario and pair afresh. Older desktop/bridge packages remain preserved. Individual snapshots must not be treated as compatible with bridge 0.11.1.

Fresh isolated native tests cover individual physical movement and stances, protection/cleanup, snapshot restart and scoped recovery; vehicle/treatment/convoy regressions passed. Simulated human-control signals are not real connected-player acceptance. Full two-way live editing, hosted/combat acceptance and an intermittent 3/4 boarding timeout remain unresolved. The latest traced convoy pass does not establish the timeout's cause fixed.

The 3D preview accepts authorized local elevation sections and existing regular point observations. Main Eden.ent identity is preconfigured, not imported as a complete scene. Real terrain section heights have a separate native check; full scene reconstruction, game models, 3D editing and tiled terrain remain future work. A file's identity/provenance statements are not authenticated permission or live-server attestations.

Local packages and manifests do not establish public GitHub or Workshop publication. Third-party addons and engine updates require their own compatibility review.

[Start](00-START-HERE.md)

The read-only terrain-section preview is desktop-only and needs no Workshop update. Bridge 0.11.2 is separately required for production AI-control, reconnect recovery and target-reporting changes.


Development source now includes a separate bridge 0.11.3 snapshot-heading correction, compatible with this desktop. The preserved 0.11.2 package does not contain it. Review/resave older current-state snapshots whose facing is incorrect; missing original headings cannot be recovered automatically. This does not change the optional3D preview or publish a Workshop update.

Français : le candidat séparé du pont 0.11.3 corrige le cap des instantanés, sans changer Companion ni l’aperçu3D. Les fichiers ayant déjà un mauvais cap doivent être vérifiés ; aucune récupération automatique du cap d’origine. Publication Workshop distincte.

Deutsch: Der getrennte Bridge-Kandidat 0.11.3 korrigiert Snapshot-Richtungen ohne Änderung an Companion oder3D-Vorschau. Bereits falsche Richtungen müssen geprüft werden; die ursprüngliche Richtung lässt sich nicht automatisch wiederherstellen. Workshop-Veröffentlichung getrennt.
