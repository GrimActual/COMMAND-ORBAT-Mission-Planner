# Next-100 progress — 17 October 2026

This records delivered scope, not completion of all 100 steps. Complete-existing identifies functionality already present. General runtime/type claims and unimplemented engine features remain pending.

awaiting-external: 10 | complete-existing: 9 | complete-new: 52 | partial: 10 | pending-development: 19

| Step | Status | Task / evidence |
| --- | --- | --- |
| 1 | awaiting-external | Confirm RC3 installation on a clean Windows account. Isolated app profiles passed; a separate clean Windows account was not tested. |
| 2 | awaiting-external | Collect the first developer feedback on RC3. No outside feedback is available yet. |
| 3 | awaiting-external | Resolve release-blocking feedback before promoting a stable build.  |
| 4 | complete-new | Document supported engine and addon version combinations.  |
| 5 | complete-new | Add a compact compatibility status page.  |
| 6 | complete-new | Keep private test sources out of public reports by default.  |
| 7 | complete-new | Add a release-content exclusion check to CI. Separate hosted distribution gate passed; diagnostic updates do not rerun unchanged compiler gates. |
| 8 | complete-new | Make update guidance preserve existing user data.  |
| 9 | complete-new | Refresh the getting-started walkthrough against the current UI.  |
| 10 | awaiting-external | Publish a stable release only after its acceptance gates pass.  |
| 11 | complete-new | Add folder intake with explicit file-selection preview.  |
| 12 | complete-new | Preserve package-relative source paths during folder intake.  |
| 13 | complete-new | Show unresolved virtual mounts in one repair view.  |
| 14 | complete-new | Let authors supply shared headers through that view.  |
| 15 | complete-new | Show include cycles as a navigable graph. Navigable selected-source include graph with potential-cycle labels; activation remains unresolved. |
| 16 | complete-new | Add source-linked macro expansion comparison.  |
| 17 | complete-new | Display exact preprocessing blockers beside affected entries.  |
| 18 | complete-new | Support saved review settings separately from mission data.  |
| 19 | partial | Add incremental re-review for changed source files. Unchanged complete reports are reused; changed-file incremental invalidation is not implemented. |
| 20 | complete-new | Measure large source-package responsiveness. 64 files / 516 KB: 610.93 ms fresh, 3.51 ms reuse; 10,000 asset counts: 6.09 ms. One local sample. |
| 21 | complete-new | Expand synthetic macro compatibility fixtures.  |
| 22 | complete-new | Compare supported macro behavior with an independent preprocessor. Hosted Linux executed eight original neutral C-preprocessor comparison fixtures. Native Arma parity remains unverified. |
| 23 | complete-new | Define a reviewed policy for line continuations.  |
| 24 | complete-new | Add bounded numeric conditional expressions. Bounded decimal literals/defined markers only; named numeric macros and engine parity remain unresolved. |
| 25 | complete-new | Add explicit diagnostics for unsupported built-in macros.  |
| 26 | pending-development | Review variadic macro feasibility against actual needs.  |
| 27 | complete-new | Improve nested control-flow AST coverage. Added original nested range/while/if/forEach/exitWith AST coverage, preserving manual lowering gates. |
| 28 | complete-new | Add precise forEach scope representation. Added explicit nested forEach body/parent scope and array-only implicit binding candidates. Dynamic iterable values stay unresolved. |
| 29 | pending-development | Represent switch cases and fallthrough rules explicitly.  |
| 30 | complete-existing | Keep unsupported dynamic code visibly manual.  |
| 31 | complete-new | Add immutable cross-file symbol identities. Revision-bound SHA-256 identities survive unrelated-file insertion and order changes; they are provenance, not runtime bindings or native GUIDs. |
| 32 | complete-existing | Track lexical shadowing across nested scopes. Existing lexical shadow candidates retained and verified in new nested initialization/symbol tests. |
| 33 | complete-new | Improve definite-assignment analysis at branch merges. Added optional advisory literal-write path analysis with branch intersection, zero-iteration loops and conservative unknown-effect barriers. General runtime initialization remains unproved. |
| 34 | pending-development | Represent supported array element types explicitly.  |
| 35 | partial | Add typed function return-path diagnostics. Existing supported typed functions reject invalid return paths; general source diagnostics remain pending. |
| 36 | pending-development | Extend call graph diagnostics for unresolved targets.  |
| 37 | pending-development | Model mutation effects across supported pure calls.  |
| 38 | pending-development | Introduce explicit authority and lifetime annotations in IR.  |
| 39 | partial | Version IR contracts and upgrade rules. Existing IR is versioned and strictly validated; upgrade policy is pending. |
| 40 | partial | Export a readable source-to-IR trace. Source-linked read-to-symbol provenance trace is delivered; complete AST/operator/effect-to-target tracing remains pending. |
| 41 | complete-new | Add generated-project preview before writing files.  |
| 42 | partial | Provide a generated component ownership template. Manual ownership pattern provided; no native component hooks are guessed or claimed compiled. |
| 43 | complete-new | Add explicit lifecycle integration instructions per job. Each generated job now has explicit lifecycle and result-handling instructions. |
| 44 | pending-development | Support a reviewed adapter for additional pure predicate types.  |
| 45 | complete-existing | Expose cancellation and timeout outcomes to integration code. Existing native adapter exposes completion, cancellation, owner-deletion and timeout status. |
| 46 | pending-development | Add native checks for selected nested scheduling patterns.  |
| 47 | complete-existing | Keep scheduling semantic differences in the checklist.  |
| 48 | complete-new | Improve deterministic generated names across files.  |
| 49 | complete-new | Add repeatable output checks across supported platforms. Golden generated-project bytes and input-order independence passed on hosted Linux Node 24 and Windows Node 22. |
| 50 | complete-new | Add an author-run Workbench validation command for generated projects. Author-run helper exported and PowerShell syntax checked; no native tool was launched by this checkpoint. |
| 51 | complete-existing | Add explicit source-class to prefab mapping review. Existing reviewed class/prefab mapping workflow retained. |
| 52 | complete-existing | Show missing addon dependencies before export. Existing deployment review displays unresolved addon metadata. |
| 53 | pending-development | Detect stale resource indexes against selected project metadata.  |
| 54 | complete-new | Improve troop, armour and support asset classification.  |
| 55 | complete-new | Add asset search aliases and clearer category counts.  |
| 56 | complete-new | Add an asset-index rebuild walkthrough for mod authors. Current rebuild command and isolated ResourceManager workflow documented. |
| 57 | pending-development | Extend terrain identity matching to additional supported worlds.  |
| 58 | pending-development | Show alignment confidence beside migrated placement previews.  |
| 59 | pending-development | Add elevation-source provenance to deployment review.  |
| 60 | complete-existing | Keep PBO inventories separate from binary terrain conversion. Existing text/binary intake separation retained. |
| 61 | awaiting-external | Complete user testing of current move and defend orders.  |
| 62 | complete-new | Reviewed 1–16-point infantry routes: contract/UI/native installation, replacement/cancel/foreign-order guards passed. Normal-terrain travel acceptance remains separate. |
| 63 | partial | Native bounded Follow binds an explicitly selected same-faction player; synthetic lifecycle passed. Real-player following and normal-terrain movement remain acceptance checks. |
| 64 | partial | Four verified formation definitions plus restoration implemented and read back natively. Diamond, Circle, adaptive Auto and physical spacing acceptance remain open. |
| 65 | complete-new | Persistent native Stand/Crouch/Prone and own-override Auto removal implemented; existing members, transfer/rejoin, foreign editor protection and release cleanup passed. Idle Stand/Crouch/Prone physically verified for all four members after the 0.10.1 transition fix; per-member editor override preserved. Combat-pose acceptance remains separate. |
| 66 | partial | Native Open Fire setting and actual-mode readback passed. Combat execution acceptance remains open. |
| 67 | partial | Native HOLD_FIRE and RETURN_FIRE are distinct and read back correctly; strict behavior under received fire is not claimed without a combat test. |
| 68 | pending-development | Add suppression and look-at adapters where supported.  |
| 69 | complete-new | Host-reviewed recruitment and release of existing selected AI squads; native faction/membership/selection guards, deletion prohibition and lifecycle checks passed. Real-session acceptance remains separate. |
| 70 | complete-existing | Keep host approval and owned-group boundaries visible. Existing native approval, capability and bridge-owned-target gates retained. |
| 71 | complete-new | Read-only vehicle seat/capacity inspection implemented and verified in an isolated native server and offline Electron. Separate capability and host approval required. Source checkpoint only; see VEHICLE-INSPECTION-PILOT.md. No boarding/transport or real-player acceptance claim. |
| 72 | complete-new | Reviewed embark with explicit roles, exact paired ownership, bounded cleanup and observed boarding passed native and offline desktop gates. Foreign reservations and waypoints are retained. See SQUAD-TRANSPORT-PILOT.md. |
| 73 | complete-new | Native dismount reports observed member results. Deliberate 3-of-4 boarding timeout recovered by dismounting only mounted members; the fourth stayed on foot. Native and desktop receipts linked in SQUAD-TRANSPORT-PILOT.md. |
| 74 | partial | Native production guards reject a simulated human-control signal for transport, dismount, driving and treatment; four actual AI occupants retained. See control-human-signal-native.json. Real connected-player behavior remains an external acceptance gate. |
| 75 | complete-new | Original convoy pursuit followed a moving leader across multiple native segments with four crew retained; cycles rejected, detach, fixed expiry and pairing shutdown passed. See convoy-native.json and convoy-lifecycle-native.json. Development pilot, no live-state guarantee. |
| 76 | complete-new | Verify vehicle route handling separately from infantry. Native two-point observed vehicle arrival with four AI occupants; separate offline desktop review. See vehicle-routing-native.json and vehicle-control-desktop.json. Development source only. |
| 77 | complete-new | Original separately approved native treatment for one supported wounded squad member. Healthy-target rejection, actual bandage consumption/bleeding cessation, timeout, cancellation, foreign-waypoint preservation and localized desktop workflow passed. See SQUAD-TREATMENT-PILOT.md. |
| 78 | complete-new | Investigate building entry points using native metadata. Bounded original door metadata assessment passed on native house; no navigability or building-entry claim. See BUILDING-METADATA-ASSESSMENT.md. |
| 79 | pending-development | Prototype garrison behavior in an isolated scenario.  |
| 80 | pending-development | Prototype room-clearing behavior only after navigation validation.  |
| 81 | awaiting-external | Run a user-led mixed human and AI 60-entity session.  |
| 82 | awaiting-external | Verify faction filters during joining and respawn.  |
| 83 | pending-development | Measure relay reconnect behavior over a longer session.  |
| 84 | complete-existing | Validate stale entity removal without dropping stationary units. Existing heartbeat, replay, expiry and full-recovery regression checks passed. |
| 85 | pending-development | Measure bounded delta updates under packet loss.  |
| 86 | complete-new | Check marker update cost at the current 60-entity cap. Matched short 60-marker samples: RC3 60.35 FPS, development 60.38 FPS; no sustained guarantee. |
| 87 | complete-new | Profile repeated open-and-close inspector sessions for leaks. 100 cycles: unchanged 1,872 DOM nodes; post-collection heap +74,676 bytes. One short sample, not proof of leak freedom. |
| 88 | complete-new | Verify map controls across common high-DPI settings. Emulated DPR 1 / 1.25 / 1.5 / 2 preserved placement coordinates. Physical monitor coverage remains separate. |
| 89 | complete-new | Plan protocol compatibility for a future 120-player cap. Proposal only; the enforced current cap remains 60. |
| 90 | pending-development | Increase the cap only after server and desktop measurements justify it.  |
| 91 | complete-new | Add a developer-facing native adapter capability matrix. Capability and evidence limits documented; unsupported adapters stay explicitly pending. |
| 92 | complete-new | Document which Workbench modules require manual integration.  |
| 93 | complete-new | Add explicit localization resource adapter requirements.  |
| 94 | complete-new | Add explicit audio-event adapter requirements.  |
| 95 | complete-new | Add explicit UI action-binding adapter requirements.  |
| 96 | complete-new | Add reviewed multiplayer authority examples using original fixtures. Original synthetic queue fixture validates advertised capability, approval and owned target; no live engine request. |
| 97 | pending-development | Run a complete original-fixture migration walkthrough.  |
| 98 | awaiting-external | Have an independent server developer repeat the walkthrough.  |
| 99 | awaiting-external | Resolve remaining release blockers and update Sarge plus guides.  |
| 100 | awaiting-external | Publish the next stable release with matching source and evidence.  |

The first source checkpoint passed hosted Linux/Windows and distribution checks. The initialization checkpoint has focused local worker and real desktop coverage; its matching hosted result will be recorded separately.

See NEXT100-DELIVERY.md and NEXT100-INITIALIZATION.md for exact boundaries. The 34 pending-development items still need implementation; five other items are partial and ten await outside acceptance.


17 October 2026: Native AI order audit added without removing roadmap goals. Move, timed Hold, Defend, two-point routes, synthetic-character Follow and cancellation were exercised with active AI on Everon navigation data. Bridge 0.10.1 corrects a reproduced idle-stance response issue. See NATIVE-AI-ORDER-AUDIT.md for exact evidence and limits; formation spacing and strict Hold Fire under attack remain unverified.

## Additional server snapshot request — 17 October 2026

Implemented outside the original 100-row numbering: separately approved planned-deployment save, supported current-state capture to the server profile, no-spawn review and frozen separately approved restoration. Actual server process restart, exact member positions, saved move/stance and partial rollback gates passed; offline Electron passed three languages, Settings destination, stale review and unchanged mission data. No local file inbox or automatic recovery was added. Source development only until the matching release is identified. See SERVER-SCENARIO-SNAPSHOTS.md.

## Control execution follow-up — 18 October 2026

The followon.8 / bridge 0.11.1 candidate improves existing controls without renumbering these rows. Explicit revocation/recovery and read-only activation/waypoint inspection address stale control and ambiguous results. A native dormant-AI reproduction and original non-forced activation fix have separate evidence. See CONTROL-EXECUTION-UPDATE.md. Hosted gameplay acceptance and all previously deferred items remain open.


2026-10-18 usability follow-up: automatic labels for unnamed deployment entries, pending-only cancellation with status recheck, explicit existing-squad recruitment shortcut, and synchronized EN/FR/DE help. See docs/CONTROL-USABILITY-REVIEW.md. Lone-character squad orders and universal plan/live two-way editing remain unimplemented; no new native acceptance claim.

Presentation follow-up: original COMMAND shell with left navigation, actual plan/connection readouts, Deploy/Orders/Server task views, retained original controls, and clearly separate offline rehearsal. UI-only; no added native capabilities or two-way editing claim.
