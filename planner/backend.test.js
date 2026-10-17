const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
test('backend: CORS, methods, static files, cache expiry, deduplication, timeout and rate limit',async()=>{
 process.env.RATE_LIMIT='20';process.env.UPSTREAM_TIMEOUT_MS='30';process.env.CACHE_TTL_MS='60000';
 const original=global.fetch;const cacheFile=path.join(__dirname,'workshop_cache.json');const backup=fs.existsSync(cacheFile)?fs.readFileSync(cacheFile):null;
 fs.writeFileSync(cacheFile,JSON.stringify({'1':{workshopId:'1',cachedAt:new Date().toISOString()},'2':{workshopId:'2',cachedAt:'2000-01-01T00:00:00Z'}}));
 let upstream=0;global.fetch=async(url,options)=>{upstream++;if(url.includes('steamcommunity'))return new Response('');if(options.body.get('publishedfileids[0]')==='3')return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('Timed out'))));await new Promise(r=>setTimeout(r,5));return new Response(JSON.stringify({response:{publishedfiledetails:[{result:1,title:'Fixture',time_updated:1}]}}))};
 const {server}=require('./server');await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{
  const request=(url,opts)=>original(base+url,opts);assert.equal((await request('/health',{headers:{Origin:'https://evil.example'}})).status,403);
  const health=await request('/health',{headers:{Origin:'http://localhost:8787'}});assert.equal(health.headers.get('access-control-allow-origin'),'http://localhost:8787');assert.equal(health.status,200);
  assert.equal((await request('/health',{method:'POST'})).status,405);assert.equal((await request('/')).status,200);assert.equal((await request('/server.js')).status,404);
  assert.equal((await request('/asset-tools.js')).headers.get('content-type'),'text/javascript; charset=utf-8');const workspace=await request('/gm-workspace.js');assert.equal(workspace.status,200);assert.match(await workspace.text(),/Optional layout shell/);
  assert.equal((await request('/jsoc-logo.png')).headers.get('content-type'),'image/png');
  const read=fs.readFileSync;try{fs.readFileSync=function(p,...args){if(p===path.join(__dirname,'index.html'))throw new Error('Fixture: missing file');return read(p,...args)};assert.equal((await request('/')).status,404)}finally{fs.readFileSync=read}
  assert.equal((await request('/health')).status,200);

  const cached=await(await request('/api/workshop/1')).json();assert.equal(cached.cached,true);assert.equal(upstream,0);
  const responses=await Promise.all([request('/api/workshop/2'),request('/api/workshop/2')]);assert.equal(responses[0].status,200);assert.equal(upstream,2);
  assert.equal((await request('/api/workshop/2?refresh=1')).status,200);assert.equal(upstream,4);
  assert.equal((await request('/api/workshop/3')).status,502);
  let code;for(let i=0;i<25;i++)code=(await request('/health')).status;assert.equal(code,429);
 }finally{global.fetch=original;await new Promise(r=>server.close(r));if(backup)fs.writeFileSync(cacheFile,backup);else fs.unlinkSync(cacheFile)}
});

