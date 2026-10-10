import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {loadSource,inspectSTL} from './core.mjs';
const html=await readFile(new URL('../source/gridfinity_generator_4.html',import.meta.url),'utf8');
const baselineHtml=await readFile(new URL('../reviews/filament-baseline/generator.html',import.meta.url),'utf8');
const make=()=>loadSource(html);
const hash=b=>createHash('sha256').update(Buffer.from(b)).digest('hex');
const slice=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
function triangles(bytes){const b=Buffer.from(bytes),n=b.readUInt32LE(80);return Array.from({length:n},(_,i)=>Array.from({length:3},(_,j)=>Array.from({length:3},(_,k)=>b.readFloatLE(84+50*i+12+j*12+k*4))));}
// Independent vertical ray intersection against exported triangles. Sample
// points avoid vertices/edges; count only strictly interior intersections.
function materialAt(bytes,[x,y,z]) {
 let crossings=0;
 for(const [a,b,c] of (Array.isArray(bytes)?bytes:triangles(bytes))){
  const det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(det)<1e-9)continue;
  const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/det;
  const v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/det;
  const w=1-u-v;
  if(u>1e-7&&v>1e-7&&w>1e-7&&u*a[2]+v*b[2]+w*c[2]>z+1e-7)crossings++;
 }
 return crossings%2===1;
}
function setupUI(){const a=make();a.run(`var P={...DEFAULTS};var MODEL='bin';var AVAIL=60;var VIEW='asm';var nodes={},handlers={};var $=id=>nodes[id]||(nodes[id]={addEventListener:(e,f)=>handlers[id+':'+e]=f});var document={querySelectorAll:()=>[]};var syncAll=()=>{};var queue=()=>{};var toast=()=>{};`);return a;}
test('standard meshes remain byte-identical to archived pre-filament source',()=>{
 const a=make(),b=loadSource(baselineHtml);
 for(const builder of ['buildBin','buildLid','buildTray','buildWipeBox','buildWipeLid'])assert.equal(hash(a.run(`toSTL(${builder}(DEFAULTS),'baseline')`)),hash(b.run(`toSTL(${builder}(DEFAULTS),'baseline')`)),builder);
});
test('economy changes only current mode-relevant fields and leaves B choice alone',()=>{
 const {run,blocks}=setupUI();run(slice(blocks[2],'const MODE_DEFAULTS =','const $ ='));run(slice(blocks[2],'function switchModel(',"$('avail').addEventListener"));run(slice(blocks[2],'function economyCandidate()',"$('reset').addEventListener"));run(slice(blocks[2],"$('reset').addEventListener", "$('ref').addEventListener"));
 for(const model of ['bin','tray','wipe']){
  run(`switchModel('${model}');P.labelMode='off';P.lip=false;var before={...P};economyCandidate();`);
  const before=run('before'),after=run('P');
  for(const key of Object.keys(before))if(!['wall','floorT',model==='bin'?'scoop':model==='wipe'?'wFillet':''].includes(key))assert.equal(after[key],before[key],`${model}:${key}`);
  assert.equal(after.wall,1.2);assert.equal(after.floorT,1);assert.equal(after.hollowFeet,false);
 }
 run(`switchModel('bin');P.hollowFeet=true;economyCandidate();`);assert.equal(run('P.hollowFeet'),true);
 run(`switchModel('tray');switchModel('bin');`);assert.equal(run('P.hollowFeet'),true);
 run(`handlers['reset:click']();`);assert.equal(run('P.hollowFeet'),false);
});
test('experimental requests are boolean and rejected by unsupported body modes',()=>{
 const {run}=make();
 for(const mode of ['tray','wipe'])assert.throws(()=>run(`requireValid({...DEFAULTS,hollowFeet:true},'${mode}')`),/only for bin/);
 for(const value of ['NaN','1','"true"','null'])assert.throws(()=>run(`buildBin({...DEFAULTS,hollowFeet:${value}})`),/true or false/);
});
test('B preserves shell, lid and every original exterior foot triangle',()=>{
 const {run}=make();
 run(`var parts=[];var originalSolid=solid;solid=(dst,fn,tag)=>{var n=dst.tri.length;originalSolid(dst,fn,tag);parts.push({tag,tri:dst.tri.slice(n)});};`);
 run(`buildBin(DEFAULTS);var standard=parts;parts=[];buildBin({...DEFAULTS,hollowFeet:true});var hollow=parts;`);
 const standard=run('standard'),hollow=run('hollow');
 assert.deepEqual(standard.find(x=>x.tag==='bin-shell'),hollow.find(x=>x.tag==='bin-shell'));
 const sf=standard.filter(x=>x.tag==='bin-foot'),hf=hollow.filter(x=>x.tag==='bin-foot');
 for(let i=0;i<sf.length;i++){
  const n=run('rrSpec(-20.75,20.75,-20.75,20.75,[4,4,4,4],derive(DEFAULTS).footSeg,DEFAULTS.cornerSegs).specs.length')*2*4;
  assert.deepEqual(sf[i].tri.slice(0,n),hf[i].tri.slice(0,n));
  const diag=inspectSTL(run(`toSTL(hollow.filter(x=>x.tag==='bin-foot')[${i}],'foot')`));
  for(const key of ['boundaryEdges','nonmanifoldEdges','inconsistentEdges','nonfinite','degenerate','normalDisagreements'])assert.equal(diag[key],0,key);
 }
 assert.equal(hash(run(`toSTL(buildLid(DEFAULTS),'lid')`)),hash(run(`toSTL(buildLid({...DEFAULTS,hollowFeet:true}),'lid')`)));
});
test('exported cavity is empty below roof, roof/floor/wall material remains, and measured budgets hold',()=>{
 const {run}=make();
 const standard=run(`toSTL(buildBin(DEFAULTS),'bin')`),hollow=run(`toSTL(buildBin({...DEFAULTS,hollowFeet:true}),'bin')`);
 assert.equal(materialAt(standard,[-20.87,.21,1]),true);
 assert.equal(materialAt(hollow,[-20.87,.21,1]),false);
 assert.equal(materialAt(hollow,[-20.87,.21,4.42]),true);
 assert.equal(materialAt(hollow,[-20.87,.21,5.9]),true);
 assert.equal(materialAt(hollow,[-6.87,.21,1]),true);
 const a=inspectSTL(standard),b=inspectSTL(hollow);assert.deepEqual(a.bounds,b.bounds);assert.ok(b.signedVolumeMm3<a.signedVolumeMm3);
 const roofs=roofGroups(hollow);assert.equal(roofs.length,2);
 for(const group of roofs)assert.ok(diameter(group)<=10);
 assert.ok(Math.max(...roofs.flat().map(v=>v[2]))<4.45);
 assert.ok(run('derive({...DEFAULTS,floorT:.8}).floorTop')-Math.max(...roofs.flat().map(v=>v[2]))>=1);
 for(const key of ['boundaryEdges','nonmanifoldEdges','inconsistentEdges','nonfinite','degenerate','normalDisagreements'])assert.equal(b[key],0,key);
});

// Components of horizontal ceiling triangles from the serialized STL.
function roofGroups(bytes) {
 const ts=triangles(bytes).filter(t=>t.every(v=>v[2]>0&&v[2]<4.45-1e-4&&Math.abs(v[2]-t[0][2])<1e-5));
 const groups=[];
 for(const tri of ts){
  const keys=tri.map(v=>v.map(x=>x.toFixed(5)).join(','));
  const touching=groups.filter(g=>keys.some(k=>g.keys.has(k)));
  if(!touching.length){groups.push({keys:new Set(keys),points:[...tri]});continue;}
  const first=touching[0];keys.forEach(k=>first.keys.add(k));first.points.push(...tri);
  for(const other of touching.slice(1)){other.keys.forEach(k=>first.keys.add(k));first.points.push(...other.points);groups.splice(groups.indexOf(other),1);}
 }
 return groups.map(g=>g.points);
}
function diameter(points){let max=0;for(const a of points)for(const b of points)max=Math.max(max,Math.hypot(a[0]-b[0],a[1]-b[1]));return max;}
function pointSegmentDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
const matrix=[
 {name:'small-min-floor-coarse',patch:{nx:1,ny:1,hu:6,floorT:.8,seg:3,cornerSegs:3,labelMode:'off',lip:false}},
 {name:'small-fine',patch:{nx:1,ny:1,hu:6,seg:.2,cornerSegs:20,labelMode:'off'}},
 {name:'wide-max-floor',patch:{nx:2,ny:1,hu:8,floorT:6,lip:false}},
 {name:'large-coarse',patch:{nx:6,ny:6,hu:6,seg:3,cornerSegs:3,labelMode:'all'}},
 {name:'large-fine',patch:{nx:6,ny:6,hu:6,seg:.2,cornerSegs:20,labelMode:'off'}}
];
test('pairwise size/floor/segmentation extremes preserve every foot, real cavities and measured floor/wall budgets',()=>{
 for(const entry of matrix){
  const {run}=make();run(`var cfg={...DEFAULTS,...${JSON.stringify(entry.patch)}};var parts=[];var originalSolid=solid;solid=(dst,fn,tag)=>{var n=dst.tri.length;originalSolid(dst,fn,tag);parts.push({tag,tri:dst.tri.slice(n)});};buildBin(cfg);var standard=parts;parts=[];buildBin({...cfg,hollowFeet:true});var hollow=parts;`);
  const sf=run('standard.filter(x=>x.tag==="bin-foot")'),hf=run('hollow.filter(x=>x.tag==="bin-foot")');
  assert.equal(hf.length,entry.patch.nx*entry.patch.ny);
  const shellBytes=run(`toSTL(hollow.find(x=>x.tag==='bin-shell'),'shell')`);
  const shellTriangles=triangles(shellBytes);
  const upwardHorizontal=shellTriangles.filter(t=>t.every(v=>Math.abs(v[2]-t[0][2])<1e-5)&&
      (t[1][0]-t[0][0])*(t[2][1]-t[0][1])-(t[1][1]-t[0][1])*(t[2][0]-t[0][0])>1e-7);
  const floorZ=Math.min(...upwardHorizontal.map(t=>t[0][2]));
  for(let i=0;i<hf.length;i++){
   const standardBytes=run(`toSTL(standard.filter(x=>x.tag==='bin-foot')[${i}],'foot')`), hollowBytes=run(`toSTL(hollow.filter(x=>x.tag==='bin-foot')[${i}],'foot')`);
   const standardTriangles=triangles(standardBytes),ts=triangles(hollowBytes),roof=roofGroups(hollowBytes);assert.equal(roof.length,1,entry.name);
   // The unchanged side strip precedes bottom/shoulder caps. Count by
   // side faces carrying vertices at more than one height, not constants.
   const sides=standardTriangles.filter(t=>new Set(t.map(v=>v[2])).size>1);
   assert.deepEqual(ts.slice(0,sides.length),sides);
   const exteriorBottom=sides.flatMap(t=>{const v=t.filter(v=>Math.abs(v[2])<1e-6);return v.length===2?[v]:[];});
   const mouths=[];
   for(const group of roof){
    assert.ok(diameter(group)<=10+1e-5);const z=group[0][2];assert.ok(z<4.45);
    const center=[group.reduce((s,v)=>s+v[0],0)/group.length,group.reduce((s,v)=>s+v[1],0)/group.length];
    assert.equal(materialAt(hollowBytes,[center[0]+.13,center[1]+.21,1]),false);
    assert.equal(materialAt(hollowBytes,[center[0]+.13,center[1]+.21,z+.1]),true);
    const groupKeys=new Set(group.map(v=>v.map(x=>x.toFixed(5)).join(',')));
    const mouth=ts.filter(t=>t.some(v=>groupKeys.has(v.map(x=>x.toFixed(5)).join(',')))&&t.some(v=>Math.abs(v[2])<1e-6)).flat().filter(v=>Math.abs(v[2])<1e-6);
    assert.ok(mouth.length>0);mouths.push(mouth);
    for(const v of mouth)assert.ok(Math.min(...exteriorBottom.map(([a,b])=>pointSegmentDistance(v,a,b)))>=1.2-1e-5);
    // Material above the roof is verified in isolated foot component,
    // avoiding aggregate parity ambiguity in overlapping Z ranges.
    assert.ok(floorZ-z>=1-1e-5);
    // Classify component union rather than canceling coincident material
    // via aggregate odd/even parity in the shell/foot overlap band.
    const unionAt=point=>materialAt(hollowBytes,point)||materialAt(shellTriangles,point);
    assert.equal(unionAt([center[0]+.13,center[1]+.21,floorZ-.1]),true);
    assert.equal(unionAt([center[0]+.13,center[1]+.21,floorZ+.1]),false);
   }
   for(let j=0;j<mouths.length;j++)for(let k=j+1;k<mouths.length;k++){
    const jxs=mouths[j].map(v=>v[0]),jys=mouths[j].map(v=>v[1]),kxs=mouths[k].map(v=>v[0]),kys=mouths[k].map(v=>v[1]);
    const dx=Math.max(0,Math.min(...jxs)-Math.max(...kxs),Math.min(...kxs)-Math.max(...jxs));
    const dy=Math.max(0,Math.min(...jys)-Math.max(...kys),Math.min(...kys)-Math.max(...jys));assert.ok(Math.hypot(dx,dy)>=1.2-1e-5);
   }
   const cx=roof.flat().reduce((s,v)=>s+v[0],0)/roof.flat().length,cy=roof.flat().reduce((s,v)=>s+v[1],0)/roof.flat().length;
   assert.equal(materialAt(hollowBytes,[cx+14,cy+.21,.1]),true);
   const diag=inspectSTL(hollowBytes);for(const key of ['boundaryEdges','nonmanifoldEdges','inconsistentEdges','nonfinite','degenerate','normalDisagreements'])assert.equal(diag[key],0,entry.name+':'+key);
  }
  // Representative lid bytes are covered above; avoid redundant large
  // fine lid builds while checking every modified body foot here.
  if(entry.patch.nx<6)assert.equal(hash(run(`toSTL(buildLid(cfg),'lid')`)),hash(run(`toSTL(buildLid({...cfg,hollowFeet:true}),'lid')`)));
  const body=inspectSTL(run(`toSTL(buildBin({...cfg,hollowFeet:true}),'body')`));
  const originalBody=inspectSTL(run(`toSTL(buildBin(cfg),'original-body')`));
  for(const key of ['boundaryEdges','nonmanifoldEdges','inconsistentEdges','nonfinite','degenerate','normalDisagreements'])assert.equal(body[key],originalBody[key],entry.name+':body:'+key);
 }
});

test('economy preserves already-thin walls/floors and disabled scoops in every mode',()=>{
 const {run,blocks}=setupUI();run(`var messages=[];toast=x=>messages.push(x);`);
 run(slice(blocks[2],'function economyCandidate()',"$('reset').addEventListener"));
 for(const model of ['bin','tray','wipe']){
  run(`MODEL='${model}';P.wall=.8;P.floorT=.8;P.scoop=0;P.wFillet=0;var before={...P};handlers['economy:click']();`);
  assert.deepEqual(run('P'),run('before'));assert.match(run('messages.at(-1)'),/no changes/);
 }
 run(`P.wall=1.5;P.floorT=1.5;MODEL='bin';P.scoop=10;handlers['economy:click']();`);
 assert.equal(run('P.wall'),1.2);assert.equal(run('P.floorT'),1);assert.equal(run('P.scoop'),3);assert.match(run('messages.at(-1)'),/reduced wall, floorT, scoop/);
});
test('withheld control stays disabled through modes and refuses programmatic toggle activation',()=>{
 const {run,blocks}=setupUI();run(blocks[2].match(/const HOLLOW_SAVINGS_VALIDATED = [^\n]+/)[0]);
 assert.match(html,/<input[^>]*id="hollowFeet"[^>]*disabled/);
 run(`var show=()=>{};var TOGGLES=['hollowFeet'];var messages=[];toast=x=>messages.push(x);$=id=>nodes[id]||(nodes[id]={style:{},classList:{toggle:()=>{}},parentElement:{classList:{toggle:()=>{}}},addEventListener:(e,f)=>handlers[id+':'+e]=f});`);
 run(slice(blocks[2],'function visibility(){','// ---------------- controls'));
 run(slice(blocks[2],'TOGGLES.forEach(id=>{\n  const el',"$('lip2').addEventListener"));
 for(const model of ['bin','tray','wipe','bin']){
  run(`MODEL='${model}';$('hollowFeet').disabled=false;visibility();`);
  assert.equal(run("$('hollowFeet').disabled"),true);assert.match(run("$('hollownote').textContent"),/No filament benefit was established/);
  run(`handlers['hollowFeet:change']({target:$('hollowFeet')});`);assert.equal(run('P.hollowFeet'),false);
 }
 run(`$('hollowFeet').checked=true;handlers['hollowFeet:change']({target:$('hollowFeet')});`);
 assert.equal(run('P.hollowFeet'),false);assert.equal(run("$('hollowFeet').checked"),false);assert.match(run('messages.at(-1)'),/research only/);
});
test('consumer export rejects injected hollow state while explicit research builders remain usable',()=>{
 const {run,blocks}=setupUI();run(blocks[2].match(/const HOLLOW_SAVINGS_VALIDATED = [^\n]+/)[0]);
 run(`var fmt=String;var messages=[];toast=x=>messages.push(x);var saved=[];var setTimeout=()=>{};`);
 run(slice(blocks[2],'function exportRevision()',"$('dl_bin').addEventListener"));
 run(`save=file=>saved.push(file);`);run(slice(blocks[2],"$('dl_bin').addEventListener",'applyTheme(); syncAll();'));
 for(const which of ['bin','lid','both']){
  run(`P.hollowFeet=true;MODEL='bin';handlers['dl_${which}:click']();`);
  assert.equal(run('saved.length'),0);assert.match(run('messages.at(-1)'),/Cannot export: Hollow feet are research only/);
 }
 assert.ok(inspectSTL(run(`toSTL(buildBin({...DEFAULTS,hollowFeet:true}),'research')`)).triangles>0);
 run(`P.hollowFeet=false;handlers['dl_bin:click']();`);assert.equal(run('saved.length'),1);
});
test('model defaults, reset and reference never activate a withheld prototype',()=>{
 const {run,blocks}=setupUI();
 run(slice(blocks[2],'const PRESETS =','const $ ='));
 run(slice(blocks[2],'function switchModel(',"$('avail').addEventListener"));
 run(slice(blocks[2],"$('reset').addEventListener","document.querySelectorAll('#views button').forEach(b=>"));
 for(const model of ['bin','tray','wipe','bin']){
  run(`switchModel('${model}');`);assert.equal(run('P.hollowFeet'),false);
  run(`P.hollowFeet=true;handlers['reset:click']();`);assert.equal(run('P.hollowFeet'),false);
  run(`P.hollowFeet=true;handlers['ref:click']();`);assert.equal(run('P.hollowFeet'),false);
 }
});
