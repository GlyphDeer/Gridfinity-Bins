import earcut from './vendor/earcut.mjs';
import {circle,toSTL} from './optics-core.mjs';
export {toSTL};
export const PRESETS={'18650':{diameter:18.6,length:65.2},'21700':{diameter:21.7,length:70.2}};
export const DEFAULTS={type:'18650',count:5,columns:1,diameter:18.6,length:65.2,clearance:.4,lidClear:.3,lid:true,labels:true};
// CCW rounded rectangle, matching sample counts for all lofts.
export function ring(w,h,radii=4,x=0,y=0){const rr=Array.isArray(radii)?radii:[radii,radii,radii,radii],out=[];for(let q=0;q<4;q++){const r=rr[q],cx=x+(q===0||q===3?1:-1)*(w/2-r),cy=y+(q<2?1:-1)*(h/2-r);for(let j=0;j<=12;j++){const a=q*Math.PI/2+j*Math.PI/24;out.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}}return out;}
export function derive(p){
 if(!Object.hasOwn(PRESETS,p.type))throw Error('Choose 18650 or 21700.');
 for(const [key,lo,hi] of [['count',1,24],['columns',1,6],['diameter',16,24],['length',60,80],['clearance',.15,.8],['lidClear',.15,.5]])if(!Number.isFinite(p[key])||p[key]<lo||p[key]>hi)throw Error(`${key} must be between ${lo} and ${hi}.`);
 if(!Number.isInteger(p.count)||!Number.isInteger(p.columns))throw Error('Count and columns must be whole numbers.');
 if(typeof p.lid!=='boolean'||typeof p.labels!=='boolean')throw Error('Lid and label options must be true or false.');
 const cols=Math.min(p.count,p.columns),rows=Math.ceil(p.count/cols),cellUnits=Math.ceil((p.length+2*p.clearance+8)/42),pitchX=42*cellUnits,w=pitchX*cols-.5;
 const compartmentW=(w-6.4-1.2*(cols-1))/cols;
 // Rounded compartment ends must clear the entire horizontal cell envelope.
 const endGap=(compartmentW-p.length)/2,cornerGap=5-Math.sqrt(25-Math.max(0,5-endGap)**2);
 const minCompartmentH=p.diameter+2*Math.max(p.clearance,cornerGap+.1);
 const gridRows=Math.ceil((rows*minCompartmentH+1.2*(rows-1)+6.4)/42),h=42*gridRows-.5;
 const compartmentH=(h-6.4-1.2*(rows-1))/rows;
 const centers=Array.from({length:p.count},(_,i)=>({x:(compartmentW+1.2)*(i%cols-(cols-1)/2),y:(compartmentH+1.2)*(Math.floor(i/cols)-(rows-1)/2),index:i+1}));
 const floor=6.75,top=floor+p.diameter+1,shoulder=top-4,roof=5,cap=2.4;
 const outer=ring(w,h),neck=ring(w-4,h-4,[2,2,6,2]);
 const inner=ring(w-4+2*p.lidClear,h-4+2*p.lidClear,[2,2,6,2].map(r=>r+p.lidClear));
 return {cols,rows,gridRows,compartmentW,compartmentH,cellUnits,pitchX,w,h,centers,floor,top,shoulder,roof,cap,outer,neck,inner,totalHeight:shoulder+roof+cap,pocketR:p.diameter/2+p.clearance};
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
export function buildBox(p){const d=derive(p),m=builder(),feet=[];
 // Slightly narrower than nominal root to leave a continuous underside web.
 for(let row=0;row<d.gridRows;row++)for(let col=0;col<d.cols*d.cellUnits;col++){
 const x=42*(col-(d.cols*d.cellUnits-1)/2),y=42*(row-(d.gridRows-1)/2);
 const levels=[[0,2.95],[.8,2.15],[2.6,2.15],[4.75,.1]],rings=levels.map(([,inset])=>ring(41.5-2*inset,41.5-2*inset,4-inset,x,y));
 m.face([rings[0]],0,false);for(let i=1;i<levels.length;i++)m.loft(rings[i-1],levels[i-1][0],rings[i],levels[i][0]);feet.push(rings.at(-1));}
 m.face([d.outer,...feet],4.75,false);m.loft(d.outer,4.75,d.outer,d.shoulder);m.face([d.outer,d.neck],d.shoulder,true);m.loft(d.neck,d.shoulder,d.neck,d.top);
 const pockets=d.centers.map(c=>ring(d.compartmentW,d.compartmentH,5,c.x,c.y));m.face([d.neck,...pockets],d.top,true);
 for(const r of pockets){m.face([r],d.floor,true);m.loft(r,d.floor,r,d.top,true);}return {tri:m.tri,d};}
export function buildLid(p){const d=derive(p);if(!p.lid)return null;const m=builder(),top=d.roof+d.cap;
 m.face([d.outer,d.inner],0,false);m.loft(d.outer,0,d.outer,top);m.loft(d.inner,0,d.inner,d.roof,true);m.face([d.inner],d.roof,false);
 const pads=p.labels?d.centers.map(c=>ring(26,12,1,c.x,c.y)):[];
 m.face([d.outer,...pads],top,true);for(const r of pads){m.loft(r,top-.4,r,top,true);m.face([r],top-.4,true);}return {tri:m.tri,d};}
