/* Original COMMAND reviewed occupied deployment. State is session-only. */
'use strict';
(() => {
 const $ = id => document.getElementById(id), O = CommandOccupiedSpawn, t = text => window.PlannerI18n.t(text);
 const box = document.createElement('details');
 box.id = 'occupiedDeployment';
 box.innerHTML = '<summary>Occupied vehicle deployment (experimental)</summary><p>Review one vehicle, individual crew and optional passenger squads in Deployment preview first. All non-vehicle entries require seats. Squads expand to their real native members and require automatic cargo seats. Crew roles remain explicit.</p><button id="occupiedLoad">Use reviewed deployment</button><label>Vehicle<select id="occupiedVehicle"></select></label><div id="occupiedSeats"></div><label>Seating timeout (seconds)<input id="occupiedTimeout" type="number" min="5" max="30" value="15"></label><button id="occupiedReview">Review occupied deployment</button><button id="occupiedSend" disabled>Send reviewed occupied deployment</button><button id="occupiedRetry" disabled>Retry last occupied request</button><button id="occupiedStatus">Check result and capability</button><button id="occupiedCancel" disabled>Cancel occupied deployment</button><pre id="occupiedFeedback" role="status"></pre><p>One approved deployment; success requires observed final occupancy. Initialization and replication take time. Required-seat failure removes only newly created entities and helpers, preserving players. Retrying uses the same request ID. No automatic boarding-timeout repair or aircraft flight is implied.</p>';
 (document.querySelector('[data-command-task-panel=deploy]') || $('panel-units')).append(box);
 window.CommandOccupiedDeployment = {async packageSetup(){const current=await CompanionDeploymentReview.exportCurrent();if(!intent||JSON.stringify(current)!==JSON.stringify(intent))throw Error('Use and configure the current reviewed deployment first.');return {unitIds:intent.entities.map(e=>e.unitId),occupied:value()};},open() {
  if (window.CommandPresentation) CommandPresentation.openTask('deploy');
  else document.querySelector('[data-tab=units]').click();
  box.open = true; box.scrollIntoView({block:'nearest'});
 }};
 let intent = null, review = null, submission = null, capable = false, pairing = '', busy = false, epoch = 0;
 const rows = new Map(), terminal = new Set(['executed','failed','rejected','expired','cancelled']);
 function invalidate() { review = null; $('occupiedSend').disabled = true; }
 function refreshButtons() {
  $('occupiedSend').disabled = busy || !capable || !review;
  $('occupiedRetry').disabled = busy || !capable || submission?.phase!=='unknown';
  $('occupiedCancel').disabled = busy || !submission || terminal.has(submission.phase);
 }
 function assignments() {
  return [...rows].map(([unitId,row]) => ({unitId,role:row.role.value,managerId:Number(row.manager.value),slotId:Number(row.slot.value)}));
 }
 function value() {
  if (!intent) throw Error('Use a reviewed deployment first.');
  return O.validate({vehicleUnitId:$('occupiedVehicle').value,timeoutSeconds:Number($('occupiedTimeout').value),assignments:assignments()},intent.entities.map(e=>({unitId:String(e.unitId)})));
 }
 function renderSeats() {
  invalidate(); rows.clear(); $('occupiedSeats').replaceChildren();
  for (const entity of intent?.entities || []) {
   if (String(entity.unitId) === $('occupiedVehicle').value) continue;
   const row = document.createElement('fieldset'), legend = document.createElement('legend');
   legend.textContent = entity.name; row.append(legend);
   const role = document.createElement('select'); role.setAttribute('aria-label','Required role for '+entity.name);
   for (const v of ['cargo','pilot','gunner']) role.add(new Option(t(v),v));
   const manager = document.createElement('input'), slot = document.createElement('input');
   for (const [input,label] of [[manager,'Native manager ID (-1 automatic)'],[slot,'Native slot ID (-1 automatic)']]) {
    input.type='number'; input.min=input===manager?'-2147483648':'-1'; input.max='2147483647'; input.value='-1';
    const labelElement=document.createElement('label'); labelElement.dataset.source=label; labelElement.textContent=t(label); labelElement.append(input); row.append(labelElement);
    input.oninput=invalidate;
   }
   role.onchange=invalidate; row.prepend(role); $('occupiedSeats').append(row);
   rows.set(String(entity.unitId),{role,manager,slot});
  }
 }
 async function safe(fn) {
  if (busy) return;
  busy=true; refreshButtons();
  try { await fn(); } catch (error) { if(submission?.phase==='submitting'&&String(error.message).includes('[COMMAND_REQUEST_REJECTED]'))submission.phase='rejected';CommandOperatorFeedback.show($('occupiedFeedback'),error); }
  finally { busy=false; refreshButtons(); }
 }
 function observe(status) {
  capable=status.capabilities?.includes(O.CAPABILITY)===true;
  const record=status.records?.find(r=>r.request.requestId===submission?.requestId);
  if (record && submission) submission.phase=record.phase;
  return record;
 }
 async function send(payload) {
  const generation=epoch,retrying=submission?.requestId===payload.requestId;
  const status=await plannerLocalBridge.command('gm-status');if(generation!==epoch)throw Error('Connection changed. Review this deployment again.');
  const observed=observe(status);if(retrying&&observed){CommandRequestState.bind($('occupiedFeedback'),()=>CommandRequestState.text(observed.phase,observed.request.kind)+' · '+payload.requestId+' · '+(CommandOperatorFeedback.redact(observed.result?.message)||'final occupancy unverified until executed result'));return;}
  if (!capable) throw Error('Occupied-spawn capability unavailable');
  submission={...payload,phase:retrying?submission.phase:'submitting'};
  try{
   const result=await plannerLocalBridge.command('gm-occupied',{requestId:payload.requestId,intent:payload.intent,occupied:payload.occupied});
   if(generation!==epoch||submission?.requestId!==payload.requestId)return;
   if(result?.record?.request?.requestId!==payload.requestId||result.record.request.kind!=='spawn'||!['pending','approved','executed','failed','rejected','expired','cancelled'].includes(result.record.phase))throw Error('Delivery acknowledgement is invalid. Check the original request result.');
   if(!terminal.has(submission.phase))submission.phase=result.record.phase;
   CommandRequestState.bind($('occupiedFeedback'),()=>CommandRequestState.text(submission.phase,'spawn')+' · '+payload.requestId+' · '+(CommandOperatorFeedback.redact(result.record.result?.message)||'final occupancy unverified until executed result'));CommandOperatorFeedback.result($('occupiedFeedback'),result.record);
  }catch(error){if(generation===epoch&&submission?.requestId===payload.requestId){const definite=String(error.message).includes('[COMMAND_REQUEST_REJECTED]');submission.phase=definite&&!retrying?'rejected':'unknown';if(retrying&&definite)error.message='Original delivery is still uncertain. Check the original request result. '+payload.requestId+' · '+error.message;}throw error;}
 }

 $('occupiedTimeout').oninput=invalidate;
 $('occupiedVehicle').onchange=renderSeats;
 $('occupiedLoad').onclick=()=>safe(async()=>{
  intent=await CompanionDeploymentReview.exportCurrent();
  $('occupiedVehicle').replaceChildren(...intent.entities.map(e=>new Option(e.name,String(e.unitId))));
  renderSeats(); $('occupiedFeedback').textContent='Select the actual vehicle, roles and optional exact manager/slot identities, then review.';
 });
 $('occupiedReview').onclick=()=>safe(async()=>{
  const status=await plannerLocalBridge.command('gm-status'); observe(status);
  if (submission && !terminal.has(submission.phase)) throw Error('Previous occupied request is unresolved. Check its result, cancel it or retry the same request.');
  invalidate();
  const current=await CompanionDeploymentReview.exportCurrent();
  if (JSON.stringify(current)!==JSON.stringify(intent)) throw Error('Deployment changed. Use the reviewed deployment again.');
  const occupied=value();
  review={requestId:crypto.randomUUID(),intent,occupied,mission:JSON.stringify(EveronPlanner.snapshot()),signature:JSON.stringify(occupied)};
  $('occupiedFeedback').textContent=intent.entities.length+' roots; '+occupied.assignments.length+' occupant entries (squads expand); vehicle '+occupied.vehicleUnitId+'\n'+occupied.assignments.map(a=>a.unitId+' → '+a.role+' ('+a.managerId+':'+a.slotId+')').join('\n')+'\n'+(capable?'Direct-seating capability advertised; host approval required.':'Execution unavailable: bridge has not advertised verified occupied-spawn support.');
 });
 $('occupiedSend').onclick=()=>safe(async()=>{
  if (!review || review.mission!==JSON.stringify(EveronPlanner.snapshot()) || review.signature!==JSON.stringify(value())) throw Error('Review occupied deployment again.');
  await send(review);
 });
 $('occupiedRetry').onclick=()=>safe(async()=>{
  if (!submission) throw Error('No occupied request to retry.');
  if (submission.mission!==JSON.stringify(EveronPlanner.snapshot()) && !terminal.has(submission.phase)) throw Error('Plan changed. Check or cancel the original occupied request before submitting a new deployment.');
  await send(submission);
 });
 $('occupiedStatus').onclick=()=>safe(async()=>{
  const record=observe(await plannerLocalBridge.command('gm-status'));
  CommandRequestState.bind($('occupiedFeedback'),()=>record?CommandRequestState.text(record.phase,record.request.kind)+' · '+(CommandOperatorFeedback.redact(record.result?.message)||'Awaiting host or seating result'):(submission?'Original request result is unresolved; retry keeps its identity.':capable?'Occupied-spawn capability advertised':'Occupied-spawn execution unavailable'));
  CommandOperatorFeedback.result($('occupiedFeedback'),record);
 });
 $('occupiedCancel').onclick=()=>safe(async()=>{
  if (!submission) return;
  const result=await plannerLocalBridge.command('gm-cancel',{requestId:submission.requestId});
  if (result.record?.phase) submission.phase=result.record.phase;
  $('occupiedFeedback').textContent='Cancellation requested; check final result before retrying.';
 });
 window.addEventListener('planner-preferences-changed',()=>{for(const {role}of rows.values())for(const option of role.options)option.textContent=t(option.value);for(const label of $('occupiedSeats').querySelectorAll('label[data-source]'))if(label.firstChild)label.firstChild.textContent=t(label.dataset.source);});
 window.addEventListener('deployment-resource-index-changed',invalidate);window.addEventListener('planner-plan-changed',invalidate);
 window.addEventListener('local-bridge-state',event=>{
  if (!Object.hasOwn(event.detail||{},'token')) return;
  const next=event.detail.token||'';
  if (next!==pairing) {epoch++;pairing=next;intent=null;submission=null;capable=false;invalidate();refreshButtons();}
 });
 refreshButtons();

 CommandReviewGuidance.create({host:box,reviewButton:$('occupiedReview'),sendButton:$('occupiedSend'),refreshButton:$('occupiedStatus'),cancelButton:$('occupiedCancel'),lifetime:null,state:()=>({review,busy,connection:pairing,pending:submission?.phase==='submitting',record:submission?{phase:submission.phase}:null,reason:busy?'Checking this action. Please wait.':!intent?'Use the current reviewed deployment, then assign the crew and passenger seats.':!pairing?'Connect a GM-enabled session, then refresh command targets.':!capable?'Occupied-spawn capability unavailable. Check compatibility and refresh.':null})});
})();
