'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
function preferences(stored){let saved=stored,fail=false;const context={window:{dispatchEvent(){}},document:{documentElement:{dataset:{},style:{setProperty(){}}}},localStorage:{getItem:()=>saved,setItem:(key,value)=>{if(fail)throw Error('Storage full');saved=value}},Event:class{}};vm.createContext(context);vm.runInContext(source('preferences.js'),context);return {api:context.window.PlannerPreferences,saved:()=>saved,fail:()=>fail=true};}
test('language preferences migrate, validate, persist and retain prior language on storage failure',()=>{
 const p=preferences(JSON.stringify({theme:'light',language:'unknown'}));assert.equal(p.api.get().language,'en');assert.equal(p.api.get().theme,'light');
 p.api.save({...p.api.get(),language:'fr',locale:'fr-FR'});assert.equal(JSON.parse(p.saved()).language,'fr');
 const reopened=preferences(p.saved());assert.equal(reopened.api.get().language,'fr');reopened.api.save({...reopened.api.get(),language:'de',locale:'de-DE'});assert.equal(reopened.api.get().locale,'de-DE');
 reopened.fail();assert.throws(()=>reopened.api.save({...reopened.api.get(),language:'en'}));assert.equal(reopened.api.get().language,'de');
});
test('both offline dictionaries cover the same strings and all Sarge instructions',()=>{
 const context={window:{}};vm.createContext(context);vm.runInContext(source('translations.js'),context);const {fr,de}=context.window.PlannerTranslations;assert.deepEqual(Object.keys(fr),Object.keys(de));for(const dictionary of [fr,de])for(const value of Object.values(dictionary))assert.equal(typeof value,'string');
 const topics=vm.runInNewContext(source('sarge-help.js').split('const topics=')[1].split('\n];')[0]+']');assert.equal(topics.length,71);
 for(const [title,text] of topics)for(const dictionary of [fr,de]){assert.ok(dictionary[title]);assert.ok(dictionary[text]);assert.notEqual(dictionary[text],text);}
});
test('unknown interface text falls back unchanged; recognized text uses selected language',()=>{
 let language='fr';const context={window:{PlannerPreferences:{get:()=>({language})},addEventListener(){}},document:{addEventListener(){}}};vm.createContext(context);vm.runInContext(source('translations.js'),context);vm.runInContext(source('i18n.js'),context);const t=context.window.PlannerI18n.t;
 assert.equal(t('Undo'),'Annuler');language='de';assert.equal(t('Undo'),'Rückgängig');assert.equal(t('Custom mod <script>'),'Custom mod <script>');language='en';assert.equal(t('Undo'),'Undo');
});
