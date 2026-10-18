#!/usr/bin/env node
'use strict';
// Prepares only an isolated, owned diagnostic project. Never launches Workbench.
const fs=require('node:fs/promises'),path=require('node:path'),{randomBytes}=require('node:crypto');
async function prepare(args){
 if(args.length!==2||args[0]!=='--out'||!args[1]||args[1].startsWith('--'))throw Error('Use --out NEW_PROJECT_DIRECTORY');
 const root=path.resolve(args[1]),guid=()=>randomBytes(8).toString('hex').toUpperCase(),worldGuid=guid();
 await fs.mkdir(root);await fs.mkdir(path.join(root,'Scripts/WorkbenchGame/WorldEditor'),{recursive:true});await fs.mkdir(path.join(root,'Worlds'));await fs.mkdir(path.join(root,'profile'));
 await fs.copyFile(path.join(__dirname,'native-probe/COMMAND_WBInventoryPlugin.c'),path.join(root,'Scripts/WorkbenchGame/WorldEditor/COMMAND_WBInventoryPlugin.c'));
 await fs.writeFile(path.join(root,'addon.gproj'),'GameProject {\n ID "COMMANDWorkbenchInventoryProbe"\n GUID "'+guid()+'"\n TITLE "COMMAND isolated scene inventory probe"\n Dependencies { "58D0FB3206B6F859" }\n}\n',{flag:'wx'});
 await fs.writeFile(path.join(root,'Worlds/InventoryProbe.ent'),'Layer default {\n Index 0\n}\n',{flag:'wx'});
 await fs.writeFile(path.join(root,'Worlds/InventoryProbe.ent.meta'),'MetaFileClass {\n Name "{'+worldGuid+'}InventoryProbe.ent"\n Configurations {\n ENTResourceClass PC {}\n ENTResourceClass HEADLESS : PC {}\n }\n}\n',{flag:'wx'});
 const probes=[['COMMAND_ProbeNorth','0 0 0'],['COMMAND_ProbeEast','0 90 0'],['COMMAND_ProbeSouth','0 180 0'],['COMMAND_ProbeWest','0 270 0'],['COMMAND_ProbeTilted','20 90 10']];
 await fs.writeFile(path.join(root,'Worlds/InventoryProbe_default.layer'),probes.map(([name,angles],i)=>'GenericEntity '+name+' {\n coords '+(10+i*10)+' 20 30\n angles '+angles+'\n}\n').join(''),{flag:'wx'});

 return {scope:'Prepared only; isolated original synthetic world and read-only Workbench plugin; no launch or native acceptance',project:path.join(root,'addon.gproj'),worldResource:'{'+worldGuid+'}Worlds/InventoryProbe.ent',worldPath:path.join(root,'Worlds/InventoryProbe.ent'),profile:path.join(root,'profile'),resultRelativePath:'profile/COMMANDWorkbenchInventory.json',plugin:'COMMAND_WBInventoryPlugin'};
}
if(require.main===module)prepare(process.argv.slice(2)).then(result=>process.stdout.write(JSON.stringify(result)+'\n')).catch(error=>{process.stderr.write(error.message+'\n');process.exitCode=1;});
module.exports={prepare};
