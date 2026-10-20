#!/usr/bin/env node
/* Review integrity only. Never authenticates authorship, imports plans or authorizes execution. */
'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const hash=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const baseNames=['REVIEW.md','adapters.json','bindings.json','expressions.json','structure.json'];
const schemas={'structure.json':'command-sqf-structural-ast','expressions.json':'command-sqf-expression-review','bindings.json':'command-sqf-binding-review','adapters.json':'command-sqf-adapter-requirements','value-ir.json':'command-sqf-value-ir-review','command-expressions.json':'command-sqf-expression-review','source-semantics.json':'command-sqf-source-semantics'};
async function verify(directory,expectedSHA256){
 if(expectedSHA256!==undefined&&(typeof expectedSHA256!=='string'||! /^[a-f0-9]{64}$/.test(expectedSHA256)))throw Error('Expected fingerprint must be a lowercase SHA-256');
 const root=await fs.realpath(directory);if(!(await fs.stat(root)).isDirectory())throw Error('Review directory required');
 let total=0;
 async function read(name,max){const file=path.join(root,name),stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>max)throw Error('Review file type/size rejected');const real=await fs.realpath(file);if(path.dirname(real)!==root)throw Error('Review path escaped directory');const bytes=await fs.readFile(real);if(bytes.length!==stat.size||bytes.length>max)throw Error('Review file changed during verification');total+=bytes.length;if(total>134217728)throw Error('Review aggregate byte limit exceeded');return bytes;}
 const manifest=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await read('manifest.json',1048576)));
 if(manifest.schema!=='command-sqf-review-bundle'||![1,2,3,4].includes(manifest.version)||manifest.executable!==false||manifest.executionReady!==0||manifest.hashScope!=='exact-utf8-review-artifacts')throw Error('Expected non-executable review bundle');
 const names=[...baseNames,...(manifest.version>=2?['value-ir.json']:[]),...(manifest.version>=3?['command-expressions.json']:[]),...(manifest.version>=4?['source-semantics.json']:[])].sort();
 const keys=['schema','version','executable','executionReady','hashScope','sources','artifacts','bundleSHA256','requiredReview','summaries'];
 if(Object.keys(manifest).sort().join(',')!==keys.sort().join(',')||JSON.stringify(manifest.requiredReview)!==JSON.stringify(['source-semantic-resolution','typed-ir-lowering','resource-validation','native-compile-and-behavior','deployment-authority'])||!Array.isArray(manifest.sources)||manifest.sources.length<1||manifest.sources.length>64)throw Error('Invalid review manifest metadata');
 const sourceIdentity=doc=>JSON.stringify(doc.files.map(f=>({name:f.name,sha256:f.sha256,hashScope:f.hashScope,textBytes:f.textBytes,mode:f.mode})));
 const summaryKeys={'structure.json':'structure','expressions.json':'expressions','bindings.json':'bindings','adapters.json':'adapters','value-ir.json':'valueIR','command-expressions.json':'commandExpressions','source-semantics.json':'sourceSemantics'};
 if(!manifest.summaries||Object.keys(manifest.summaries).sort().join(',')!==(manifest.version>=4?'adapters,bindings,commandExpressions,expressions,sourceSemantics,structure,valueIR':manifest.version>=3?'adapters,bindings,commandExpressions,expressions,structure,valueIR':manifest.version===2?'adapters,bindings,expressions,structure,valueIR':'adapters,bindings,expressions,structure'))throw Error('Invalid review summaries');
 if(!Array.isArray(manifest.artifacts)||manifest.artifacts.length!==names.length)throw Error('Invalid review artifact list');
 for(let i=0;i<names.length;i++){const artifact=manifest.artifacts[i];if(!artifact||Object.keys(artifact).sort().join(',')!=='bytes,name,sha256'||artifact.name!==names[i]||!Number.isSafeInteger(artifact.bytes)||artifact.bytes<0||artifact.bytes>33554432||typeof artifact.sha256!=='string'||! /^[a-f0-9]{64}$/.test(artifact.sha256))throw Error('Invalid or unsafe review artifact');}
 const fingerprint=hash(Buffer.from('COMMAND-SQF-REVIEW-BUNDLE-v'+manifest.version+'\0'+JSON.stringify(manifest.artifacts),'utf8'));
 if(fingerprint!==manifest.bundleSHA256||expectedSHA256!==undefined&&fingerprint!==expectedSHA256)throw Error('Review bundle fingerprint mismatch');
 for(const artifact of manifest.artifacts){const bytes=await read(artifact.name,33554432);if(bytes.length!==artifact.bytes||hash(bytes)!==artifact.sha256)throw Error('Review artifact hash mismatch: '+artifact.name);
  if(artifact.name.endsWith('.json')){const doc=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(doc.schema!==schemas[artifact.name]||doc.version!==(artifact.name==='command-expressions.json'?2:1)||doc.executable!==false||doc.summary?.executionReady!==0)throw Error('Artifact execution/version claims rejected');if(!Array.isArray(doc.files)||sourceIdentity(doc)!==JSON.stringify(manifest.sources)||JSON.stringify(doc.summary)!==JSON.stringify(manifest.summaries[summaryKeys[artifact.name]]))throw Error('Review source or summary metadata mismatch');if(artifact.name==='source-semantics.json')require('../../planner/sqf-source-semantics-validation').validate(doc);}
 }
 return {integrityVerified:true,integrityScope:'listed-review-artifacts-only',bundleSHA256:fingerprint,expectedFingerprintMatched:expectedSHA256===undefined?null:true,sourceSemanticsVerified:false,nativeBehaviorVerified:false,executionAuthorized:false};
}
async function main(args){if(![2,4].includes(args.length)||args[0]!=='--review'||args.length===4&&args[2]!=='--expected-sha256')throw Error('Usage: node verify.cjs --review <review-folder> [--expected-sha256 <trusted-fingerprint>]');console.log(JSON.stringify(await verify(args[1],args[3]),null,2));}
if(require.main===module)main(process.argv.slice(2)).catch(error=>{console.error(error.message);process.exitCode=1;});module.exports={verify,main};
