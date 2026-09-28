import json, subprocess
from pathlib import Path
root=Path(__file__).resolve().parent
images={arm:subprocess.check_output(['docker','image','inspect','jevgrep-tree-bench-'+arm,'--format','{{.Id}}'],text=True).strip() for arm in ['before','after']}
print(json.dumps({'metadata':{'images':images,'baseline':'2dc1d3c','candidate':'1493eaa','cpus':2,'memory':'2g','network':'none','trials':3,'warmIterations':10}}),flush=True)
for language in ['rust','c']:
 for count in [100,1500]:
  for trial in range(3):
   for arm in (['before','after'] if trial%2==0 else ['after','before']):
    cmd=['docker','run','--rm','--network','none','--read-only','--cpus','2','--memory','2g','--tmpfs','/tmp','-v',str(root/'bench.mjs')+':/work/test/parser/c-rust.bench.mjs:ro',images[arm],'node','--experimental-strip-types','test/parser/c-rust.bench.mjs',language,str(count),arm]
    p=subprocess.run(cmd,text=True,capture_output=True,timeout=45,check=True)
    print(json.dumps(dict(trial=trial,**json.loads(p.stdout))),flush=True)
