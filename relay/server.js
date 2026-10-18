'use strict';
const http = require('node:http');
const crypto = require('node:crypto');
const Tracked=require('./tracked-protocol');
const GM=require('./gm-commands');

// Single-instance ephemeral relay. No plans, identity data or tokens are logged/stored on disk.
function createRelay({clock = Date.now, maxSessions = 100, lifetime = 3600000, staleAfter = 7000} = {}) {
  const sessions = new Map(), readers = new Map();
  let bucketAt = 0, requests = 0, creates = 0;
  function remove(s) { sessions.delete(s.write); readers.delete(s.read); }
  function sweep() { for (const s of sessions.values()) if (clock() >= s.expires) remove(s); }
  const server = http.createServer(async (req, res) => {
    const reply = (status, data) => {
      if (res.destroyed || res.writableEnded) return;
      res.writeHead(status, {'Content-Type':'application/json', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'});
      res.end(JSON.stringify(data));
    };
    sweep();
    if (req.headers.origin) return reply(403, {error:'Browser requests are not supported'});
    if (clock() - bucketAt >= 1000) { bucketAt = clock(); requests = 0; creates = 0; }
    if (++requests > 400) return reply(429, {error:'Busy; retry later'});
    if (req.method === 'GET' && req.url === '/health') return reply(200, {ok:true});
    if (req.url === '/session' && ['GET','DELETE'].includes(req.method)) {
      const token = (req.headers.authorization || '').replace(/^Bearer /, '');
      const s = readers.get(token);
      if (!s) return reply(401, {error:'Session expired or invalid'});
      if (req.method === 'DELETE') { remove(s); return reply(200, {ok:true}); }
      if(s.locked) return reply(423, {error:'Session locked'});
      if(s.protocol===3)return reply(200,{protocol:3,sessionId:s.id,sequence:s.tracked.lastSequence,entities:Tracked.snapshot(s.tracked,clock()),expires:s.expires});
      return reply(200, {protocol:s.protocol, sessionId:s.id, entityId:s.entityId||null, sequence:s.sequence, point:s.point && clock()-s.updated < staleAfter ? s.point : null, expires:s.expires});
    }
    if (req.method !== 'POST' || !['/sessions','/marker','/batch','/gm-request','/gm-poll','/gm-approve','/gm-result','/gm-status','/gm-cancel'].includes(req.url)) return reply(404, {error:'Not found'});
    let size = 0, parts = [];
    try {
      for await (const chunk of req) {
        size += chunk.length;
        if (size > (req.url.startsWith('/gm-')?32768:req.url==='/batch'?32768:req.url==='/sessions'?8192:2048)) { reply(413, {error:'Payload too large'}); req.destroy(); return; }
        parts.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(parts).toString('utf8'));
      if(req.url.startsWith('/gm-')){
        const writer=['/gm-poll','/gm-approve','/gm-result'].includes(req.url),credential=writer?body?.token:body?.reader,s=(writer?sessions:readers).get(credential);
        if(!s)return reply(401,{error:'Invalid GM session'});if(s.locked)return reply(423,{error:'Session locked'});if(!s.gm)return reply(403,{error:'GM commands were not enabled for this pairing'});
        try{
          if(req.url==='/gm-request'){if(Object.keys(body).sort().join(',')!=='reader,request')throw Error('Unsupported GM envelope');return reply(202,{ok:true,record:s.gm.submit(body.request)});}
          if(req.url==='/gm-cancel'){if(Object.keys(body).sort().join(',')!=='reader,requestId')throw Error('Unsupported GM envelope');return reply(200,{record:s.gm.cancel(body.requestId)});}
          if(req.url==='/gm-status'){if(Object.keys(body).join(',')!=='reader')throw Error('Unsupported GM envelope');return reply(200,{records:s.gm.history(),groups:s.gm.groups(),capabilities:s.gm.capabilities()});}
          if(req.url==='/gm-poll'){if(!['token','capabilities,token','capabilities,revokedTargets,token','capabilities,revokedTargets,targetStates,token'].includes(Object.keys(body).sort().join(',')))throw Error('Unsupported GM envelope');if('capabilities' in body)s.gm.registerCapabilities(body.capabilities);if('revokedTargets' in body)s.gm.registerControlStatus(body.revokedTargets);if('targetStates' in body)s.gm.registerTargetStates(body.targetStates);return reply(200,{record:s.gm.poll()});}
          if(req.url==='/gm-approve'){if(Object.keys(body).sort().join(',')!=='requestId,token')throw Error('Unsupported GM envelope');return reply(200,{record:s.gm.approve(body.requestId)});}
          if(Object.keys(body).sort().join(',')!=='result,token')throw Error('Unsupported GM envelope');return reply(200,{record:s.gm.result(body.result)});
        }catch(e){return reply(409,{error:e.message});}
      }
      if (req.url === '/sessions') {
        if (++creates > 3 || sessions.size >= maxSessions) return reply(429, {error:'Session capacity reached'});
        let tracked=null;const batch=body&&['entityIds,protocol,scope','entityIds,gmCommands,protocol,scope'].includes(Object.keys(body).sort().join(','))&&body.protocol===3&&body.scope==='allowlisted-entities';if(batch){try{if('gmCommands' in body&&body.gmCommands!==true)throw Error('Explicit GM opt-in required');tracked=Tracked.state(body.entityIds);}catch{return reply(400,{error:'Invalid tracked allowlist'});}}
        if(size>8192||!body||Array.isArray(body)||(!batch&&Object.keys(body).length&&!(Object.keys(body).sort().join(',')==='protocol,scope'&&body.protocol===2&&body.scope==='single-entity')))return reply(400,{error:'Unsupported session request'});
        const s = {id:crypto.randomBytes(16).toString('hex'), protocol:body.protocol||1, invalid:0, locked:false, entityId:'', senderSequence:0, write:crypto.randomBytes(16).toString('hex'), read:crypto.randomBytes(32).toString('hex'), expires:clock()+lifetime, sequence:0, point:null, updated:0};
        if(tracked)s.tracked=tracked;if(batch&&body.gmCommands===true)s.gm=GM.createQueue(clock,{trackingIds:body.entityIds});
        sessions.set(s.write,s); readers.set(s.read,s);
        return reply(201, {token:s.write, reader:s.read, expires:s.expires, protocol:s.protocol, sessionId:s.id});
      }
      if (!body || Array.isArray(body) || typeof body.token !== 'string' || !/^[a-f0-9]{32}$/.test(body.token)) return reply(400, {error:'Invalid marker'});
      const s = sessions.get(body.token);
      if (!s) return reply(401, {error:'Invalid pairing code'});
      if (s.locked) return reply(423, {error:'Session locked'});
      function invalid(message) { if (++s.invalid >= 3) { s.locked=true; s.point=null; if(s.tracked)s.tracked.entities.clear(); } return reply(s.locked?423:400,{error:message}); }
      if(req.url==='/batch'){if(s.protocol!==3)return invalid('Batch protocol was not authorised');try{const result=Tracked.apply(s.tracked,body,clock());const {status,...data}=result;return reply(status,{ok:status===200,...(status===200?{identityMetadata:1}:{}),...data});}catch(e){return invalid(e.message);}}
      if(s.protocol===3||size>2048)return invalid('Expected an authorised batch endpoint');
      const keys=Object.keys(body).sort().join(',');
      const legacy=keys==='token,x,z';
      const modern=keys==='entityId,protocol,sequence,token,x,z' && body.protocol===2 && typeof body.entityId==='string' && /^[a-zA-Z0-9_-]{1,64}$/.test(body.entityId) && Number.isSafeInteger(body.sequence) && body.sequence>0;
      if ((!legacy&&!modern) || (s.protocol===2&&!modern) || (s.protocol===1&&!legacy) || !Number.isFinite(body.x) || !Number.isFinite(body.z) || Math.abs(body.x)>13500 || Math.abs(body.z)>13500) return invalid('Invalid marker or unsupported protocol');
      if(modern){
        if(s.entityId && s.entityId!==body.entityId) return invalid('Only the paired entity is permitted');
        if(body.sequence<s.senderSequence) return reply(409,{error:'Out-of-order update'});
        if(body.sequence===s.senderSequence){
          if(s.point?.x!==body.x || s.point?.z!==body.z) return invalid('Conflicting duplicate');
          return reply(200,{ok:true,duplicate:true});
        }
      }
      if (s.sequence && clock()-s.updated < 500) return reply(429, {error:'Update too frequent'});
      if(modern){s.entityId=body.entityId;s.senderSequence=body.sequence;}
      s.point = {x:body.x,z:body.z}; s.updated=clock(); s.sequence++;
      reply(200, {ok:true});
    } catch { reply(400, {error:'Invalid request'}); }
  });
  server.requestTimeout=5000; server.headersTimeout=5000; server.maxHeadersCount=20; server.maxConnections=200;
  const timer=setInterval(sweep,30000); timer.unref(); server.on('close',()=>clearInterval(timer));
  return server;
}
if (require.main === module) {
  const port=Number(process.env.PORT || 8080);
  const server=createRelay(); server.listen(port,'0.0.0.0',()=>console.log('ORBAT relay listening on port '+port));
  for (const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>{server.close();server.closeAllConnections();});
}
module.exports={createRelay};
