'use strict';
// Original COMMAND declarations. Aircraft assets remain external dependencies.
const base='58D0FB3206B6F859', core='5614BBCCBB55ED1C';
const reference=(empty,mtow,note)=>({units:'kg',emptyMassEstimate:empty,maximumTakeoffMassEstimate:mtow,provenance:{source:'User aircraft handoff, 2026-10-20',verification:'unverified-user-estimate'},note});
const targets=[
 ['mi8mt','Mi-8MT',base,reference(7260,[12000,13000],'Exact installed variant required.')],
 ['uh60m','UH-60M','60ED3CC6E7E40221',reference(5675,[9980,9980],'Other H60 variants do not match UH-60M.')],
 ['mh6','MH-6','6273146ADFE8241D',reference(722,[1590,2132],'Estimate spans variants; transport must be resolved separately.')],
 ['ah6m','AH-6M','6273146ADFE8241D',reference(722,[1590,2132],'Estimate spans variants; armed variant does not imply cargo capacity.')],
 ['ch47f','CH-47F','5CAB7D88BB567AD6',reference(11148,[22680,22680],'Tandem reference layout does not establish native yaw mappings.')],
 ['ah64d','AH-64D','5CCCC1DFB9C93581',reference(5165,[10432,10432],'AH-64E must not substitute for AH-64D.')],
 ['ah1z','AH-1Z','517995C96696B616',reference(5579,[8391,8391],'Pilot and gunner roles require native compartment inspection.')],
 ['aw159','AW159',null,reference(3300,[6000,6000],'Private/custom implementation is unindexed; no guessed addon identity.')]
].map(([id,variant,expectedAddonId,realWorldReference])=>({id,variant,expectedAddonId,realWorldReference}));
const variants=[
 ['transport','DF5CCB7C0FF049F4','Mi8MT_unarmed_transport.et'],
 ['armed','7BD282AF716ED639','Mi8MT_armed.et'],
 ['gunship-empty','98225ED6D5F724D7','Mi8MT_armed_gunship_empty.et'],
 ['gunship-he','3C6B3ED0C3AC30D5','Mi8MT_armed_gunship_HE.et'],
 ['gunship-hedp','DBEC63C9DEE4358C','Mi8MT_armed_gunship_HEDP.et'],
 ['civilian-blue','AB9ED3A33EE1B630','Mi8MT_unarmed_civ_blue.et'],
 ['civilian-red','8175FCADFA2FB904','Mi8MT_unarmed_civ_red.et']
];
const profiles=variants.map(([id,guid,file])=>({
 id:'command-mi8mt-'+id,version:1,targetId:'mi8mt',variant:'Mi-8MT '+id,
 identity:{addonId:base,guid,path:'Prefabs/Vehicles/Helicopters/Mi8MT/'+file},
 identityEvidence:'Installed base-game Workbench metadata index, 2026-10-14; not a native availability test.',
 classification:'aircraft-candidate',targetMatch:'exact-variant-reference',rotorConfiguration:'unknown',
 requiredComponents:['HelicopterControllerComponent','BaseCompartmentManagerComponent'],
 controlBindings:[],seatRoleHints:[],calibration:null,validatedEnvironment:null,
 declaredDependencies:[base,core],validation:'metadata-only'
}));
// Exact addon-prefab candidates from a public ResourceDatabase query. Names do not
// certify the requested M variant; no candidate is substituted for UH-60M.
for(const [id,guid,file] of [
 ['armed','48F288F5BFF10D8B','AUS_UH60_armed.et'],
 ['medical','847A4C8E73A7C186','AUS_UH60_Medical.et'],
 ['quad-hydra','1529FD2C6A8162A1','AUS_UH60_Pylon_Quad_Hydra.et'],
 ['supply','47F2921E0DACA300','AUS_UH60_Supply.et']
])profiles.push({...profiles[0],id:'command-h60-'+id,targetId:'uh60m',variant:'Sikorsky H60 '+id+' (M variant unverified)',
 identity:{addonId:'60ED3CC6E7E40221',guid,path:'Prefabs/Vehicles/Helicopters/AUS_MH60/'+file},
 identityEvidence:'Native ResourceDatabase query of installed Sikorsky H60 Project 0.6.56, 2026-10-20; metadata only.',targetMatch:'unverified-variant',
 declaredDependencies:['60ED3CC6E7E40221',base,core,'6276E6E3CC97A22B','629B2BA37EFFD577','64EE818E08AFCF94']});
module.exports={schema:'command-aircraft-profiles',version:1,targets,profiles};
