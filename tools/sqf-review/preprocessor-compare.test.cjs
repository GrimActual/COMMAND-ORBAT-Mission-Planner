'use strict';
const test=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process'),E=require('../../planner/sqf-include-expansion');
const executable=process.env.COMMAND_CPP||(process.platform==='linux'?'/usr/bin/cpp':null);
const fixtures=[
 '#define FLIP(x) not (x)\nprivate _r=FLIP(FLIP(true));',
 '#define PREFIX TAG\n#define JOIN(a,b) a##b\n#define WRAP(a,b) JOIN(a,b)\nprivate _r=WRAP(PREFIX,_fnc_ready);',
 '#define PREFIX TAG\n#define QUOTE(x) #x\n#define WRAP(x) QUOTE(x)\nprivate _r=WRAP(PREFIX);',
 '#define PICK(a,b) b\nprivate _r=PICK((true), (false));',
 '#if 2+3*4==14\ntrue;\n#else\nfalse;\n#endif',
 '#define READY\n#if defined(READY) && (6/2==3)\ntrue;\n#else\nfalse;\n#endif',
 '#if 0 && (1/0)\nfalse;\n#else\ntrue;\n#endif',
 '#define FLAG true\n#undef FLAG\n#define FLAG false\nprivate _r=FLAG;'
];
const lex=text=>(text.replace(/\/\*[\s\S]*?\*\/|\/\/[^\r\n]*/g,'').match(/"(?:[^"\\]|\\.)*"|[A-Za-z_][A-Za-z0-9_]*|[0-9]+|&&|\|\||==|!=|<=|>=|\S/g)||[]);
test('original neutral macro fixtures match an independent C preprocessor token stream',{skip:!executable||!path.isAbsolute(executable)||!fs.existsSync(executable)?'Independent C preprocessor unavailable; native Arma preprocessing parity is not claimed':false},()=>{
 for(const [i,text]of fixtures.entries()){const native=spawnSync(executable,['-P','-undef','-nostdinc','-x','c','-'],{input:text,encoding:'utf8',timeout:5000,maxBuffer:1048576,windowsHide:true});a.equal(native.status,0,'Independent preprocessor failed for neutral fixture '+i+': '+native.stderr);const result=E.buildFunctionMacros([{name:'entry.sqf',text}],[],[{file:'entry.sqf',configRoot:null}],{mode:'explicit-closed-set',defined:[]});a.equal(result.summary.expanded,1);a.deepEqual(lex(result.units[0].text),lex(native.stdout),'Neutral fixture '+i);a.equal(result.nativePreprocessorParityVerified,false);}
});
