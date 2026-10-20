"use strict";
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PlannerServerProfiles=api;})(typeof window!=='undefined'?window:globalThis,()=>{
 const KEY='everonBridgeProfilesV1';
 function endpoint(value){let u;try{u=new URL(value);}catch{throw Error('Enter an HTTPS relay root address, not the game server IP and port.');}if(typeof value!=='string'||value.length>240||u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw Error('Use an HTTPS relay root address without credentials, path or query.');return u.href;}
 function validate(p){if(!p||typeof p!=='object'||Array.isArray(p))throw Error('Invalid profile');
  if(typeof p.id!=='string'||!/^[-a-zA-Z0-9_]{1,64}$/.test(p.id))throw Error('Invalid profile identifier');
  if(typeof p.name!=='string'||!p.name.trim()||p.name.length>80)throw Error('Profile name must contain 1–80 characters');
  if(!['local','dedicated'].includes(p.deployment)||!['free','relay'].includes(p.method))throw Error('Unsupported deployment or pairing method');
  if(!['single-entity','allowlisted-entities','host-mixed'].includes(p.scope)||p.readOnly!==true||(p.scope==='allowlisted-entities'&&p.deployment!=='dedicated')||(p.scope==='host-mixed'&&p.deployment!=='local'))throw Error('Unsupported read-only tracking scope');
  let entityIds;if(p.scope==='host-mixed')entityIds=Array.from({length:60},(_,i)=>'host_'+(i+1));if(p.scope==='allowlisted-entities'){entityIds=p.entityIds;if(!Array.isArray(entityIds)||!entityIds.length||entityIds.length>60||new Set(entityIds).size!==entityIds.length||entityIds.some(id=>typeof id!=='string'||!/^[-a-zA-Z0-9_]{1,64}$/.test(id)))throw Error('Choose 1–60 distinct tracked entity IDs');}
  if(!Number.isInteger(p.intervalMs)||p.intervalMs<1000||p.intervalMs>5000)throw Error('Update interval must be 1–5 seconds');
  if(p.scope!=='single-entity'&&p.intervalMs>2000)throw Error('Tracked batch interval must be 1–2 seconds');
  if(!Number.isInteger(p.timeoutMs)||p.timeoutMs<2000||p.timeoutMs>15000)throw Error('Timeout must be 2–15 seconds');
  if(typeof p.autoReconnect!=='boolean')throw Error('Choose a reconnect option');
  if(p.gmCommands!==undefined&&(typeof p.gmCommands!=='boolean'||(p.gmCommands&&p.scope==='single-entity')))throw Error('GM commands require mixed or allowlisted tracking scope');
  return {...(p.gmCommands?{gmCommands:true}:{}),id:p.id,name:p.name.trim(),deployment:p.deployment,method:p.method,endpoint:p.method==='relay'?endpoint(p.endpoint):'',intervalMs:p.intervalMs,timeoutMs:p.timeoutMs,autoReconnect:p.autoReconnect,scope:p.scope,readOnly:true,...(entityIds?{entityIds:entityIds.slice()}: {})};
 }
 function createStore(storage){let profiles=[];try{const raw=JSON.parse(storage.getItem(KEY));if(raw?.version===1&&Array.isArray(raw.profiles)&&raw.profiles.length<=20){profiles=raw.profiles.map(validate);if(new Set(profiles.map(p=>p.id)).size!==profiles.length)profiles=[];}}catch{}
  function persist(next){storage.setItem(KEY,JSON.stringify({version:1,profiles:next}));profiles=next;return list();}
  function list(){return profiles.map(p=>({...p,...(p.entityIds?{entityIds:p.entityIds.slice()}: {})}));}
  return {list,save(raw){const p=validate(raw),next=profiles.filter(x=>x.id!==p.id);if(next.length>=20)throw Error('Maximum 20 profiles');next.push(p);return persist(next);},remove(id){return persist(profiles.filter(p=>p.id!==id));},export(){return JSON.stringify({version:1,profiles:list()},null,2);}};
 }
 return {endpoint,validate,createStore};
});
