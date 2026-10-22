/* Presentation access to existing catalog/index controls. No import, pairing or mission logic. */
'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const words={
  'Asset library':['Asset library','Bibliothèque d’assets','Asset-Bibliothek'],
  'Back to selection':['Back to selection','Retour à la sélection','Zurück zur Auswahl'],
  'Asset catalog':['Asset catalog','Catalogue d’assets','Asset-Katalog'],
  'Deployment resource index':['Deployment resource index','Index des ressources de déploiement','Ressourcenindex für den Einsatz'],
  'Choose a catalog to update the assets available to place. Existing planned units keep their saved asset references.':['Choose a catalog to update the assets available to place. Existing planned units keep their saved asset references.','Choisissez un catalogue pour actualiser les assets disponibles. Les unités déjà planifiées conservent leurs références enregistrées.','Wählen Sie einen Katalog, um verfügbare Assets zu aktualisieren. Bereits geplante Einheiten behalten ihre gespeicherten Asset-Referenzen.'],
  'The resource index identifies exact game prefabs for deployment. It is separate from the asset catalog.':['The resource index identifies exact game prefabs for deployment. It is separate from the asset catalog.','L’index identifie les prefabs exacts du jeu pour le déploiement. Il est distinct du catalogue d’assets.','Der Ressourcenindex identifiziert genaue Spiel-Prefabs für den Einsatz. Er ist vom Asset-Katalog getrennt.'],
  'Choose files yourself. Opening this panel imports nothing, uploads no files to the server and deploys no units.':['Choose files yourself. Opening this panel imports nothing, uploads no files to the server and deploys no units.','Choisissez vous-même les fichiers. Ouvrir ce panneau n’importe rien, n’envoie aucun fichier au serveur et ne déploie aucune unité.','Wählen Sie die Dateien selbst aus. Das Öffnen dieses Bereichs importiert nichts, lädt keine Dateien auf den Server und setzt keine Einheiten ein.'],
  'Resource index import is available in the desktop application.':['Resource index import is available in the desktop application.','L’importation de l’index est disponible dans l’application de bureau.','Der Import des Ressourcenindex ist in der Desktop-Anwendung verfügbar.']
 };
 const dictionaries=window.PlannerTranslations||(window.PlannerTranslations={});
 for(const [column,language]of ['en','fr','de'].entries()){
  const dictionary=dictionaries[language]||(dictionaries[language]={});
  for(const [source,translations]of Object.entries(words))if(!Object.hasOwn(dictionary,source))dictionary[source]=translations[column];
 }
 const t=source=>window.PlannerI18n?.t(source)||source;
 const mission=$('gmUnifiedMission'),body=$('gmUnifiedBody'),catalog=$('catalogFile'),index=$('deploymentIndex');
 if(!mission||!body||!catalog||!index||$('gmUnifiedAssetLibrary'))return;
 const action=document.createElement('button');action.type='button';action.id='gmUnifiedAssetLibrary';action.dataset.commandLabel='Asset library';
 mission.after(action);
 let view=null,moved=[],hiddenStates=[],savedScroll=0,returnFocus=null,watch=null,back=null;
 const labels=[];
 function label(node,source){labels.push({node,source});node.textContent=t(source);return node;}
 function paragraph(source){return label(document.createElement('p'),source);}
 function translate(){action.textContent=t('Asset library');for(const item of labels)if(item.node.isConnected)item.node.textContent=t(item.source);}
 function restore({restoreView=true,focus=false}={}){
  if(!view)return;
  watch?.disconnect();watch=null;
  for(const item of moved){if(item.anchor.parentNode)item.anchor.replaceWith(item.node);}
  moved=[];
  view.remove();view=null;back=null;labels.length=0;
  if(restoreView){for(const item of hiddenStates)if(item.node.isConnected)item.node.hidden=item.hidden;body.scrollTop=savedScroll;}
  hiddenStates=[];
  if(focus&&returnFocus?.isConnected&&!returnFocus.disabled)returnFocus.focus({preventScroll:true});
  returnFocus=null;
 }
 function move(node,into){
  if(!node?.parentNode)return;
  const anchor=document.createComment('asset library control home');node.before(anchor);moved.push({node,anchor});into.append(node);
 }
 function open(){
  if(view){back.focus({preventScroll:true});return;}
  window.CommandUnifiedWorkspace?.open();
  returnFocus=document.activeElement;
  savedScroll=body.scrollTop;
  const panels=[$('gmUnifiedResults'),$('gmUnifiedInspector'),$('gmUnifiedAction')].filter(Boolean);
  hiddenStates=panels.map(node=>({node,hidden:node.hidden}));
  view=document.createElement('section');view.id='assetLibrary';view.setAttribute('aria-labelledby','assetLibraryHeading');
  back=label(document.createElement('button'),'Back to selection');back.id='assetLibraryBack';back.type='button';back.onclick=()=>restore({focus:true});
  const heading=label(document.createElement('h2'),'Asset library');heading.id='assetLibraryHeading';
  view.append(back,heading,paragraph('Choose files yourself. Opening this panel imports nothing, uploads no files to the server and deploys no units.'));
  const catalogSection=document.createElement('section');catalogSection.setAttribute('aria-labelledby','assetLibraryCatalogHeading');
  const catalogHeading=label(document.createElement('h3'),'Asset catalog');catalogHeading.id='assetLibraryCatalogHeading';
  catalogSection.append(catalogHeading,paragraph('Choose a catalog to update the assets available to place. Existing planned units keep their saved asset references.'));
  const catalogLabel=document.querySelector('label[for="catalogFile"]');move(catalogLabel,catalogSection);move(catalog,catalogSection);move($('catalogStatus'),catalogSection);
  const indexSection=document.createElement('section');indexSection.setAttribute('aria-labelledby','assetLibraryIndexHeading');
  const indexHeading=label(document.createElement('h3'),'Deployment resource index');indexHeading.id='assetLibraryIndexHeading';
  indexSection.append(indexHeading,paragraph('The resource index identifies exact game prefabs for deployment. It is separate from the asset catalog.'));
  move(index,indexSection);move($('deploymentIndexStatus'),indexSection);move($('deploymentStatus'),indexSection);
  if(!window.plannerMetadata)indexSection.append(paragraph('Resource index import is available in the desktop application.'));
  view.append(catalogSection,indexSection);body.append(view);
  for(const panel of panels)panel.hidden=true;
  body.scrollTop=0;back.focus({preventScroll:true});
  // Existing tools own their presentation. Restore moved controls before yielding to another tool.
  const tool=$('gmUnifiedAction');
  watch=new MutationObserver(records=>{
   if(!view)return;
   if(records.some(record=>record.type==='childList'&&record.target===tool)){
    restore({restoreView:false});return;
   }
   // Catalog refresh may rerender the browser behind this temporary view.
   for(const panel of panels)if(!panel.hidden)panel.hidden=true;
  });
  for(const panel of panels)watch.observe(panel,{attributes:true,attributeFilter:['hidden']});
  if(tool)watch.observe(tool,{childList:true});
 }
 action.onclick=open;
 // Restore before the destination's normal click handler runs, keeping its chosen layout intact.
 document.addEventListener('click',event=>{
  if(!view||view.contains(event.target)||action.contains(event.target))return;
  if(event.target.closest?.('button,[data-tab]'))restore();
 },true);
 document.addEventListener('input',event=>{
  if(view&&event.target.closest?.('#gmUnifiedHead')&&!view.contains(event.target))restore();
 },true);
 document.addEventListener('change',event=>{
  if(view&&event.target.closest?.('#gmUnifiedHead')&&!view.contains(event.target))restore();
 },true);
 // The existing workspace has already selected/inspected the new item; do not restore an older view.
 window.addEventListener('planner-selection-changed',()=>restore({restoreView:false}));
 window.addEventListener('planner-preferences-changed',translate);
 window.addEventListener('beforeunload',()=>{watch?.disconnect();});
 window.CommandAssetLibrary={open};
 translate();
})();
