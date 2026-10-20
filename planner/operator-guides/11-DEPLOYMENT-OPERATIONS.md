# COMMAND deployment operations — English

## Occupied vehicle deployment

In Command → Deploy, review the selected vehicle, individual crew and optional passenger squads first, then open Occupied vehicle deployment. Select the vehicle and explicit pilot, gunner or cargo roles. Passenger squads use automatic cargo seats and preserve their real group identity. Review again and send only when the bridge advertises support. One approved request creates the roots, waits for declared squad members and verifies every required native seat. Root count and actor count differ: at most 16 roots and 15 occupants per request. Missing required seats remove the newly created batch, protecting players. Signed native manager IDs are valid. Check results; retry retains the original request ID. It does not fix the historical walking boarding timeout.

## Ground reinforcement dispatch

In Command → Deploy, insert a reserve composition at its staging point and review only infantry or infantry-group prefabs. Open Ground reinforcement dispatch, choose a destination on the map and review the staged reserve. Send its deployment and refresh until native execution is reported. Explicitly permit replacement of existing movement orders, then send each ground order and refresh its result. Accepted orders do not prove physical arrival. Failed steps stop without automatically respawning units. Stop dispatch retains already deployed entities. Pairing changes discard this transient workflow. Helicopter insertion is a separate experimental reviewed operation.

## Refuel once

In Command → Orders, open Refuel once. Refresh owned targets and choose a supported vehicle, supplying tanker and distinct individual AI operator from the same pairing. All must be parked in native interaction range with compatible factions and equipment. Review one stock interaction and send for host approval only if support is advertised. The game checks scenario resources; no fuel setter or supply bypass is used. Success reports observed vehicle gain and supplying-store consumption. Retry preserves request identity. This is one interaction, not a complete logistics chain; unsupported targets fail clearly.

Status: experimental candidate. Isolated native and desktop evidence does not establish Workshop or two-player acceptance.
