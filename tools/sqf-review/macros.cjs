#!/usr/bin/env node
'use strict';
const {inspect}=require('./dependencies.cjs');
async function main(args){if(args.length!==4||args[0]!=='--source-set'||args[2]!=='--output')throw Error('Usage: node macros.cjs --source-set <absolute-macro-package.json> --output <new-report.json>');console.log(JSON.stringify(await inspect(args[1],args[3],{profile:'macros'}),null,2));}
if(require.main===module)main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});module.exports={main};
