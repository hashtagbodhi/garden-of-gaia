# Download finished Artlist re-renders: read the generation results from this session's transcript, save as raw/regen2/<handle>.png
import json, os, re, sys, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'raw', 'regen2'); os.makedirs(OUT, exist_ok=True)
jobs = json.load(open(os.path.join(ROOT, 'raw', 'regen_jobs.json')))[20:40]
IDS = ["01a20575-2d5b-770b-80b8-cc271e579b15", "01a20575-2d4e-7ae8-b670-e80957cac17e", "01a20575-2d51-7945-888c-8a0f048594ce", "01a20575-2d4f-7f08-b003-bb10ea6bf067", "01a20575-2d51-77fa-b1f8-847ba220c18d",
       "01a20575-2e1e-7fc3-806f-221e3a7d2723", "01a20575-2e39-7627-87ba-1987d5e1c5af", "01a20575-2e4d-7150-89de-7e7ee9a5eb6d", "01a20575-2e77-7eab-8040-ad03617053d6", "01a20575-2f2b-7fa3-989b-90552a36cb8a",
       "01a20575-2f1e-7668-8b62-d368c9b94328", "01a20575-2f27-75d7-a021-2638878cbb2d", "01a20575-2f49-785a-87b4-892c8b4a053f", "01a20575-2fed-71a5-a306-e2cc05203cb8", "01a20575-301a-7c62-8587-019ad94dcb2b",
       "01a20575-301d-769a-8ef4-4f1e03b641d9", "01a20575-3027-7ee4-ba15-00dea10d8a69", "01a20575-3031-734f-a9b0-cfe9742671a3", "01a20575-30b7-71fa-9e26-cd774e17a31a", "01a20575-3101-7a78-b1f4-6fb371dfef2c"]
handle = {g: j['h'] for g, j in zip(IDS, jobs)}
text = open(sys.argv[1], encoding='utf-8', errors='ignore').read().replace('\\"', '"').replace('\\\\', '\\')
found = {}
for m in re.finditer(r'"assetUrl":"(https://cms-toolkit-artifacts\.artlist\.io/[^"]+?)","generationId":"([0-9a-f-]{36})"', text):
    found[m.group(2)] = m.group(1).replace('\\u0026', '&')
print(len(found), 'results found;', len([g for g in IDS if g in found]), 'of 20 wanted')
for g in IDS:
    if g not in found: print('MISSING', handle[g]); continue
    dst = os.path.join(OUT, handle[g] + '.png')
    if os.path.exists(dst) and os.path.getsize(dst) > 50000: continue
    req = urllib.request.Request(found[g], headers={'User-Agent': 'Mozilla/5.0'})
    try:
        open(dst, 'wb').write(urllib.request.urlopen(req, timeout=90).read()); print('ok', handle[g], os.path.getsize(dst) // 1024, 'KB')
    except Exception as e:
        print('ERR', handle[g], e)
