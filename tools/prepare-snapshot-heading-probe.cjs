#!/usr/bin/env node
'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),{randomBytes}=require('node:crypto');
async function prepare(args){
 if(args.length!==2||args[0]!=='--out'||!args[1]||args[1].startsWith('--'))throw Error('Use --out NEW_PROJECT_DIRECTORY');
 const root=path.resolve(args[1]),guid=()=>randomBytes(8).toString('hex').toUpperCase(),worldGuid=guid();await fs.mkdir(root);
 await fs.cp(path.join(__dirname,'../reforger-mod/dedicated-candidate/JSOC_ORBAT_Bridge/Scripts/Game'),path.join(root,'Scripts/Game'),{recursive:true});await fs.mkdir(path.join(root,'Worlds'));await fs.mkdir(path.join(root,'profile/profile'),{recursive:true});
 await fs.copyFile(path.join(__dirname,'snapshot-heading-native-probe.c'),path.join(root,'Scripts/Game/COMMAND_SnapshotHeadingProbe.c'));
 await fs.writeFile(path.join(root,'addon.gproj'),'GameProject {\n ID "COMMANDSnapshotHeadingProbe"\n GUID "'+guid()+'"\n TITLE "COMMAND isolated snapshot heading probe"\n Dependencies { "58D0FB3206B6F859" }\n}\n',{flag:'wx'});
 await fs.writeFile(path.join(root,'Worlds/SnapshotHeading.ent'),'SubScene {\n Parent "{55A3176BBDD01AAE}worlds/Eden/EmptyEden.ent"\n}\nLayer default {\n Index 0\n}\n',{flag:'wx'});
 await fs.writeFile(path.join(root,'Worlds/SnapshotHeading.ent.meta'),'MetaFileClass {\n Name "{'+worldGuid+'}SnapshotHeading.ent"\n Configurations {\n ENTResourceClass PC {}\n ENTResourceClass HEADLESS : PC {}\n }\n}\n',{flag:'wx'});
 await fs.writeFile(path.join(root,'Worlds/SnapshotHeading_default.layer'),'SCR_FactionManager COMMAND_HeadingFactions : "{589540B35EBA8CDC}Prefabs/MP/Managers/Factions/FactionManager_USxUSSR.et" {}\nSCR_LoadoutManager COMMAND_HeadingLoadouts : "{97EF4C1A41F63DDB}Prefabs/MP/Managers/Loadouts/LoadoutManager_USxUSSR.et" {}\nSCR_BaseGameMode COMMAND_HeadingMode : "{1B76F75A3175E85C}Prefabs/MP/Modes/Plain/GameMode_Plain.et" {}\nGenericEntity COMMAND_HeadingSource { coords 10 20 30 }\nGenericEntity COMMAND_HeadingTarget { coords 40 50 60 }\n',{flag:'wx'});
 return {scope:'Prepared only; no engine launch; production pose helpers and profile JSON probe, not full snapshot integration',project:path.join(root,'addon.gproj'),worldResource:'{'+worldGuid+'}Worlds/SnapshotHeading.ent',profile:path.join(root,'profile'),resultRelativePath:'profile/SnapshotHeadingProbe.json'};
}
if(require.main===module)prepare(process.argv.slice(2)).then(result=>process.stdout.write(JSON.stringify(result)+'\n')).catch(error=>{process.stderr.write(error.message+'\n');process.exitCode=1;});module.exports={prepare};
