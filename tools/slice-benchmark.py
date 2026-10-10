#!/usr/bin/env python3
"""Offline X2D reference slicing; never sends a print job. Requires Bambu Studio and Node.
Usage: python3 tools/slice-benchmark.py [--cases cases.json] [--summary output.json]
Cases JSON: [{"name":"name","source":"relative/generator.html","patch":{},"parts":["body","lid"]}]
"""
import argparse, pathlib, json, hashlib, subprocess, datetime, re, sys
from slice_metadata import parse_metadata
ROOT=pathlib.Path(__file__).resolve().parent.parent
ap=argparse.ArgumentParser(description=__doc__)
ap.add_argument('--executable',default='/Applications/BambuStudio.app/Contents/MacOS/BambuStudio')
ap.add_argument('--profiles',default='/Applications/BambuStudio.app/Contents/Resources/profiles/BBL')
ap.add_argument('--cases');ap.add_argument('--summary',default='reviews/filament-slicing/summary.json')
a=ap.parse_args();exe=pathlib.Path(a.executable);profiles=pathlib.Path(a.profiles)
sha=lambda b:hashlib.sha256(b).hexdigest()
report={'schemaVersion':1,'results':[],'method':'Offline X2D slicing benchmark; no print job.'}
try:
 runid=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
 rundir=ROOT/'reviews/filament-slicing/runs'/runid;rundir.mkdir(parents=True,exist_ok=False)
 helptext=subprocess.run([str(exe),'--help'],capture_output=True,text=True,check=True,cwd=rundir,timeout=30).stdout
 version=re.search(r'BambuStudio-([^:]+):',helptext).group(1)
 index={}
 for f in profiles.rglob('*.json'):
  try:o=json.loads(f.read_text())
  except Exception:continue
  if 'name' in o:index[o['name']]=(f,o)
 provenance={}
 def resolve(name,seen=()):
  if name in seen:raise ValueError('Profile inheritance cycle '+name)
  if name not in index:raise ValueError('Missing bundled profile '+name)
  f,o=index[name];provenance[name]={'file':str(f.relative_to(profiles)),'sha256':sha(f.read_bytes())}
  out=resolve(o['inherits'],seen+(name,)) if o.get('inherits') else {}
  for inc in o.get('include',[]):out.update(resolve(inc,seen+(name,)))
  out.update({k:v for k,v in o.items() if k not in ['inherits','include']})
  return out
 machine=resolve('Bambu Lab X2D 0.4 nozzle');process=resolve('0.20mm Standard @BBL X2D')
 assert machine['printer_model']=='Bambu Lab X2D' and all(x=='0.4' for x in machine['nozzle_diameter'])
 configs={'machine':machine,'process':process}
 for mat in ['PLA','PETG']:configs[mat]=resolve(f'Generic {mat} @BBL X2D 0.4 nozzle')
 for k,o in configs.items():(rundir/(k+'.json')).write_text(json.dumps(o,indent=2)+'\n')
 cases=json.loads((ROOT/a.cases).read_text()) if a.cases else [
  {'name':'baseline','source':'reviews/filament-baseline/generator.html','patch':{},'parts':['body','lid']},
  {'name':'economy_existing_controls','source':'reviews/filament-baseline/generator.html','patch':{'wall':1.2,'floorT':1,'scoop':3},'parts':['body']}]
 report={'schemaVersion':1,'runId':runid,'slicer':'Bambu Studio','version':version,'method':'Offline CLI estimates from generated STL, official bundled flattened X2D 0.4 mm/0.20 mm Standard/Generic PLA or PETG profiles. Upright/feet down, no auto orientation, arrange only. No physical validation.','bed':'Textured PEI Plate','cliDocumentation':'https://github.com/bambulab/BambuStudio/wiki/Command-Line-Usage','profiles':configs,'profileProvenance':provenance,'results':[]}
 exportjs="""import fs from 'node:fs';import {loadSource} from './tools/core.mjs';const [src,patch,part,out]=process.argv.slice(2);const {run}=loadSource(fs.readFileSync(src,'utf8'));run('var bp={...DEFAULTS,...'+patch+'};var bm='+ (part==='body'?'buildBin':'buildLid')+'(bp);');fs.writeFileSync(out,Buffer.from(run('toSTL(bm,"benchmark")')));"""
 exporter=rundir/'export.mjs';exporter.write_text(exportjs.replace("'./tools/core.mjs'",json.dumps((ROOT/'tools/core.mjs').as_uri())))
 for case in cases:
  if not re.fullmatch(r'[a-zA-Z0-9_-]+',case['name']):raise ValueError('Unsafe case name')
  source=ROOT/case['source'];sourcebytes=source.read_bytes();sourcehash=sha(sourcebytes)
  if case.get('expectedSourceSHA256') and case['expectedSourceSHA256']!=sourcehash:raise ValueError('Source hash differs from expected case snapshot')
  snapshot=rundir/(case['name']+'-generator.html');snapshot.write_bytes(sourcebytes)
  for part in case.get('parts',['body','lid']):
   if part not in ['body','lid']:raise ValueError('Unknown part')
   stl=rundir/(case['name']+'-'+part+'.stl')
   subprocess.run(['node',str(exporter),str(snapshot),json.dumps(case.get('patch',{})),part,str(stl)],cwd=ROOT,check=True)
   for mat in ['PLA','PETG']:
    job=rundir/(case['name']+'-'+part+'-'+mat);job.mkdir()
    cmd=[str(exe),'--datadir',str(job/'datadir'),'--debug','2','--curr-bed-type','Textured PEI Plate','--load-settings',str(rundir/'machine.json')+';'+str(rundir/'process.json'),'--load-filaments',str(rundir/(mat+'.json')),'--check-preset','--orient','0','--arrange','1','--slice','0','--outputdir',str(job),'--export-settings',str(job/'effective.json'),'--export-slicedata',str(job/'slice-data'),str(stl)]
    print('Slicing',case['name'],part,mat,flush=True)
    try:proc=subprocess.run(cmd,capture_output=True,text=True,timeout=180,cwd=job)
    except subprocess.TimeoutExpired as err:proc=subprocess.CompletedProcess(cmd,124,(err.stdout or b'').decode() if isinstance(err.stdout,bytes) else (err.stdout or ''),((err.stderr or b'').decode() if isinstance(err.stderr,bytes) else (err.stderr or ''))+'\nSlicing timed out after 180 seconds')
    (job/'stdout.log').write_text(proc.stdout);(job/'stderr.log').write_text(proc.stderr)
    (job/'command.json').write_text(json.dumps(cmd,indent=2)+'\n')
    row={'case':case['name'],'part':part,'material':mat,'source':case['source'],'sourceSHA256':sourcehash,'patch':case.get('patch',{}),'stlSHA256':sha(stl.read_bytes()),'profileSHA256':{k:sha((rundir/(k+'.json')).read_bytes()) for k in ['machine','process',mat]},'exitCode':proc.returncode,'artifacts':str(job.relative_to(ROOT))}
    gcodefile=job/'plate_1.gcode'
    if proc.returncode==0 and gcodefile.exists():
     if not gcodefile.stat().st_size:row['error']='Empty sliced G-code'
     else:
      gcode=gcodefile.read_text();(job/'header.txt').write_text('\n'.join(gcode.splitlines()[:100]))
      row['gcodeSHA256']=sha(gcode.encode())
      try:
       row.update(parse_metadata(gcode));row['success']=True
      except ValueError as err:row['error']='Invalid sliced G-code evidence: '+str(err)
      row['warnings']=[line for line in proc.stdout.splitlines()+proc.stderr.splitlines() if '[warning]' in line or '[error]' in line]
     if (job/'effective.json').exists():row['effectiveSettingsSHA256']=sha((job/'effective.json').read_bytes())
    else:row['error']='CLI failed or no output';row['logTail']=(proc.stdout+'\n'+proc.stderr)[-4000:]
    report['results'].append(row)
    (ROOT/a.summary).parent.mkdir(parents=True,exist_ok=True);(ROOT/a.summary).write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in row.items() if k in ['case','part','material','exitCode','error','grams','time','supportToolpathsPresent']}),flush=True)
 report['pairComparisons']=[]
 by={(r['case'],r['part'],r['material']):r for r in report['results'] if r.get('success')}
 for material in ['PLA','PETG']:
  if all(('baseline',p,material) in by for p in ['body','lid']):
   baseline=sum(by[('baseline',p,material)]['grams'] for p in ['body','lid'])
   for case in cases:
    if case['name']=='baseline' or (case['name'],'body',material) not in by:continue
    lid=by.get((case['name'],'lid',material))
    # A body-only case explicitly uses the baseline lid; other custom cases require their own lid.
    if not lid and case['name']=='economy_existing_controls':lid=by[('baseline','lid',material)]
    if lid:
     pair=by[(case['name'],'body',material)]['grams']+lid['grams'];report['pairComparisons'].append({'case':case['name'],'material':material,'baselinePairGrams':baseline,'candidatePairGrams':pair,'slicerEstimatedReductionPercent':100*(baseline-pair)/baseline,'lidReusedFromBaseline':case['name']=='economy_existing_controls'})
 (ROOT/a.summary).write_text(json.dumps(report,indent=2)+'\n')
 print('Summary:',a.summary)
 if any(not r.get('success') for r in report['results']):sys.exit(1)
except Exception as err:
 report['fatalError']={'type':type(err).__name__,'message':str(err)}
 report['success']=False
 destination=ROOT/a.summary;destination.parent.mkdir(parents=True,exist_ok=True);destination.write_text(json.dumps(report,indent=2)+'\n')
 print('Benchmark failed:',str(err),file=sys.stderr)
 sys.exit(1)
