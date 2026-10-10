import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadSource,inspectSTL} from './core.mjs';
const html = await readFile(new URL('../source/gridfinity_generator_4.html', import.meta.url),'utf8');
const make = () => loadSource(html);
const slice = (s,a,b) => s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
test('all five builders reject invalid and unbounded direct parameters before allocating',()=>{
 const {run} = make();
 for(const builder of ['buildBin','buildLid','buildTray','buildWipeBox','buildWipeLid']) {
  for(const param of ['seg:0','seg:NaN','nx:Infinity','cornerSegs:100000','labels:"x".repeat(1001)']) assert.throws(()=>run(`${builder}({...DEFAULTS,${param}})`));
 }
 assert.throws(()=>run('buildTray({...DEFAULTS,nx:1,ny:1,hu:2,floorT:6,slots:40,slotW:40,slotBottom:"round"})'),/cradle/);
 assert.throws(()=>run('buildBin({...DEFAULTS,nx:1,ny:1,hu:2,floorT:6,labelH:40,labelW:240})'),/Label/);
});
test('normal reference builders export finite measured bounds',()=>{
 const {run}=make();
 for(const [builder,mode] of [['buildBin','bin'],['buildLid','bin'],['buildTray','tray'],['buildWipeBox','wipe'],['buildWipeLid','wipe']]){
  const result=inspectSTL(run(`toSTL(${builder}(DEFAULTS),'reference')`));
  assert.equal(result.nonfinite,0);assert.equal(result.degenerate,0);
  const nx=mode==='wipe'?2.5:2, ny=1;
  assert.ok(Math.abs(result.bounds.max[0]-result.bounds.min[0]-(42*nx-.5))<.001);
  assert.ok(Math.abs(result.bounds.max[1]-result.bounds.min[1]-(42*ny-.5))<.001);
  assert.equal(result.bounds.min[2],0);assert.ok(result.bounds.max[2]<65);
 }
});
test('radial clearance changes mating surfaces on both lids but preserves footprint and frame',()=>{
 const {run}=make();
 for(const builder of ['buildLid','buildWipeLid']) {
  const [a,b]=run(`[${builder}({...DEFAULTS,stackClear:0}),${builder}({...DEFAULTS,stackClear:.4})]`);
  assert.equal(a.tri.length,b.tri.length);
  let changed=0;
  a.tri.forEach((tri,i)=>tri.forEach((v,j)=>{
   const w=b.tri[i][j];assert.equal(v[2],w[2]);
   if(v[2]>=4.75)assert.deepEqual(v,w);
   if(v[0]!==w[0]||v[1]!==w[1])changed++;
  }));
  assert.ok(changed>100);
  const sa=inspectSTL(run(`toSTL(${builder}({...DEFAULTS,stackClear:0}),'a')`));
  const sb=inspectSTL(run(`toSTL(${builder}({...DEFAULTS,stackClear:.4}),'b')`));
  assert.deepEqual(sa.bounds,sb.bounds);assert.equal(sb.boundaryEdges,0);
 }
});
test('wipe fit and warnings share rotation policy for both pack orientations',()=>{
 const {run}=make();
 for(const [l,w] of [[100,38],[38,100]]){
  assert.equal(run(`wipePackFits({...DEFAULTS,packL:${l},packW:${w}},deriveWipe(DEFAULTS))`),true);
  assert.ok(!run(`warningsWipe({...DEFAULTS,packL:${l},packW:${w}})`).some(x=>x.includes('bigger than')));
 }
 assert.equal(run('wipePackFits({...DEFAULTS,packL:240,packW:240},deriveWipe(DEFAULTS))'),false);
});
function uiSetup(){
 const a=make();
 a.run(`var P={...DEFAULTS};var MODEL='bin';var handlers={};var nodes={};var $=id=>nodes[id]||(nodes[id]={value:'',min:'1',max:'60',addEventListener:(e,fn)=>handlers[id+':'+e]=fn});var document={};var queue=()=>{};var fmt=x=>String(x);var NUMS=['sheetN'];`);
 return a;
}
test('typed fractional sheet count commits one integer used by fitting',()=>{
 const {run,blocks}=uiSetup();
 run(slice(blocks[2],'NUMS.forEach(id=>{','TOGGLES.forEach(id=>{'));
 run(`$('sheetN_n').value='1.5';handlers['sheetN_n:input']()`);
 assert.equal(run('P.sheetN'),2);assert.equal(run("$('sheetN_n').value"),2);
 assert.equal(run('deriveWipe(P).stackNeed'),5.8);
 run('var show=()=>{};var toast=()=>{};');
 run(slice(blocks[2],'function fitPack(){',"$('fit').addEventListener"));
 run('fitPack()');assert.equal(run('P.whu'),3);assert.equal(run('wipePackFits(P,deriveWipe(P))'),true);
});
test('export handlers capture edited geometry and serialize both files before delayed download',()=>{
 const {run,blocks}=uiSetup();
 run(`var saved=[];var messages=[];var timers=[];var setTimeout=fn=>timers.push(fn);var toast=x=>messages.push(x);`);
 run(slice(blocks[2],'function exportRevision()',"$('dl_bin').addEventListener"));
 run(`save=file=>saved.push(file);`);
 run(slice(blocks[2],"$('dl_bin').addEventListener",'applyTheme(); syncAll();'));
 run(`P.nx=3;handlers['dl_both:click']();MODEL='wipe';P.wnx=6;timers.shift()();`);
 const files=run('saved');assert.equal(files.length,2);assert.equal(files[0].name,'bin_3x1x6U.stl');assert.equal(files[1].name,'lid_3x1x6U.stl');
 for(const f of files) assert.ok(Math.abs(inspectSTL(f.bytes).bounds.max[0]-62.75)<.001);
 assert.ok(run('messages').every(x=>!x.includes('Saved')));
 run(`saved=[];MODEL='tray';P.nx=2;P.trayText=false;handlers['dl_both:click']();`);assert.equal(run('saved[0].kind'),'tray');
 run(`saved=[];P.seg=0;handlers['dl_both:click']();`);assert.equal(run('saved.length'),0);assert.match(run('messages.at(-1)'),/Cannot export/);
 run(`P.seg=.7;toSTL=()=>{throw new Error('serializer failed')};handlers['dl_both:click']();`);assert.equal(run('saved.length'),0);assert.match(run('messages.at(-1)'),/serializer failed/);
});

test('every UI scoop mode builds and exports the requested scoop geometry',()=>{
 const {run}=make();
 const choices=[...html.matchAll(/data-sw="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(choices,['one','both','four']);
 const volumes=[];
 for(const choice of choices) {
   assert.equal(run(`validateParams({...DEFAULTS,scoopWalls:"${choice}"},"bin").length`),0);
   const stl=inspectSTL(run(`toSTL(buildBin({...DEFAULTS,scoopWalls:"${choice}"}),'scoop')`));
   assert.equal(stl.nonfinite,0);assert.equal(stl.degenerate,0);volumes.push(stl.signedVolumeMm3);
 }
 assert.equal(new Set(volumes).size,3);
});

test('mode switches restore complete edits and resetting current mode preserves others',()=>{
 const {run,blocks}=uiSetup();
 run(`var AVAIL=60;var VIEW='asm';var syncAll=()=>{};var toast=()=>{};document.querySelectorAll=()=>[];`);
 run(slice(blocks[2],'const MODE_DEFAULTS =','const $ ='));
 run(slice(blocks[2],'function switchModel(',"$('avail').addEventListener"));
 run(slice(blocks[2],"$('reset').addEventListener", "$('ref').addEventListener"));
 run(`P.nx=4;P.wall=1.8;P.floorT=2;P.lip=false;AVAIL=72;var original=JSON.stringify(P);switchModel('tray');P.hu=5;P.wall=2;P.lip=true;var tray=JSON.stringify(P);switchModel('wipe');P.wall=1;P.wnx=3.5;switchModel('bin');`);
 assert.equal(run('JSON.stringify(P)'),run('original'));assert.equal(run('AVAIL'),72);
 run(`switchModel('tray');`);assert.equal(run('JSON.stringify(P)'),run('tray'));
 run(`handlers['reset:click']();switchModel('bin');`);assert.equal(run('JSON.stringify(P)'),run('original'));
 run(`switchModel('wipe');`);assert.equal(run('P.wall'),1);assert.equal(run('P.wnx'),3.5);
});
test('missing CDN library and renderer failure show actionable fallback and disable exports',()=>{
 for(const error of ['missing','renderer']) {
  const {run,blocks}=make();
  run(`var nodes={};var document={getElementById:id=>nodes[id]||(nodes[id]={})};`);
  if(error==='renderer')run(`var THREE={WebGLRenderer:function(){throw new Error('no GPU')}};`);
  run(blocks[2]);
  assert.equal(run('nodes.startup_error.hidden'),false);
  assert.match(run('nodes.startup_error.textContent'),/reload/);
  for(const id of ['dl_bin','dl_lid','dl_both'])assert.equal(run(`nodes.${id}.disabled`),true);
 }
});
test('number and checkbox controls have static accessible names; focus and restrained live feedback exist',()=>{
 const fields=[...html.matchAll(/<input\b[^>]*type="(?:number|checkbox)"[^>]*>/g)].map(x=>x[0]);
 assert.equal(fields.length,13);
 for(const tag of fields)assert.match(tag,/aria-label="[^"\s][^"]+"/);
 assert.match(html,/button:focus-visible,input:focus-visible/);
 assert.match(html,/<div id="toast" role="status" aria-live="polite" aria-atomic="true">/);
 assert.match(html,/<div id="startup_error" role="alert" tabindex="0" hidden>/);
});
function luminance(hex) {
 const channels=hex.match(/[0-9a-f]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
 return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
}
test('exact light and dark secondary text token contrast meets 4.5',()=>{
 const light=html.match(/:root\{([\s\S]*?)\}/)[1];
 const dark=html.match(/:root\[data-theme="dark"\]\{([\s\S]*?)\}/)[1];
 for(const block of [light,dark]){
  const ink=block.match(/--ink-2:(#[0-9A-Fa-f]{6})/)[1],paper=block.match(/--paper:(#[0-9A-Fa-f]{6})/)[1];
  const ls=[luminance(ink),luminance(paper)].sort((a,b)=>a-b);assert.ok((ls[1]+.05)/(ls[0]+.05)>=4.5);
 }
});
test('invalid preview clears settled edges and pending edge update',()=>{
 const {run,blocks}=uiSetup();
 run(`P.seg=0;var binMesh={},lidMesh={},trayMesh={};var meshBin={visible:true},meshLid={visible:true};var edgeBin={visible:true},edgeLid={visible:true};var edgeTimer=7;var cleared=null;var clearTimeout=x=>cleared=x;var toast=()=>{};`);
 run(slice(blocks[2],'function rebuild(){','function rebuildTray(){'));
 run('rebuild()');
 assert.equal(run('cleared'),7);assert.equal(run('edgeBin.visible||edgeLid.visible||meshBin.visible||meshLid.visible'),false);
});
test('snap-disabled geometry presents no snap warnings and paint hides snap judgments',()=>{
 const {run,blocks}=make();
 for(const fn of ['warnings','warningsWipe'])assert.ok(!run(`${fn}({...DEFAULTS,snap:false,stackClear:.4})`).some(x=>x.includes('Snap deflection')));
 for(const fn of ['paint(d){','paintWipe(d){']){
  const code=slice(blocks[2],'function '+fn,fn==='paint(d){'?'function paintTray':'function queue');
  assert.match(code,/el.style.display = P.snap \? '' : 'none'/);
 }
});
