import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,PRESETS,CELL_ENVELOPE,derive,ring,buildBox,buildLid,toSTL} from '../source/battery-core.mjs';
import {buildLid as normalLid,clean,tipLevels} from '../source/bin-geometry.mjs';
import {inspectSTL} from './core.mjs';

function closed(mesh,context=''){
 const result=inspectSTL(toSTL(mesh));
 for(const key of ['boundaryEdges','nonmanifoldEdges','inconsistentEdges','degenerate','nonfinite'])assert.equal(result[key],0,`${context} ${key}`);
 assert.ok(result.signedVolumeMm3>0,`${context} has positive volume`);
 return result;
}
function contains(r,x,y){
 let inside=false;
 for(let i=0,j=r.length-1;i<r.length;j=i++){
  const a=r[i],b=r[j];
  if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside;
}
// Independent vertical ray intersections distinguish real cavities from caps
// or overlapping shells. Sample away from triangle and polygon boundaries.
function intersections(m,x,y){
 const zs=[];
 for(const [a,b,c] of m.tri){
  const det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
  if(Math.abs(det)<1e-10)continue;
  const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/det;
  const v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/det;
  if(u>0&&v>0&&u+v<1)zs.push(u*a[2]+v*b[2]+(1-u-v)*c[2]);
 }
 return zs;
}
function material(m,x,y,z){return intersections(m,x,y).filter(hit=>hit>z).length%2===1;}

test('universal defaults make a compact five-cell drawer with no size or lifting options',()=>{
 const d=derive(DEFAULTS);
 assert.deepEqual(CELL_ENVELOPE,{diameter:21.7,length:70.2});
 for(const key of ['type','diameter','length','rocker','fingerAccess'])assert.equal(Object.hasOwn(DEFAULTS,key),false,key);
 assert.equal(d.centers.length,5);
 assert.equal(d.cols,1);
 assert.equal(d.rows,5);
 assert.equal(d.normal.nx,2);
 assert.equal(d.normal.ny,3);
 assert.equal(d.w,83.5);
 assert.equal(d.h,125.5);
 assert.ok(Math.abs(d.compartmentW-77.1)<1e-8);
 assert.ok(Math.abs(d.compartmentH-22.86)<1e-8);
 assert.equal(d.floor,6.75);
 assert.equal(d.bodyH,35);
 assert.ok(d.dividerTop-d.floor<PRESETS['18650'].diameter,'both sizes extend above the straight dividers');
 assert.ok(d.lidZ-d.floor-CELL_ENVELOPE.diameter>=.5,'21700 cells clear the closed lid');
 assert.equal(buildLid({...DEFAULTS,lid:false}),null);
});

test('reference battery envelopes fit rounded compartments across all valid count and clearance layouts',()=>{
 for(let step=3;step<=16;step++)for(let count=1;count<=24;count++)for(let columns=1;columns<=3;columns++){
  const clearance=step/20;
  const p={...DEFAULTS,count,columns,clearance};
  let d;
  try{d=derive(p);}catch(error){assert.match(error.message,/6 × 6/);continue;}
  assert.equal(d.centers.length,count);
  assert.ok(d.normal.nx<=6&&d.normal.ny<=6);
  const pocket=ring(d.compartmentW,d.compartmentH,d.pocketRadius);
  for(const [type,cell] of Object.entries(PRESETS)){
   assert.ok(d.compartmentW-cell.length>=2*clearance-1e-8,`${type} end clearance`);
   assert.ok(d.compartmentH-cell.diameter>=2*clearance-1e-8,`${type} side clearance`);
   for(let j=0;j<=8;j++)for(let k=0;k<32;k++){
    const x=cell.length*(j/8-.5),y=cell.diameter/2*Math.sin(2*Math.PI*k/32);
    assert.ok(contains(pocket,x,y),`${type} envelope fits count=${count}, columns=${columns}, clearance=${clearance}`);
   }
  }
 }
});

test('single, default, partial-row and maximum drawers and both label choices produce closed STLs',()=>{
 const layouts=[{count:1,columns:1,clearance:.15},{count:5,columns:1},{count:5,columns:3,clearance:.15},{count:24,columns:3,clearance:.8}];
 for(const layout of layouts)for(const labels of [true,false]){
  const p={...DEFAULTS,...layout,labels},d=derive(p);
  assert.equal(d.centers.length,p.count);
  assert.equal(d.rows,Math.ceil(p.count/Math.min(p.count,p.columns)));
  closed(buildBox(p),`${p.count} cells, ${p.columns} columns`);
  closed(buildLid(p),`${p.count} cells, labels=${labels}`);
 }
 assert.throws(()=>derive({...DEFAULTS,count:24,columns:1}),/6 × 6/);
 assert.throws(()=>derive({...DEFAULTS,count:24,columns:2}),/6 × 6/);
});

test('unbounded, fractional, nonfinite and invalid option settings are rejected',()=>{
 for(const patch of [{count:0},{count:25},{count:1.5},{count:NaN},{columns:0},{columns:4},{columns:1.5},{columns:Infinity},{clearance:.1},{clearance:.9},{clearance:NaN},{lid:'yes'},{labels:'yes'},{lidClear:.6},{lidClear:Infinity},{centerLabels:'yes'}])assert.throws(()=>buildBox({...DEFAULTS,...patch}));
});

test('old battery-size and lifting fields cannot change the universal geometry',()=>{
 const universal=derive(DEFAULTS);
 for(const type of Object.keys(PRESETS))assert.deepEqual(derive({...DEFAULTS,...PRESETS[type],type,rocker:true,fingerAccess:true}),universal);
 assert.deepEqual(buildBox({...DEFAULTS,type:'18650',diameter:18.6,length:65.2,rocker:false,fingerAccess:false}).tri,buildBox(DEFAULTS).tri);
});

test('all compartments have flat solid floors and straight thin dividers',()=>{
 for(const columns of [1,3]){
  const box=buildBox({...DEFAULTS,count:5,columns}),d=box.d;
  for(const center of d.centers)for(const x of [-25.173,.173,25.173])for(const y of [-5.097,.097,5.097]){
   assert.equal(material(box,center.x+x,center.y+y,d.floor-.2),true,'floor is solid across the compartment');
   assert.equal(material(box,center.x+x,center.y+y,d.floor+.2),false,'floor is flat with no center support');
  }
  for(const center of d.centers){
   const nextRow=d.centers[center.index-1+d.cols];
   if(nextRow){
    const y=(center.y+nextRow.y)/2+.097;
    assert.ok(Math.abs(nextRow.y-center.y-d.compartmentH-1.2)<1e-8,'divider is 1.2 mm thick');
    for(const x of [-d.compartmentW/2+2.173,.173,d.compartmentW/2-2.173]){
     assert.equal(material(box,center.x+x,y,d.dividerTop-.2),true,'divider has an unbroken straight top');
     assert.equal(material(box,center.x+x,y,d.dividerTop+.2),false,'no raised shoulders');
    }
   }
   const nextColumn=d.centers[center.index];
   if(nextColumn&&nextColumn.y===center.y){
    const x=(center.x+nextColumn.x)/2+.173;
    assert.ok(Math.abs(nextColumn.x-center.x-d.compartmentW-1.2)<1e-8,'column divider is 1.2 mm thick');
    assert.equal(material(box,x,center.y+.097,d.dividerTop-.2),true,'column divider is solid');
    assert.equal(material(box,x,center.y+.097,d.dividerTop+.2),false,'column divider has no raised shoulder');
   }
  }
 }
});

test('both cells have an unobstructed vertical removal path through the actual drawer mesh',()=>{
 const box=buildBox(DEFAULTS),d=box.d;
 for(const [type,cell] of Object.entries(PRESETS))for(const center of d.centers){
  for(const axial of [-.5,-.23,.017,.29,.5])for(const lateral of [-.5,-.24,.019,.27,.5]){
   const x=center.x+cell.length*axial,y=center.y+cell.diameter*lateral;
   const zs=intersections(box,x,y);
   assert.ok(zs.some(z=>Math.abs(z-d.floor)<1e-7),`${type} rests over the floor`);
   assert.ok(zs.every(z=>z<=d.floor+1e-7),`${type} has no roof or overhang in its vertical lifting path`);
  }
 }
});

test('shallow lid preserves normal mating feet and centers real label recesses clear of the guide',()=>{
 const p={...DEFAULTS},d=derive(p),standard=clean(normalLid(d.normal,{feetOnly:true})).tri,lid=buildLid(p),blank=buildLid({...p,labels:false});
 const feet=tri=>tri.filter(t=>t.some(v=>v[2]<4.75-1e-8));
 assert.deepEqual(feet(lid.tri),feet(standard));
 assert.equal(d.lidGuide,1.2);
 assert.ok(d.lidTop<normalLid(d.normal).tri.flat().reduce((z,v)=>Math.max(z,v[2]),0));
 assert.deepEqual(d.pads,d.centers.map(c=>({x:c.x,y:c.y})));
 assert.ok(derive({...p,centerLabels:false}).pads.every((c,i)=>c.x<d.centers[i].x));
 for(const c of d.pads){
  assert.equal(material(lid,c.x+.173,c.y+.097,d.lidDeck-.2),false,'label is recessed');
  assert.equal(material(lid,c.x+.173,c.y+.097,d.lidDeck-.6),true,'label has a solid floor');
  assert.equal(material(blank,c.x+.173,c.y+.097,d.lidDeck-.2),true,'disabled labels leave a flat lid');
 }
 // At 1.2 mm engagement the upper bin's feet are inset 2.15 mm;
 // the shallow guide is inset only 1.9 mm, leaving 0.25 mm per side.
 assert.ok(2.15-1.9>=.24);
 assert.equal(material(lid,d.w/2-1,.137,d.lidDeck+.6),true);
 assert.equal(material(lid,d.w/2-2.15,.137,d.lidDeck+.6),false);
 const box=buildBox(p);
 for(const level of tipLevels(d.bodyH+4.4,.5,9))assert.ok(box.tri.some(t=>t.some(v=>Math.abs(v[2]-level.z)<1e-8)));
});
