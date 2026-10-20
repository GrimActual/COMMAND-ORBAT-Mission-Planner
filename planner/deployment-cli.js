#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),D=require('./deployment-intent');
(async()=>{const [missionPath,indexPath,idsText,headingText,output]=process.argv.slice(2);if(!output)throw Error('Usage: node deployment-cli.js mission.json resource-index.json [1,2] headingDegrees output.json');
 const read=p=>{if(fs.statSync(p).size>5*1024*1024)throw Error('Selected input exceeds 5 MiB');return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(fs.readFileSync(p)));};
 const mission=read(missionPath),review=await D.review(mission,read(indexPath),JSON.parse(idsText),Number(headingText));const data=D.validate(await review.export(mission));fs.writeFileSync(output,JSON.stringify(data,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({intentOnly:true,entities:data.entities.length,nativeValidationRequired:true,unresolvedAddonIds:data.unresolvedAddonIds}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
