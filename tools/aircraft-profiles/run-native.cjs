#!/usr/bin/env node
'use strict';
// Opt-in isolated diagnostic SERVER only. No normal game client or release candidate.
const fs=require('node:fs/promises'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),os=require('node:os');
const P=require('./profiles.cjs'),C=require('./contract.cjs');
const {verifySnapshot}=require('./discover.cjs');
function memoryStatus(freeBytes,started=false){
 if(!Number.isFinite(freeBytes)||freeBytes<0)throw Error('Invalid free-memory reading');
 const minimumMiB=started?256:1536;
 return {freeMiB:Math.floor(freeBytes/1048576),minimumMiB,allowed:freeBytes>=minimumMiB*1048576};
}
async function run(args){
 if(args.length!==4||!['query-h60','inspect-mi8mt','inspect-mi8mt-resting','inspect-h60-supply'].includes(args[0]))throw Error('Use query-h60|inspect-mi8mt|inspect-mi8mt-resting|inspect-h60-supply DISCOVERY.json SERVER_DIAG.exe NEW_RUN_PARENT');
 const [mode,discoveryFile,exe,parent]=args,discovery=JSON.parse(await fs.readFile(discoveryFile,'utf8')),registry=C.create(P,discovery.index);
 const initialMemory=memoryStatus(os.freemem());
 if(!initialMemory.allowed)throw Error('Native diagnostic deferred: less than 1.5 GiB free RAM');
 verifySnapshot(discovery);
 if(!path.basename(exe).match(/^ArmaReforgerServerDiag\.exe$/i))throw Error('Only the standalone diagnostic server is supported');
 const required=mode.startsWith('inspect-mi8mt')?'58D0FB3206B6F859':'60ED3CC6E7E40221';if(!discovery.localPaths[required])throw Error('Required addon not installed');
 await fs.mkdir(parent,{recursive:true});const dir=await fs.mkdtemp(path.join(parent,mode+'-')),project=path.join(dir,'project'),profile=path.join(dir,'profile'),links=path.join(dir,'addons');
 await fs.mkdir(path.join(project,'Scripts','Game'),{recursive:true});await fs.mkdir(path.join(project,'Worlds'));await fs.mkdir(path.join(profile,'profile'),{recursive:true});await fs.mkdir(links);
 const visited=new Set();async function link(id){if(visited.has(id))return;visited.add(id);const source=discovery.localPaths[id];if(!source)throw Error('Missing installed dependency '+id);await fs.symlink(source,path.join(links,id),'junction');const addon=discovery.index.addons.find(a=>a.id===id);for(const dep of addon.dependencies)await link(dep);}await link(required);
 const guid=crypto.randomBytes(8).toString('hex').toUpperCase(),world=crypto.randomBytes(8).toString('hex').toUpperCase();
 await fs.writeFile(path.join(project,'addon.gproj'),`GameProject {\n ID "COMMANDAircraftDiagnostic"\n GUID "${guid}"\n TITLE "COMMAND isolated aircraft diagnostic"\n Dependencies { "${required}" }\n}\n`);
 await fs.writeFile(path.join(project,'Worlds','Diagnostic.ent'),'SubScene {\n Parent "{55A3176BBDD01AAE}worlds/Eden/EmptyEden.ent"\n}\nLayer default {\n Index 0\n}\n');
 await fs.writeFile(path.join(project,'Worlds','Diagnostic.ent.meta'),`MetaFileClass {\n Name "{${world}}Diagnostic.ent"\n Configurations { ENTResourceClass PC {} ENTResourceClass HEADLESS : PC {} }\n}\n`);
 await fs.writeFile(path.join(project,'Worlds','Diagnostic_default.layer'),'SCR_FactionManager AircraftDiagnosticFactions : "{589540B35EBA8CDC}Prefabs/MP/Managers/Factions/FactionManager_USxUSSR.et" {}\nSCR_LoadoutManager AircraftDiagnosticLoadouts : "{97EF4C1A41F63DDB}Prefabs/MP/Managers/Loadouts/LoadoutManager_USxUSSR.et" {}\nSCR_BaseGameMode AircraftDiagnosticMode : "{1B76F75A3175E85C}Prefabs/MP/Modes/Plain/GameMode_Plain.et" {}\n');
 const helper=mode==='query-h60'?'COMMAND_AircraftQuery.c':'COMMAND_AircraftInspection.c';await fs.copyFile(path.join(__dirname,'native',helper),path.join(project,'Scripts','Game',helper));
 const id=P.profiles.find(p=>p.id===(mode==='inspect-h60-supply'?'command-h60-supply':'command-mi8mt-transport')).identity,resource=`{${id.guid}}${id.path}`;
 const action=mode==='query-h60'?`COMMAND_AircraftQuery query=new COMMAND_AircraftQuery();query.Run();`:
 `Resource aircraftResource=Resource.Load("${resource}");
 if(!aircraftResource || !aircraftResource.IsValid()) { return; }
 EntitySpawnParams spawnParams=new EntitySpawnParams();
 spawnParams.TransformMode=ETransformMode.WORLD;
 float surfaceY=GetGame().GetWorld().GetSurfaceY(4930,11740);
 spawnParams.Transform[3]=Vector(4930,surfaceY+1,11740);
 IEntity selected=GetGame().SpawnEntityPrefab(aircraftResource,GetGame().GetWorld(),spawnParams);
 if(!selected) { return; }
 Selected=selected;
 GetGame().GetCallqueue().CallLater(Capture,1000,false);
 }
 static void Capture()
 {
 IEntity selected=Selected;
 if(!selected) { return; }
 vector beforePosition=selected.GetOrigin();
 vector beforeAttitude=selected.GetYawPitchRoll();
 COMMAND_AircraftNativeObservation report=COMMAND_AircraftInspection.Capture(selected,"${registry.environment}");
 ${mode==='inspect-mi8mt-resting'?`Frames.Insert(report);
 if(selected.GetOrigin()!=beforePosition || selected.GetYawPitchRoll()!=beforeAttitude) { PoseUnchanged=false; }
 if(Frames.Count()<13) { GetGame().GetCallqueue().CallLater(Capture,250,false);return; }`:''}
 JsonSaveContext save=new JsonSaveContext();
 save.WriteValue("report",report);
 ${mode==='inspect-mi8mt-resting'?'save.WriteValue("reports",Frames);save.WriteValue("poseUnchangedAllCaptures",PoseUnchanged);':''}
 save.WriteValue("poseUnchangedDuringCapture",selected.GetOrigin()==beforePosition && selected.GetYawPitchRoll()==beforeAttitude);
 save.SaveToFile("$profile:COMMAND-AircraftInspection.json");`;
 await fs.writeFile(path.join(project,'Scripts','Game','COMMAND_DiagnosticFixture.c'),`// Original owned fixture. Entity creation is separate from read-only Capture.\nclass COMMAND_AircraftFixture { static IEntity Selected; static ref array<ref COMMAND_AircraftNativeObservation> Frames={}; static bool PoseUnchanged=true; static void Run() { ${action} } };\nmodded class SCR_BaseGameMode { override void OnGameStart() { super.OnGameStart();GetGame().GetCallqueue().CallLater(COMMAND_AircraftFixture.Run,1500,false); } };\n`.replace(mode==='query-h60'?'static ref array<ref COMMAND_AircraftNativeObservation> Frames={};':'',''));
 const resultName=mode==='query-h60'?'COMMAND-AircraftQuery.json':'COMMAND-AircraftInspection.json';let child,outcome={mode,dir,status:'pending',initialFreeMiB:initialMemory.freeMiB,minimumObservedFreeMiB:initialMemory.freeMiB,sourceMetadataStamp:discovery.metadataStamp,environment:registry.environment,scope:'Isolated server metadata/inspection only; no control or multiplayer validation.'};
 const config=path.join(dir,'server.json');
 await fs.writeFile(config,JSON.stringify({bindAddress:'127.0.0.1',bindPort:29992,publicAddress:'127.0.0.1',publicPort:29992,game:{name:'COMMAND local aircraft diagnostic',password:crypto.randomBytes(16).toString('hex'),maxPlayers:1,scenarioId:`{${world}}Worlds/Diagnostic.ent`,visible:false,crossPlatform:false,gameProperties:{}}},null,2));
 const started=Date.now();
 try{
  child=cp.spawn(exe,['-gproj',path.join(project,'addon.gproj'),'-addonsDir',links,'-profile',profile,'-config',config,'-server',`{${world}}Worlds/Diagnostic.ent`,'-maxFPS','10','-noSound','-noSplash','-noThrow'],{cwd:path.dirname(exe),windowsHide:true,stdio:'ignore'});
  child.on('error',e=>{outcome.error=e.message;});
  while(Date.now()-started<90000){await new Promise(r=>setTimeout(r,500));const memory=memoryStatus(os.freemem(),true);outcome.minimumObservedFreeMiB=Math.min(outcome.minimumObservedFreeMiB,memory.freeMiB);if(!memory.allowed){outcome.status='memory-pressure';break;}try{const result=JSON.parse(await fs.readFile(path.join(profile,'profile',resultName),'utf8'));outcome={...outcome,status:'observed',result};break;}catch{}if(child.exitCode!==null){outcome.status='server-exited';outcome.exitCode=child.exitCode;break;}if(outcome.error){outcome.status='launch-failed';break;}}
  if(outcome.status==='pending')outcome.status='timeout';
  try{verifySnapshot(discovery);}catch(e){outcome.status='stale-dependencies';outcome.error=e.message;}
 }finally{
  if(child&&child.pid&&child.exitCode===null){child.kill();await new Promise(resolve=>child.once('exit',resolve));}
  outcome.elapsedMs=Date.now()-started;await fs.writeFile(path.join(dir,'result.json'),JSON.stringify(outcome,null,2)+'\n');
  // Remove only the junction entries created by this run; never traverse source addon directories.
  for(const id of visited)await fs.unlink(path.join(links,id));
 }
 process.stdout.write(JSON.stringify({dir,status:outcome.status,metadataRows:outcome.result?.rows?.length,selectedResource:outcome.result?.report?.resourceName,simulationAvailable:outcome.result?.report?.simulationAvailable,physicsAvailable:outcome.result?.report?.physicsAvailable})+'\n');if(outcome.status!=='observed')process.exitCode=1;
 return outcome;
}
if(require.main===module)run(process.argv.slice(2)).catch(e=>{process.stderr.write(e.stack+'\n');process.exitCode=1;});
module.exports={run,memoryStatus};
