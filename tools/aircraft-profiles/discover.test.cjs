'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {discover,verifySnapshot}=require('./discover.cjs'),P=require('./profiles.cjs');
test('bounded original installation fixture handles BOM, missing aircraft and changed metadata',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'command-aircraft-metadata-')),addonRoot=path.join(root,'addons'),baseRoot=path.join(root,'base');
 fs.mkdirSync(addonRoot);fs.mkdirSync(baseRoot);
 try{
  function addon(dir,id,name,dependencies,version){fs.mkdirSync(dir);fs.writeFileSync(path.join(dir,'addon.gproj'),`GameProject { GUID "${id}" TITLE "${name}" Dependencies { ${dependencies.map(d=>'"'+d+'"').join(' ')} } }`);fs.writeFileSync(path.join(dir,'resourceDatabase.rdb'),'Original neutral fixture metadata');if(version)fs.writeFileSync(path.join(dir,'ServerData.json'),'\uFEFF'+JSON.stringify({id,name,revision:{version}}));}
  addon(path.join(baseRoot,'data'),'58D0FB3206B6F859','Neutral base',['5614BBCCBB55ED1C']);addon(path.join(baseRoot,'core'),'5614BBCCBB55ED1C','Neutral core',[]);addon(path.join(addonRoot,'H60_60ED3CC6E7E40221'),'60ED3CC6E7E40221','Neutral H60',['58D0FB3206B6F859'],'test-1');
  const p=P.profiles[0],vanilla={schema:'companion-resource-index',version:1,addons:[{id:p.identity.addonId,name:'Neutral base',version:null,dependencies:[]}],resources:[{id:'neutral',...p.identity,kind:'prefab',observation:'metadata-only',provenance:{method:'manual',source:'Original neutral fixture',license:null},dependencies:[]}]};
  const first=discover(vanilla,addonRoot,baseRoot,'test-game');a.equal(verifySnapshot(first),true);a.equal(first.inventory.find(t=>t.targetId==='uh60m').status,'addon-present-prefab-unresolved');a.equal(first.inventory.find(t=>t.targetId==='ah64d').status,'not-installed-in-supplied-index');a.equal(first.index.resources.length,1);a.equal(first.index.addons.find(d=>d.id==='60ED3CC6E7E40221').version,'test-1');
  fs.writeFileSync(path.join(baseRoot,'data','resourceDatabase.rdb'),'Changed neutral metadata');a.throws(()=>verifySnapshot(first),/changed/);a.notEqual(discover(vanilla,addonRoot,baseRoot,'test-game').metadataStamp,first.metadataStamp);
 }finally{a.equal(path.dirname(path.resolve(root)),path.resolve(os.tmpdir()));a.ok(path.basename(root).startsWith('command-aircraft-metadata-'));fs.rmSync(root,{recursive:true,force:true});}
});
