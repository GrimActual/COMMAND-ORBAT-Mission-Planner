#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),P=require('./profiles.cjs'),C=require('./contract.cjs'),R=require('../../planner/resource-index');
function importQuery(discovery,receipt){
 if(receipt.mode!=='query-h60'||receipt.status!=='observed'||receipt.sourceMetadataStamp!==discovery.metadataStamp||receipt.environment!==C.create(P,discovery.index).environment)throw Error('Query is not bound to this dependency snapshot');
 const result=receipt.result;if(!result||result.complete!==true||result.truncated!==false||!Array.isArray(result.rows)||result.rows.length>512)throw Error('Incomplete or oversized metadata query');
 const out=JSON.parse(JSON.stringify(discovery)),accepted=[];
 for(const p of P.profiles.filter(p=>p.identity.addonId==='60ED3CC6E7E40221')){
  const name=`{${p.identity.guid}}${p.identity.path}`,rows=result.rows.filter(r=>r.resourceName===name&&r.file==='$SikorskyMH60DAPProject:'+p.identity.path);
  if(rows.length!==1)continue;
  if(out.index.resources.some(r=>r.addonId===p.identity.addonId&&(r.guid===p.identity.guid||r.path===p.identity.path)))throw Error('Conflicting existing candidate identity');
  out.index.resources.push({id:'h60_'+p.identity.guid,...p.identity,kind:'prefab',observation:'metadata-only',provenance:{method:'project-metadata',source:'Native ResourceDatabase selected addon query; snapshot '+discovery.metadataStamp+'; does not establish exact M variant or simulation.',license:null},dependencies:[]});accepted.push(p.id);
 }
 out.index=R.validate(out.index);out.inventory=C.create(P,out.index).inventory();out.h60Query={acceptedProfileIds:accepted,scope:'Exact metadata only; non-aircraft/templates/wrecks excluded; M variant unverified.'};return out;
}
if(require.main===module){try{const [input,receipt,out]=process.argv.slice(2);if(!out)throw Error('Use DISCOVERY.json QUERY_RESULT.json NEW_DISCOVERY.json');function read(f){if(fs.statSync(f).size>5*1024*1024)throw Error('Input exceeds bound');return JSON.parse(fs.readFileSync(f,'utf8'));}fs.writeFileSync(out,JSON.stringify(importQuery(read(input),read(receipt)),null,2)+'\n',{flag:'wx'});process.stdout.write(JSON.stringify({report:out})+'\n');}catch(e){process.stderr.write(e.message+'\n');process.exitCode=1;}}
module.exports={importQuery};
