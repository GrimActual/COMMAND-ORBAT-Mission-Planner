#!/usr/bin/env node
'use strict';
// Bounded local metadata discovery. Does not inspect archives, install addons or load prefabs.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),Resources=require('../../planner/resource-index'),P=require('./profiles.cjs'),C=require('./contract.cjs');
function json(file,max=1024*1024){if(fs.statSync(file).size>max)throw Error('Metadata file exceeds bound');return JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));}
function hash(file){const size=fs.statSync(file).size;if(size>64*1024*1024)throw Error('Resource metadata exceeds hashing bound');return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
function discover(vanillaIndex,addonRoot,baseRoot,gameVersion){
 const vanilla=Resources.validate(vanillaIndex),dirs=fs.readdirSync(addonRoot,{withFileTypes:true}).filter(d=>d.isDirectory());if(dirs.length>500)throw Error('Addon directory bound exceeded');
 const paths=new Map();for(const d of dirs){const id=d.name.match(/_([A-Fa-f0-9]{16})$/)?.[1]?.toUpperCase();if(id){if(paths.has(id))throw Error('Duplicate installed addon ID');paths.set(id,path.join(addonRoot,d.name));}}
 paths.set('58D0FB3206B6F859',path.join(baseRoot,'data'));paths.set('5614BBCCBB55ED1C',path.join(baseRoot,'core'));
 const addons=[],fingerprints=[],localPaths={},visited=new Set();
 function visit(id){if(visited.has(id))return;visited.add(id);const dir=paths.get(id);if(!dir)return;const gproj=fs.readdirSync(dir).filter(n=>n.endsWith('.gproj'));if(gproj.length!==1)throw Error('Expected one installed addon project');const file=path.join(dir,gproj[0]);if(fs.statSync(file).size>262144)throw Error('Project metadata exceeds bound');const source=fs.readFileSync(file,'utf8'),guid=source.match(/\bGUID\s+"([A-Fa-f0-9]{16})"/)?.[1]?.toUpperCase();if(guid!==id)throw Error('Installed project GUID mismatch');
  const dependencies=[...((source.match(/\bDependencies\s*\{([^}]+)\}/)?.[1]||'').matchAll(/"([A-Fa-f0-9]{16})"/g))].map(m=>m[1].toUpperCase());
  const server=path.join(dir,'ServerData.json'),meta=fs.existsSync(server)?json(server):null;
  addons.push({id,name:meta?.name||source.match(/\bTITLE\s+"([^"]+)"/)?.[1]||id,version:meta?.revision?.version||(['58D0FB3206B6F859','5614BBCCBB55ED1C'].includes(id)?gameVersion:null),dependencies});localPaths[id]=dir;
  const rdb=path.join(dir,'resourceDatabase.rdb');fingerprints.push({id,project:hash(file),resourceDatabase:fs.existsSync(rdb)?hash(rdb):null});dependencies.forEach(visit);
 }
 for(const id of new Set(['58D0FB3206B6F859','5614BBCCBB55ED1C',...P.targets.map(t=>t.expectedAddonId).filter(Boolean)]))visit(id);
 const metadataStamp=crypto.createHash('sha256').update(JSON.stringify(fingerprints.sort((a,b)=>a.id.localeCompare(b.id)))).digest('hex');
 const resources=vanilla.resources.filter(r=>P.profiles.some(p=>p.identity.addonId===r.addonId&&p.identity.guid===r.guid&&p.identity.path===r.path)).map(r=>({...r,provenance:{method:'project-metadata',source:'Previously indexed exact identity; current installed project/RDB metadata fingerprint '+metadataStamp+'. Native resource loading not established.',license:null}}));
 const index=Resources.validate({schema:'companion-resource-index',version:1,addons,resources});
 return {index,inventory:C.create(P,index).inventory(),metadataStamp,fingerprints,localPaths,scope:'Installed addon manifests and prior vanilla metadata index only; archive contents and aircraft availability not asserted.'};
}
function verifySnapshot(discovery){
 if(!Array.isArray(discovery.fingerprints)||discovery.fingerprints.length>500)throw Error('Missing bounded installed metadata fingerprints');
 for(const fingerprint of discovery.fingerprints){const dir=discovery.localPaths[fingerprint.id];if(!dir)throw Error('Installed dependency path unavailable');const projects=fs.readdirSync(dir).filter(n=>n.endsWith('.gproj'));if(projects.length!==1||hash(path.join(dir,projects[0]))!==fingerprint.project)throw Error('Installed project changed; rediscovery required');const rdb=path.join(dir,'resourceDatabase.rdb');if((fs.existsSync(rdb)?hash(rdb):null)!==fingerprint.resourceDatabase)throw Error('Installed resource database changed; rediscovery required');const server=path.join(dir,'ServerData.json');if(fs.existsSync(server)){const addon=discovery.index.addons.find(a=>a.id===fingerprint.id);if(json(server).revision?.version!==addon?.version)throw Error('Installed addon version changed; rediscovery required');}}
 return true;
}
if(require.main===module){try{const [vanilla,addons,base,version,out]=process.argv.slice(2);if(!out)throw Error('Use VANILLA_INDEX ADDON_DIRECTORY BASE_ADDON_DIRECTORY GAME_VERSION NEW_REPORT.json');const report=discover(json(vanilla,5*1024*1024),addons,base,version==='unknown'?null:version);fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});process.stdout.write(JSON.stringify({report:out,aircraft:report.inventory.map(t=>({aircraft:t.variant,status:t.status}))})+'\n');}catch(e){process.stderr.write(e.message+'\n');process.exitCode=1;}}
module.exports={discover,verifySnapshot};
