/* Original alignment helpers shared by tests and the read-only preview. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CommandTerrainImagery=api;})(globalThis,function(){
'use strict';
const MAP_SPAN=12801.024,MAP_OFFSET=50,TILE_SIZE=256;
const worlds={"853E92315D1D9EFE":"worlds/Eden/Eden.ent","55A3176BBDD01AAE":"worlds/Eden/EmptyEden.ent","BEF094A5F7F3211B":"worlds/GameMaster/GM_Eden.ent"};
function knownEveron(world){return world?.addonId==='58D0FB3206B6F859'&&worlds[world.guid]===world.path;}
function tilePosition(x,y,pixels=TILE_SIZE){if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>3||y<0||y>3)throw Error('Invalid offline map tile');if(!Number.isInteger(pixels)||pixels<2||pixels>1024)throw Error('Invalid tile bitmap dimensions');return {left:x*pixels,top:(3-y)*pixels};}
function baseUV(x,z){if(!Number.isFinite(x)||!Number.isFinite(z))throw Error('Invalid texture coordinate');return [(x+MAP_OFFSET)/MAP_SPAN,(z+MAP_OFFSET)/MAP_SPAN];}
function imageUV(bounds,x,z){return [(x-bounds.westWorldX)/(bounds.eastWorldX-bounds.westWorldX),(z-bounds.southWorldZ)/(bounds.northWorldZ-bounds.southWorldZ)];}
function imageSize(width,height){if(!Number.isInteger(width)||!Number.isInteger(height)||width<2||height<2||width>4096||height>4096)throw Error('Satellite image must be 2–4096 pixels per edge');return {width,height};}
function encodedImageSize(bytes){
 if(!(bytes instanceof Uint8Array))throw Error('Invalid satellite image bytes');
 if(bytes.length>=24&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)&&String.fromCharCode(...bytes.slice(12,16))==='IHDR'){const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);return imageSize(v.getUint32(16),v.getUint32(20));}
 if(bytes.length>=4&&bytes[0]===255&&bytes[1]===216){let offset=2;while(offset<bytes.length){if(bytes[offset++]!==255)throw Error('Malformed JPEG image');while(bytes[offset]===255)offset++;const marker=bytes[offset++];if(marker===217||marker===218)break;if(marker===1||marker>=208&&marker<=215)continue;if(offset+2>bytes.length)break;const length=bytes[offset]*256+bytes[offset+1];if(length<2||offset+length>bytes.length)throw Error('Truncated JPEG image');if(marker>=192&&marker<=207&&![196,200,204].includes(marker)){if(length<8)throw Error('Invalid JPEG dimensions');return imageSize(bytes[offset+5]*256+bytes[offset+6],bytes[offset+3]*256+bytes[offset+4]);}offset+=length;}}
 throw Error('Choose a complete PNG or JPEG satellite image');
}
return {MAP_SPAN,MAP_OFFSET,TILE_SIZE,knownEveron,tilePosition,baseUV,imageUV,imageSize,encodedImageSize};
});
