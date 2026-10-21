/* Presentation of existing review deadlines/bindings. Never changes approval authority. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CommandReviewGuidance=factory();})(globalThis,function(){
 'use strict';
 const reasons={plan:'Plan changed. Review again.',target:'Target selection changed. Review again.',selection:'Planned selection changed. Review again.',heading:'Heading changed. Review again.',resource:'Resource index changed. Review again.',connection:'Connection changed. Refresh targets and review again.',route:'Route or destination changed. Review again.',settings:'Order settings changed. Review again.',timeout:'Review expired. Review again.',refresh:'Targets or results were refreshed. Review again.',sent:'Review closed. Check the original request result before sending another request.',context:'Review context changed. Review again.'};
 function fieldReason(id){return /heading/i.test(id)?'heading':/target|squad|team|aircraft|crew|vehicle|source|provider|actor|leader|reviews/i.test(id)?'target':/route|pick|destination|selected|LZ|waypoint/i.test(id)?'route':'settings';}
 function remaining(at,now=Date.now(),lifetime=60000){return Number.isFinite(at)?Math.max(0,Math.ceil((at+lifetime-now)/1000)):null;}
 const clocks=new Set();let timer=null;
 function schedule(){if(timer||!clocks.size)return;timer=setTimeout(()=>{timer=null;for(const item of [...clocks])item.update();schedule();},1000);}
 function create(config){
  const {host,state,reviewButton,sendButton,refreshButton,cancelButton}=config,t=s=>window.PlannerI18n.t(s),box=document.createElement('section');box.className='command-review-guidance';box.dataset.qolGuidance='true';
  const unavailable=document.createElement('details'),unavailableTitle=document.createElement('summary'),unavailableList=document.createElement('ul');unavailable.append(unavailableTitle,unavailableList);let unavailableKey='';
  const lifecycle=document.createElement('p');lifecycle.className='hint';lifecycle.textContent=t('Request status does not by itself confirm arrival or wider mission completion.');
  const hint=document.createElement('p'),countdown=config.countdownElement||document.createElement('p'),again=document.createElement('button'),cancelHint=document.createElement('p');hint.id=host.id+'ReviewGuidance';hint.setAttribute('role','status');hint.setAttribute('aria-live','polite');countdown.setAttribute('role','timer');countdown.setAttribute('aria-live','off');again.type='button';again.textContent=t('Review again');again.hidden=true;box.append(hint);if(!config.countdownElement)box.append(countdown);box.append(again,cancelHint,unavailable,lifecycle);
  const anchor=sendButton?.closest('.actions')||sendButton;if(anchor?.parentElement&&host.contains(anchor))anchor.after(box);else host.append(box);
  for(const el of [reviewButton,sendButton,cancelButton].filter(Boolean)){el.setAttribute('aria-describedby',((el.getAttribute('aria-describedby')||'')+' '+hint.id).trim());}
  let prior=null,cause=null,stale=null,expired=null,frame=null,seenConnection=state().connection||'';
  const write=(el,text)=>{if(el.textContent!==text)el.textContent=text;};
  function mark(reason){if(prior)cause=typeof reason==='string'&&Object.hasOwn(reasons,reason)?reason:reason?.target?.id?fieldReason(reason.target.id):cause;}
  function update(){
   frame=null;const s=state(),review=s.review||null,at=config.at?config.at(review):review?.at,lifetime=config.lifetime===undefined?60000:config.lifetime;
   if(review&&review!==prior){prior=review;cause=null;stale=null;expired=null;}
   const seconds=review&&lifetime!==null?remaining(at,Date.now(),lifetime):null;
   if(review&&seconds===0&&expired!==review){expired=review;cause='timeout';if(sendButton&&!sendButton.disabled)sendButton.disabled=true;config.expire?.();}
   const current=state();if(!current.review&&prior){stale=seconds===0?'timeout':cause||'context';prior=null;}
   const record=current.record,active=record&&['pending','approved'].includes(record.phase);
   const message=current.busy?'Checking this action. Please wait.':current.pending?'Resolve the original uncertain delivery before reviewing a replacement.':active?(record.phase==='pending'?'Awaiting host approval. Check results or cancel the eligible request.':'A request is running. Check results before starting another operation.'):stale?reasons[stale]:current.reason||(!current.review?'Review the action before sending.':'Reviewed. Host approval and native validation still apply.');
   write(lifecycle,t('Request status does not by itself confirm arrival or wider mission completion.'));write(hint,t(message)+(stale&&current.reason?' '+t(current.reason):''));again.hidden=!stale||stale==='sent';again.disabled=!!current.busy||!!current.pending||!!active||!!reviewButton?.disabled;write(again,t('Review again'));
   write(countdown,current.review?(seconds!==null?t('Review valid for')+' '+seconds+' '+t('seconds'):t('No time-based expiry; changing the bound selection, settings or connection requires another review.')):'');
   const cancelReason=cancelButton?.disabled&&!cancelButton.hidden&&record?(current.busy?'Wait for the current check before cancelling.':current.pending?'Check the original delivery result before cancelling.':current.cancelReason|| (record.phase==='approved'?'This running request cannot be cancelled from this control. Check its result.':['executed','failed','rejected','expired','cancelled'].includes(record.phase)?'This request is finished. Cancellation is unavailable.':'Check the request result before cancelling.')):'';write(cancelHint,t(cancelReason));cancelHint.hidden=!cancelReason;
   const items=current.unavailable||[],key=JSON.stringify(items.map(item=>[t(item.label),t(item.reason)]));unavailable.hidden=!items.length;write(unavailableTitle,t('Unavailable action choices')+' · '+items.length);if(key!==unavailableKey){unavailableKey=key;unavailableList.replaceChildren();for(const item of items){const li=document.createElement('li');li.textContent=t(item.label)+' · '+t(item.reason);unavailableList.append(li);}}
   for(const el of [reviewButton,sendButton])if(el)el.title=el.disabled?hint.textContent:'';if(cancelButton)cancelButton.title=t(cancelReason);
   if(current.review&&lifetime!==null&&seconds!==null){clocks.add(api);schedule();}else{clocks.delete(api);if(!clocks.size&&timer){clearTimeout(timer);timer=null;}}
  }
  const later=()=>{if(frame===null)frame=requestAnimationFrame(update);};
  const observer=new MutationObserver(records=>{if(records.some(r=>!box.contains(r.target)&&r.target!==countdown&&!countdown.contains(r.target)))later();});observer.observe(host,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled']});
  host.addEventListener('input',event=>mark(event),true);host.addEventListener('click',event=>{const clicked=event.target.closest('button'),id=clicked?.id;if(clicked?.dataset.flightAction)mark('route');if(!id)return;if(id===sendButton?.id)mark('sent');else if(id===refreshButton?.id)mark('refresh');else if(/Index|Load/.test(id))mark('resource');else if(/Route|Pick|Destination|Selected|LZ|Waypoint/.test(id))mark('route');},true);
  window.addEventListener('planner-plan-changed',()=>mark('plan'),true);window.addEventListener('planner-selection-changed',()=>mark('selection'),true);window.addEventListener('local-bridge-state',event=>{if(Object.hasOwn(event.detail||{},'token')){const next=event.detail.token||'';if(next!==seenConnection)mark('connection');seenConnection=next;}},true);window.addEventListener('deployment-resource-index-changed',()=>mark('resource'),true);window.addEventListener('planner-preferences-changed',later);
  again.onclick=()=>reviewButton?.click();
  const api={update,mark,destroy(){observer.disconnect();clocks.delete(api);if(frame!==null)cancelAnimationFrame(frame);if(!clocks.size&&timer){clearTimeout(timer);timer=null;}}};window.addEventListener('beforeunload',api.destroy,{once:true});update();return api;
 }
 return{create,remaining,fieldReason,reasons};
});
