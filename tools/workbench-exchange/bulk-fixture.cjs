'use strict';
const C=require('../../planner/planner-core'),X=require('./contract.cjs'),{fixture}=require('./fixtures.cjs');
function bulkFixture(){
 const f=fixture(),template=f.mission.orderOfBattle[0],foreign=f.mission.orderOfBattle[2];
 f.mission.orderOfBattle=Array.from({length:1000},(_,i)=>({...structuredClone(template),id:'existing-'+(i+1),name:'Synthetic '+(i+1),position:{lng:150+i%100*20,lat:250+Math.floor(i/100)*20}}));f.mission.orderOfBattle.push(foreign);f.mission=C.validate(f.mission);
 f.config.entities=f.mission.orderOfBattle.slice(0,1000).map((unit,i)=>({managedId:'managed-'+(i+1),unitId:unit.id,prefab:structuredClone(f.config.resources[0]),transform:{position:[unit.position.lng-50,10,unit.position.lat-50],angles:[90,0,0]}}));
 const prepared=X.createBaseline(JSON.stringify(f.mission),JSON.stringify(f.config));f.baseline=prepared.baseline;f.wire.baselineSha256=prepared.baselineSha256;
 f.wire.entities=f.config.entities.slice(0,999).map(({unitId,...row},i)=>({...structuredClone(row),transform:{position:[row.transform.position[0]+(i<500?1:0),10,row.transform.position[2]],angles:[90,0,0]}}));
 f.wire.entities.push({managedId:'new',prefab:structuredClone(f.config.resources[1]),transform:{position:[300,20,400],angles:[270,0,0]}});f.choices.confirmedMovedIds=f.config.entities.slice(0,500).map(row=>row.managedId);f.choices.confirmedRemovedIds=['managed-1000'];return f;
}
module.exports={bulkFixture};
