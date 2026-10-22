// Approval authority is registered only by the authenticated game writer.
'use strict';
const AI=require('./ai-orders-contract'),Vehicle=require('./vehicle-control-contract'),Scenario=require('./scenario-contract'),Refuel=require('./refuel-contract'),Flight=require('./helicopter-insertion-contract');
const CAPABILITY='approval-all-supported-v1';
const SUPPORTED_KINDS=Object.freeze([...new Set(['spawn','remove',...AI.kinds,...Vehicle.kinds,...Scenario.kinds,Refuel.KIND,Flight.KIND])]);
const CUSTOM_ORDERS=Object.freeze([...AI.kinds,...Vehicle.kinds]);
function validate(value){
 const required=['aiOrders','spawning','removal'],allowed=[...required,'allSupported'];
 if(!value||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value))||Reflect.ownKeys(value).some(k=>!allowed.includes(k))||required.some(k=>!Object.hasOwn(value,k)))throw Error('Invalid approval policy');
 const policy={};for(const key of allowed)if(Object.hasOwn(value,key)){const d=Object.getOwnPropertyDescriptor(value,key);if(!d||!('value'in d)||!d.enumerable||typeof d.value!=='boolean')throw Error('Invalid approval policy');policy[key]=d.value;}
 return policy;
}
function eligible(kind,policy){
 const p=validate(policy);if(!SUPPORTED_KINDS.includes(kind))return false;
 if(p.allSupported===true)return true;
 return kind==='spawn'?p.spawning:kind==='remove'?p.removal:CUSTOM_ORDERS.includes(kind)&&p.aiOrders;
}
module.exports={CAPABILITY,SUPPORTED_KINDS,validate,eligible};
