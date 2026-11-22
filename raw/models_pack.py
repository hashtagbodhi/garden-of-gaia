# Each Poly Haven model as one model.json ({gltf, bin: base64}) beside its texture, since some hosts only serve common file types.
import base64, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = os.path.join(ROOT, 'public', 'assets', 'models')
for k in sorted(os.listdir(M)):
    d = os.path.join(M, k); g = os.path.join(d, 'model.gltf')
    if not os.path.exists(g): continue
    doc = json.load(open(g)); assert len(doc['buffers']) == 1
    binf = os.path.join(d, doc['buffers'][0].pop('uri')); data = open(binf, 'rb').read()
    json.dump({'gltf': doc, 'bin': base64.b64encode(data).decode()}, open(os.path.join(d, 'model.json'), 'w'))
    os.unlink(g); os.unlink(binf); print(k, len(data) // 1024, 'KB')
