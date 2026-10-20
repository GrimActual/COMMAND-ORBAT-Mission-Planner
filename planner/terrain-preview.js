/* Original bounded elevation geometry for a read-only planning preview. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./terrain-context'):root.CompanionTerrainContext);if(typeof module==='object'&&module.exports)module.exports=api;else root.CommandTerrainPreview=api;})(globalThis,function(T){
'use strict';
const EVERON_WORLD=Object.freeze({addonId:'58D0FB3206B6F859',guid:'853E92315D1D9EFE',path:'worlds/Eden/Eden.ent'});
const MAX_EDGE=257,MAX_BYTES=4*1024*1024,MAX_WORLD=13450;
const exact=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||![Object.prototype,null].includes(Object.getPrototypeOf(v))||Reflect.ownKeys(v).length!==keys.length||keys.some(k=>{const d=Object.getOwnPropertyDescriptor(v,k);return !d||!d.enumerable||!('value'in d);}))throw Error('Unsupported terrain preview fields');};
const text=(v,max)=>{if(typeof v!=='string'||!v.trim()||v.length>max||/[\x00-\x1f\x7f]/.test(v))throw Error('Terrain source and permission statements are required');};
const key=w=>JSON.stringify(T.world(w));
function validate(raw,expectedWorld){
 exact(raw,['schema','version','world','source','grid','height','imagery']);if(raw.schema!=='command-terrain-heightmap'||raw.version!==1)throw Error('Unsupported terrain heightmap');
 if(new TextEncoder().encode(JSON.stringify(raw)).length>MAX_BYTES)throw Error('Terrain preview file exceeds 4 MiB');
 const world=T.world(raw.world);if(expectedWorld&&key(world)!==key(expectedWorld))throw Error('Terrain belongs to a different world');
 exact(raw.source,['name','reference','permission']);for(const field of ['name','reference','permission'])text(raw.source[field],1000);
 const g=raw.grid;exact(g,['columns','rows','spacingXMetres','spacingZMetres','originWorldX','originWorldZ','columnDirection','rowDirection']);
 if(![g.columns,g.rows].every(v=>Number.isSafeInteger(v)&&v>=2&&v<=MAX_EDGE)||![g.spacingXMetres,g.spacingZMetres].every(v=>Number.isFinite(v)&&v>=0.01&&v<=1000)||!['east','west'].includes(g.columnDirection)||!['north','south'].includes(g.rowDirection))throw Error('Terrain grid requires 2–257 samples per edge, metre spacing and explicit axis directions');
 const sx=g.columnDirection==='east'?1:-1,sz=g.rowDirection==='north'?1:-1,endX=g.originWorldX+sx*(g.columns-1)*g.spacingXMetres,endZ=g.originWorldZ+sz*(g.rows-1)*g.spacingZMetres;
 if(![g.originWorldX,g.originWorldZ,endX,endZ].every(v=>Number.isFinite(v)&&v>=0&&v<=MAX_WORLD))throw Error('Terrain section is outside supported Everon bounds');
 const h=raw.height;exact(h,['scaleMetres','offsetMetres','verticalReference','values']);text(h.verticalReference,160);
 if(!Number.isFinite(h.scaleMetres)||h.scaleMetres<=0||!Number.isFinite(h.offsetMetres)||!Array.isArray(h.values)||h.values.length!==g.columns*g.rows||Array.from({length:h.values.length},(_,i)=>h.values[i]).some(v=>!Number.isFinite(v)||v*h.scaleMetres+h.offsetMetres< -1000||v*h.scaleMetres+h.offsetMetres>10000))throw Error('Terrain heights must be complete finite samples with a declared scale and vertical reference');
 if(raw.imagery!==null){const i=raw.imagery;exact(i,['westWorldX','eastWorldX','southWorldZ','northWorldZ','topEdge']);if(i.topEdge!=='north'||![i.westWorldX,i.eastWorldX,i.southWorldZ,i.northWorldZ].every(v=>Number.isFinite(v)&&v>=0&&v<=MAX_WORLD)||i.westWorldX>=i.eastWorldX||i.southWorldZ>=i.northWorldZ||Math.min(g.originWorldX,endX)<i.westWorldX||Math.max(g.originWorldX,endX)>i.eastWorldX||Math.min(g.originWorldZ,endZ)<i.southWorldZ||Math.max(g.originWorldZ,endZ)>i.northWorldZ)throw Error('Imagery alignment must cover this section with its top edge north');}
 return JSON.parse(JSON.stringify({...raw,world}));
}
function build(raw,expectedWorld){
 const data=validate(raw,expectedWorld),g=data.grid,h=data.height,sx=g.columnDirection==='east'?1:-1,sz=g.rowDirection==='north'?1:-1;
 const minX=Math.min(g.originWorldX,g.originWorldX+sx*(g.columns-1)*g.spacingXMetres),maxX=Math.max(g.originWorldX,g.originWorldX+sx*(g.columns-1)*g.spacingXMetres),minZ=Math.min(g.originWorldZ,g.originWorldZ+sz*(g.rows-1)*g.spacingZMetres),maxZ=Math.max(g.originWorldZ,g.originWorldZ+sz*(g.rows-1)*g.spacingZMetres),centerX=(minX+maxX)/2,centerZ=(minZ+maxZ)/2;
 const positions=new Float32Array(g.columns*g.rows*3),uv=new Float32Array(g.columns*g.rows*2),indices=new Uint32Array((g.columns-1)*(g.rows-1)*6);let minY=Infinity,maxY=-Infinity;
 for(let row=0;row<g.rows;row++)for(let col=0;col<g.columns;col++){const n=row*g.columns+col,x=g.originWorldX+sx*col*g.spacingXMetres,z=g.originWorldZ+sz*row*g.spacingZMetres,y=h.values[n]*h.scaleMetres+h.offsetMetres;positions.set([x-centerX,y,-(z-centerZ)],n*3);minY=Math.min(minY,y);maxY=Math.max(maxY,y);const i=data.imagery;uv.set(i?[(x-i.westWorldX)/(i.eastWorldX-i.westWorldX),(z-i.southWorldZ)/(i.northWorldZ-i.southWorldZ)]:[(x-minX)/(maxX-minX),(z-minZ)/(maxZ-minZ)],n*2);}
 let n=0;for(let r=0;r<g.rows-1;r++)for(let c=0;c<g.columns-1;c++){const a=r*g.columns+c,b=a+1,d=a+g.columns,e=d+1;indices.set(sx*sz>0?[a,b,d,b,e,d]:[a,d,b,b,d,e],n);n+=6;}
 function heightAt(x,z){if(!Number.isFinite(x)||!Number.isFinite(z)||x<minX||x>maxX||z<minZ||z>maxZ)return null;const fx=(x-g.originWorldX)/(sx*g.spacingXMetres),fz=(z-g.originWorldZ)/(sz*g.spacingZMetres),c=Math.min(g.columns-2,Math.floor(fx)),r=Math.min(g.rows-2,Math.floor(fz)),u=fx-c,v=fz-r,a=r*g.columns+c,value=i=>positions[i*3+1];return u+v<=1?value(a)+u*(value(a+1)-value(a))+v*(value(a+g.columns)-value(a)):value(a+g.columns+1)+(1-u)*(value(a+g.columns)-value(a+g.columns+1))+(1-v)*(value(a+1)-value(a+g.columns+1));}
 return {data,positions,indices,uv,bounds:{minX,maxX,minZ,maxZ,minY,maxY},centerX,centerZ,heightAt,toView:(x,y,z)=>[x-centerX,y,-(z-centerZ)],toWorld:(x,y,z)=>({worldX:x+centerX,surfaceY:y,worldZ:centerZ-z})};
}
function fromObservation(raw){
 const report=T.observation(raw),xs=[...new Set(report.samples.map(p=>p.worldX))].sort((a,b)=>a-b),zs=[...new Set(report.samples.map(p=>p.worldZ))].sort((a,b)=>a-b);
 if(xs.length<2||zs.length<2||xs.length*zs.length!==report.samples.length)throw Error('Terrain observations need a complete rectangular grid for a surface preview');
 const dx=xs[1]-xs[0],dz=zs[1]-zs[0];if(xs.some((x,i)=>Math.abs(x-xs[0]-i*dx)>1e-6)||zs.some((z,i)=>Math.abs(z-zs[0]-i*dz)>1e-6))throw Error('Terrain observations need regular metre spacing');
 const rows=new Map(report.samples.map(p=>[p.worldX+':'+p.worldZ,p.surfaceY]));
 return validate({schema:'command-terrain-heightmap',version:1,world:report.world,source:{name:'Imported native point samples',reference:'Imported GetSurfaceY observation; engine '+report.engineVersion+'; file is not authenticated',permission:'User must confirm authorization and alignment before preview'},grid:{columns:xs.length,rows:zs.length,spacingXMetres:dx,spacingZMetres:dz,originWorldX:xs[0],originWorldZ:zs[0],columnDirection:'east',rowDirection:'north'},height:{scaleMetres:1,offsetMetres:0,verticalReference:'Enfusion world metres',values:zs.flatMap(z=>xs.map(x=>rows.get(x+':'+z)))},imagery:null});
}
function headingDirection(yawDegrees){if(!Number.isFinite(yawDegrees))throw Error('Heading must be finite');const radians=yawDegrees*Math.PI/180;return [Math.sin(radians),0,-Math.cos(radians)];}
return {EVERON_WORLD,MAX_EDGE,MAX_BYTES,validate,build,fromObservation,headingDirection};
});
