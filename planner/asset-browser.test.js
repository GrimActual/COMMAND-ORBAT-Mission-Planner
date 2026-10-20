const {test}=require('node:test'),assert=require('node:assert/strict'),B=require('./asset-browser');
const asset=(path,assetKind='other',name='Asset')=>({id:path,name,assetKind,resourceReference:{path,guid:'1234567890ABCDEF'}});
test('folders distinguish troops, groups, weapons and vehicles without changing identity',()=>{const a=asset('Prefabs/Characters/Factions/BLUFOR/US_Army/Character_US_Rifleman.et','infantry');const before=JSON.stringify(a),r=B.describe(a);assert.equal(r.kind,'troops');assert.equal(r.title,'US Rifleman');assert.equal(r.faction,'BLUFOR');assert.equal(JSON.stringify(a),before);assert.equal(B.describe(asset('Prefabs/Groups/US_RifleSquad.et','infantry')).kind,'groups');assert.equal(B.describe(asset('Prefabs/Weapons/Rifles/M16.et')).kind,'weapons');});
test('linked armour filtering excludes troops and soft vehicles, APC filter retains APCs',()=>{const rows=[B.describe(asset('Prefabs/Vehicles/Wheeled/BTR70/BTR70.et','apc')),B.describe(asset('Prefabs/Vehicles/Tracked/T72/T72.et','tank')),B.describe(asset('Prefabs/Vehicles/Wheeled/M998/M998.et','lightVehicle')),B.describe(asset('Prefabs/Characters/Character_US_Rifleman.et','infantry'))];assert.equal(B.filter(rows,{kind:'armor'}).length,2);assert.equal(B.filter(rows,{kind:'mechanized'}).length,1);assert.equal(B.filter(rows,{kind:'troops'}).length,1);assert.equal(B.filter(rows,{kind:'vehicles'}).length,3);});
test('search matches unicode, multiple tokens, exact GUID, and optional helper exclusions',()=>{const rows=[B.describe(asset('Prefabs/Items/Café_Radio.et','other','Café radio')),B.describe(asset('Prefabs/Characters/Basebody/CharacterBasebody_Asian_02.et')),B.describe(asset('Prefabs/Vehicles/Helicopters/Mi8/Dst/Dbr/Dbr_Mi8_Blade.et','helicopter'))];assert.equal(B.filter(rows,{query:'cafe radio'}).length,1);assert.equal(B.filter(rows,{query:'1234567890abcdef'}).length,3);assert.equal(B.filter(rows,{variants:false}).length,1);assert.equal(B.filter(rows,{query:'<script>'}).length,0);});

test('category aliases make infantry and armour searchable without mixing exclusive types',()=>{const rows=[B.describe(asset('Prefabs/Characters/Soldier.et','infantry')),B.describe(asset('Prefabs/Vehicles/Tank.et','tank')),B.describe(asset('Prefabs/Vehicles/Boats/Patrol.et','boat')),B.describe(asset('Prefabs/Vehicles/Support/Utility.et','truck'))];assert.equal(B.filter(rows,{query:'infanterie',kind:'troops'}).length,1);assert.equal(B.filter(rows,{query:'armour',kind:'armor'}).length,1);assert.equal(B.filter(rows,{query:'armour',kind:'troops'}).length,0);assert.equal(B.filter(rows,{kind:'naval'}).length,1);assert.equal(B.filter(rows,{kind:'support'}).length,1);const counts=B.counts(rows);assert.equal(counts.all,4);assert.equal(counts.vehicles,3);assert.equal(counts.troops,1);assert.equal(counts.naval,1);assert.equal(B.counts(rows,{query:'infantry'}).armor,0);});

test('vehicle components never enter vehicle or armour lists, even with broad vehicle hints',()=>{
 const paths=['Prefabs/Vehicles/Core/DestructibleVehicleGlass_Armored.et','Prefabs/Vehicles/Generic/VehParts/Plate.et','Prefabs/Vehicles/Helicopters/Mi8MT/Lights/VehicleLight_Mi8_Cabin.et','Prefabs/Vehicles/Helicopters/Mi8MT/Dst/Dbr/Dbr_Mi8MT_Blade_01.et'];
 const rows=paths.map(p=>B.describe(asset(p,'tank')));
 assert.ok(rows.every(r=>r.kind==='vehicleparts'));
 assert.equal(B.filter(rows,{kind:'vehicles'}).length,0);
 assert.equal(B.filter(rows,{kind:'armor'}).length,0);
 assert.equal(B.filter(rows,{variants:false}).length,0);
 assert.equal(B.filter(rows,{kind:'vehicleparts'}).length,4);
});
test('complete vehicle variants remain selectable while wrecks templates and scenery are separate',()=>{
 const rows=[B.describe(asset('Prefabs/Vehicles/Helicopters/Mi8MT/Mi8MT_armed_gunship_HE.et','helicopter')),B.describe(asset('Prefabs/Vehicles/Helicopters/Mi8MT/Mi8_base.et','helicopter')),B.describe(asset('Prefabs/Vehicles/Wheeled/M998/M998_wreck.et','lightVehicle')),B.describe(asset('Prefabs/Props/Vehicle_Display.et','tank'))];
 assert.equal(rows[0].kind,'vehicles');assert.equal(rows[0].variant,false);
 assert.equal(rows[1].kind,'templates');assert.equal(rows[2].kind,'wrecks');
 assert.equal(rows[3].kind,'props');
 assert.equal(B.filter(rows,{kind:'vehicles'}).length,1);
 assert.equal(B.filter(rows,{variants:false}).length,2);
});

test('default faction grouping prefers explicit variants over origin and never mutates assets',()=>{
 const samples=[['Prefabs/Vehicles/Wheeled/M998/M998.et','BLUFOR'],['Prefabs/Vehicles/Wheeled/BTR70/BTR70.et','OPFOR'],['Prefabs/Vehicles/Wheeled/BTR70/BTR70_FIA.et','INDFOR'],['Prefabs/Vehicles/Wheeled/Ural4320/Ural4320_Civ.et','CIVILIAN'],['Prefabs/Vehicles/Wheeled/UnknownMod/Novel.et','unknown'],['Prefabs/Vehicles/Factions/BLUFOR/BTR70.et','BLUFOR']];
 for(const [path,faction] of samples){const original=asset(path);const before=JSON.stringify(original);assert.equal(B.describe(original).faction,faction);assert.equal(JSON.stringify(original),before);}
 const rows=samples.map(([path])=>B.describe(asset(path)));assert.equal(B.filter(rows,{faction:'all'}).length,6);assert.equal(B.filter(rows,{faction:'BLUFOR'}).length,2);
});
