# Individual AI and reconnect recovery — bridge 0.11.2 candidate

A supported living, on-foot infantry character can now receive COMMAND orders through an original one-member native control group. Its physical root and exact prefab remain unchanged. This applies to approved deployment and scoped, host-approved recruitment of a currently tracked individual. A character already belonging to a squad uses the existing squad path. Arbitrary props, vehicle parts, mounted characters and players do not become infantry targets.

Use Game controls → Orders → Control existing in-game squad, select a tracked AI member, review and send, then approve in Reforger. With the new bridge this also accepts a supported individual on foot. Targets prefixed In game are live control identities; a planned marker is separate. The bridge reports actual infantry/vehicle/unsupported roles and an unavailable-control explanation. Older bridges omit those details and retain their existing validation; update the bridge for individual support.

After a new pairing, recruit the currently tracked AI again. Approval transfers only that exact previously owned target into a fresh recruited lease. Existing foreign orders remain protected. Release retains physical troops and does not authorize deletion. Old pairing identities do not become valid in the new relay. Recovered targets are recruited and therefore excluded from owned deletion and current-snapshot capture.

For an owned individual, a current server snapshot retains its original character prefab, stable ID, pose, faction, one member and supported orders. Restore recreates its native helper group. These individual snapshots require bridge 0.11.2; older bridge 0.11.1 cannot restore them. A snapshot is still a bounded COMMAND package, not a complete game save.

## Verification and limits

Actual isolated native tests observed single-character Move arrival; physical Stand, Crouch and Prone; timed Hold followed by movement; route arrival; recruitment/release/recruit; exact snapshot write and restore across a process restart; removal and helper cleanup. Scoped reconnect recovery passed for an individual and an existing four-person squad. Foreign waypoints and extra members were preserved. An injected second-helper initialization failure rolled back the partial batch. Stop retained the recruited physical actor.

Player-control protection used explicitly simulated control signals in the isolated fixture. No connected-human acceptance is claimed. Route installation and native policy readback are not combat acceptance. Universal two-way live editing remains unfinished. A fresh convoy test completed both 4/4 boardings, physical following, two ordered lead arrivals and detach; the earlier intermittent 3/4 boarding timeout remains unresolved because its cause has not been established.

## Français

Le bridge 0.11.2 peut contrôler une IA d’infanterie vivante à pied via un groupe natif d’un membre, après déploiement approuvé ou recrutement d’une identité suivie. Après reconnexion, recrutez l’IA suivie à nouveau avec l’approbation de l’hôte. La libération conserve les troupes ; elle n’autorise pas la suppression. Les marqueurs du plan restent distincts des entités en jeu. Les sauvegardes de personnages individuels nécessitent ce nouveau bridge. Les protections de joueurs ont été testées avec des signaux simulés, sans clients humains connectés. Le délai d’embarquement intermittent et l’édition bidirectionnelle complète restent ouverts.

## Deutsch

Bridge 0.11.2 kann eine lebende einzelne Infanterie-KI zu Fuß über eine native Einpersonengruppe steuern, nach genehmigtem Einsatz oder Übernahme einer erfassten Identität. Nach erneuter Verbindung die erfasste KI mit Host-Freigabe erneut übernehmen. Freigeben erhält die Truppen und erlaubt kein Löschen. Planmarkierungen bleiben von Live-Entitäten getrennt. Einzelcharakter-Snapshots benötigen diese neue Bridge. Spielerschutz wurde mit simulierten Kontrollsignalen ohne verbundene menschliche Clients geprüft. Der gelegentliche Einstiegs-Timeout und die vollständige bidirektionale Bearbeitung bleiben offen.
