import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectSTL,loadSource} from './core.mjs';
function stl(tris){const b=Buffer.alloc(84+50*tris.length);b.writeUInt32LE(tris.length,80);tris.forEach((t,i)=>t.flat().forEach((x,j)=>b.writeFloatLE(x,84+i*50+12+j*4)));return b;}
test('reader rejects truncated and count-mismatched files',()=>{assert.throws(()=>inspectSTL(Buffer.alloc(10)));const b=Buffer.alloc(84);b.writeUInt32LE(1,80);assert.throws(()=>inspectSTL(b));});
test('reader distinguishes a closed tetrahedron from an open surface',()=>{const a=[0,0,0],b=[1,0,0],c=[0,1,0],d=[0,0,1];const ts=[[a,c,b],[a,b,d],[a,d,c],[b,c,d]];assert.equal(inspectSTL(stl(ts)).boundaryEdges,0);assert.equal(inspectSTL(stl(ts.slice(1))).boundaryEdges,3);assert.equal(inspectSTL(stl(ts)).inconsistentEdges,0);});
test('reader detects nonfinite, collapsed, and same-direction edges',()=>{assert.equal(inspectSTL(stl([[[NaN,0,0],[1,0,0],[0,1,0]]])).nonfinite,1);assert.equal(inspectSTL(stl([[[0,0,0],[0,0,0],[1,0,0]]])).degenerate,1);const t=[[0,0,0],[1,0,0],[0,1,0]];assert.equal(inspectSTL(stl([t,t])).inconsistentEdges,3);});
test('source adapter fails visibly on changed layout',()=>assert.throws(()=>loadSource('<script>const x=1</script>')));
