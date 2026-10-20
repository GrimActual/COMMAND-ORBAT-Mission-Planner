/* Optional layout shell: existing forms/commands own all editing and execution. */
'use strict';
(()=>{
 const $=id=>document.getElementById(id),P=window.PlannerPreferences,t=s=>window.PlannerI18n.t(s),body=document.body,shell=document.querySelector('.map-shell');
 const toggle=document.createElement('button');toggle.type='button';toggle.id='gmWorkspaceToggle';toggle.setAttribute('aria-pressed','false');document.querySelector('header .actions').prepend(toggle);
 const bar=document.createElement('nav');bar.id='gmWorkspaceBar';bar.setAttribute('aria-label','Compact GM controls');bar.hidden=true;shell.append(bar);
 const labels=new Map();function button(id,label,fn,parent=bar){const b=document.createElement('button');b.id=id;b.type='button';labels.set(b,label);b.onclick=fn;parent.append(b);return b;}
 const host=$('assetBrowserHost'),anchor=document.createComment('asset browser home');host.before(anchor);
 function drawer(id,title){const box=document.createElement('section');box.id=id;box.className='gm-drawer';box.hidden=true;box.setAttribute('aria-label',title);const head=document.createElement('div');head.className='section-heading';const h=document.createElement('h2');labels.set(h,title);head.append(h);box.append(head);shell.append(box);return {box,head};}
 const assets=drawer('gmAssetDrawer','Asset drawer'),inspector=drawer('gmSelectionInspector','Planned selection');
 const inspectorRows=document.createElement('div');inspectorRows.id='gmInspectorRows';inspector.box.append(inspectorRows);
 const note=document.createElement('p');note.className='hint';labels.set(note,'Planned markers are separate from live tracking and offline rehearsal. Editing opens the existing form.');inspector.box.append(note);
 let editor=false,frame=0,positionFrame=0,dirty=true,live='off';
 const liveReadout=document.createElement('span');liveReadout.id='gmWorkspaceLive';liveReadout.className='gm-workspace-state';const rehearsalReadout=document.createElement('span');rehearsalReadout.id='gmWorkspaceRehearsal';rehearsalReadout.className='gm-workspace-state';
 function save(key,value){try{P.save({...P.get(),[key]:value});}catch(e){$('status').textContent=t('Workspace preference could not be saved')+': '+e.message;}}
 function toggleDrawer(which){const show=which==='assets'?assets.box.hidden:inspector.box.hidden;editor=false;try{const pref=P.get();P.save({...pref,gmAssetDrawer:which==='assets'?show:(innerWidth<950&&show?false:pref.gmAssetDrawer),gmInspector:which==='inspector'?show:(innerWidth<950&&show?false:pref.gmInspector)});}catch(e){$('status').textContent=t('Workspace preference could not be saved')+': '+e.message;}}
 function showEditor(tab){editor=true;body.classList.add('gm-workspace-editor');if(tab)document.querySelector('[data-tab="'+tab+'"]').click();layout();}
 function openDeployment(){showEditor('units');window.CompanionDeploymentReview.open();}
 const assetsButton=button('gmWorkspaceAssets','Assets',()=>toggleDrawer('assets'));
 const inspectorButton=button('gmWorkspaceInspector','Inspector',()=>toggleDrawer('inspector'));
 const editorButton=button('gmWorkspaceEditor','Editor',()=>{editor=!editor;layout();});
 button('gmWorkspaceDeployment','Review deployment',openDeployment);
 button('gmWorkspaceAIOrders','Native AI orders',()=>{showEditor('units');window.CompanionAIOrders?.open();});
 const resultButton=button('gmWorkspaceResults','Request results',()=>{openDeployment();$('deploymentGMStatus').click();});
 button('gmWorkspaceOffline','Offline rehearsal',()=>showEditor('gm'));
 const pauseButton=button('gmWorkspacePause','Pause rehearsal',()=>{if(!$('gmPause').disabled)$('gmPause').click();});
 const advanceButton=button('gmWorkspaceAdvance','Advance rehearsal',()=>{if(!$('gmStep').disabled)$('gmStep').click();});
 bar.append(liveReadout,rehearsalReadout);
 const actions=document.createElement('details');actions.id='gmWorkspaceMenu';const actionsSummary=document.createElement('summary');labels.set(actionsSummary,'GM actions');actions.append(actionsSummary);const actionsMenu=document.createElement('div');actionsMenu.id='gmWorkspaceActions';actions.append(actionsMenu);
 for(const id of ['gmWorkspaceDeployment','gmWorkspaceAIOrders','gmWorkspaceResults','gmWorkspaceOffline','gmWorkspacePause','gmWorkspaceAdvance'])actionsMenu.append($(id));actionsMenu.append(rehearsalReadout);bar.insertBefore(actions,liveReadout);
 actionsMenu.addEventListener('click',e=>{if(e.target.closest('button'))actions.open=false;});$('fullMap').addEventListener('click',()=>actions.open=false);
 button('gmAssetDrawerClose','Close asset drawer',()=>{save('gmAssetDrawer',false);assetsButton.focus();},assets.head);
 button('gmInspectorClose','Close inspector',()=>{save('gmInspector',false);inspectorButton.focus();},inspector.head);
 button('gmInspectorEdit','Edit selection',()=>{showEditor();const kind=EveronPlanner.selected()[0]?.kind;document.querySelector('[data-tab="'+(kind==='unit'?'units':'drawing')+'"]').click();$(kind==='unit'?'name':'drawingName').focus({preventScroll:true});},inspector.box);
 button('gmDrawerEditor','Unit editor',()=>showEditor('units'),assets.box);
 const drawerHint=document.createElement('p');drawerHint.className='hint';labels.set(drawerHint,'Choose an asset, then use Unit editor to Apply changes or Place new unit. Browsing does not spawn entities.');assets.box.append(drawerHint);
 toggle.onclick=()=>save('gmWorkspace',!P.get().gmWorkspace);
 function syncStatuses(){const statuses={off:'Off',starting:'Starting',pairing:'Pairing',waiting:'Waiting for data',connecting:'Connecting',connected:'Connected',receiving:'Receiving',stale:'Stale',reconnecting:'Retrying',retrying:'Retrying',error:'Error',expired:'Expired','authentication-failed':'Authentication failed','security-lockout':'Security lockout',unsupported:'Unsupported',interrupted:'Interrupted'};liveReadout.textContent=t('Live bridge')+': '+t(statuses[live]||'Unavailable');rehearsalReadout.textContent=t('Offline rehearsal')+': '+($('gmStatus')?.textContent.replace(/^OFFLINE GM · /,'')||t('No scenario loaded'));pauseButton.disabled=!$('gmPause')||$('gmPause').disabled;advanceButton.disabled=!$('gmStep')||$('gmStep').disabled;resultButton.disabled=!window.plannerLocalBridge;}
 function placeDrawers(){const aside=document.querySelector('main>aside');if(!P.get().gmWorkspace){aside.style.removeProperty('top');aside.style.removeProperty('bottom');return;}if(body.classList.contains('briefing-mode'))return;const top=bar.offsetTop+bar.offsetHeight+10,tools=document.querySelector('.map-toolbar'),bottom=Math.max(105,shell.clientHeight-tools.offsetTop+10);for(const panel of [assets.box,inspector.box,aside]){panel.style.top=top+'px';panel.style.bottom=bottom+'px';}}
 function requestDrawerPlacement(){if(!positionFrame)positionFrame=requestAnimationFrame(()=>{positionFrame=0;placeDrawers();});}
 const panelPlacementObserver=new ResizeObserver(requestDrawerPlacement);panelPlacementObserver.observe(bar);panelPlacementObserver.observe(document.querySelector('.map-toolbar'));
 function label(){toggle.textContent=t('GM workspace');for(const [node,text]of labels)node.textContent=t(text);bar.setAttribute('aria-label',t('Compact GM controls'));assets.box.setAttribute('aria-label',t('Asset drawer'));inspector.box.setAttribute('aria-label',t('Planned selection'));syncStatuses();}
 function renderInspector(){if(!P.get().gmWorkspace||inspector.box.hidden)return;inspectorRows.replaceChildren();const selection=EveronPlanner.selected(),details=EveronPlanner.selectionDetails();const count=document.createElement('p');count.textContent=selection.length+' '+t('selected planned objects');inspectorRows.append(count);$('gmInspectorEdit').disabled=selection.length!==1;
 for(const {kind,object:o}of details){const card=document.createElement('article');card.className='gm-inspector-card';const title=document.createElement('strong');title.textContent=o.name||t('Unnamed planned object');card.append(title);const lines=[t('Plan ID')+': '+o.id,t('Object type')+': '+t(kind==='unit'?'Unit':kind==='route'?'Route':'Area'),t(o.locked?'Locked':'Unlocked')];
 if(kind==='unit'){lines.push(t('Grid')+': '+EveronPlanner.grid(o.position,8),t('Asset')+': '+(o.assetName||t('No asset assigned')));if(o.assetCatalogItem?.resourceReference){const ref=o.assetCatalogItem.resourceReference;lines.push('GUID: '+ref.guid,ref.path,t('Native availability unverified'));}}
 else if(o.points)lines.push(t('Points')+': '+o.points.length);
 for(const text of lines){const line=document.createElement('p');line.textContent=text;card.append(line);}inspectorRows.append(card);}
 if(selection.length>details.length){const more=document.createElement('p');more.textContent=t('Inspector shows up to 16 selected objects.');inspectorRows.append(more);}dirty=false;
 }
 function refreshInspector(){dirty=true;if(!frame&&P.get().gmWorkspace&&P.get().gmInspector)frame=requestAnimationFrame(()=>{frame=0;renderInspector();});}
 function layout(){const pref=P.get(),active=pref.gmWorkspace,focus=document.activeElement;body.classList.toggle('gm-workspace',active);body.classList.toggle('gm-workspace-editor',active&&editor);toggle.setAttribute('aria-pressed',String(active));bar.hidden=!active;if(!active)actions.open=false;assets.box.hidden=!active||!pref.gmAssetDrawer||(innerWidth<950&&editor);inspector.box.hidden=!active||!pref.gmInspector||editor||(innerWidth<950&&pref.gmAssetDrawer);assetsButton.setAttribute('aria-expanded',String(!assets.box.hidden));inspectorButton.setAttribute('aria-expanded',String(!inspector.box.hidden));editorButton.setAttribute('aria-expanded',String(active&&editor));
 // Move the existing chooser, never clone its input values, listeners or asset model.
 if(active){if(host.parentNode!==assets.box)assets.box.insertBefore(host,assets.box.children[1]);if(!assets.box.hidden&&$('assetBrowse').getAttribute('aria-expanded')!=='true')$('assetBrowse').click();}else if(host.parentNode!==anchor.parentNode)anchor.after(host);
 if(dirty&&!inspector.box.hidden)renderInspector();if(focus?.isConnected&&focus!==body&&focus!==document.activeElement)focus.focus({preventScroll:true});label();requestDrawerPlacement();
 }
 window.addEventListener('planner-selection-changed',refreshInspector);window.addEventListener('planner-plan-changed',refreshInspector);
 window.addEventListener('local-bridge-state',e=>{live=e.detail?.status||'off';syncStatuses();});window.addEventListener('gm-frame',()=>queueMicrotask(syncStatuses));
 window.addEventListener('planner-preferences-changed',()=>{if(!P.layoutOnlyChange?.())dirty=true;layout();});
 // Prevent a narrow overlay editor from obscuring the open inspector.
 window.addEventListener('resize',layout);
 document.querySelector('.tabs').addEventListener('click',e=>{if(P.get().gmWorkspace&&e.target.closest('[data-tab]')){editor=true;layout();}},true);
 document.addEventListener('keydown',e=>{if(window.EveronPlanner?.isChoosingOrderDestination?.())return;if(e.key!=='Escape'||e.isComposing||!P.get().gmWorkspace||body.classList.contains('briefing-mode')||document.querySelector('dialog[open]')||e.target.closest('input,textarea,select'))return;if(actions.open){actions.open=false;actionsSummary.focus();}else if(editor){editor=false;layout();editorButton.focus();}else if(!assets.box.hidden){save('gmAssetDrawer',false);assetsButton.focus();}else if(!inspector.box.hidden){save('gmInspector',false);inspectorButton.focus();}else return;e.preventDefault();e.stopImmediatePropagation();},true);
 const section=$('gmSettingsPanel'),check=document.createElement('label');check.className='check';const input=document.createElement('input');input.type='checkbox';input.id='pref-gmWorkspace';input.dataset.pref='gmWorkspace';const text=document.createElement('span');labels.set(text,'Enable compact GM workspace');check.append(input,text);section.prepend(check);button('gmWorkspaceSettingsOpen','Open compact GM workspace',()=>{$('settingsClose').click();editor=false;save('gmWorkspace',true);toggle.focus();},section);
 window.CompanionGMWorkspace={open(){save('gmWorkspace',true);},refresh:refreshInspector};layout();
})();
