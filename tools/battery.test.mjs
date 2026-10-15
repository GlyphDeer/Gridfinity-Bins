import test from 'node:test';import assert from 'node:assert/strict';
import {DEFAULTS,PRESETS,derive,buildBox,buildLid,toSTL} from '../source/battery-core.mjs';import {inspectSTL} from './core.mjs';
test('battery counts, presets, partial rows and label choices create closed STLs',()=>{for(const type of Object.keys(PRESETS))for(const count of [1,5,24])for(const labels of [true,false]){const p={...DEFAULTS,...PRESETS[type],type,count,columns:count===24?3:2,labels,fingerAccess:count!==24};for(const m of [buildBox(p),buildLid(p)]){const s=inspectSTL(toSTL(m));for(const k of ['boundaryEdges','nonmanifoldEdges','inconsistentEdges','degenerate','nonfinite'])assert.equal(s[k],0,`${type} ${count} ${labels} ${k}`);assert.ok(s.signedVolumeMm3>0);}}});
test('exact battery count and clearance beneath the standard lid are preserved',()=>{const d=derive({...DEFAULTS,count:5,columns:3});assert.equal(d.centers.length,5);assert.equal(d.rows,2);assert.equal(d.w,251.5);assert.ok(d.lidZ-(d.floor+DEFAULTS.diameter)>=.5);assert.equal(d.bodyH%7,0);assert.equal(buildLid({...DEFAULTS,lid:false}),null);});
test('unbounded, fractional and nonfinite settings are rejected',()=>{for(const patch of [{count:0},{count:25},{count:1.5},{columns:0},{columns:Infinity},{diameter:NaN},{length:100},{lid:'yes'},{lidClear:.6},{fingerAccess:'yes'},{centerLabels:'yes'}])assert.throws(()=>buildBox({...DEFAULTS,...patch}));});
function contains(r,x,y){let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function material(m,x,y,z){let n=0;for(const [a,b,c] of m.tri){const det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(det)<1e-10)continue;const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/det,v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/det;if(u>0&&v>0&&u+v<1&&u*a[2]+v*b[2]+(1-u-v)*c[2]>z)n++;}return n%2===1;}
test('compartments and lid label pads are real recesses with solid floors',()=>{const p={...DEFAULTS,count:5,columns:3},b=buildBox(p),l=buildLid(p);for(const c of b.d.centers){assert.equal(material(b,c.x+.173,c.y+.097,b.d.floor-.2),true);assert.equal(material(b,c.x+.173,c.y+.097,b.d.floor+1),false);}for(const c of l.d.pads){assert.equal(material(l,c.x+.173,c.y+.097,l.d.lidDeck-.2),false);assert.equal(material(l,c.x+.173,c.y+.097,l.d.lidDeck-.6),true);}});
import{buildLid as normalLid,clean,tipLevels}from '../source/bin-geometry.mjs';
test('shallow lid preserves normal mating feet and centers labels clear of the guide',()=>{
 const p={...DEFAULTS},d=derive(p),standard=clean(normalLid(d.normal,{feetOnly:true})).tri,actual=buildLid(p).tri;
 const feet=tri=>tri.filter(t=>t.some(v=>v[2]<4.75-1e-8));assert.deepEqual(feet(actual),feet(standard));
 assert.equal(d.lidGuide,1.2);assert.ok(d.lidTop<normalLid(d.normal).tri.flat().reduce((z,v)=>Math.max(z,v[2]),0));
 assert.deepEqual(d.pads,d.centers.map(c=>({x:c.x,y:c.y})));
 assert.ok(derive({...p,centerLabels:false}).pads.every((c,i)=>c.x<d.centers[i].x));
 const lid=buildLid(p),blank=buildLid({...p,labels:false});
 for(const c of d.pads){assert.equal(material(lid,c.x+.173,c.y+.097,d.lidDeck-.2),false);assert.equal(material(blank,c.x+.173,c.y+.097,d.lidDeck-.2),true);}
 // At 1.2 mm engagement the upper bin's feet are inset 2.15 mm;
 // the shallow guide is inset only 1.9 mm, leaving 0.25 mm per side.
 assert.ok(2.15-1.9>=.24);
 assert.equal(material(lid,d.w/2-1,.137,d.lidDeck+.6),true);
 assert.equal(material(lid,d.w/2-2.15,.137,d.lidDeck+.6),false);
 const box=buildBox(p);for(const level of tipLevels(d.bodyH+4.4,.5,9))assert.ok(box.tri.some(t=>t.some(v=>Math.abs(v[2]-level.z)<1e-8)));
});
test('finger access opens shared dividers while keeping floors and the outer rim solid',()=>{
 for(const type of Object.keys(PRESETS)){
  const p={...DEFAULTS,...PRESETS[type],type},m=buildBox(p),d=m.d;
  assert.ok(d.compartmentH>=p.diameter+8);
  for(let i=0;i<d.centers.length-1;i++){
   const x=d.centers[i].x+.173,y=(d.centers[i].y+d.centers[i+1].y)/2+.097;
   assert.equal(material(m,x,y,d.dividerTop-2),false,'scoop is open');
   assert.equal(material(m,x,y,d.dividerTop-11),true,'divider remains below scoop');
   assert.equal(material(m,x+15,y,d.dividerTop-2),true,'divider shoulders remain');
  }
  const s=inspectSTL(toSTL(m));for(const k of ['boundaryEdges','nonmanifoldEdges','inconsistentEdges','degenerate','nonfinite'])assert.equal(s[k],0,`${type} scoop ${k}`);
  const compact=buildBox({...p,fingerAccess:false});assert.ok(d.h>=compact.d.h);
  const y=(compact.d.centers[0].y+compact.d.centers[1].y)/2+.097;
  assert.equal(material(compact,.173,y,compact.d.dividerTop-2),true,'toggle restores straight divider');
  const max=inspectSTL(toSTL(buildBox({...p,count:18,columns:3})));
  for(const k of ['boundaryEdges','nonmanifoldEdges','inconsistentEdges','degenerate','nonfinite'])assert.equal(max[k],0,`${type} 18 cells ${k}`);
 }
});
