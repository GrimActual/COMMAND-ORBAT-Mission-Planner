# Next 100 development steps

Ordered follow-on work after RC3. These extend the existing roadmap; each item needs its own acceptance check. Investigation items are not promises of engine support. Private third-party test details are excluded.

## Release and developer experience

1. Confirm RC3 installation on a clean Windows account.
2. Collect the first developer feedback on RC3.
3. Resolve release-blocking feedback before promoting a stable build.
4. Document supported engine and addon version combinations.
5. Add a compact compatibility status page.
6. Keep private test sources out of public reports by default.
7. Add a release-content exclusion check to CI.
8. Make update guidance preserve existing user data.
9. Refresh the getting-started walkthrough against the current UI.
10. Publish a stable release only after its acceptance gates pass.

## Source intake and diagnostics

11. Add folder intake with explicit file-selection preview.
12. Preserve package-relative source paths during folder intake.
13. Show unresolved virtual mounts in one repair view.
14. Let authors supply shared headers through that view.
15. Show include cycles as a navigable graph.
16. Add source-linked macro expansion comparison.
17. Display exact preprocessing blockers beside affected entries.
18. Support saved review settings separately from mission data.
19. Add incremental re-review for changed source files.
20. Measure large source-package responsiveness.

## Preprocessing and syntax

21. Expand synthetic macro compatibility fixtures.
22. Compare supported macro behavior with an independent preprocessor.
23. Define a reviewed policy for line continuations.
24. Add bounded numeric conditional expressions.
25. Add explicit diagnostics for unsupported built-in macros.
26. Review variadic macro feasibility against actual needs.
27. Improve nested control-flow AST coverage.
28. Add precise forEach scope representation.
29. Represent switch cases and fallthrough rules explicitly.
30. Keep unsupported dynamic code visibly manual.

## Types, symbols and intermediate representation

31. Add immutable cross-file symbol identities.
32. Track lexical shadowing across nested scopes.
33. Improve definite-assignment analysis at branch merges.
34. Represent supported array element types explicitly.
35. Add typed function return-path diagnostics.
36. Extend call graph diagnostics for unresolved targets.
37. Model mutation effects across supported pure calls.
38. Introduce explicit authority and lifetime annotations in IR.
39. Version IR contracts and upgrade rules.
40. Export a readable source-to-IR trace.

## Generation and scheduling

41. Add generated-project preview before writing files.
42. Provide a generated component ownership template.
43. Add explicit lifecycle integration instructions per job.
44. Support a reviewed adapter for additional pure predicate types.
45. Expose cancellation and timeout outcomes to integration code.
46. Add native checks for selected nested scheduling patterns.
47. Keep scheduling semantic differences in the checklist.
48. Improve deterministic generated names across files.
49. Add repeatable output checks across supported platforms.
50. Add an author-run Workbench validation command for generated projects.

## Assets and world context

51. Add explicit source-class to prefab mapping review.
52. Show missing addon dependencies before export.
53. Detect stale resource indexes against selected project metadata.
54. Improve troop, armour and support asset classification.
55. Add asset search aliases and clearer category counts.
56. Add an asset-index rebuild walkthrough for mod authors.
57. Extend terrain identity matching to additional supported worlds.
58. Show alignment confidence beside migrated placement previews.
59. Add elevation-source provenance to deployment review.
60. Keep PBO inventories separate from binary terrain conversion.

## Game Master and AI orders

61. Complete user testing of current move and defend orders.
62. Add reviewed chained waypoint orders.
63. Add native follow-owner behavior.
64. Add formation selection backed by verified engine adapters.
65. Add stance selection backed by verified engine adapters.
66. Add verified open-fire behavior.
67. Investigate strict hold-fire semantics before promising them.
68. Add suppression and look-at adapters where supported.
69. Add squad recruitment authority review.
70. Keep host approval and owned-group boundaries visible.

## Vehicles and advanced squad behavior

71. Add vehicle seat and capacity inspection.
72. Add reviewed squad embark requests.
73. Add dismount requests with clear results.
74. Handle mixed human and AI occupants explicitly.
75. Add convoy attach and detach adapters.
76. Verify vehicle route handling separately from infantry.
77. Add healing requests with supported-target checks.
78. Investigate building entry points using native metadata.
79. Prototype garrison behavior in an isolated scenario.
80. Prototype room-clearing behavior only after navigation validation.

## Tracking, performance and reliability

81. Run a user-led mixed human and AI 60-entity session.
82. Verify faction filters during joining and respawn.
83. Measure relay reconnect behavior over a longer session.
84. Validate stale entity removal without dropping stationary units.
85. Measure bounded delta updates under packet loss.
86. Check marker update cost at the current 60-entity cap.
87. Profile repeated open-and-close inspector sessions for leaks.
88. Verify map controls across common high-DPI settings.
89. Plan protocol compatibility for a future 120-player cap.
90. Increase the cap only after server and desktop measurements justify it.

## Integration and stable acceptance

91. Add a developer-facing native adapter capability matrix.
92. Document which Workbench modules require manual integration.
93. Add explicit localization resource adapter requirements.
94. Add explicit audio-event adapter requirements.
95. Add explicit UI action-binding adapter requirements.
96. Add reviewed multiplayer authority examples using original fixtures.
97. Run a complete original-fixture migration walkthrough.
98. Have an independent server developer repeat the walkthrough.
99. Resolve remaining release blockers and update Sarge plus guides.
100. Publish the next stable release with matching source and evidence.
