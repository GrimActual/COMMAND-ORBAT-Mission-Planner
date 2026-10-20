// Explicit server-managed loopback origin. Deploy behind an administrator-managed HTTPS tunnel.
'use strict';
const {createRelay}=require('./server');
function options(env){const port=Number(env.COMMAND_RELAY_PORT||8080),hours=Number(env.COMMAND_RELAY_HOURS||1);if(!Number.isInteger(port)||port<1||port>65535||!Number.isInteger(hours)||hours<1||hours>24)throw Error('Choose port 1–65535 and lifetime 1–24 whole hours');return {port,lifetime:hours*3600000};}
if(require.main===module){const o=options(process.env),server=createRelay({lifetime:o.lifetime});server.listen(o.port,'127.0.0.1',()=>console.log('COMMAND server relay ready on loopback; sessions expire after '+(o.lifetime/3600000)+' hour(s).'));for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.close();server.closeAllConnections();});}
module.exports={options};
