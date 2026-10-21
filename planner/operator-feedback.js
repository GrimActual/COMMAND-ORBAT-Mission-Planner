/* Actionable UI errors with redacted diagnostic detail. Never retries a request. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CommandOperatorFeedback=factory();})(globalThis,function(){
 'use strict';
 function redact(value){const masked=String(value??'').replace(/^Error invoking remote method ['"][^'"]+['"]:\s*(?:Error:\s*)?/,'').replace(/\[COMMAND_REQUEST_REJECTED\]\s*/g,'').replace(/\bBearer\s+[^\s,;]+/gi,'Bearer [hidden]').replace(/((?:pairingCode|readerCredential|serverToken|dashboardKey|token)["']?\s*[=:]\s*["']?)[^\s,"';}]+/gi,'$1[hidden]').replace(/\b[a-f0-9]{32}(?:[a-f0-9]{32})?\b/gi,'[hidden]');return masked.length>6000?masked.slice(0,6000)+'\n[Diagnostic detail truncated]':masked;}
 function describe(error){const detail=redact(error?.message??error),s=detail.toLowerCase();let summary='The action could not be completed.',next='Read the diagnostic detail, refresh the current status, then review before trying again.';
  if(/delivery uncertain|acknowledgement is invalid|original delivery|original request/.test(s)){summary='Delivery is not confirmed.';next='Check the original request result. Retry only the same request identity; do not create a replacement.';}
  else if(/session.*(?:expired|revoked)|pairing.*revoked|authentication|http (?:401|403)|unauthori[sz]ed/.test(s)){summary='The pairing or authorization is no longer valid.';next='Reconnect with an authorized pairing and check existing results before resubmitting.';}
  else if(/connection changed|session changed|pairing changed/.test(s)){summary='The connection changed.';next='Refresh targets for the current pairing and review again. Check the original request before resubmitting.';}
  else if(/only pending.*cancel|cannot be cancel|cannot cancel|already finished|cannot be cancelled/.test(s)){summary='This request cannot be cancelled in its current state.';next='Refresh its result. Use cancellation only while the control is available.';}
  else if(/bridge-created.*(?:group|entity)|ownership.*unavailable|not owned|owned.*unavailable|target.*identit.*differ|squad.*unavailable|leader.*unavailable|identities.*differ/.test(s)){summary='The selected target is unavailable for this operation.';next='Refresh and choose a supported owned target. Existing infantry requires approved recruitment.';}
  else if(/^choose |^select |^load .*index|^use .*reviewed|^mark .*landing|^enter .*snapshot/.test(s)){summary=detail;next='Complete the selection above, then review again.';}
  else if(/capability|not advertised|advertised.*support|support.*unavailable|updated game mod/.test(s)){summary='The bridge has not advertised the required support.';next='Check the matching desktop and bridge versions, then refresh targets and capabilities.';}
  else if(/review.*(?:stale|expired|again)|plan changed|heading changed|resource index changed|context changed/.test(s)){summary='The review no longer matches the current action.';next='Review the changed action again. Check existing results before retrying.';}
  else if(/obstruct|clearance|unsuitable|terrain relief/.test(s)){summary='The game refused the selected route or landing area.';next='Inspect the route and landing area in the game, choose a clear supported location, then review again.';}
  else if(/exceeds|maximum|1[–-]16|limit/.test(s)){summary='The request exceeds a supported limit.';next='Check the diagnostic detail and use the supported batch or configuration.';}
  else if(/json|unexpected token|schema|invalid.*file|resource reference|prefab/.test(s)){summary='The selected data could not be validated.';next='Check the mission package and matching asset index before importing or reviewing again.';}
  else if(/fetch failed|econn|etimedout|dns|network|relay.*(?:unavailable|unreachable)|public.*(?:address|tunnel)|http 5\d\d/.test(s)){summary='The relay connection could not be completed.';next='Check the address and network. Check the original result before retrying any request.';}
  else if(/timed? out|timeout/.test(s)){summary='The operation timed out.';next='Check the game and recorded result before retrying. Do not assume earlier effects were reversed.';}
  return{summary,next,detail};
 }
 const views=new WeakMap(),t=s=>globalThis.PlannerI18n?.t(s)||s;
 function show(target,error){if(!target)return;const value=describe(error);let view=views.get(target);
  if(!view){const details=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre'),copy=document.createElement('button'),status=document.createElement('p');details.className='command-error-detail';details.dataset.commandErrorDetail='true';pre.style.whiteSpace='pre-wrap';pre.style.overflowWrap='anywhere';copy.type='button';status.setAttribute('role','status');details.append(summary,pre,copy,status);target.after(details);view={details,summary,pre,copy,status,source:null,presented:''};views.set(target,view);
   new MutationObserver(()=>{if(target.textContent!==view.presented)view.details.hidden=true;}).observe(target,{childList:true,characterData:true,subtree:true});
   copy.onclick=async()=>{status.textContent=t('Copying…');try{await navigator.clipboard.writeText(view.pre.textContent);status.textContent=t('Diagnostic detail copied. Sensitive values are hidden.');}catch{status.textContent=t('Copy failed. Select the diagnostic text and copy it manually.');}};
   window.addEventListener('planner-preferences-changed',()=>{if(view.source&&!view.details.hidden)paint(view.source);});
  }
  function paint(source){view.source=source;view.presented=t(source.summary)+' '+t(source.next);target.textContent=view.presented;view.summary.textContent=t('Diagnostic detail — sensitive values hidden');view.copy.textContent=t('Copy diagnostic detail');view.pre.textContent=source.detail;view.status.textContent='';view.details.hidden=false;}
  paint(value);return view.presented;
 }
 function clear(target){const view=views.get(target);if(view){view.details.hidden=true;view.source=null;}if(target)target.textContent='';}
 function result(target,record){if(record&&['failed','rejected'].includes(record.phase)){show(target,record.result?.message||'The game rejected this request.');return true;}return false;}
 return{redact,describe,show,clear,result};
});
