// Research-only measurements. Runs the unchanged generator in memory.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {loadSource} from '../tools/core.mjs';
const file=new URL('../source/gridfinity_generator_4.html',import.meta.url);
const source=fs.readFileSync(file);
const {run}=loadSource(source.toString('utf8'));
run(`var componentVolumes=[];var originalSolid=solid;solid=(dst,fn,tag)=>{const m=originalSolid(dst,fn,tag);componentVolumes.push({tag,mm3:volumeOf(m)});return m;};`);
const cases=[['Default 2x1x6 bin',{}],['Wall 1.2 mm',{wall:1.2}],['Floor 1.0 mm',{floorT:1}],['Scoop 3 mm',{scoop:3}],['No label shelf',{labelMode:'off'}],['Wall 1.2 + floor 1.0 + scoop 3',{wall:1.2,floorT:1,scoop:3}],['Same footprint, 4U high',{hu:4}]];
const results=[];
for(const [name,patch]of cases){
 run(`var researchP={...DEFAULTS,...${JSON.stringify(patch)}};var errors=validateParams(researchP,'bin');`);
 const errors=run('errors');if(errors.length){results.push({name,patch,errors});continue;}
 run('componentVolumes=[];var bin=buildBin(researchP);var binComponents=componentVolumes.slice();componentVolumes=[];var lid=buildLid(researchP);var lidComponents=componentVolumes.slice();var derived=derive(researchP);');
 const values=run('({binCm3:(volumeOf(bin)-overlapBin(researchP,derived))/1000,lidCm3:(volumeOf(lid)-overlapLid(researchP,derived))/1000,binComponents,lidComponents})');
 const cm3=values.binCm3+values.lidCm3;
 results.push({name,patch,...values,pairCm3:cm3,changeVsDefaultPercent:results.length?100*(results[0].pairCm3-cm3)/results[0].pairCm3:0});
}
const report={sourceSHA256:crypto.createHash('sha256').update(source).digest('hex'),method:'Existing volumeOf minus existing heuristic overlap corrections, from unchanged generator; no slicing, infill or physical-print comparison. Component volumes are pre-union and double-count overlaps.',results};
fs.writeFileSync(new URL('filament-model-comparison.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.table(results.map(r=>({name:r.name,binCm3:r.binCm3?.toFixed(2),lidCm3:r.lidCm3?.toFixed(2),pairCm3:r.pairCm3?.toFixed(2),proxyReduction:r.changeVsDefaultPercent?.toFixed(1)+'%'})));
console.log(JSON.stringify(results[0].binComponents));
