import assert from 'node:assert/strict';
import { ChildProcess } from 'node:child_process';
import { readFile } from 'node:fs/promises';
const [language, countText, arm] = process.argv.slice(2), count = Number(countText);
assert.ok(['rust','c'].includes(language));
let child;
const emit = ChildProcess.prototype.emit;
ChildProcess.prototype.emit = function(event,...args) { if(event==='spawn') child=this; return emit.call(this,event,...args); };
const pieces = Array.from({length:count},(_,i)=>language==='rust'
 ? `pub fn target_${i}(value: i32) -> i32 {\r\n // original 🙂 bytes\r\n value + ${i}\r\n}\r\n`
 : `int target_${i}(int value) {\r\n // original 🙂 bytes\r\n return value + ${i};\r\n}\r\n`);
const source=pieces.join('\r\n'), snapshot={source,path:language==='rust'?'fixture.rs':'fixture.c',contentHash:'fixture'};
const start=performance.now();
const {inspect,sourceForUnit}=await import('../../packages/core/src/source.ts');
const imported=performance.now(), result=await inspect(snapshot), end=performance.now();
const names=new Set(result.units.map(u=>u.name));
const found=pieces.filter((_,i)=>names.has(`target_${i}`)).length;
if(language==='rust' && arm==='after') {
 assert.equal(result.mode,'rust'); assert.equal(found,count);
 for(let i=0;i<count;i++) assert.equal(sourceForUnit(snapshot,result.units.find(u=>u.name===`target_${i}`)),pieces[i]);
} else {
 assert.equal(result.mode,'text'); assert.equal(result.fallback,'unsupported');
 assert.equal(result.units.map(u=>sourceForUnit(snapshot,u)).join(''),source);
 assert.equal(found,0);
}
const warm=[];
for(let i=0;i<10;i++) {const t=performance.now(); await inspect({...snapshot}); warm.push(performance.now()-t);}
let workerRSSKiB=null;
if(child?.pid) workerRSSKiB=Number(/VmRSS:\s+(\d+)/.exec(await readFile(`/proc/${child.pid}/status`,'utf8'))?.[1]);
console.log(JSON.stringify({language,count,arm,sourceBytes:Buffer.byteLength(source),mode:result.mode,fallback:result.fallback??null,namedFunctions:found,units:result.units.length,importMs:imported-start,firstInspectMs:end-imported,coldTotalMs:end-start,warmMs:warm,parentMaxRSSKiB:process.resourceUsage().maxRSS,workerRSSKiB}));
