import vm from 'node:vm';
export function loadSource(html) {
  const blocks=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(x=>! /\bsrc\s*=/.test(x[1])).map(x=>x[2]);
  if(blocks.length!==3 || !blocks[2].includes('(function(){')) throw new Error('Source layout changed: expected two core scripts and one UI script; update adapter.');
  blocks.forEach((s,i)=>new vm.Script(s,{filename:`inline-${i+1}.js`}));
  const context=vm.createContext({});
  vm.runInContext(blocks.slice(0,2).join('\n'),context,{timeout:10000});
  return {blocks, context, run:(code)=>vm.runInContext(code,context,{timeout:30000})};
}
// Independent binary reader: never calls source clean/volume helpers.
export function inspectSTL(bytes) {
  const b=Buffer.from(bytes); if(b.length<84) throw new Error('Truncated STL header');
  const n=b.readUInt32LE(80); if(b.length!==84+50*n) throw new Error('STL count/length mismatch');
  const edges=new Map(), min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  let nonfinite=0,degenerate=0,normalDisagreements=0,volume=0;
  const key=v=>v.map(x=>Math.round(x*1e5)).join(',');
  for(let i=0;i<n;i++){
    const o=84+50*i, normal=[0,1,2].map(j=>b.readFloatLE(o+4*j));
    const vs=[0,1,2].map(j=>[0,1,2].map(k=>b.readFloatLE(o+12+j*12+k*4)));
    if(![...normal,...vs.flat()].every(Number.isFinite)){nonfinite++;continue;}
    vs.forEach(v=>v.forEach((x,k)=>{min[k]=Math.min(min[k],x);max[k]=Math.max(max[k],x);}));
    const [a,c,d]=vs,u=c.map((x,k)=>x-a[k]),v=d.map((x,k)=>x-a[k]);
    const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    if(Math.hypot(...cross)<1e-7)degenerate++;
    if(cross.reduce((s,x,k)=>s+x*normal[k],0)<0)normalDisagreements++;
    volume+=(a[0]*(c[1]*d[2]-c[2]*d[1])-a[1]*(c[0]*d[2]-c[2]*d[0])+a[2]*(c[0]*d[1]-c[1]*d[0]))/6;
    const ks=vs.map(key);for(let j=0;j<3;j++){const x=ks[j],y=ks[(j+1)%3],k=x<y?x+'|'+y:y+'|'+x;const e=edges.get(k)||{count:0,balance:0};e.count++;e.balance+=x<y?1:-1;edges.set(k,e);}
  }
  return {triangles:n,nonfinite,degenerate,normalDisagreements,bounds:{min,max},signedVolumeMm3:volume,boundaryEdges:[...edges.values()].filter(e=>e.count===1).length,nonmanifoldEdges:[...edges.values()].filter(e=>e.count>2).length,inconsistentEdges:[...edges.values()].filter(e=>e.count===2&&e.balance!==0).length,weldToleranceMm:1e-5};
}
