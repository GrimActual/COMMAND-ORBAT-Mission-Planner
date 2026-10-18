/* Interface-only localization. Never rewrites plan data, form values or imported names. */
'use strict';
(()=>{
 const dictionaries=window.PlannerTranslations;
 const language=()=>window.PlannerPreferences?.get().language||'en';
 function t(source,requestedLanguage=language()){return dictionaries[requestedLanguage]?.[source]??source;}
 const records=new WeakMap();
 // These containers mix user content with UI. Their fixed labels are localized at source.
 const excluded='script,style,svg,textarea,input,[contenteditable],#commandPlanName,#map,#roster,#drawingList,#symbolPreview,#assetMeta,#asset,#parent,#unitPhase,#drawingPhase,#phases,#unitTitle,#drawingTitle,#propertyReviewRows,#metadataResources,#metadataGaps,#metadataSummary,#deploymentRows,#deploymentGMResult,#deploymentRemoveId,#aiTarget,#aiPreview,#aiResults,#aiLatest,#transportSquad,#transportVehicle,#transportPreview,#transportResults,#healingSquad,#healingPreview,#healingResults,#snapshotTargets,#snapshotReviews,#snapshotPreview,#snapshotResults,#vehicleCrew,#vehicleTarget,#vehicleLeader,#vehiclePreview,#vehicleResults,#vehicleRoutePoints,#aiDestination,#sqfRows,#sqfStatus,#sqfASTRows,#sqfASTStatus,#sqfDependencyReview,#sqfFunctionExplorer,#sqfTypeReview,#sqfEffectReview,#sqfDiagnosticExport,#sourceProjectActions,#classMapSources,#classMapTargets,#classMapPreview,#classMapCoverage,#classMapStatus,#intentDraftRows,#intentDraftStatus,#migrationChoices,#migrationRouteChoices,#alignmentResiduals,#alignmentStatus,#terrainResolution,#terrainObservationStatus,#migrationPlacementRows,#migrationTransferStatus';
 function translated(source){
  if(t(source)!==source)return t(source);
  const patterns=[
   [/^(Saved locally · )(.*)$/s,'Saved locally · '],
   [/^(Catalog rejected: |Could not load: |Export failed: |Settings could not be fully saved: )(.*)$/s,null],
   [/^(Import rejected: )(.*)(\. Current plan unchanged\.)$/s,null],
   [/^(Validated )(backup|export)( download requested · )(.*)$/s,null],
   [/^(Loaded\. )([0-9]+)( assets available\.)$/s,null],
   [/^([0-9]+)( selected)( · includes locked objects)?$/s,null],
   [/^([0-9]+)( objects copied within this app session\.)$/s,null],
   [/^(Add at least )([0-9]+)( points\.)$/s,null],
   [/^([0-9]+)( selected objects deleted\. Undo restores the group\.)$/s,null]
  ];
  for(const [re] of patterns){const match=source.match(re);if(match)return match.slice(1).map(v=>t(v||'')).join('');}
  return source;
 }
 function translateSlot(node,key,read,write){
  let slots=records.get(node);if(!slots){slots={};records.set(node,slots);}
  const value=read();let rec=slots[key];
  if(!rec||value!==rec.output)rec=slots[key]={source:value,output:value};
  const match=rec.source.match(/^(\s*)(.*?)(\s*)$/s);
  const next=match[1]+translated(match[2])+match[3];
  rec.output=next;if(value!==next)write(next);
 }
 function visit(root){
  if(root.nodeType===Node.TEXT_NODE){
   if(root.parentElement&&!root.parentElement.closest(excluded))translateSlot(root,'text',()=>root.data,v=>root.data=v);
   return;
  }
  if(root.nodeType!==Node.ELEMENT_NODE)return;
  const field=root.matches('input,textarea');
  if(!field&&root.matches(excluded))return;
  for(const attr of ['aria-label','title','placeholder','alt'])if(root.hasAttribute(attr))translateSlot(root,attr,()=>root.getAttribute(attr),v=>root.setAttribute(attr,v));
  // Translate instructions on fields, never typed values or textarea contents.
  if(field)return;
  for(const child of root.childNodes)visit(child);
 }
 let observer;
 function refresh(){if(!document.body)return;observer?.disconnect();document.documentElement.lang=language();visit(document.body);observer?.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder','alt']});}
 window.PlannerI18n={t,refresh};
 window.addEventListener('planner-preferences-changed',refresh);
 document.addEventListener('DOMContentLoaded',()=>{
  observer=new MutationObserver(changes=>{
   observer.disconnect();
   for(const change of changes){if(change.type==='childList')for(const node of change.addedNodes) {if(!node.parentElement?.closest(excluded))visit(node);}else if(!change.target.parentElement?.closest(excluded))visit(change.target);}
   observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder','alt']});
  });refresh();
 });
})();
