/* Cleanup candidates are current-desktop submissions, not arbitrary tracked world entities. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CommandMissionRemoval=factory();})(globalThis,function(){
 'use strict';
 function candidates(ledger,plan,status){
  const units=new Map((plan.orderOfBattle||[]).map(u=>[String(u.id),u]));
  const removed=new Set((status.records||[]).filter(r=>r.request?.kind==='remove'&&r.phase==='executed').map(r=>r.request.targetRequestId));
  const owned=new Set([...(status.groups||[]).filter(g=>g.kind==='spawn').map(g=>g.requestId),...(status.records||[]).filter(r=>r.request?.kind==='spawn'&&r.phase==='executed').map(r=>r.request.requestId)]);
  return ledger.filter(batch=>!removed.has(batch.requestId)&&owned.has(batch.requestId)&&batch.entities?.length&&batch.entities.every(e=>{const ref=units.get(String(e.unitId))?.assetCatalogItem?.resourceReference;return ref&&('{'+ref.guid+'}'+ref.path).toLowerCase()===e.resourceName.toLowerCase();})).map(batch=>structuredClone(batch));
 }
 const signature=batches=>JSON.stringify(batches.map(b=>({requestId:b.requestId,entities:b.entities})));
 return{candidates,signature};
});
