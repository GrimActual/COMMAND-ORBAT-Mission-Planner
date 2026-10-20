/* Original bounded texture loader. Reuses existing offline map tiles without downloading or storing a new asset. */
const I=globalThis.CommandTerrainImagery;
async function image(url){const img=new Image();img.src=url;await img.decode();return img;}
function canvas(width,height){I.imageSize(width,height);const result=document.createElement('canvas');result.width=width;result.height=height;return result;}
export async function satellite(terrain,file){
 if(file){
  if(!terrain.data.imagery)throw Error('A satellite image requires north-up extent metadata in the elevation package');
  if(file.size>20*1024*1024)throw Error('Satellite image exceeds 20 MiB');
  I.encodedImageSize(new Uint8Array(await file.arrayBuffer()));
  const url=URL.createObjectURL(file);let img;try{img=await image(url);const c=canvas(img.naturalWidth,img.naturalHeight);c.getContext('2d').drawImage(img,0,0);return {canvas:c,uv:(x,z)=>I.imageUV(terrain.data.imagery,x,z),source:'Imported satellite image',attribution:'User-provided image; declared world extent'};}finally{URL.revokeObjectURL(url);if(img)img.src='';}
 }
 if(!I.knownEveron(terrain.data.world))return null;
 const loaded=await Promise.allSettled(Array.from({length:16},async(_,n)=>{const x=n%4,y=Math.floor(n/4),url=globalThis.presentationDesktop?await presentationDesktop.offlineBase({x,y}):new URL('./terrain/everon/'+x+'-'+y+'.jpg',import.meta.url).href;return image(url);}));
 const images=loaded.filter(r=>r.status==='fulfilled').map(r=>r.value);let c;
 try{const failed=loaded.find(r=>r.status==='rejected');if(failed)throw failed.reason;const pixels=images[0].naturalWidth;if(images.some(img=>img.naturalWidth!==pixels||img.naturalHeight!==pixels))throw Error('Offline map tile dimensions are inconsistent');c=canvas(pixels*4,pixels*4);const ctx=c.getContext('2d');for(let n=0;n<16;n++){const p=I.tilePosition(n%4,Math.floor(n/4),pixels);ctx.drawImage(images[n],p.left,p.top);}return {canvas:c,uv:I.baseUV,source:'Existing Everon base map',attribution:'User-supplied local tiles · same map transform as the 2D planner'};}catch(e){if(c)c.width=c.height=0;throw e;}finally{for(const img of images)img.src='';}
}
