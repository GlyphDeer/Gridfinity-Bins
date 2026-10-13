import earcut from './vendor/earcut.mjs';
const url = slug => `https://convoylight.com/products/${slug}`;
export const PRESETS = [
 {id:'tir233',name:'23.3 mm TIR · 60° bead / 10 × 65° stripe',diameter:23.3,height:13.5,glassD:23,glassT:1.6,glassVerified:false,source:url('23-3mm-tir-lens'),note:'Both ordered variants. Include the white holder when measuring. Glass dimensions are placeholders; measure yours.'},
 {id:'s2',name:'S2+ / S3 · smooth or orange peel',diameter:20,height:12,glassD:20,glassT:1.6,glassVerified:true,source:url('reflector-for-s2-s3-t4'),glassSource:url('20-1-6mm-ar-coaed-glass-lens-for-s2-s2-s3-s6-s8'),note:'Published replacement-part envelope. Confirm the actual reflector, including its rim.'},
 {id:'s8',name:'S8 / S6 / S2 · smooth or orange peel',diameter:21,height:20,glassD:20,glassT:1.6,glassVerified:true,source:url('reflector-for-s2-s6-s8-t6'),glassSource:url('20-1-6mm-ar-coaed-glass-lens-for-s2-s2-s3-s6-s8'),note:'Convoy lists 21 × 20 mm; a customer reports different dimensions. Measure your part before printing.'},
 {id:'s21',name:'S21E / S21A / S21B · smooth or orange peel',diameter:23.1,height:11.6,glassD:23,glassT:1.6,glassVerified:false,source:url('reflector-for-s21a-s21b-s21e'),note:'Standard replacement reflector only; UV versions are not verified. Measure the glass.'},
 {id:'custom',name:'Custom · T8, H4, T5, S12 or another optic',diameter:20,height:12,glassD:20,glassT:1.6,glassVerified:false,source:null,note:'No verified preset for these ordered flashlight variants. Enter measured dimensions.'}
];
export const DEFAULTS={includeGlass:true,includeGasket:true,diameter:23.3,height:13.5,glassD:23,glassT:1.6,gasketD:8,gasketH:2,clearance:0.3,binClear:0.3,binWall:1.5,binFloor:1.5,binU:6,base:1.6,web:1.2,expose:3};
const ranges={diameter:[8,32],height:[5,35],glassD:[8,32],glassT:[0.5,4],gasketD:[3,16],gasketH:[0.5,5],clearance:[0.1,0.8],binClear:[0.1,0.8],binWall:[0.6,2.2],binFloor:[0.6,6],binU:[2,12],base:[1.2,3],web:[1,3],expose:[2,5]};
export function circle(x,y,r,n=96){return Array.from({length:n},(_,i)=>[x+r*Math.cos(i*2*Math.PI/n),y+r*Math.sin(i*2*Math.PI/n)]);}
function rect(x,y,w,h){return [[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y+h/2],[x-w/2,y+h/2]];}
function rounded(w,r){const out=[];for(let q=0;q<4;q++){const a=q*Math.PI/2,cx=(q===0||q===3?1:-1)*(w/2-r),cy=(q<2?1:-1)*(w/2-r);for(let j=0;j<=12;j++){const t=a+j*Math.PI/24;out.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]);}}return out;}
export function derive(p){
 for(const k of ['includeGlass','includeGasket'])if(typeof p[k]!=='boolean')throw Error(`${k} must be true or false.`);
 // Disabled pockets do not validate or influence the layout through stale edits.
 p={...p,...(!p.includeGlass?{glassD:DEFAULTS.glassD,glassT:DEFAULTS.glassT}:{}),...(!p.includeGasket?{gasketD:DEFAULTS.gasketD,gasketH:DEFAULTS.gasketH}:{})};
 for(const [k,[lo,hi]] of Object.entries(ranges))if(!Number.isFinite(p[k])||p[k]<lo||p[k]>hi)throw Error(`${k} must be ${lo}–${hi} mm${k==='binU'?' (height units)':''}.`);
 if(!Number.isInteger(p.binU))throw Error('Bin height must be whole U.');
 if(p.expose>=p.height-1)throw Error('Leave at least 1 mm of optic inside its pocket.');
 const width=Math.min(41.5-2*p.binWall,36.3)-2*p.binClear,half=width/2;
 const r=p.diameter/2+p.clearance,rg=p.gasketD/2+p.clearance;
 const slotW=p.glassD+2*p.clearance,slotT=p.glassT+2*p.clearance;
 const oy=-half+p.web+r,ox=-half+p.web+r;
 const ly=half-p.web-slotT/2,gx=half-p.web-rg,gy=ly-slotT/2-p.web-rg;
 const top=p.base+p.height-p.expose;
 if(p.includeGasket&&top-p.base<p.gasketH+0.3)throw Error('Gasket is too tall for this insert. Reduce exposed optic height or use a taller optic.');
 const floorGlass=Math.max(p.base,top+3-p.glassD);
 const floorG=top-p.gasketH-0.3;
 const holes=[{name:'Optic',ring:circle(ox,oy,r),floor:p.base}];
 if(p.includeGlass)holes.push({name:'Glass',ring:rect(0,ly,slotW,slotT),floor:floorGlass});
 if(p.includeGasket)holes.push({name:'Gasket',ring:circle(gx,gy,rg,64),floor:floorG});
 const outer=rounded(width,3);
 // Keep every pocket inside a conservatively inset rounded perimeter.
 const innerHalf=half-p.web,cr=Math.max(0,3-p.web);
 for(const hole of holes)for(const [x,y] of hole.ring){const dx=Math.max(Math.abs(x)-(innerHalf-cr),0),dy=Math.max(Math.abs(y)-(innerHalf-cr),0);if(Math.abs(x)>innerHalf+1e-8||Math.abs(y)>innerHalf+1e-8||Math.hypot(dx,dy)>cr+1e-8)throw Error(`${hole.name} pocket does not fit a 1 × 1 insert. Reduce its size or use a larger bin.`);}
 const opticGlass=ly-slotT/2-(oy+r),opticGasket=Math.hypot(gx-ox,gy-oy)-r-rg;
 if((p.includeGlass&&opticGlass<p.web-1e-8)||(p.includeGasket&&opticGasket<p.web-1e-8))throw Error('These parts collide in a 1 × 1 bin. Reduce the pocket sizes or use a larger bin.');
 const loaded=Math.max(top,p.base+p.height,p.includeGlass?floorGlass+p.glassD:0, p.includeGasket?floorG+p.gasketH:0);
 // Stop 0.5 mm below the existing generator lid foot's lowest point (H − 0.35).
 const available=7*p.binU-4.75-p.binFloor-0.85;
 const minU=Math.ceil((loaded+4.75+p.binFloor+0.85)/7);
 if(loaded>available)throw Error(`Loaded insert needs at least ${minU}U with this bin floor. Increase bin height.`);
 return {width,top,outer,holes,loaded,available,minU,ox,oy,r,ly,slotW,slotT,gx,gy,rg};
}
export function build(p){
 const d=derive(p),tri=[];
 const face=(rings,z,up)=>{const verts=rings.flat(),starts=[];let n=rings[0].length;for(let i=1;i<rings.length;i++){starts.push(n);n+=rings[i].length;}const ids=earcut(verts.flat(),starts,2);for(let i=0;i<ids.length;i+=3){let t=ids.slice(i,i+3).map(j=>[...verts[j],z]);const a=t[0],b=t[1],c=t[2];if(((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])>0)!==up)t.reverse();tri.push(t);}};
 const walls=(ring,z0,z1,inward)=>{for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];const v=[[...a,z0],[...b,z0],[...b,z1],[...a,z1]];let ts=[[v[0],v[1],v[2]],[v[0],v[2],v[3]]];if(inward)ts=ts.map(t=>t.reverse());tri.push(...ts);}};
 face([d.outer],0,false);face([d.outer,...d.holes.map(h=>h.ring)],d.top,true);walls(d.outer,0,d.top,false);
 for(const h of d.holes){face([h.ring],h.floor,true);walls(h.ring,h.floor,d.top,true);}
 return {tri,d};
}
export function toSTL(mesh){const bytes=new ArrayBuffer(84+mesh.tri.length*50),v=new DataView(bytes);v.setUint32(80,mesh.tri.length,true);let o=84;for(const [a,b,c] of mesh.tri){const u=b.map((x,i)=>x-a[i]),w=c.map((x,i)=>x-a[i]);const n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],len=Math.hypot(...n);for(const x of [...n.map(x=>x/len),...a,...b,...c]){v.setFloat32(o,x,true);o+=4;}o+=2;}return bytes;}
