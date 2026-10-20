/* Canonical, portable canvas shortcuts. Project data never contains preferences. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PlannerShortcuts=api;})(globalThis,()=>{
 'use strict';
 const definitions={
  passengerPlacement:['Place passengers','N'],pilotPlacement:['Place pilot','B'],
  undo:['Undo','Ctrl+Z'],redo:['Redo','Ctrl+Y, Ctrl+Shift+Z'],selectAll:['Select all units','Ctrl+A'],
  duplicate:['Duplicate selection','Ctrl+D'],copy:['Copy','Ctrl+C'],paste:['Paste','Ctrl+V'],
  delete:['Delete selected objects','Delete, Backspace'],cancel:['Cancel tool / clear selection','Escape'],finish:['Finish path / polygon','Enter'],
  zoomIn:['Zoom in','='],zoomOut:['Zoom out','-'],fit:['Fit ORBAT',''],
  panUp:['Pan up','ArrowUp, W'],panDown:['Pan down','ArrowDown, S'],panLeft:['Pan left','ArrowLeft, A'],panRight:['Pan right','ArrowRight, D'],holdPan:['Hold to drag the map','Space']
 };
 const defaults=()=>Object.fromEntries(Object.entries(definitions).map(([id,[,value]])=>[id,value]));
 const held=id=>id.startsWith('pan')||id==='holdPan';
 function canonical(value){
  const pieces=value.trim().split('+').map(x=>x.trim());let key=pieces.pop();
  const aliases={esc:'Escape',escape:'Escape',enter:'Enter',space:'Space',spacebar:'Space',delete:'Delete',backspace:'Backspace',arrowup:'ArrowUp',arrowdown:'ArrowDown',arrowleft:'ArrowLeft',arrowright:'ArrowRight',plus:'=',minus:'-'};
  key=aliases[key.toLowerCase()]||key.toUpperCase();
  if(!/^[A-Z0-9=\-]$/.test(key)&&!Object.values(aliases).includes(key))throw Error('Use a letter, number, arrow key, Space, Enter, Escape, Delete, Backspace, = or -.');
  const modifiers=pieces.map(x=>/^(ctrl|control|cmd|meta)$/i.test(x)?'Ctrl':/^shift$/i.test(x)?'Shift':null);
  if(modifiers.includes(null)||new Set(modifiers).size!==modifiers.length)throw Error('Only Ctrl and Shift modifiers are supported.');
  if(modifiers.includes('Shift')&&/^[0-9-]$/.test(key))throw Error('Use Shift with letters or named keys, not numbers or minus.');
  if(modifiers.includes('Ctrl')&&['W','Q','R','L','N','T','P','S','F','O','J','H','U','I','Escape'].includes(key))throw Error('That shortcut is reserved by the browser or operating system.');
  if(key==='='&&!modifiers.includes('Ctrl'))return '='; // + and = both zoom by default, across layouts.
  return [...['Ctrl','Shift'].filter(m=>modifiers.includes(m)),key].join('+');
 }
 function validate(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid shortcut preferences.');
  const result={},used=new Map();
  for(const id of Object.keys(definitions)){
   const value=raw[id]??defaults()[id];if(typeof value!=='string'||value.length>200)throw Error('Invalid shortcut preferences.');
   const tokens=value.trim()?value.split(',').map(canonical):[];
   if(tokens.length>3||new Set(tokens).size!==tokens.length)throw Error('Use up to three different shortcuts per action.');
   if(held(id)&&tokens.some(k=>k.includes('+')||!/^([A-Z]|Arrow(Up|Down|Left|Right)|Space)$/.test(k)))throw Error('Map movement and drag keys must be unmodified letters, arrows or Space.');
   for(const token of tokens){
    const variants=held(id)?[token,'Shift+'+token]:[token];
    for(const v of variants){if(used.has(v))throw Error('Shortcut conflict: '+v+' ('+definitions[used.get(v)][0]+' / '+definitions[id][0]+').');used.set(v,id);}
   }
   result[id]=tokens.join(', ');
  }
  return result;
 }
 function fromEvent(e){
  if(e.altKey||e.isComposing||e.key==='Dead'||e.key==='Unidentified'||e.ctrlKey&&e.metaKey)return null;
  let key=e.key===' '?'Space':e.key==='+'?'=':e.key;
  if(['Control','Meta','Shift','Alt'].includes(key))return null;
  try{return canonical((e.ctrlKey||e.metaKey?'Ctrl+':'')+(e.shiftKey?'Shift+':'')+key);}catch{return null;}
 }
 function match(e,bindings,letters=true){
  const token=fromEvent(e);if(!token)return null;
  for(const [id,value]of Object.entries(bindings)){
   const candidate=held(id)?token.replace(/^Shift\+/,''):token;
   if(id.startsWith('pan')&&!letters&&/^[A-Z]$/.test(candidate))continue;
   if(value.split(', ').includes(candidate))return id;
  }
  return null;
 }
 return {definitions,defaults,validate,match,canonical};
});
