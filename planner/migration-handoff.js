/* Planning import -> existing reviewed deployment path. Never sends game requests. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./planner-core'),require('./resource-index'));else root.CompanionMigrationHandoff=factory(root.PlannerCore,root.CompanionResources);})(globalThis,(C,R)=>{
'use strict';
function prepare(mission,metadata,ids){
 const plan=C.validate(C.clone(mission)),index=R.validate(metadata),byId=new Map(plan.orderOfBattle.map(u=>[u.id,u]));
 if(!Array.isArray(ids)||!ids.length||ids.length>60||Object.keys(ids).length!==ids.length||new Set(ids).size!==ids.length)throw Error('Choose 1–60 distinct imported unit IDs');
 for(const id of ids){const unit=byId.get(id),source=unit?.assetCatalogItem?.migrationSource;if(!unit||!source||!/^[a-f0-9]{64}$/.test(source.sha256)||source.sourceLogicConverted!==false||typeof source.intentId!=='string')throw Error('Imported source identity is unavailable');}
 const fingerprint=JSON.stringify(plan),batches=[];for(let at=0;at<ids.length;at+=16)batches.push(ids.slice(at,at+16));
 return {count:ids.length,batchCount:batches.length,select(batch,current){if(!Number.isInteger(batch)||batch<0||batch>=batches.length)throw Error('Choose an imported deployment batch');if(JSON.stringify(C.validate(C.clone(current)))!==fingerprint)throw Error('Imported deployment handoff is stale; review the current plan');return {ids:batches[batch].slice(),index:C.clone(index),sourceLogicConverted:false,hostApprovalRequired:true};}};
}
return {prepare};
});
