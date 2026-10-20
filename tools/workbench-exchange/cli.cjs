#!/usr/bin/env node
'use strict';
// Explicit local files only. Never launches Workbench, the game or a native command.
const fs=require('node:fs/promises'),path=require('node:path'),X=require('./contract.cjs');
async function read(file,max){const handle=await fs.open(file,'r');try{const stat=await handle.stat();if(!stat.isFile()||stat.size>max)throw Error('Input must be a bounded regular JSON file');const bytes=await handle.readFile();if(bytes.length>max)throw Error('Input grew beyond its size limit');return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}finally{await handle.close();}}
async function main(args){
 const mode=args.shift(),allowed=mode==='prepare'?['mission','configuration','out']:['review','review-native'].includes(mode)?['mission','baseline','snapshot','out']:null;
 if(!allowed)throw Error('Use prepare --mission FILE --configuration FILE --out NEW_FILE or review/review-native --mission FILE --baseline FILE --snapshot FILE --out NEW_FILE');
 const options={};while(args.length){const flag=args.shift(),value=args.shift(),key=flag?.slice(2);if(!flag?.startsWith('--')||!allowed.includes(key)||Object.hasOwn(options,key)||!value||value.startsWith('--'))throw Error('Unexpected or repeated option');options[key]=path.resolve(value);}
 if(allowed.some(k=>!Object.hasOwn(options,k)))throw Error('Missing required file option');
 const mission=await read(options.mission,5*1024*1024);let output,sha256=null;
 if(mode==='prepare'){const prepared=X.createBaseline(mission,await read(options.configuration,X.BYTES));output=prepared.baseline;sha256=prepared.baselineSha256;}
 else output=(mode==='review-native'?X.reviewNative:X.review)(mission,await read(options.baseline,X.BYTES),await read(options.snapshot,X.BYTES));
 const handle=await fs.open(options.out,'wx',0o600);try{await handle.writeFile(JSON.stringify(output,null,2)+'\n','utf8');await handle.sync();}finally{await handle.close();}
 return {mode,output:options.out,baselineSha256:sha256??output.baselineSha256,nativeValidationRequired:true,canApply:false};
}
if(require.main===module)main(process.argv.slice(2)).then(result=>process.stdout.write(JSON.stringify(result)+'\n')).catch(error=>{process.stderr.write(error.message+'\n');process.exitCode=1;});
module.exports={main};
