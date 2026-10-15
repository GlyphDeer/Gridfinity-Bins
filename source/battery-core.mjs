import earcut from './vendor/earcut.mjs';
import {toSTL} from './optics-core.mjs';
import {DEFAULTS as BIN_DEFAULTS,buildLid as normalLid,derive as normalDerive,clean,tipLevels,rrSpec,rrPoints,runFn} from './bin-geometry.mjs';
export {toSTL};
export const PRESETS={'18650':{diameter:18.6,length:65.2},'21700':{diameter:21.7,length:70.2}};
export const DEFAULTS={type:'18650',count:5,columns:1,diameter:18.6,length:65.2,clearance:.4,lidClear:.3,lid:true,labels:true,fingerAccess:true,centerLabels:true};
// CCW rounded rectangle, matching sample counts for all lofts.
export function ring(w,h,radii=4,x=0,y=0){const rr=Array.isArray(radii)?radii:[radii,radii,radii,radii],out=[];for(let q=0;q<4;q++){const r=rr[q],cx=x+(q===0||q===3?1:-1)*(w/2-r),cy=y+(q<2?1:-1)*(h/2-r);for(let j=0;j<=12;j++){const a=q*Math.PI/2+j*Math.PI/24;out.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}}return out;}
export function derive(p){
 if(!Object.hasOwn(PRESETS,p.type))throw Error('Choose 18650 or 21700.');
 for(const [key,lo,hi] of [['count',1,24],['columns',1,3],['diameter',16,24],['length',60,80],['clearance',.15,.8],['lidClear',.15,.5]])if(!Number.isFinite(p[key])||p[key]<lo||p[key]>hi)throw Error(`${key} must be between ${lo} and ${hi}.`);
 if(!Number.isInteger(p.count)||!Number.isInteger(p.columns))throw Error('Count and columns must be whole numbers.');
 if(typeof p.lid!=='boolean'||typeof p.labels!=='boolean'||typeof p.fingerAccess!=='boolean'||typeof p.centerLabels!=='boolean')throw Error('Lid, label and finger access options must be true or false.');
 const cols=Math.min(p.count,p.columns),rows=Math.ceil(p.count/cols),cellUnits=Math.ceil((p.length+2*p.clearance+8)/42),pitchX=42*cellUnits,w=pitchX*cols-.5;
 const compartmentW=(w-6.4-1.2*(cols-1))/cols;
 // Rounded compartment ends must clear the entire horizontal cell envelope.
 const endGap=(compartmentW-p.length)/2,cornerGap=5-Math.sqrt(25-Math.max(0,5-endGap)**2);
 const minCompartmentH=p.diameter+2*Math.max(p.fingerAccess?4:p.clearance,p.clearance,cornerGap+.1);
 const gridRows=Math.ceil((rows*minCompartmentH+1.2*(rows-1)+6.4)/42),h=42*gridRows-.5;
 const compartmentH=(h-6.4-1.2*(rows-1))/rows;
 if(cols*cellUnits>6||gridRows>6)throw Error('Layout exceeds the normal 6 × 6 bin limit. Use more columns for a long tray, fewer columns for a wide tray, or fewer batteries.');
 const centers=Array.from({length:p.count},(_,i)=>({x:(compartmentW+1.2)*(i%cols-(cols-1)/2),y:(compartmentH+1.2)*(Math.floor(i/cols)-(rows-1)/2),index:i+1}));
 const floor=6.75,hu=Math.ceil((floor+p.diameter+1)/7),bodyH=hu*7,top=bodyH+4.4-.5*Math.SQRT2,dividerTop=bodyH-2.6;
 const normal={...BIN_DEFAULTS,nx:cols*cellUnits,ny:gridRows,hu,wall:1.5,floorT:2,scoop:0,labelMode:'off',window:false,stackClear:p.lidClear};
 const lidZ=bodyH-.35;
 const pads=centers.map(c=>({x:p.centerLabels?c.x:c.x-p.length/2+15,y:c.y}));
 const lidDeck=7,lidGuide=1.2,lidTop=lidDeck+lidGuide;
 const shellSpec=rrSpec(-w/2,w/2,-h/2,h/2,[4,4,4,4],normal.seg,normal.cornerSegs),outer=rrPoints(shellSpec,0,null);
 return {cols,rows,gridRows,compartmentW,compartmentH,cellUnits,pitchX,w,h,centers,floor,top,bodyH,dividerTop,hu,normal,lidZ,pads,outer,shellSpec,lidDeck,lidGuide,lidTop,totalHeight:lidZ+lidTop,pocketR:p.diameter/2+p.clearance};
}
function builder(){const tri=[];return {tri,
 face(rings,z,up){const v=rings.flat(),holes=[];let n=rings[0].length;for(const r of rings.slice(1)){holes.push(n);n+=r.length;}const ids=earcut(v.flat(),holes);for(let i=0;i<ids.length;i+=3){const t=ids.slice(i,i+3).map(j=>[...v[j],z]),[a,b,c]=t;if((((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))>0)!==up)t.reverse();
 // Earcut may bridge aligned rectangular holes with an edge that spans
 // intermediate boundary vertices. Split those edges to keep the STL welded.
 const boundary=[];for(let edge=0;edge<3;edge++){const a=t[edge],b=t[(edge+1)%3],dx=b[0]-a[0],dy=b[1]-a[1],len2=dx*dx+dy*dy;boundary.push(a);const cuts=[];for(const q of v){const u=((q[0]-a[0])*dx+(q[1]-a[1])*dy)/len2;if(u>1e-8&&u<1-1e-8&&Math.abs((q[0]-a[0])*dy-(q[1]-a[1])*dx)<1e-7)cuts.push({u,p:[...q,z]});}cuts.sort((a,b)=>a.u-b.u);for(const cut of cuts)if(Math.hypot(cut.p[0]-boundary.at(-1)[0],cut.p[1]-boundary.at(-1)[1])>1e-7)boundary.push(cut.p);}
 if(boundary.length===3)tri.push(t);else{const center=[(t[0][0]+t[1][0]+t[2][0])/3,(t[0][1]+t[1][1]+t[2][1])/3,z];for(let j=0;j<boundary.length;j++)tri.push([center,boundary[j],boundary[(j+1)%boundary.length]]);}
 }} ,
 loft(a,z0,b,z1,inward=false){if(a.length!==b.length)throw Error('Ring count mismatch');for(let i=0;i<a.length;i++){const j=(i+1)%a.length,v=[[...a[i],z0],[...a[j],z0],[...b[j],z1],[...b[i],z1]];for(const t of [[v[0],v[1],v[2]],[v[0],v[2],v[3]]])tri.push(inward?t.reverse():t);}}
 };}
function standardLip(d){const H=d.bodyH,nd=normalDerive(d.normal),g0=nd.grooveZ0,g1=nd.grooveZ1;
 const insetAt=z=>z<=H?2.6:z<=H+.7?2.6-(z-H):1.9;
 const levels=[{z:H,inset:0},...tipLevels(H+4.4,.5,9),{z:H+2.5,inset:1.9},{z:g1,inset:1.9},{z:g1,inset:1.9,off:.9},{z:g0,inset:insetAt(g0),off:.9},{z:g0,inset:insetAt(g0)},...(H+.7<g0?[{z:H+.7,inset:1.9}]:[]),{z:H,inset:2.6},{z:H-1.5,inset:2.6}];
 const run=runFn(nd.cx,nd.cy,d.normal.grooveLen,0);
 return levels.map(l=>({...l,r:rrPoints(d.shellSpec,l.inset,l.off?sp=>l.off*run(sp):null)}));}
// Triangulate the top as vertical strips so each scoop sample crosses the
// whole divider. Shared strip boundaries use the same vertices on both sides.
function scoopCap(rings,planes,z){
 const sorted=[...rings.flat().map(v=>v[0]),...planes].sort((a,b)=>a-b),xs=[];
 for(const x of sorted)if(!xs.length||x-xs.at(-1)>1e-8)xs.push(x);
 const edges=rings.flatMap(r=>r.map((a,i)=>[a,r[(i+1)%r.length]])),polys=[],ys=xs.map(()=>[]);
 const at=(edge,x)=>{const[a,b]=edge;if(Math.abs(x-a[0])<1e-8)return a[1];if(Math.abs(x-b[0])<1e-8)return b[1];return a[1]+(x-a[0])/(b[0]-a[0])*(b[1]-a[1]);};
 for(let i=0;i<xs.length-1;i++){const left=xs[i],right=xs[i+1],mid=(left+right)/2;
  const hits=edges.filter(([a,b])=>Math.min(a[0],b[0])<mid&&Math.max(a[0],b[0])>mid).sort((a,b)=>at(a,mid)-at(b,mid));
  for(let j=0;j<hits.length;j+=2){const lo=hits[j],hi=hits[j+1];if(!hi)throw Error('Unpaired compartment boundary');
   const poly=[[left,at(lo,left),z],[right,at(lo,right),z],[right,at(hi,right),z],[left,at(hi,left),z]];
   polys.push({i,poly});ys[i].push(poly[0][1],poly[3][1]);ys[i+1].push(poly[1][1],poly[2][1]);
  }
 }
 for(const v of rings.flat()){const i=xs.findIndex(x=>Math.abs(x-v[0])<1e-8);if(i>=0)ys[i].push(v[1]);}
 for(let i=0;i<ys.length;i++)ys[i]=[...new Set(ys[i])].sort((a,b)=>a-b);
 const tri=[];for(const {i,poly} of polys){const boundary=[];
  for(let j=0;j<4;j++){const a=poly[j],b=poly[(j+1)%4];if(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-8)continue;boundary.push(a);
   if(a[0]===b[0]){const values=ys[j===1?i+1:i].filter(y=>y>Math.min(a[1],b[1])+1e-8&&y<Math.max(a[1],b[1])-1e-8);if(b[1]<a[1])values.reverse();for(const y of values)boundary.push([a[0],y,z]);}
  }
  const center=[(poly[0][0]+poly[1][0])/2,poly.reduce((sum,v)=>sum+v[1],0)/4,z];
  for(let j=0;j<boundary.length;j++)tri.push([center,boundary[j],boundary[(j+1)%boundary.length]]);
 }return clean({tri}).tri;
}
function conformCapEdges(tri,cap,z){const points=[...new Map(cap.flat().map(v=>[v.map(n=>n.toFixed(8)).join(','),v])).values()];
 return tri.flatMap(t=>{const boundary=[];for(let i=0;i<3;i++){const a=t[i],b=t[(i+1)%3];boundary.push(a);
  if(Math.abs(a[2]-z)>1e-8||Math.abs(b[2]-z)>1e-8)continue;
  const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy,cuts=[];
  for(const v of points){const u=((v[0]-a[0])*dx+(v[1]-a[1])*dy)/len;if(u>1e-8&&u<1-1e-8&&Math.abs((v[0]-a[0])*dy-(v[1]-a[1])*dx)<1e-7)cuts.push({u,v});}
  cuts.sort((a,b)=>a.u-b.u);for(const c of cuts)if(Math.hypot(c.v[0]-boundary.at(-1)[0],c.v[1]-boundary.at(-1)[1])>1e-7)boundary.push(c.v);
 }if(boundary.length===3)return [t];const center=[0,1,2].map(i=>(t[0][i]+t[1][i]+t[2][i])/3);return boundary.map((v,i)=>[center,v,boundary[(i+1)%boundary.length]]);});
}
function splitPocketRing(r,points){const out=[];for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy,cuts=[];out.push(a);
 for(const v of points){const u=((v[0]-a[0])*dx+(v[1]-a[1])*dy)/len;if(u>1e-8&&u<1-1e-8&&Math.abs((v[0]-a[0])*dy-(v[1]-a[1])*dx)<1e-7)cuts.push({u,v:[v[0],v[1]]});}
 cuts.sort((a,b)=>a.u-b.u);for(const c of cuts)if(Math.hypot(c.v[0]-out.at(-1)[0],c.v[1]-out.at(-1)[1])>1e-7)out.push(c.v);
 }return out;}
function fingerNotches(mesh,d){
 const notches=d.centers.filter(c=>c.index+d.cols<=d.centers.length).map(c=>({x:c.x,y:c.y+(d.compartmentH+1.2)/2}));
 const depth=Math.min(10,d.dividerTop-d.floor-3);
 const move=v=>{if(v[2]<=d.floor||v[2]>d.dividerTop+1e-8)return v;
  const n=notches.find(n=>Math.abs(v[0]-n.x)<12&&Math.abs(v[1]-n.y)<.61);if(!n)return v;
  const u=(v[0]-n.x+12)/24*16,i=Math.min(15,Math.floor(u));
  const drop=depth*(Math.sin(Math.PI*i/16)+(Math.sin(Math.PI*(i+1)/16)-Math.sin(Math.PI*i/16))*(u-i));
  return [v[0],v[1],v[2]-drop*(v[2]-d.floor)/(d.dividerTop-d.floor)];
 };
 return {tri:mesh.tri.map(t=>t.map(move))};
}
function stockFootRing(x,y,p){const d=normalDerive(p),fh=20.75;return rrPoints(rrSpec(x-fh,x+fh,y-fh,y+fh,[4,4,4,4],d.footSeg,p.cornerSegs),0,null);}
export function buildBox(p){const d=derive(p),m=builder(),feet=[];
 // Slightly narrower than nominal root to leave a continuous underside web.
 for(let row=0;row<d.gridRows;row++)for(let col=0;col<d.cols*d.cellUnits;col++){
 const x=42*(col-(d.cols*d.cellUnits-1)/2),y=42*(row-(d.gridRows-1)/2);
 const levels=[[0,2.95],[.8,2.15],[2.6,2.15],[4.75,.1]],rings=levels.map(([,inset])=>ring(41.5-2*inset,41.5-2*inset,4-inset,x,y));
 m.face([rings[0]],0,false);for(let i=1;i<levels.length;i++)m.loft(rings[i-1],levels[i-1][0],rings[i],levels[i][0]);feet.push(rings.at(-1));}
 m.face([d.outer,...feet],4.75,false);m.loft(d.outer,4.75,d.outer,d.bodyH);
 // Standard 0.7 mm chamfer / 1.8 mm pocket band and rounded stacking lip.
 // Follow the normal-bin rounded-tip profile exactly using its exported sampler.
 const lips=standardLip(d);
 for(let i=1;i<lips.length;i++)m.loft(lips[i-1].r,lips[i-1].z,lips[i].r,lips[i].z);
 const innerTop=lips.at(-1),wallRing=rrPoints(d.shellSpec,1.5,null);
 const pockets=d.centers.map(c=>ring(d.compartmentW,d.compartmentH,5,c.x,c.y));
 m.loft(innerTop.r,innerTop.z,wallRing,d.dividerTop,false);
 const cap=builder();cap.face([wallRing,...pockets],d.dividerTop,true);
 const planes=[...new Set(d.centers.map(c=>c.x))].flatMap(x=>Array.from({length:17},(_,i)=>x-12+24*i/16));
 const capTri=p.fingerAccess?scoopCap([wallRing,...pockets],planes,d.dividerTop):cap.tri;
 const capPoints=[...new Map(capTri.flat().map(v=>[v.map(n=>n.toFixed(8)).join(','),v])).values()];
 for(const pocket of pockets){const r=p.fingerAccess?splitPocketRing(pocket,capPoints):pocket;const center=[r.reduce((sum,v)=>sum+v[0],0)/r.length,r.reduce((sum,v)=>sum+v[1],0)/r.length,d.floor];for(let i=0;i<r.length;i++)m.tri.push([center,[...r[i],d.floor],[...r[(i+1)%r.length],d.floor]]);m.loft(r,d.floor,r,d.dividerTop,true);}
 const combined={tri:[...(p.fingerAccess?conformCapEdges(m.tri,capTri,d.dividerTop):m.tri),...capTri]};
 return {tri:clean(p.fingerAccess?fingerNotches(clean(combined),d):combined).tri,d};}

export function buildLid(p){const d=derive(p);if(!p.lid)return null;const m=builder();
 // Reuse the exact normal mating feet and snap beads; replace their top caps
 // with one continuous deck and a low perimeter guide instead of grid ribs.
 const feet=normalLid(d.normal,{feetOnly:true});
 const sides=feet.tri.filter(t=>!t.every(v=>Math.abs(v[2]-4.75)<1e-8));
 const roots=[];for(let ix=0;ix<d.normal.nx;ix++)for(let iy=0;iy<d.normal.ny;iy++)roots.push(stockFootRing(42*(ix-(d.normal.nx-1)/2),42*(iy-(d.normal.ny-1)/2),d.normal));
 // A 0.2 mm overhang joins the foot shoulders with a continuous bottom web.
 const outer=ring(d.w+.4,d.h+.4,4.2),inside=ring(d.w-3.8,d.h-3.8,2.1);
 const pads=p.labels?d.pads.map(c=>ring(26,8,1,c.x,c.y)):[];
 m.face([outer,...roots],4.75,false);
 m.loft(outer,4.75,outer,d.lidTop);
 m.face([outer,inside],d.lidTop,true);
 m.loft(inside,d.lidDeck,inside,d.lidTop,true);
 m.face([inside,...pads],d.lidDeck,true);
 for(const r of pads){m.loft(r,d.lidDeck-.4,r,d.lidDeck,true);m.face([r],d.lidDeck-.4,true);}
 return {tri:clean({tri:[...sides,...m.tri]}).tri,d};}
