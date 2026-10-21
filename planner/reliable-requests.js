/* COMMAND transient delivery slots. Requests are never rewritten or replayed automatically. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CommandReliableRequests=factory();})(globalThis,function(){
 'use strict';
 const mutations=new Set(['gm-request','gm-occupied','gm-order','gm-vehicle','gm-scenario','gm-helicopter','gm-refuel','gm-remove']);
 const terminal=new Set(['executed','failed','rejected','expired','cancelled']),phases=new Set(['pending','approved',...terminal]);
 function nextPhase(previous,incoming){if(!phases.has(incoming)||terminal.has(previous)||previous==='approved'&&incoming==='pending')return previous;return incoming;}
 function createManager(command){
  const slots=new Set();let epoch=0;
  const notify=slot=>slot.notify?.();function latest(previous,incoming){if(previous?.request?.requestId===incoming?.request?.requestId&&(terminal.has(previous.phase)||previous.phase==='approved'&&incoming.phase==='pending'))return previous;return incoming;}
  function reset(){epoch++;for(const slot of slots){slot.entry=null;slot.inFlight=false;slot.last=null;notify(slot);}}
  function requestKind(state){const entry=state.entry;return entry?.payload.request?.kind||state.last?.request?.kind||(entry?.action==='gm-remove'?'remove':['gm-request','gm-occupied'].includes(entry?.action)?'spawn':null);}
  function matchesKind(state,record){const kind=requestKind(state);return typeof record?.request?.kind==='string'&&(!kind||record.request.kind===kind);}
  function observe(data){for(const slot of slots){const id=slot.entry?.requestId||slot.last?.request?.requestId;if(!id)continue;const record=(data.records||[]).find(r=>r.request?.requestId===id);if(record&&phases.has(record.phase)&&matchesKind(slot,record)){slot.entry=null;slot.last=latest(slot.last,structuredClone(record));slot.onRecord?.(slot.last);notify(slot);}else{const group=(data.groups||[]).find(g=>g.requestId===id),kind=requestKind(slot)||group?.kind;if(!group||terminal.has(slot.last?.phase)||!['spawn','scenario-restore','ai-recruit'].includes(kind)||group.kind&&group.kind!==kind)continue;const request=structuredClone(slot.entry?.payload.request||slot.last?.request||{requestId:id,kind});slot.entry=null;slot.last=latest(slot.last,{request,phase:'executed'});slot.onRecord?.(slot.last);notify(slot);}}}

  function slot(owner,binding){
   const state={owner,binding,entry:null,inFlight:false,last:null,notify:null,onRecord:null};slots.add(state);
   async function transmit(entry,retry){
    if(state.inFlight)throw Error('The original delivery is still in flight. Check its result.');
    if(retry&&entry.binding!==binding())throw Error('Review context changed. Check the original delivery result; do not send a replacement.');
    const at=epoch;state.entry=entry;state.inFlight=true;notify(state);
    try{
     let result;
     try{result=await command(entry.action,structuredClone(entry.payload));}
     catch(error){
      if(at!==epoch)throw error;
      if(state.last?.request?.requestId===entry.requestId&&!state.entry){result={record:structuredClone(state.last)};}
      else{const message=String(error?.message||error),marker='[COMMAND_REQUEST_REJECTED]';
       if((error.definitive===true||message.includes(marker))&&!retry){state.entry=null;state.last={request:structuredClone(entry.payload.request||{requestId:entry.requestId,kind:entry.action==='gm-remove'?'remove':'spawn'}),phase:'rejected',result:{message:message.split(marker).at(-1).trim()}};state.onRecord?.(state.last);throw Error(state.last.result.message);}
       entry.uncertain=true;if(retry&&(error.definitive===true||message.includes(marker)))throw Error('Original delivery is still uncertain. The retry was rejected. Check the original request result. '+entry.requestId+' · '+message.split(marker).at(-1).trim());throw Error('Delivery uncertain. Check the result or retry the same request. '+entry.requestId+' · '+message);
      }
     }
     if(at!==epoch)throw Error('Connection changed. Old delivery result was discarded.');
     if(result?.record?.request?.requestId!==entry.requestId||!phases.has(result.record.phase)||!matchesKind(state,result.record)){entry.uncertain=true;throw Error('Delivery acknowledgement is invalid. Check the original request result. '+entry.requestId);}state.entry=null;state.last=latest(state.last,structuredClone(result.record));if(state.last)state.onRecord?.(state.last);return {...result,record:structuredClone(state.last)};
    }finally{if(at===epoch){state.inFlight=false;notify(state);}}
   }
   const api={
    async command(action,payload){if(!mutations.has(action)){const at=epoch;const result=await command(action,payload);if(at!==epoch)throw Error('Connection changed. Refresh results.');if(action==='gm-status')observe(result);else if(action==='gm-cancel'&&result?.record)observe({records:[result.record]});return result;}const pending=[...slots].find(s=>s.entry||s.inFlight);if(pending)throw Error('Resolve the uncertain request in '+pending.owner+' before sending another request.');const requestId=payload?.request?.requestId||payload?.requestId;if(typeof requestId!=='string'||!requestId)throw Error('Reviewed request identity required');return transmit({action,payload:structuredClone(payload),requestId,binding:binding(),uncertain:false},false);},
    retry(){const entry=state.entry;if(!entry?.uncertain)throw Error('No uncertain request to retry');return transmit(entry,true);},
    check(){return api.command('gm-status');},
    get uncertain(){return !!state.entry?.uncertain;},get pending(){return !!state.entry||state.inFlight;},get canRetry(){try{return !state.inFlight&&!!state.entry?.uncertain&&state.entry.binding===binding();}catch{return false;}},get requestId(){return state.entry?.requestId||state.last?.request?.requestId||'';},get record(){return state.last?structuredClone(state.last):null;},
    subscribe(fn){state.notify=fn;},onRecord(fn){state.onRecord=fn;}
   };return api;
  }
  return{slot,reset,observe};
 }
 let browserManager=null,connection='';
 function browserSlot(owner,binding){if(!browserManager){browserManager=createManager((action,payload)=>window.plannerLocalBridge.command(action,payload));window.addEventListener('local-bridge-state',event=>{if(!Object.hasOwn(event.detail||{},'token'))return;const next=event.detail.token||'';if(next!==connection){connection=next;browserManager.reset();}});}return browserManager.slot(owner,binding);}
 function mount(slot,host,{render,onRecord}={}){
  const t=s=>window.PlannerI18n.t(s),box=document.createElement('section');box.className='command-delivery-feedback';box.hidden=true;box.setAttribute('aria-label',t('Uncertain request delivery'));
  const message=document.createElement('p'),feedback=document.createElement('p'),check=document.createElement('button'),retry=document.createElement('button');feedback.setAttribute('role','status');check.type=retry.type='button';box.append(message,check,retry,feedback);host.append(box);let busy=false;
  const paint=()=>{box.hidden=!slot.uncertain;message.textContent=t(slot.canRetry?'Delivery uncertain. Check the result or retry the same request.':'Review context changed. Check the original delivery result; do not send a replacement.')+' · '+slot.requestId;check.textContent=t('Check delivery result');retry.textContent=t('Retry same request');check.disabled=busy;retry.disabled=busy||!slot.canRetry;render?.();};
  async function run(fn){if(busy)return;busy=true;paint();try{await fn();feedback.textContent=t(slot.uncertain?'No confirmed result yet. Retrying keeps the original request identity.':'Delivery result confirmed. Refresh the tool results.');}catch(e){CommandOperatorFeedback.show(feedback,e);}finally{busy=false;paint();}}
  check.onclick=()=>run(()=>slot.check());retry.onclick=()=>run(()=>slot.retry());slot.subscribe(paint);const outcome=document.createElement('p');outcome.hidden=true;outcome.setAttribute('role','status');host.append(outcome);slot.onRecord(record=>{onRecord?.(record);if(['failed','rejected'].includes(record.phase)){outcome.hidden=false;CommandOperatorFeedback.result(outcome,record);}else{outcome.hidden=true;CommandOperatorFeedback.clear(outcome);}render?.();});host.addEventListener('input',paint);window.addEventListener('planner-plan-changed',paint);window.addEventListener('planner-preferences-changed',paint);
 }
 return{createManager,browserSlot,mount,nextPhase};
});
