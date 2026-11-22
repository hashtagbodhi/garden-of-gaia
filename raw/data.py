import json, re, os, subprocess, html
from html.parser import HTMLParser
SITE='/home/user/research/site/'
prods=json.load(open(SITE+'products.json'))['products']
cat=json.load(open('src/catalog.json'))
by={p['handle']:p for p in prods}

class Blocks(HTMLParser):
    BL={'p','h1','h2','h3','h4','h5','h6','li','div'}
    def __init__(s):
        super().__init__(); s.out=[]; s.cur=None; s.bold=0
    def start(s,tag):
        s.flush(); s.cur={'tag':tag,'runs':[]}
    def flush(s):
        if s.cur and any(t.strip() for t,_ in s.cur['runs']): s.out.append(s.cur)
        s.cur=None
    def handle_starttag(s,tag,a):
        if tag in s.BL: s.start(tag)
        elif tag in('strong','b'): s.bold+=1
        elif tag=='br' and s.cur: s.cur['runs'].append((' ',False))
        elif tag=='hr': s.flush()
    def handle_endtag(s,tag):
        if tag in s.BL: s.flush()
        elif tag in('strong','b'): s.bold=max(0,s.bold-1)
    def handle_data(s,d):
        if s.cur is None: s.cur={'tag':'p','runs':[]}
        s.cur['runs'].append((d,s.bold>0))
clean=lambda t: re.sub(r'\s+',' ',t.replace('\xa0',' ')).strip()
EMO=re.compile(r'[✨✅\U0001F300-\U0001FAFF☀-➿]')
def icon(t):
    t=t.lower()
    for k,v in [('ingredient','plant'),('botanical','plant'),('how to','cup'),('use','cup'),('prepar','cup'),('direction','cup'),('benefit','lotus'),('propert','lotus'),('sourc','leaf'),('quality','leaf'),('includ','package'),('bundle','package'),('size','package')]:
        if k in t: return v
    return 'flower'
def sent(t):
    t=clean(EMO.sub('',t)).strip(' :*~-–')
    return t[:1].upper()+t[1:] if t else t
HEADKW=re.compile(r'^(ingredients?|benefits?|how to|suggested use|directions?|sourcing|key botanicals|bundle includes|included|size|instructions?)',re.I)
def structure(p):
    b=Blocks(); b.feed(p['body_html'] or ''); b.flush()
    name=p['title'].split(' - ')[0].split('-')[0].strip().lower()
    secs=[{'title':'','icon':'flower','blocks':[]}]
    for blk in b.out:
        text=clean(''.join(t for t,_ in blk['runs']))
        if not text or text in('*','.'): continue
        if re.search(r'not been evaluated|^disclaimer',text,re.I): continue
        boldtxt=clean(''.join(t for t,bd in blk['runs'] if bd)); allbold=len(boldtxt)>=len(text)-2
        ish=blk['tag'][0]=='h' and blk['tag']!='hr'
        low=text.lower()
        if (ish or allbold) and low.startswith(name[:14]) and len(text)<len(p['title'])+30 and not secs[0]['blocks'] and len(secs)==1: continue
        # leading bold label "Label: rest"
        m=re.match(r'^([^:]{2,48}):\s*(.*)$',text)
        lead = m and boldtxt and clean(boldtxt).rstrip(': ').lower().startswith(m.group(1).lower()[:12])
        if blk['tag']=='li':
            it={'k':'li','t':text}
            if m and lead and m.group(2): it={'k':'li','term':sent(m.group(1)),'t':m.group(2)}
            secs[-1]['blocks'].append(it); continue
        if ish or (allbold and len(text)<80 and '•' not in text and not text.startswith('*')):
            t=text
            if ':' in t:  # "How to Use & Prepare:Butterfly Chai - ..." keep the label part
                a,bb=t.split(':',1)
                if not bb.strip() or bb.strip().lower().startswith(name[:10]): t=a
                elif HEADKW.match(a): 
                    secs.append({'title':sent(a),'icon':icon(a),'blocks':[{'k':'p','t':clean(bb)}]}); continue
            secs.append({'title':sent(t),'icon':icon(t),'blocks':[]}); continue
        if m and lead and HEADKW.match(m.group(1)) and m.group(2):
            secs.append({'title':sent(m.group(1)),'icon':icon(m.group(1)),'blocks':[{'k':'p','t':m.group(2)}]}); continue
        if m and lead and m.group(2) and len(m.group(1))<40:
            secs[-1]['blocks'].append({'k':'dt','term':sent(m.group(1)),'t':m.group(2)}); continue
        kind='note' if (allbold or text.startswith('*') or '•' in text) and len(text)<140 else 'p'
        secs[-1]['blocks'].append({'k':kind,'t':text.strip('* ') if kind=='note' else text})
    secs=[s for s in secs if s['blocks']]
    lede=''
    if secs and not secs[0]['title']:
        for i,bk in enumerate(secs[0]['blocks']):
            if bk['k']=='p': lede=bk['t']; secs[0]['blocks'].pop(i); break
        if not secs[0]['blocks']: secs.pop(0)
        elif secs: secs[0]['title']='About'
    return lede,secs

os.makedirs('public/assets/gal',exist_ok=True); os.makedirs('raw/gal',exist_ok=True)
jobs=[]
for c in cat:
    p=by[c['handle']]
    c['lede'],c['sections']=structure(p)
    c.pop('desc',None)
    c['gallery']=[]
    for i,im in enumerate(p['images'][:5]):
        fn=f"raw/gal/{c['handle']}-{i}.jpg"
        if not os.path.exists(fn): jobs.append((fn,im['src'].split('?')[0]+'?width=1000'))
        c['gallery'].append(f"assets/gal/{c['handle']}-{i}.webp")
print('downloading',len(jobs))
for k in range(0,len(jobs),8):
    ps=[subprocess.Popen(['curl','-s','-m','60','-o',fn,u]) for fn,u in jobs[k:k+8]]
    [x.wait() for x in ps]
json.dump(cat,open('src/catalog.json','w'),ensure_ascii=False)
gifts={}
for n in ('25','40','75'):
    gifts[n]=[x['handle'] for x in json.load(open(SITE+f'gift-{n}-dollar-gifts.json'))['products'] if x['handle'] in by]
json.dump(gifts,open('src/gifts.json','w'))
print({k:len(v) for k,v in gifts.items()})
for h in ['butterfly-chai-organic-whole-spice-blend-ceylon-black-tea','hathor-s-nectar-tallow-balm']:
    c=[x for x in cat if x['handle']==h][0]
    print('LEDE:',c['lede'][:120])
    for s in c['sections']: print('  §',s['title'],'|',s['icon'],'|',[(b['k'],b.get('term',''),b['t'][:40]) for b in s['blocks'][:4]])
from collections import Counter
print(Counter(len(c['sections']) for c in cat)); print(sum(1 for c in cat if not c['lede']),'without lede')
print(sorted(set(s['title'] for c in cat for s in c['sections']))[:80])
