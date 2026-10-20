# Tracking pilot debrief — 2026-10-13

## Implemented
60 explicit named entities, protocol 3 batched telemetry, 0.5 m movement deltas, complete membership heartbeats, periodic/full recovery, five-second stale expiry, per-ID retained map markers and one animation-frame update queue. No automatic player discovery or gameplay commands. Private dedicated-server config, secret-free profiles and English/French/German Sarge instructions included.

## Validation
- Native PC and Workbench script compilation passed.
- Real standalone-server HTTPS test: all 60 arrived, stationary membership retained, moved entity updated, deleted entity removed, 59 final markers. Saved mission unchanged; no renderer errors. About 582 MB sampled peak server memory.
- 18 focused tracking/deployment/localization checks passed across the final test calls. Earlier affected legacy bridge checks passed before the final guidance changes.
- Six independent JSON schemas and 12 contract cases passed.
- Isolated desktop smoke: 60 markers created and cleared; settings enforce a maximum two-second interval; mission unchanged; no renderer errors.
- Short desktop rendering sample: 180 frames, median 16.7 ms, 95th percentile 16.8 ms on this PC. This is a stationary-marker smoke sample, not a busy mission benchmark or sustained 60 FPS guarantee.
- Test server/tunnel stopped, session revoked, private test config disabled. Synthetic fixtures are outside production source.

## Delivery boundaries
RC1 and published Workshop 0.2.0 remain unchanged. This branch requires a matching addon update before public use. Automatic opt-in player tracking and eventual 120-player support remain future work. The reviewed deployment-intent CLI is offline and source-only; no native execution adapter exists yet.

See TRACKED-ENTITIES-PILOT.md for application and server setup. The isolated Windows pilot is in experiments/tracking-pilot, separate from published packages. No public release tag was created by this milestone.
