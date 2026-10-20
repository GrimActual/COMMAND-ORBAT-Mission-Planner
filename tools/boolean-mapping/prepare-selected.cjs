#!/usr/bin/env node
/* Prepare reviewed generated code for isolated native compilation. Never launches an engine. */
'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),F=require('../../planner/sqf-typed-functions'),D=require('../../planner/sqf-dependency-main'),X=require('../../planner/sqf-typed-call-expressions');
async function prepare(sourcePackage,destination,cases=[]){
 if(typeof sourcePackage!=='string'||!path.isAbsolute(sourcePackage)||typeof destination!=='string'||!path.isAbsolute(destination))throw Error('Use absolute source-package and new destination paths');
 if(!Array.isArray(cases)||cases.length>256||Object.keys(cases).length!==cases.length)throw Error('Supply at most 256 explicit typed invocation checks');
 const captured=await D.loadSelection([sourcePackage],{functions:true}),report=await F.compile(captured.input.files,captured.input);
 if(!report.functions.length)throw Error('Selected package has no complete supported functions');
 const calls=cases.map((c,i)=>{
  if(!c||Object.getPrototypeOf(c)!==Object.prototype||Object.keys(c).sort().join(',')!=='arguments,expected,sourceName'||typeof c.sourceName!=='string'||!Array.isArray(c.arguments)||!['boolean','number','string'].includes(typeof c.expected))throw Error('Each native check requires sourceName, typed arguments and matching expected value');
  const fn=report.functions.find(f=>f.sourceName.toLowerCase()===c.sourceName.toLowerCase());
  if(!fn||c.arguments.length>fn.parameters.length||c.arguments.some((v,i)=>X.literal(v).targetType!==fn.parameters[i]?.targetType)||X.literal(c.expected).targetType!==fn.returnType||Object.keys(c.arguments).length!==c.arguments.length)throw Error('Native check does not match a supported scalar function contract');
  return {id:i,sourceName:fn.sourceName,arguments:c.arguments,expected:c.expected,targetMethod:fn.method,code:F.CLASS+'.'+fn.method+'('+c.arguments.map(v=>X.literal(v).code).join(', ')+')'};
 });
 // Re-check the captured package before any output is created.
 for(const f of captured.originals)if(crypto.createHash('sha256').update(await D.read(f.file,f.max)).digest('hex')!==f.hash)throw Error('Selected source package changed during preparation');
 const proof=await F.verification(),moduleSHA256=crypto.createHash('sha256').update(report.moduleCode).digest('hex'),guid=crypto.randomBytes(8).toString('hex').toUpperCase();
 const receipt={schema:'command-selected-native-project',version:1,mapping:report.mapping,moduleSHA256,mappingFamilyNativeVerified:!!proof,selectedSourceNativelyCompiled:false,selectedSourceNativelyExecuted:false,sourceSQFExecuted:false,launched:false,functions:report.functions.length,manualCandidates:report.unresolved.length,invocationChecks:calls.map(({code,...c})=>c),requiredNextSteps:['Compile this exact isolated project in the target engine.','For checks, compare the exact module hash and all caller-supplied expected values with the native log.','Integrate source registration, initialization and engine authority manually.']};
 const checkCode='class COMMAND_SelectedModuleCheck\n{\n static void Run()\n {\n  int failures = 0;\n'+calls.map(c=>'  if ('+c.code+' != '+X.literal(c.expected).code+') failures++;').join('\n')+'\n  PrintFormat("[COMMAND SELECTED] HASH='+moduleSHA256+' CASES='+calls.length+' FAILURES=%1 VERSION=%2", failures, GetGame().GetBuildVersion());\n }\n};\nmodded class ArmaReforgerScripted\n{\n override void OnAfterInit(BaseWorld world)\n {\n  super.OnAfterInit(world);\n  GetGame().GetCallqueue().CallLater(COMMAND_SelectedModuleCheck.Run,500,false);\n }\n};\n';
 await fs.mkdir(destination);const scripts=path.join(destination,'Scripts/Game');await fs.mkdir(scripts,{recursive:true});
 for(const [file,text]of Object.entries({'addon.gproj':'GameProject {\n ID "COMMANDSelectedFunctionReview"\n GUID "'+guid+'"\n TITLE "COMMAND selected generated function review"\n Dependencies { "58D0FB3206B6F859" }\n}\n','Scripts/Game/COMMAND_TypedBooleanFunctions.c':report.moduleCode,'Scripts/Game/COMMAND_SelectedModuleCheck.c':checkCode,'function-review.json':JSON.stringify(report,null,2)+'\n','native-review.json':JSON.stringify(receipt,null,2)+'\n','README.md':'# COMMAND selected function validation\n\nThis project contains the accepted generated methods from the selected package. No source SQF or engine was run by preparation. Unresolved functions remain in function-review.json and are excluded.\n\nNative logs must identify the exact module SHA-256 and zero failures. Zero supplied invocation checks can prove compilation only. Family proof does not prove this selected project has compiled. Runtime registration, lifecycle, entity authority and full mission integration remain manual.\n'}))await fs.writeFile(path.join(destination,...file.split('/')),text,{flag:'wx'});
 return {destination,...receipt};
}
async function main(args){if(args.length!==4||args[0]!=='--source-set'||args[2]!=='--output')throw Error('Usage: node prepare-selected.cjs --source-set <absolute-package.json> --output <absolute-new-project>');console.log(JSON.stringify(await prepare(args[1],args[3]),null,2));}
if(require.main===module)main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={prepare,main};
