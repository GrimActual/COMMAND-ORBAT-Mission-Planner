#!/usr/bin/env node
'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),{start,MAX_INPUT_BYTES}=require('./dependency-runner.cjs');
const MAX_REPORT_FILE_BYTES=67108864;
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function boundedBytes(filename,max){const handle=await fs.open(filename,'r'),chunks=[];let total=0;try{for(;;){const buffer=Buffer.allocUnsafe(Math.min(65536,max+1-total)),{bytesRead}=await handle.read(buffer,0,buffer.length,null);if(!bytesRead)break;total+=bytesRead;if(total>max)throw Error('Verification file byte limit exceeded');chunks.push(buffer.subarray(0,bytesRead));}return Buffer.concat(chunks,total);}finally{await handle.close();}}
async function read(file,max){if(typeof file!=='string'||!file)throw Error('Supply source and report filenames');const filename=path.resolve(file),stat=await fs.lstat(filename);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>max)throw Error('Verification needs bounded regular files');const bytes=await boundedBytes(filename,max);const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));return {filename,max,data,sha256:sha(bytes)};}
async function verify(sourcePath,reportPath){
 const source=await read(sourcePath,MAX_INPUT_BYTES),report=await read(reportPath,MAX_REPORT_FILE_BYTES);
 if(!source.data||Array.isArray(source.data)||Object.keys(source.data).join(',')!=='files')throw Error('Verification source set must contain exactly files');
 const receipt=await start(JSON.stringify({files:source.data.files,report:report.data}),{profile:'flowverify'}).promise;
 for(const input of [source,report]){const stat=await fs.lstat(input.filename);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>input.max||sha(await boundedBytes(input.filename,input.max))!==input.sha256)throw Error('Verification source/report changed while checking');}
 return {...receipt,sourceJSONSHA256:source.sha256,reportJSONSHA256:report.sha256};
}
async function main(args){if(args.length!==4||args[0]!=='--source-set'||args[2]!=='--report')throw Error('Usage: node verify-control-flow.cjs --source-set <files.json> --report <control-context.json>');console.log(JSON.stringify(await verify(args[1],args[3]),null,2));}
if(require.main===module)main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={verify,main,MAX_REPORT_FILE_BYTES};
