import earcut from './vendor/earcut.mjs';
import {toSTL} from './optics-core.mjs';
import {DEFAULTS as BIN_DEFAULTS,buildLid as normalLid,derive as normalDerive,clean,tipLevels,rrSpec,rrPoints,runFn} from './bin-geometry.mjs';
export {toSTL};
export const PRESETS={'18650':{diameter:18.6,length:65.2},'21700':{diameter:21.7,length:70.2}};
export const DEFAULTS={type:'18650',count:5,columns:1,diameter:18.6,length:65.2,clearance:.4,lidClear:.3,lid:true,labels:true};
// CCW rounded rectangle, matching sample counts for all lofts.
export function ring(w,h,radii=4,x=0,y=0){const rr=Array.isArray(radii)?radii:[radii,radii,radii,radii],out=[];for(let q=0;q<4;q++){const r=rr[q],cx=x+(q===0||q===3?1:-1)*(w/2-r),cy=y+(q<2?1:-1)*(h/2-r);for(let j=0;j<=12;j++){const a=q*Math.PI/2+j*Math.PI/24;out.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}}return out;}
export function derive(p){
 if(!Object.hasOwn(PRESETS,p.type))throw Error('Choose 18650 or 21700.');
 for(const [key,lo,hi] of [['count',1,24],['columns',1,3],['diameter',16,24],['length',60,80],['clearance',.15,.8],['lidClear',.15,.5]])if(!Number.isFinite(p[key])||p[key]<lo||p[key]>hi)throw Error(`${key} must be between ${lo} and ${hi}.`);
 if(!Number.isInteger(p.count)||!Number.isInteger(p.columns))throw Error('Count and columns must be whole numbers.');
 if(typeof p.lid!=='boolean'||typeof p.labels!=='boolean')throw Error('Lid and label options must be true or false.');
 const cols=Math.min(p.count,p.columns),rows=Math.ceil(p.count/cols),cellUnits=Math.ceil((p.length+2*p.clearance+8)/42),pitchX=42*cellUnits,w=pitchX*cols-.5;
 const compartmentW=(w-6.4-1.2*(cols-1))/cols;
 // Rounded compartment ends must clear the entire horizontal cell envelope.
 const endGap=(compartmentW-p.length)/2,cornerGap=5-Math.sqrt(25-Math.max(0,5-endGap)**2);
 const minCompartmentH=p.diameter+2*Math.max(p.clearance,cornerGap+.1);
 const gridRows=Math.ceil((rows*minCompartmentH+1.2*(rows-1)+6.4)/42),h=42*gridRows-.5;
 const compartmentH=(h-6.4-1.2*(rows-1))/rows;
 if(cols*cellUnits>6||gridRows>6)throw Error('Layout exceeds the normal 6 × 6 bin limit. Use more columns for a long tray, fewer columns for a wide tray, or fewer batteries.');
 const centers=Array.from({length:p.count},(_,i)=>({x:(compartmentW+1.2)*(i%cols-(cols-1)/2),y:(compartmentH+1.2)*(Math.floor(i/cols)-(rows-1)/2),index:i+1}));
 const floor=6.75,hu=Math.ceil((floor+p.diameter+1)/7),bodyH=hu*7,top=bodyH+4.4-.5*Math.SQRT2,dividerTop=bodyH-2.6;
 const normal={...BIN_DEFAULTS,nx:cols*cellUnits,ny:gridRows,hu,wall:1.5,floorT:2,scoop:0,labelMode:'off',window:false,stackClear:p.lidClear};
 const nd=normalDerive(normal),lidZ=bodyH-.35;
 const pads=centers.map(c=>{const col=Math.floor((c.index-1)%cols),x=42*(col*cellUnits-(cols*cellUnits-1)/2),iy=Math.max(0,Math.min(gridRows-1,Math.round(c.y/42+(gridRows-1)/2))),cy=42*(iy-(gridRows-1)/2);return {x,y:Math.max(cy-11,Math.min(cy+11,c.y)),cellX:x,cellY:cy};});
 const shellSpec=rrSpec(-w/2,w/2,-h/2,h/2,[4,4,4,4],normal.seg,normal.cornerSegs),outer=rrPoints(shellSpec,0,null);
 return {cols,rows,gridRows,compartmentW,compartmentH,cellUnits,pitchX,w,h,centers,floor,top,bodyH,dividerTop,hu,normal,lidZ,pads,outer,shellSpec,totalHeight:lidZ+nd.lidTop,pocketR:p.diameter/2+p.clearance};
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
 m.face([wallRing,...pockets],d.dividerTop,true);
 for(const r of pockets){m.face([r],d.floor,true);m.loft(r,d.floor,r,d.dividerTop,true);}return {tri:clean(m).tri,d};}
export function buildLid(p){const d=derive(p);if(!p.lid)return null;const raw=normalLid(d.normal),m=builder();
 // Replace only the top faces of the solid feet with recessed label areas.
 // Feet, frame and stacking ribs remain exactly those of the normal lid.
 if(!p.labels)return {tri:clean(raw).tri,d};
 const cut=raw.tri.filter(t=>!t.every(v=>Math.abs(v[2]-4.75)<1e-8));
 for(let ix=0;ix<d.normal.nx;ix++)for(let iy=0;iy<d.normal.ny;iy++){
 const x=42*(ix-(d.normal.nx-1)/2),y=42*(iy-(d.normal.ny-1)/2),pads=d.pads.filter(a=>a.cellX===x&&a.cellY===y).map(a=>ring(26,8,1,a.x,a.y));
 const edge=stockFootRing(x,y,d.normal);m.face([edge,...pads],4.75,true);
 for(const r of pads){m.loft(r,4.35,r,4.75,true);m.face([r],4.35,true);}}
 return {tri:clean({tri:[...cut,...m.tri]}).tri,d};}
