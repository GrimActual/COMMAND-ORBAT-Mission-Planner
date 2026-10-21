'use strict';
// Selected original diagnostic reduction. No receipt promotion or runtime writes.
const {summarize}=require('./summarize-flight.cjs'),{IDENTITY}=require('./acceptance.cjs');
const RESOURCE=`{${IDENTITY.guid}}${IDENTITY.path}`;
function reviewArtifacts({result,progress,trace,nativeObservation,sourceHashes,currentHashes}){
 if(!result||!Array.isArray(progress)||progress.length>8192||!sourceHashes||!Object.values(sourceHashes).every(v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v)))throw Error('Bounded local artifacts and source hashes required');
 if(nativeObservation&&nativeObservation.resourceName!==RESOURCE)throw Error('Wrong native aircraft identity');
 const last=result.terminal?.progress??progress.at(-1)??null;
 const terminal=last&&typeof last.phase==='string'&&/^(complete:|cancelled:|failed:)/.test(last.phase);
 const sourceMatchesCurrent=currentHashes?Object.keys(sourceHashes).every(k=>sourceHashes[k]===currentHashes[k]):null;
 const physics=Array.isArray(trace)?trace.filter(s=>s.stage==='physics-force-step'&&s.physicsDt>0&&s.physicsDt<=0.2):[];
 const spool=physics.filter(s=>s.phase==='spooling');
 let hold=null;
 if(spool.length){const anchor=spool[0].targetPosition;if(!Array.isArray(anchor)||anchor.length!==3)throw Error('Missing held-start reference');hold={samples:spool.length,initialAnchorM:anchor,maxSampledHorizontalDisplacementM:Math.max(...spool.map(s=>Math.hypot(s.position[0]-anchor[0],s.position[2]-anchor[2]))),maxSampledSpeedMps:Math.max(...spool.map(s=>Math.hypot(...s.bodyVelocity))),allSampledContact:spool.every(s=>s.groundContact===true)};}
 return {schema:'command-mi8-run-review',version:1,resourceName:RESOURCE,
  outcome:terminal?'native-terminal-observed':'incomplete',terminalPhase:terminal?last.phase:null,
  harnessSuccess:result.success===true,recordedStopReason:typeof result.stopReason==='string'?result.stopReason:null,
  exactNativeIdentityObserved:!!nativeObservation,sourceHashes,sourceMatchesCurrent,
  reviewedSpeedMps:result.reviewedSpeedMps??null,testedDistanceMetres:result.testedDistanceMetres??null,
  lastProgress:last,heldStartup:hold,trends:physics.length?summarize(trace):null,
  nativeTerminalOutcomeRequiresReview:true,acceptance:null,validatedEnvironment:null,executable:false,
  limitations:['An incomplete run is neither a flight failure nor acceptance; a memory stop needs a retained harness receipt.','Different controller/profile hashes prevent promoting historical evidence to current acceptance.','Source/result labels are not independent proof. Exact identity, load, tested envelope and every native capability require owning-harness review.','Human takeover and multiplayer remain separate acceptance gates.']};
}
async function reviewDirectory(dir,currentSourceDir){
 const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
 async function read(file,optional=false){try{const info=await fs.stat(file);if(info.size>8*1024*1024)throw Error('Artifact exceeds8MiB');return await fs.readFile(file);}catch(e){if(optional&&e.code==='ENOENT')return null;throw e;}}
 async function json(name,optional=false){const bytes=await read(path.join(dir,name),optional);return bytes?JSON.parse(bytes):null;}
 const result=await json('result.json'),progress=await json('progress.json',true)??[],savedTrace=await json('flight-trace.json',true),observed=await json('profile/profile/FlightHTTPObserved.json',true);
 const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),names=['COMMAND_HelicopterFlightLease.c','COMMAND_ValidatedAircraftProfile.c'];
 const sourceHashes={},currentHashes=currentSourceDir?{}:null;
 for(const name of names){sourceHashes[name]=hash(await read(path.join(dir,'candidate/Scripts/Game',name)));if(currentSourceDir)currentHashes[name]=hash(await read(path.join(currentSourceDir,name)));}
 return reviewArtifacts({result,progress,trace:savedTrace?.trace??null,nativeObservation:observed?.profileObservation??result.postFlight?.at(-1)??null,sourceHashes,currentHashes});
}
if(require.main===module){reviewDirectory(process.argv[2],process.argv[3]).then(r=>process.stdout.write(JSON.stringify(r,null,2)+'\n')).catch(e=>{process.stderr.write(e.message+'\n');process.exitCode=1;});}
module.exports={reviewArtifacts,reviewDirectory};
