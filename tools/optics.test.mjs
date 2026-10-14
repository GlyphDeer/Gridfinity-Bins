import test from 'node:test';
import assert from 'node:assert/strict';
import {PRESETS,DEFAULTS,build,toSTL,derive} from '../source/optics-core.mjs';
import {inspectSTL} from './core.mjs';
function materialAt(mesh,x,y,z){let n=0;for(const t of mesh.tri){const [a,b,c]=t,det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(det)<1e-9)continue;const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/det,v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/det;if(u>0&&v>0&&u+v<1&&u*a[2]+v*b[2]+(1-u-v)*c[2]>z)n++;}return n%2===1;}
test('every sourced preset produces a closed outward STL and passes through the 36.3 mm lip',()=>{for(const preset of PRESETS){const p={...DEFAULTS,...Object.fromEntries(['diameter','height','glassD','glassT'].map(k=>[k,preset[k]]))},m=build(p),s=inspectSTL(toSTL(m));for(const k of ['nonfinite','degenerate','normalDisagreements','boundaryEdges','nonmanifoldEdges','inconsistentEdges'])assert.equal(s[k],0,`${preset.id} ${k}`);assert.ok(s.signedVolumeMm3>0);assert.ok(s.bounds.max[0]-s.bounds.min[0]<36.3);assert.equal(s.bounds.min[2],0);assert.ok(m.d.loaded<=m.d.available);}});
test('three actual separated recesses have material floors and air above',()=>{const m=build(DEFAULTS),d=m.d;for(const [x,y,z] of [[d.ox+.117,d.oy+.073,DEFAULTS.base],[.117,d.ly+.073,DEFAULTS.base],[d.gx+.117,d.gy+.073,d.holes[2].floor]]){assert.equal(materialAt(m,x,y,z-.2),true);assert.equal(materialAt(m,x,y,z+.2),false);}assert.equal(materialAt(m,-17.1,.137,d.top/2),true);});
test('oversized parts, colliding pockets, low bins and invalid values cannot export',()=>{for(const patch of [{diameter:32},{gasketD:16},{binU:2},{glassD:32},{clearance:NaN},{glassT:0},{height:Infinity},{binU:5.5},{diameter:undefined}])assert.throws(()=>build({...DEFAULTS,...patch}),JSON.stringify(patch));});
test('height accounts for upright glass, exposed optic and a closed lid',()=>{const p={...DEFAULTS,binU:5},d=derive(p);assert.equal(d.loaded,24.6);assert.equal(d.minU,5);assert.ok(d.available>d.loaded);assert.throws(()=>derive({...p,binU:4}),/at least 5U/);assert.equal(derive({...p,binFloor:3,binU:6}).minU,5);});
test('fit adjustments preserve walls and change physical pocket sizes',()=>{const a=build(DEFAULTS),b=build({...DEFAULTS,clearance:.5,binClear:.5});assert.ok(b.d.r>a.d.r);assert.ok(b.d.width<a.d.width);assert.ok(b.d.holes[1].ring[1][0]>a.d.holes[1].ring[1][0]);const s=inspectSTL(toSTL(b));assert.equal(s.nonmanifoldEdges,0);assert.equal(s.boundaryEdges,0);});

test('small glass remains graspable and a tall gasket cannot consume the floor',()=>{const p={...DEFAULTS,glassD:8},d=derive(p);assert.ok(d.holes[1].floor+p.glassD>=d.top+3);assert.throws(()=>derive({...DEFAULTS,height:5,expose:3,gasketH:3}),/Gasket/);});

test('all four pocket combinations export watertight geometry with disabled recesses filled',()=>{
 const original=derive(DEFAULTS);
 for(const includeGlass of [true,false])for(const includeGasket of [true,false]){
  const m=build({...DEFAULTS,includeGlass,includeGasket}),s=inspectSTL(toSTL(m));
  assert.equal(m.d.holes.length,1+Number(includeGlass)+Number(includeGasket));
  for(const k of ['nonfinite','degenerate','boundaryEdges','nonmanifoldEdges','inconsistentEdges'])assert.equal(s[k],0);
  assert.equal(materialAt(m,.117,original.ly+.073,m.d.top-.1),!includeGlass);
  assert.equal(materialAt(m,original.gx+.117,original.gy+.073,m.d.top-.1),!includeGasket);
 }
});
test('omitted pockets ignore invalid saved dimensions and no longer require their height',()=>{
 const d=derive({...DEFAULTS,includeGlass:false,includeGasket:false,glassD:NaN,glassT:0,gasketD:Infinity,gasketH:99,binU:4});
 assert.equal(d.loaded,15.1);assert.equal(d.minU,4);
 assert.throws(()=>derive({...DEFAULTS,includeGlass:'false'}),/true or false/);
});
