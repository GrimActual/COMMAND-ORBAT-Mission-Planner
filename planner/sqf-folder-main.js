'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),D=require('./sqf-dependency-main'),S=require('./sqf-source-dependencies');
const EXT=/\.(sqf|sqm|ext|hpp|inc|cpp)$/i,SKIP=new Set(['.git','.svn','node_modules','.cache']);
async function scan(root){
 if(typeof root!=='string'||!path.isAbsolute(root))throw Error('Choose a source folder');
 const base=await fs.lstat(root);if(!base.isDirectory()||base.isSymbolicLink())throw Error('Choose a regular source folder');
 const files=[];let ignored=0,visited=0;
 async function walk(dir,depth){if(depth>24)throw Error('Source folder nesting limit exceeded');for(const entry of await fs.readdir(dir,{withFileTypes:true})){if(++visited>4096)throw Error('Source folder entry limit exceeded');const file=path.join(dir,entry.name),relative=path.relative(root,file).split(path.sep).join('/');if(entry.isSymbolicLink()){ignored++;continue;}if(entry.isDirectory()){if(SKIP.has(entry.name.toLowerCase())){ignored++;continue;}await walk(file,depth+1);continue;}if(!entry.isFile()||!EXT.test(entry.name)){ignored++;continue;}if(files.length>=S.LIMITS.files)throw Error('Source folder has too many supported files; choose a smaller component');const stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink())throw Error('Source folder changed during preview');if(stat.size>S.LIMITS.fileBytes)throw Error('Source file exceeds the byte limit; choose a smaller component');files.push({name:relative,file,bytes:stat.size});}}
 await walk(root,0);files.sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0);if(!files.length)throw Error('No supported source files in this folder');if(files.reduce((sum,f)=>sum+f.bytes,0)>S.LIMITS.totalBytes)throw Error('Source folder byte limit exceeded');return {root,files,ignored};
}
async function capture(preview,names){
 if(!preview||!Array.isArray(names)||!names.length||names.length>S.LIMITS.files||new Set(names).size!==names.length||names.some(n=>typeof n!=='string'||!preview.files.some(f=>f.name===n)))throw Error('Choose files from the current folder preview');
 const selected=preview.files.filter(f=>names.includes(f.name)),files=[],originals=[];
 for(const f of selected){const absolute=path.resolve(preview.root,...f.name.split('/'));if(absolute!==f.file||!absolute.startsWith(path.resolve(preview.root)+path.sep))throw Error('Source path changed');let parent=path.dirname(absolute);while(parent!==path.resolve(preview.root)){const st=await fs.lstat(parent);if(!st.isDirectory()||st.isSymbolicLink())throw Error('Source folder changed during review');parent=path.dirname(parent);}const rootStat=await fs.lstat(preview.root);if(!rootStat.isDirectory()||rootStat.isSymbolicLink())throw Error('Source folder changed during review');const bytes=await D.read(absolute,S.LIMITS.fileBytes);files.push({name:f.name,text:new TextDecoder('utf-8',{fatal:true}).decode(bytes)});originals.push({file:absolute,max:S.LIMITS.fileBytes,hash:crypto.createHash('sha256').update(bytes).digest('hex')});}
 const snapshot=S.createSourceContext(files,[]);return {input:{files:snapshot.files.map(({name,text})=>({name,text})),mounts:[],configRoots:[]},originals};
}
module.exports={scan,capture};
