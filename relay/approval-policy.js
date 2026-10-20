// Approval authority is registered only by the authenticated game writer.
'use strict';
function validate(v){if(!v||Array.isArray(v)||Object.keys(v).sort().join(',')!=='aiOrders,removal,spawning'||['aiOrders','spawning','removal'].some(k=>typeof v[k]!=='boolean'))throw Error('Invalid approval policy');return {...v};}
function eligible(kind,p){return kind==='spawn'?p.spawning:kind==='remove'?p.removal:['ai-move','ai-hold','ai-defend','ai-halt','ai-route','ai-recruit','ai-release','ai-follow','ai-formation','ai-stance','ai-combat-mode','ai-embark','ai-dismount','ai-heal','ai-diagnose','vehicle-inspect','vehicle-route','convoy-attach','convoy-detach'].includes(kind)&&p.aiOrders;}
module.exports={validate,eligible};
