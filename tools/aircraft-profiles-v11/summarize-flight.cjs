'use strict';
// Quantitative audit of captured physics records, never an aircraft acceptance gate.
const vec=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
const wrap=a=>((a+180)%360+360)%360-180;
function summarize(trace){
 if(!Array.isArray(trace)||trace.length>8192)throw Error('Bounded trace required');
 const rows=trace.filter(s=>s.stage==='physics-force-step'&&Number.isFinite(s.physicsDt)&&s.physicsDt>0&&s.physicsDt<=0.2);if(!rows.length)throw Error('No valid controller physics records');
 const phases={};let prior=null;
 for(const s of rows){
  if(!Number.isFinite(s.worldTimeMs)||typeof s.phase!=='string'||!vec(s.bodyVelocity)||!vec(s.position)||!vec(s.attitude)||!Number.isFinite(s.lateralError)||!Number.isFinite(s.heightY)||!Number.isFinite(s.targetY))throw Error('Incomplete physics record');
  if(prior&&s.worldTimeMs<=prior.worldTimeMs)throw Error('Non-monotonic physics records');
  const p=phases[s.phase]??={samples:0,maxAbsVerticalAccelerationErrorMps2:null,alignedAccelerationSamples:0,maxAbsHeadingErrorDeg:null,maxAbsHeadingErrorRateDegps:null,maxHorizontalSpeedMps:0,maxAbsAltitudeErrorM:0,finalLateralErrorM:null,finalHorizontalSpeedMps:null,maxSampleGapMs:0};
  p.samples++;
  const priorCommand=s.priorCommandedAcceleration??s.priorAppliedAcceleration;
  if(s.accelerationPairValid===true&&Number.isFinite(priorCommand)&&Number.isFinite(s.measuredAcceleration)){
   const e=Math.abs(priorCommand-s.measuredAcceleration);p.maxAbsVerticalAccelerationErrorMps2=Math.max(p.maxAbsVerticalAccelerationErrorMps2??0,e);p.alignedAccelerationSamples++;
  }
  const yaw=Number.isFinite(s.desiredYaw)?wrap(s.desiredYaw-s.attitude[0]):null;
  if(yaw!==null)p.maxAbsHeadingErrorDeg=Math.max(p.maxAbsHeadingErrorDeg??0,Math.abs(yaw));
  if(prior&&prior.phase===s.phase){
   const gap=s.worldTimeMs-prior.worldTimeMs;p.maxSampleGapMs=Math.max(p.maxSampleGapMs,gap);
   // Skip route-bearing jumps and sparse intervals rather than misreport command changes as oscillation.
   if(yaw!==null&&Number.isFinite(prior.desiredYaw)&&gap<=500&&Math.abs(wrap(s.desiredYaw-prior.desiredYaw))<0.01){
    const previousError=wrap(prior.desiredYaw-prior.attitude[0]);const rate=Math.abs(wrap(yaw-previousError)/(gap/1000));p.maxAbsHeadingErrorRateDegps=Math.max(p.maxAbsHeadingErrorRateDegps??0,rate);
   }
  }
  const speed=Math.hypot(s.bodyVelocity[0],s.bodyVelocity[2]);p.maxHorizontalSpeedMps=Math.max(p.maxHorizontalSpeedMps,speed);p.maxAbsAltitudeErrorM=Math.max(p.maxAbsAltitudeErrorM,Math.abs(s.targetY-s.heightY));p.finalLateralErrorM=s.lateralError;p.finalHorizontalSpeedMps=speed;prior=s;
 }
 return {schema:'command-mi8-flight-trends',version:1,physicsSampleCount:rows.length,phases,
  stoppingDistanceM:null,stoppingDistanceReason:'A braking-start event and complete stopping interval are required; arrival error is reported separately.',
  limitations:['Acceleration error compares measured response with prior commanded acceleration; force saturation may prevent that command being applied.','Peak values and last records do not establish settling, contact, occupant identity, unload, cancellation or multiplayer acceptance.','Heading error rate is a sampled trend, not a native inertia estimate.'],executable:false};
}
if(require.main===module){try{const fs=require('node:fs'),file=process.argv[2];if(!file||fs.statSync(file).size>8*1024*1024)throw Error('Trace JSON file required, maximum 8 MiB');const x=JSON.parse(fs.readFileSync(file,'utf8'));process.stdout.write(JSON.stringify(summarize(Array.isArray(x)?x:x.trace),null,2)+'\n');}catch(e){process.stderr.write(e.message+'\n');process.exitCode=1;}}
module.exports={summarize};
