'use strict';
// Background public reachability verification; local pairing does not wait on public DNS.
async function waitForPublicRelay(endpoint,signal,{fetchImpl=fetch,attempts=41,requestMs=4000,delayMs=3000,timeoutMs=120000,onProgress=()=>{}}={}){
 let last='unreachable';
 const deadline=Date.now()+timeoutMs;
 for(let n=0;n<attempts;n++){
  signal.throwIfAborted();
  if(Date.now()>=deadline)break;
  try{
   const response=await fetchImpl(endpoint+'health',{redirect:'error',signal:AbortSignal.any([signal,AbortSignal.timeout(Math.max(1,Math.min(requestMs,deadline-Date.now())))])});
   if(!response.ok){last='HTTP '+response.status;await response.body?.cancel();}
   else{
    let size=0;const parts=[],reader=response.body.getReader();
    try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1024)throw Error('Invalid health response');parts.push(value);}}finally{await reader.cancel().catch(()=>{});}
    const data=JSON.parse(Buffer.concat(parts).toString('utf8'));
    if(data?.ok===true)return;
    last='invalid health response';
   }
  }catch(e){if(signal.aborted)throw e;last=e.cause?.code==='ENOTFOUND'?'DNS lookup failed':'unreachable';}
  onProgress({attempt:n+1,reason:last});
  if(n+1<attempts&&Date.now()<deadline)await new Promise((resolve,reject)=>{const abort=()=>{clearTimeout(timer);reject(Error('Cancelled'));};const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},Math.min(delayMs,deadline-Date.now()));signal.addEventListener('abort',abort,{once:true});if(signal.aborted){signal.removeEventListener('abort',abort);abort();}});
 }
 throw Error('Public tunnel is not reachable ('+last+'). Public reachability remains unconfirmed. Check the game connection or use a working server-managed HTTPS relay.');
}
module.exports={waitForPublicRelay};
