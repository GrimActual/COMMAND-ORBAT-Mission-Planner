#!/usr/bin/env node
'use strict';
// Creates an isolated diagnostic project. Never starts an executable or edits a world.
const fs=require('node:fs/promises'),path=require('node:path'),{randomBytes}=require('node:crypto');
async function prepare(args){
 if(args.length!==2||args[0]!=='--out'||!args[1]||args[1].startsWith('--'))throw Error('Use --out NEW_PROJECT_DIRECTORY');
 const root=path.resolve(args[1]),worldGuid=randomBytes(8).toString('hex').toUpperCase(),projectGuid=randomBytes(8).toString('hex').toUpperCase();
 await fs.mkdir(root);await fs.mkdir(path.join(root,'Scripts','Game'),{recursive:true});await fs.mkdir(path.join(root,'Worlds'));await fs.mkdir(path.join(root,'profile','profile'),{recursive:true});
 await fs.copyFile(path.join(__dirname,'native-probe','COMMAND_WBJsonProbe.c'),path.join(root,'Scripts','Game','COMMAND_WBJsonProbe.c'));
 await fs.writeFile(path.join(root,'addon.gproj'),'GameProject {\n ID "COMMANDWorkbenchDataProbe"\n GUID "'+projectGuid+'"\n TITLE "COMMAND isolated JSON probe"\n Dependencies { "58D0FB3206B6F859" }\n}\n',{flag:'wx'});
 await fs.writeFile(path.join(root,'Worlds','WBJsonProbe.ent'),'SubScene {\n Parent "{55A3176BBDD01AAE}worlds/Eden/EmptyEden.ent"\n}\nLayer default {\n Index 0\n}\n',{flag:'wx'});
 await fs.writeFile(path.join(root,'Worlds','WBJsonProbe.ent.meta'),'MetaFileClass {\n Name "{'+worldGuid+'}WBJsonProbe.ent"\n Configurations {\n ENTResourceClass PC {}\n ENTResourceClass HEADLESS : PC {}\n }\n}\n',{flag:'wx'});
 await fs.writeFile(path.join(root,'Worlds','WBJsonProbe_default.layer'),'SCR_FactionManager ProbeFactions : "{589540B35EBA8CDC}Prefabs/MP/Managers/Factions/FactionManager_USxUSSR.et" {}\nSCR_BaseGameMode ProbeMode : "{1B76F75A3175E85C}Prefabs/MP/Modes/Plain/GameMode_Plain.et" {}\n',{flag:'wx'});
 return {scope:'Prepared only; no game/editor launch; native Game JSON scalar probe, not a Workbench importer',project:path.join(root,'addon.gproj'),worldResource:'{'+worldGuid+'}Worlds/WBJsonProbe.ent',profile:path.join(root,'profile'),resultRelativePath:'profile/WorkbenchJsonProbe.json'};
}
if(require.main===module)prepare(process.argv.slice(2)).then(result=>process.stdout.write(JSON.stringify(result)+'\n')).catch(error=>{process.stderr.write(error.message+'\n');process.exitCode=1;});
module.exports={prepare};
