import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadSource} from './core.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function markdownFiles(directory) {
  return fs.readdirSync(path.join(root,directory),{withFileTypes:true}).flatMap(entry=>{
    if(entry.isDirectory())return ['runs','draft-before-review'].includes(entry.name)?[]:markdownFiles(directory+'/'+entry.name);
    return entry.name.endsWith('.md')?[directory+'/'+entry.name]:[];
  });
}
const files=['README.md',...['docs','reviews','tools'].flatMap(markdownFiles)];
let failures=[];let count=0;
const {run}=loadSource(fs.readFileSync(path.join(root,'source','gridfinity_generator_4.html'),'utf8'));
const parameterText=fs.readFileSync(path.join(root,'docs','parameters.md'),'utf8');
const defaultKeys=run('Object.keys(DEFAULTS)');
for(const key of defaultKeys)if(!parameterText.includes('`'+key+'`'))failures.push('Parameter reference missing default: '+key);
const anchor=s=>s.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu,'').trim().replace(/\s/g,'-');
for(const file of files){const text=fs.readFileSync(path.join(root,file),'utf8');for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){const link=m[1];if(/^[a-z]+:/i.test(link))continue;count++;const [name,fragment]=link.split('#'),target=path.resolve(root,path.dirname(file),name||path.basename(file));if(!fs.existsSync(target)){failures.push(`${file}: missing ${link}`);continue;}if(fragment&&target.endsWith('.md')){const headings=[...fs.readFileSync(target,'utf8').matchAll(/^#+\s+(.+)$/gm)].map(m=>anchor(m[1]));if(!headings.includes(fragment))failures.push(`${file}: missing anchor ${link}`);}}}
console.log(`${files.length} current Markdown files; ${count} local links checked (archived draft snapshots excluded).`);
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log(`All local links resolve; all ${defaultKeys.length} default parameter names are documented. External URLs are not fetched.`);
