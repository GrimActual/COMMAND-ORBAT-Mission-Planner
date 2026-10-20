'use strict';
const {performance}=require('node:perf_hooks'),P=require('./candidate.cjs'),{bulkFixture}=require('./bulk-fixture.cjs'),f=bulkFixture(),json=JSON.stringify,inputs=[json(f.mission),json(f.baseline),json(f.wire),json(f.index),json(f.choices)],samples=[];let result;
for(let i=0;i<5;i++){const start=performance.now();result=P.prepare(...inputs);samples.push(performance.now()-start);}
if(result.canApply!==false||result.review.moved.length!==500||result.candidate.orderOfBattle.length!==1001)throw Error('Unexpected candidate benchmark output');
process.stdout.write(JSON.stringify({scope:'Source-only synthetic candidate preparation; no renderer or native scene/importer test',node:process.version,managed:1000,foreign:1,moved:500,added:1,removed:1,runs:5,medianMs:samples.slice().sort((a,b)=>a-b)[2],samplesMs:samples,bytes:{before:Buffer.byteLength(inputs[0]),after:Buffer.byteLength(json(result.candidate))},canApply:result.canApply})+'\n');
