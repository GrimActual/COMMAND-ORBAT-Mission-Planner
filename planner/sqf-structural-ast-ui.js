/* Explicit, session-only syntax inspection; no bridge or mission mutation. */
'use strict';
(()=>{
 const $=id=>document.getElementById(id),t=s=>window.PlannerI18n?.t(s)||s;
 const box=document.createElement('details');box.id='sqfASTReview';
 box.innerHTML='<summary>SQF syntax inspector</summary><p>Inspect nested conditions, loops and stored code blocks. Expressions and runtime semantics remain unresolved. This does not generate Enforce code or run game commands.</p><button id="sqfASTInspect" type="button" disabled>Inspect SQF structure</button><p id="sqfASTStatus" role="status">No syntax review</p><div id="sqfASTRows"></div><button id="sqfASTPrev" type="button" disabled>Previous syntax rows</button><button id="sqfASTNext" type="button" disabled>Next syntax rows</button><button id="sqfASTExport" type="button" disabled>Export syntax review</button><button id="sqfASTClear" type="button">Clear syntax review</button>';
 $('sqfMigration').append(box);
 let statusKey="No syntax review",statusDetail="";
 const status=(key,detail="")=>{statusKey=key;statusDetail=detail;};
 let report=null,page=0,worker=null,timer=null,epoch=0,revision=null,stale=false,saving=false;
 const labels={Program:'Source file',Block:'Code block',If:'Condition',ExitWith:'Exit current code scope',While:'While loop',ForRange:'Range loop',ForCode:'Three-block loop',ForEach:'For-each loop',CodeAssignment:'Stored code block',Assignment:'Assignment',CodeLiteral:'Code value',OpaqueStatement:'Unresolved expression or command',Unsupported:'Unsupported control syntax'};
 const busy=()=>!!window.CompanionMigrationFiles?.busy();
 const current=()=>!!report&&!stale&&!busy()&&revision===window.CompanionMigrationFiles?.revision();
 function stop(){worker?.terminate();worker=null;clearTimeout(timer);timer=null;}
 function render(){
  $('sqfASTStatus').textContent=t(statusKey)+(statusDetail?': '+statusDetail:'')+(statusKey==='Syntax review ready'&&report?' · '+report.summary.nodes+' '+t('syntax nodes')+' · '+report.summary.loops+' '+t('loops')+' · '+report.summary.conditionals+' '+t('conditions')+' · '+report.summary.unsupported+' '+t('unsupported statements'):'');
  const rows=$('sqfASTRows');rows.replaceChildren();const all=report?[...report.nodes,...report.findings]:[];page=Math.min(page,Math.max(0,Math.ceil(all.length/40)-1));
  for(const row of all.slice(page*40,page*40+40)){const p=document.createElement('p');p.style.whiteSpace='pre-wrap';p.style.overflowWrap='anywhere';p.textContent=(row.kind?t(labels[row.kind]||row.kind):t('Review finding'))+' · '+row.source.file+':'+row.source.line+':'+row.source.column+'\n'+(row.preview??row.message)+(row.parts?.length?'\n'+row.parts.map(part=>part.role+': '+part.preview).join('\n'):'');rows.append(p);}
  $('sqfASTInspect').disabled=!!worker||saving||busy()||!window.CompanionMigrationFiles?.count();$('sqfASTPrev').disabled=page===0;$('sqfASTNext').disabled=(page+1)*40>=all.length;$('sqfASTExport').disabled=!!worker||saving||!current()||!window.plannerMetadata?.exportSQFAST;
 }
 function invalidate(){epoch++;stop();stale=!!report;status(report?'Syntax review is stale. Inspect again.':'No syntax review');render();}
 window.addEventListener('command-sqf-source-changing',invalidate);window.addEventListener('command-sqf-source-ready',render);
 $('sqfASTInspect').onclick=()=>{if(worker||saving||busy())return;const files=window.CompanionMigrationFiles?.snapshot()||[];if(!files.length)return;const at=++epoch,sourceRevision=window.CompanionMigrationFiles.revision();stale=!!report;
  try{worker=new Worker('sqf-structural-ast-worker.js');const active=worker;status('Inspecting SQF structure');render();timer=setTimeout(()=>{if(at!==epoch)return;epoch++;stop();status('Syntax review timed out');render();},15000);
   active.onmessage=e=>{if(at!==epoch)return;stop();if(sourceRevision!==window.CompanionMigrationFiles.revision()||busy()){status('Syntax review is stale. Inspect again.');stale=!!report;}else if(e.data.ok){report=e.data.report;revision=sourceRevision;stale=false;page=0;status('Syntax review ready');}else{status('Syntax review rejected',e.data.error);}render();};
   active.onerror=()=>{if(at!==epoch)return;epoch++;stop();status('Syntax review rejected');render();};active.postMessage(files);
  }catch(error){stop();status('Syntax review rejected',error.message);render();}
 };
 $('sqfASTPrev').onclick=()=>{page--;render();};$('sqfASTNext').onclick=()=>{page++;render();};
 $('sqfASTClear').onclick=()=>{epoch++;stop();report=null;revision=null;stale=false;page=0;status('No syntax review');render();};
 $('sqfASTExport').onclick=async()=>{if(!current()||worker||saving)return;const at=epoch;saving=true;render();try{const result=await plannerMetadata.exportSQFAST(report);if(at===epoch)status(result.ok?'Syntax review saved':result.cancelled?'Syntax export cancelled':'Syntax export failed');}catch(error){if(at===epoch)status('Syntax export failed',error.message);}finally{saving=false;render();}};
 const shortcut=document.createElement('button');shortcut.type='button';shortcut.textContent=t('Open SQF syntax inspector');shortcut.onclick=()=>{document.querySelector('#settingsDialog')?.close();document.querySelector('[data-tab=assets]').click();$('sqfMigration').open=true;box.open=true;box.scrollIntoView({block:'nearest'});$('sqfASTInspect').focus();};$('gmSettingsPanel').append(shortcut);
 window.addEventListener('planner-preferences-changed',()=>{shortcut.textContent=t('Open SQF syntax inspector');render();});
 window.CompanionMigrationAST={snapshot:()=>current()&&!worker?structuredClone(report):null,revision:()=>epoch,current:()=>current()&&!worker};render();
})();
