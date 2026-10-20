const {test}=require('node:test'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const {createFreeBridge}=require('./free-bridge');
function harness(announce=true,probe=async()=>{}){
 let callback;const helper=new EventEmitter();helper.stdout=new EventEmitter();helper.stderr=new EventEmitter();helper.stdout.resume=helper.stderr.resume=()=>{};helper.kill=()=>helper.killed=true;
 const relay=new EventEmitter();relay.listen=(_port,host,fn)=>{assert.equal(host,'127.0.0.1');setImmediate(fn);};relay.address=()=>({port:12345});relay.close=()=>relay.closed=true;relay.closeAllConnections=()=>{};
 const deps={probe,createRelay:()=>relay,spawn:()=>{if(announce)setImmediate(()=>helper.stderr.emit('data','https://example-name.trycloudflare.com\nRegistered tunnel connection'));return helper;},createRemote:cb=>{callback=cb;return {start:async endpoint=>{assert.equal(endpoint,'http://127.0.0.1:12345/');cb({status:'waiting',endpoint,token:'a'.repeat(32),point:null,received:0});},stop:()=>cb({status:'off'})};}};
 const bridge=createFreeBridge(()=>{},deps);return {bridge,helper,relay,update:s=>callback(s)};
}
test('one-click start exposes a code; stop closes only owned relay/helper and clears secrets',async()=>{
 const h=harness();const s=await h.bridge.start();assert.equal(s.status,'waiting');assert.equal(s.token.length,32);assert.equal(s.endpoint,'https://example-name.trycloudflare.com/');
 h.update({status:'connected',token:s.token,point:{x:1,z:2},received:1});assert.equal(h.bridge.status().received,1);
 h.bridge.stop();assert.equal(h.helper.killed,true);assert.equal(h.relay.closed,true);assert.equal(h.bridge.status().token,'');assert.equal(h.bridge.status().endpoint,'');
 h.update({status:'connected',point:{x:8,z:9}});assert.equal(h.bridge.status().point,null);
});
test('cancelling startup resolves without a late connection',async()=>{
 const h=harness(false);const pending=h.bridge.start();await new Promise(r=>setImmediate(r));h.bridge.stop();await pending;
 h.helper.stderr.emit('data','https://late-name.trycloudflare.com');assert.equal(h.bridge.status().status,'off');assert.equal(h.relay.closed,true);
});
test('helper exit clears marker and gives actionable restart message',async()=>{
 const h=harness();await h.bridge.start();h.helper.emit('exit',1);assert.equal(h.bridge.status().status,'error');assert.equal(h.bridge.status().token,'');assert.match(h.bridge.status().error,/new address/);
});
test('expired pairing stops helper instead of leaving an idle public relay running',async()=>{
 const h=harness();await h.bridge.start();h.update({status:'off'});assert.equal(h.bridge.status().status,'error');assert.equal(h.helper.killed,true);assert.match(h.bridge.status().error,/expired/);
});
test('an address alone is not ready; registration enables local pairing and preserves the public address',async()=>{
 const h=harness(false);const pending=h.bridge.start();await new Promise(r=>setImmediate(r));
 h.helper.stderr.emit('data','https://example-name.trycloudflare.com');
 await new Promise(r=>setImmediate(r));assert.equal(h.bridge.status().token,'');assert.equal(h.bridge.status().status,'starting');
 h.helper.stderr.emit('data','\nRegistered tunnel con');h.helper.stderr.emit('data','nection');
 const s=await pending;assert.equal(s.status,'waiting');assert.equal(s.endpoint,'https://example-name.trycloudflare.com/');assert.equal(s.token.length,32);
 h.bridge.stop();
});

test('registered tunnel issues local credentials promptly while failed public checks remain explicit',async()=>{const h=harness(true,async()=>{throw Error('Public tunnel is not reachable (DNS lookup failed). No pairing code was issued.');});const s=await h.bridge.start();assert.equal(s.status,'waiting');assert.equal(s.token.length,32);await new Promise(r=>setImmediate(r));assert.equal(h.bridge.status().publicReachability,'unconfirmed');assert.match(h.bridge.status().connectionWarning,/could not be confirmed/);h.bridge.stop();});
test('Stop during public verification cannot publish late pairing state',async()=>{let release;const h=harness(true,()=>new Promise(r=>release=r)),pending=h.bridge.start();while(!release)await new Promise(r=>setImmediate(r));h.bridge.stop();release();await pending;assert.equal(h.bridge.status().status,'off');assert.equal(h.bridge.status().token,'');});
test('public health checks retry DNS failure without credentials and bound replies',async()=>{const {waitForPublicRelay}=require('./public-relay-health');let calls=0;await waitForPublicRelay('https://fixture.invalid/',new AbortController().signal,{attempts:2,delayMs:1,fetchImpl:async(url,options)=>{assert.equal(url,'https://fixture.invalid/health');assert.equal(options.redirect,'error');assert.equal(options.headers,undefined);if(++calls===1)throw Object.assign(Error('DNS'),{cause:{code:'ENOTFOUND'}});return new Response('{"ok":true}');}});assert.equal(calls,2);await assert.rejects(waitForPublicRelay('https://fixture.invalid/',new AbortController().signal,{attempts:1,fetchImpl:async()=>new Response('x'.repeat(1025))}),/not reachable/);});
test('public health failure and cancellation do not hang connection startup',async()=>{const {waitForPublicRelay}=require('./public-relay-health');await assert.rejects(waitForPublicRelay('https://fixture.invalid/',new AbortController().signal,{attempts:1,fetchImpl:async()=>{throw Object.assign(Error('DNS'),{cause:{code:'ENOTFOUND'}});}}),/DNS lookup failed/);const c=new AbortController();c.abort();await assert.rejects(waitForPublicRelay('https://fixture.invalid/',c.signal,{fetchImpl:()=>{throw Error('must not fetch');}}));});

test('public readiness has a total deadline even when DNS fails immediately',async()=>{const {waitForPublicRelay}=require('./public-relay-health');const started=Date.now();await assert.rejects(waitForPublicRelay('https://fixture.invalid/',new AbortController().signal,{attempts:1000,delayMs:1,timeoutMs:15,fetchImpl:async()=>{throw Object.assign(Error('DNS'),{cause:{code:'ENOTFOUND'}});}}),/DNS lookup failed/);assert.ok(Date.now()-started<1000);});

test('a slow public DNS check does not block address/code delivery',async()=>{let finish;const h=harness(true,()=>new Promise(r=>finish=r));const state=await h.bridge.start();assert.equal(state.token.length,32);assert.equal(state.publicReachability,'checking');assert.equal(state.endpoint,'https://example-name.trycloudflare.com/');finish();await new Promise(r=>setImmediate(r));assert.equal(h.bridge.status().publicReachability,'verified');h.bridge.stop();});
