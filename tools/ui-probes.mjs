// Executes original event handlers with explicit DOM/timer doubles. Not a browser test.
export function uiProbes(run,ui){
 const slice=(a,b)=>{const i=ui.indexOf(a),j=ui.indexOf(b,i);if(i<0||j<0)throw Error('UI adapter markers changed');return ui.slice(i,j);};
 run(`globalThis.handlers={};globalThis.nodes={};$=id=>nodes[id]||(nodes[id]={value:'',min:'1',max:'60',addEventListener:(event,fn)=>handlers[id+':'+event]=fn});var document={querySelectorAll:()=>[]};var syncAll=()=>{};var MODEL='bin',VIEW='asm',AVAIL=60;`);
 if(ui.includes('function switchModel(')){run(slice('const MODE_DEFAULTS =','const $ ='));run(slice('function switchModel(',"$('avail').addEventListener"));}
 else run(slice('let traySeen = false',"$('avail').addEventListener"));
 const modes=run(`(()=>{const result=[];for(const model of ['bin','tray','bin','wipe','bin']){handlers['model_seg:click']({target:{closest:()=>({dataset:{model}})}});result.push({model,nx:P.nx,ny:P.ny,hu:P.hu,lip:P.lip,wall:P.wall});}return result;})()`);
 run(`var NUMS=['sheetN'];`);run(slice('NUMS.forEach(id=>{','TOGGLES.forEach(id=>{'));
 const numeric=run(`(()=>{const r=[];for(const value of ['', 'NaN','Infinity','1.5','999','-4']){$('sheetN_n').value=value;handlers['sheetN_n:input']();r.push({input:value,state:P.sheetN,effective:deriveWipe(P).sheetN});}return r;})()`);
 let exportResult;
 if(ui.includes('function exportRevision()')){
 run(`var timers=[];var setTimeout=fn=>timers.push(fn);var saved=[];P={...DEFAULTS,nx:3};MODEL='bin';`);
 run(slice('function exportRevision()', "$('dl_bin').addEventListener"));
 run(`save=file=>{saved.push({name:file.name,kind:file.kind,byteLength:file.bytes.byteLength});return file.name;};`);
 run(slice("$('dl_bin').addEventListener",'applyTheme(); syncAll();'));
 run(`handlers['dl_both:click']();MODEL='wipe';P.wnx=6;timers.shift()();`);
 exportResult=run('saved');
 }else{
 run(`var timers=[];var setTimeout=fn=>timers.push(fn);var trayMesh='tray-old',binMesh='bin-old',lidMesh='lid-old';var saved=[];var save=(mesh,kind)=>{saved.push({mesh,kind,model:MODEL});return kind;};MODEL='bin';`);
 run(slice("$('dl_both').addEventListener",'applyTheme(); syncAll();'));
 run(`handlers['dl_both:click']();MODEL='wipe';lidMesh='wipe-new';timers.shift()();`);
 exportResult=run('saved');
 }
 return {environment:'DOM and timer doubles, original handlers; no rendering or browser validation',modeSequence:modes,numericInputs:numeric,downloadBothSwitch:exportResult};
}
