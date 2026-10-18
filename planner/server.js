'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const TTL = Number(process.env.CACHE_TTL_MS || 3600000);
const LIMIT = Number(process.env.RATE_LIMIT || 60);
const TIMEOUT = Number(process.env.UPSTREAM_TIMEOUT_MS || 8000);
const allowed = new Set((process.env.ALLOWED_ORIGINS || 'http://localhost:8787,http://127.0.0.1:8787,null').split(',').map(x=>x.trim()));
if (![TTL,LIMIT,TIMEOUT].every(x=>Number.isFinite(x)&&x>0)) throw new Error('Invalid limit configuration');
const rates = new Map(), pending = new Map();
let active=0;
async function limitedFetch(url, options={}) { const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),TIMEOUT);try{const response=await fetch(url,{...options,signal:controller.signal});if(!response.ok)throw new Error('Upstream HTTP '+response.status);const reader=response.body.getReader();let length=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>2000000){await reader.cancel();throw new Error('Upstream response too large')}chunks.push(Buffer.from(value))}const body=Buffer.concat(chunks).toString('utf8');return {ok:true,status:response.status,json:async()=>JSON.parse(body),text:async()=>body}}finally{clearTimeout(timer)}}
const CACHE_FILE = path.join(__dirname, 'workshop_cache.json');
let cache = Object.create(null);
try { cache = Object.assign(Object.create(null), JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))); } catch (_) { cache = Object.create(null); }
function persistCache() { try { const ids=Object.keys(cache).sort((a,b)=>Date.parse(cache[b].cachedAt)-Date.parse(cache[a].cachedAt));for(const id of ids.slice(1000))delete cache[id];const tmp=CACHE_FILE+'.tmp';fs.writeFileSync(tmp,JSON.stringify(cache,null,2)+'\n');fs.renameSync(tmp,CACHE_FILE); } catch(e) { console.error('Cache could not be saved:',e.code||e.message); } }
function send(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data, null, 2));
}
function textBetween(html, regex) { const m = html.match(regex); return m ? m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]+>/g, '').trim() : ''; }
function parseVersion(description, updated) {
  const m = String(description || '').match(/(?:^|[\n\r ])(?:mod\s*)?version\s*[:=\-]?\s*v?([0-9]+(?:\.[0-9A-Za-z_-]+){0,4})/i);
  if (m) return m[1];
  return updated ? 'Updated ' + new Date(updated * 1000).toISOString().slice(0, 10) : 'Not specified';
}
async function fetchWorkshop(id) {
  const form = new URLSearchParams({ 'itemcount': '1', 'publishedfileids[0]': id });
  const apiRes = await limitedFetch('https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form
  });
  if (!apiRes.ok) throw new Error('Steam Workshop API returned HTTP ' + apiRes.status);
  const apiData = await apiRes.json();
  const item = apiData?.response?.publishedfiledetails?.[0];
  if (!item || Number(item.result) !== 1) throw new Error('Workshop item not found or not publicly available');
  let author = item.creator ? 'Steam creator ' + item.creator : 'Unknown';
  let pageUrl = 'https://steamcommunity.com/sharedfiles/filedetails/?id=' + id;
  // This server-side request avoids browser CORS restrictions. Failure is non-fatal.
  try {
    const page = await limitedFetch(pageUrl, { headers: { 'User-Agent': 'EveronORBATMetadataBridge/1.0' } });
    if (page.ok) {
      const html = await page.text();
      const authorMatch = html.match(/class=["'][^"']*(?:friendBlockLinkOverlay|workshopItemAuthorName)[^"']*["'][^>]*>([\s\S]*?)<\/a>/i)
        || html.match(/<div[^>]*class=["'][^"']*workshopItemAuthorName[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
      if (authorMatch) author = textBetween(authorMatch[1], /([\s\S]+)/) || author;
    }
  } catch (_) {}
  const updated = Number(item.time_updated || 0);
  return {
    workshopId: id,
    title: item.title || 'Untitled Workshop item',
    author,
    creatorId: item.creator || '',
    image: item.preview_url || '',
    sizeBytes: Number(item.file_size || 0),
    version: parseVersion(item.description || '', updated),
    updatedAt: updated ? new Date(updated * 1000).toISOString() : null,
    description: String(item.description || '').slice(0, 3000),
    workshopUrl: pageUrl,
    cachedAt: new Date().toISOString(),
    source: 'Steam Community Workshop'
  };
}
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Vary','Origin');
  const origin=req.headers.origin;if(origin&&!allowed.has(origin)&&!allowed.has('*'))return send(res,403,{error:'Origin is not allowed'});
  if(origin)res.setHeader('Access-Control-Allow-Origin',allowed.has('*')?'*':origin);
  const now=Date.now();for(const [key,value] of rates)if(value.until<=now)rates.delete(key);
  const ip=req.socket.remoteAddress;const rate=rates.get(ip)||{count:0,until:now+60000};
  if(!rates.has(ip)&&rates.size>=10000)return send(res,503,{error:'Server busy'});
  rates.set(ip,rate);if(++rate.count>LIMIT){res.setHeader('Retry-After',String(Math.ceil((rate.until-now)/1000)));return send(res,429,{error:'Too many requests; retry later'});}
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end();}
  if(req.method!=='GET'){res.setHeader('Allow','GET, OPTIONS');return send(res,405,{error:'Method not allowed'});}
  let url;try{url=new URL(req.url,'http://localhost')}catch{return send(res,400,{error:'Invalid URL'})}
  const staticFiles=new Map([
    ['/terrain-context.js',['terrain-context.js','text/javascript; charset=utf-8']],
    ['/terrain-context-ui.js',['terrain-context-ui.js','text/javascript; charset=utf-8']],
    ['/terrain-alignment.js',['terrain-alignment.js','text/javascript; charset=utf-8']],
    ['/terrain-alignment-ui.js',['terrain-alignment-ui.js','text/javascript; charset=utf-8']],
    ['/migration-transfer.js',['migration-transfer.js','text/javascript; charset=utf-8']],
    ['/migration-transfer-ui.js',['migration-transfer-ui.js','text/javascript; charset=utf-8']],
    ['/sqf-intent-draft.js',['sqf-intent-draft.js','text/javascript; charset=utf-8']],
    ['/sqf-intent-draft-ui.js',['sqf-intent-draft-ui.js','text/javascript; charset=utf-8']],
    ['/sqf-intent-draft-worker.js',['sqf-intent-draft-worker.js','text/javascript; charset=utf-8']],

    ['/sqf-class-map.js',['sqf-class-map.js','text/javascript; charset=utf-8']],
    ['/sqf-class-map-ui.js',['sqf-class-map-ui.js','text/javascript; charset=utf-8']],
    ['/sqf-class-map-worker.js',['sqf-class-map-worker.js','text/javascript; charset=utf-8']],

    ['/sqf-structural-ast.js',['sqf-structural-ast.js','text/javascript; charset=utf-8']],
    ['/sqf-structural-ast-ui.js',['sqf-structural-ast-ui.js','text/javascript; charset=utf-8']],
    ['/sqf-dependency-ui.js',['sqf-dependency-ui.js','text/javascript; charset=utf-8']],
    ['/sqf-function-ui.js',['sqf-function-ui.js','text/javascript; charset=utf-8']],
    ['/sqf-type-ui.js',['sqf-type-ui.js','text/javascript; charset=utf-8']],
    ['/sqf-effect-ui.js',['sqf-effect-ui.js','text/javascript; charset=utf-8']],
    ['/sqf-diagnostic-export-ui.js',['sqf-diagnostic-export-ui.js','text/javascript; charset=utf-8']],
    ['/sqf-effect-rows.js',['sqf-effect-rows.js','text/javascript; charset=utf-8']],
    ['/sqf-diagnostics-ui.js',['sqf-diagnostics-ui.js','text/javascript; charset=utf-8']],
    ['/sqf-structural-ast-worker.js',['sqf-structural-ast-worker.js','text/javascript; charset=utf-8']],
    ['/sqf-migration.js',['sqf-migration.js','text/javascript; charset=utf-8']],
    ['/sqf-migration-worker.js',['sqf-migration-worker.js','text/javascript; charset=utf-8']],
    ['/sqf-migration-ui.js',['sqf-migration-ui.js','text/javascript; charset=utf-8']],

    ['/', ['index.html','text/html; charset=utf-8']],
    ['/index.html',['index.html','text/html; charset=utf-8']],
    ['/asset-catalog.json',['asset-catalog.json','application/json; charset=utf-8']],
    ['/ai-orders-contract.js',['bridge-runtime/ai-orders-contract.js','text/javascript; charset=utf-8']],
    ['/ai-orders-ui.js',['ai-orders-ui.js','text/javascript; charset=utf-8']],
    ['/ai-order-layer.js',['ai-order-layer.js','text/javascript; charset=utf-8']],
    ['/gm-workspace.js',['gm-workspace.js','text/javascript; charset=utf-8']],
    ['/asset-browser.js',['asset-browser.js','text/javascript; charset=utf-8']],
    ['/asset-tools.js',['asset-tools.js','text/javascript; charset=utf-8']],
    ['/planner-core.js',['planner-core.js','text/javascript; charset=utf-8']],
    ['/mission-clock.js',['mission-clock.js','text/javascript; charset=utf-8']],
    ['/plan-csv.js',['plan-csv.js','text/javascript; charset=utf-8']],
    ['/planner.js',['planner.js','text/javascript; charset=utf-8']],
    ['/editing.js',['editing.js','text/javascript; charset=utf-8']],
    ['/preferences.js',['preferences.js','text/javascript; charset=utf-8']],
    ['/settings.js',['settings.js','text/javascript; charset=utf-8']],
    ['/simulation-layer.js',['simulation-layer.js','text/javascript; charset=utf-8']],
    ['/simulation-ui.js',['simulation-ui.js','text/javascript; charset=utf-8']],
    ['/settings.css',['settings.css','text/css; charset=utf-8']],
    ['/sarge-help.js',['sarge-help.js','text/javascript; charset=utf-8']],
    ['/presentation.js',['presentation.js','text/javascript; charset=utf-8']],
    ['/planner.css',['planner.css','text/css; charset=utf-8']],
    ['/vendor/milsymbol.js',['vendor/milsymbol.js','text/javascript; charset=utf-8']],
    ['/jsoc-logo.png',['command-logo.png','image/png']],
    ['/command-logo.png',['command-logo.png','image/png']]
  ]);
  for(const file of ['terrain-imagery.js','terrain-preview-texture.mjs','terrain-preview.js','terrain-preview-ui.js','terrain-preview-renderer.mjs','terrain-preview.css','command-presentation.js','command-presentation.css','vendor/three/three.module.js','vendor/three/three.core.js','vendor/three/OrbitControls.js'])staticFiles.set('/'+file,[file,file.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8']);
  for(const file of ['leaflet.js','leaflet.css'])staticFiles.set('/vendor/leaflet/'+file,['vendor/leaflet/'+file,file.endsWith('.css')?'text/css':'text/javascript']);
  for(let x=0;x<4;x++)for(let y=0;y<4;y++)staticFiles.set('/terrain/everon/'+x+'-'+y+'.jpg',['terrain/everon/'+x+'-'+y+'.jpg','image/jpeg']);
  if(staticFiles.has(url.pathname)){
    const [file,type]=staticFiles.get(url.pathname);
    let body;try{body=fs.readFileSync(path.join(__dirname,file))}catch{return send(res,404,{error:'File not found'})}
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-cache'});return res.end(body);
  }
  if (url.pathname === '/health') return send(res, 200, { ok: true, service: 'everon-orbat-workshop-bridge', cachedItems: Object.keys(cache).length });
  const match = url.pathname.match(/^\/api\/workshop\/([0-9]{1,20})$/);
  if (!match) return send(res, 404, { error: 'Use GET /api/workshop/{numericWorkshopId} or /health.' });
  const id = match[1];
  if (cache[id] && now-Date.parse(cache[id].cachedAt)<TTL && url.searchParams.get('refresh') !== '1') return send(res, 200, { ...cache[id], cached: true });
  try {
    if(!pending.has(id)){if(active>=8)return send(res,503,{error:'Metadata service busy; retry later'});active++;pending.set(id,fetchWorkshop(id).finally(()=>{active--;pending.delete(id)}));}
    const data = await pending.get(id);
    cache[id] = data; persistCache();
    return send(res, 200, { ...data, cached: false });
  } catch (e) {
    return send(res, 502, { error: e.message, workshopId: id });
  }
});
server.requestTimeout=15000;server.headersTimeout=10000;server.keepAliveTimeout=5000;
if(require.main===module)server.listen(PORT, HOST, () => console.log(`Everon ORBAT Mapper listening on http://${HOST}:${PORT}`));
module.exports={server,parseVersion,fetchWorkshop};
