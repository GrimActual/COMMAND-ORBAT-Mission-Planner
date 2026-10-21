/* Request lifecycle labels; accepted orders are not a claim of physical arrival. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CommandRequestState=factory();})(globalThis,function(){
 'use strict';
 const orderInstalled=new Set(['ai-move','ai-hold','ai-defend','ai-halt','ai-route','ai-follow','ai-formation','ai-stance','ai-combat-mode']);
 const labels={queued:'Queued',pending:'Awaiting host approval',approved:'Running',unknown:'Delivery uncertain',submitting:'Sending; acknowledgement pending',failed:'Failed',rejected:'Rejected',expired:'Expired',cancelled:'Cancelled',reviewed:'Reviewed',removed:'Removed',stopped:'Stopped'};
 function label(phase,kind){if(phase!=='executed')return labels[phase]||'Status unrecognized';if(orderInstalled.has(kind))return'Order installed';return({spawn:'Deployed',remove:'Removed','ai-recruit':'Control granted','ai-release':'Control released','vehicle-inspect':'Report ready','ai-diagnose':'Report ready','scenario-review':'Server review ready','scenario-save-plan':'Saved to server','scenario-save-current':'Saved to server','scenario-restore':'Restored'})[kind]||'Completed request';}
 const text=(phase,kind)=>globalThis.PlannerI18n?.t(label(phase,kind))||label(phase,kind);
 const bindings=new WeakMap(),entries=new Set();let changes=0;
 function clean(){for(const entry of entries){const target=entry.target.deref();if(!target||!target.isConnected){entries.delete(entry);if(target)bindings.delete(target);}}}
 function bind(target,render){if(!target||typeof render!=='function')return;let entry=bindings.get(target);if(!entry){entry={target:new WeakRef(target),render};bindings.set(target,entry);entries.add(entry);}entries.add(entry);entry.render=render;entry.presented=render();target.textContent=entry.presented;if(++changes%64===0)clean();}
 if(typeof window!=='undefined')window.addEventListener('planner-preferences-changed',()=>{clean();for(const entry of entries){const target=entry.target.deref();if(target){if(target.textContent!==entry.presented){entries.delete(entry);bindings.delete(target);continue;}entry.presented=entry.render();target.textContent=entry.presented;}}});
 return{label,text,bind};
});
