'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function querySha256(raw){
  const query=require('../../planner/terrain-context').query(raw);
  const normalized={enabled:true,version:1,world:{addonId:query.world.addonId,guid:query.world.guid,path:query.world.path.toLowerCase()},samples:query.samples.map(p=>({worldX:p.worldX,worldZ:p.worldZ,surfaceY:0}))};
  return sha('COMMAND terrain query v1\n'+JSON.stringify(normalized));
}
function fileSha256(file){return sha(fs.readFileSync(file));}
function sourceSha256(root){
  const files=[];
  function visit(relative){const full=path.join(root,relative),stat=fs.lstatSync(full);if(stat.isSymbolicLink())throw Error('Diagnostic source cannot contain symbolic links.');if(stat.isDirectory()){for(const name of fs.readdirSync(full).sort())visit(path.join(relative,name));}else if(stat.isFile()&&(relative==='addon.gproj'||relative.endsWith('.c'))){files.push({path:relative.split(path.sep).join('/'),sha256:fileSha256(full)});}}
  visit('addon.gproj');visit('Scripts');
  files.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
  return sha('COMMAND terrain diagnostic source v1\n'+JSON.stringify(files));
}
function verifyAttempt(attempt){
  if(typeof attempt!=='string'||!path.isAbsolute(attempt))throw Error('Use the absolute diagnostic attempt directory.');
  const result=JSON.parse(fs.readFileSync(path.join(attempt,'result.json'),'utf8'));
  const query=JSON.parse(fs.readFileSync(path.join(attempt,'profile/profile/COMMAND-terrain-query.json'),'utf8'));
  return {contentMatches:result.querySha256===querySha256(query)&&result.nativeSourceSha256===sourceSha256(path.join(attempt,'candidate'))&&result.observationSha256===fileSha256(path.join(attempt,'COMMAND-terrain-observation.json')),liveSessionAttested:false};
}
if(require.main===module){try{const result=verifyAttempt(process.argv[2]);console.log(JSON.stringify(result,null,2));if(!result.contentMatches)process.exitCode=1;}catch(error){console.error(error.message);process.exitCode=1;}}
module.exports={querySha256,fileSha256,sourceSha256,verifyAttempt};
