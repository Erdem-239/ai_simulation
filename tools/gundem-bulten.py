#!/usr/bin/env python3
"""Günlük 'Haber & gündem' bülteni.
Kaynaklardan öğe çeker -> Gemini ile süzer/özetler (kendi cümleleriyle) -> blog/gundem/index.json'a ekler.
Gizli anahtarlar yalnız ortam değişkeninden: APIFY_TOKEN (X için), GEMINI_API_KEY | GROQ_API_KEY | OPENROUTER_API_KEY (saglayici ayardan), SOCIALDATA_API_KEY (hiçbiri depoda YOK).
Kullanım: python3 tools/gundem-bulten.py [--dry-run] [--girdi dosya.json]
  --girdi : kaynak çekmek yerine hazır öğe listesi ([{"url","text","author"}]) kullan (test)
  GUNDEM_MOCK=1 : LLM yerine sahte yanıt (anahtarsız test)
"""
import json, os, sys, re, datetime, urllib.request, urllib.parse
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = json.load(open(os.path.join(ROOT, 'tools', 'gundem-kaynaklar.json'), encoding='utf-8'))
OUT = os.path.join(ROOT, 'blog', 'gundem', 'index.json')
UA = {'User-Agent': 'gundem-bulten/1.0'}

ETIKETLER = ['model', 'araştırma', 'araç', 'güvenlik', 'açık-model', 'donanım', 'uygulama', 'ses-görüntü', 'bilim']

def get(url, headers=None, data=None, timeout=30):
    req = urllib.request.Request(url, data=data, headers={**UA, **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        print('HTTP', e.code, url.split('?')[0], e.read()[:300].decode('utf-8', 'replace'), file=sys.stderr)
        raise

def rss_items(url):
    root = ET.fromstring(get(url))
    out = []
    for it in root.iter():
        tag = it.tag.split('}')[-1]
        if tag not in ('item', 'entry'):
            continue
        g = lambda n: next((c for c in it if c.tag.split('}')[-1] == n), None)
        link = g('link')
        href = (link.get('href') if link is not None and link.get('href') else (link.text if link is not None else '')) or ''
        title = (g('title').text if g('title') is not None else '') or ''
        desc = ''
        for n in ('description', 'summary', 'content'):
            if g(n) is not None and g(n).text:
                desc = re.sub(r'<[^>]+>', ' ', g(n).text)[:400]; break
        if href:
            out.append({'url': href.strip(), 'text': (title + ' — ' + desc).strip(), 'author': urllib.parse.urlparse(url).hostname})
    return out[:40]

AI_RE = re.compile(r'\b(ai|llm|gpt|claude|gemini|llama|qwen|deepseek|mistral|grok|openai|anthropic|deepmind|transformer|diffusion|model|neural|agent|rag|inference|fine-?tun|benchmark|moe|attention|robot|nvidia|gpu|tpu|open[- ]?source|weights)\b', re.I)

def hn_items():
    c = CFG.get('hacker_news', {})
    if not c.get('aktif'): return []
    from concurrent.futures import ThreadPoolExecutor
    ids = json.loads(get('https://hacker-news.firebaseio.com/v0/topstories.json'))[:c.get('tara', 80)]
    def one(i):
        try: return json.loads(get('https://hacker-news.firebaseio.com/v0/item/%d.json' % i, timeout=15))
        except Exception: return None
    with ThreadPoolExecutor(8) as ex: its = list(ex.map(one, ids))
    out = []
    for t in its:
        if not t or t.get('type') != 'story' or not t.get('title'): continue
        if t.get('score', 0) < c.get('min_puan', 100) or not AI_RE.search(t['title']): continue
        out.append({'url': t.get('url') or 'https://news.ycombinator.com/item?id=%d' % t['id'], 'text': t['title'],
                    'author': 'Hacker News', 'pop': '%d puan, %d yorum' % (t.get('score', 0), t.get('descendants', 0))})
    print('hacker news:', len(out), 'öğe', file=sys.stderr)
    return out

def hf_items():
    c = CFG.get('huggingface', {})
    if not c.get('aktif'): return []
    out = []
    try:
        for m in json.loads(get('https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=%d' % c.get('model', 15))):
            mid = m.get('id') or m.get('modelId')
            if mid: out.append({'url': 'https://huggingface.co/' + mid, 'text': 'Trend model: %s (%s)' % (mid, m.get('pipeline_tag') or 'model'),
                                'author': 'HF trend model', 'pop': '%s beğeni, %s indirme' % (m.get('likes', 0), m.get('downloads', 0))})
    except Exception as e: print('hf model hata', e, file=sys.stderr)
    try:
        for p in json.loads(get('https://huggingface.co/api/daily_papers?limit=%d' % c.get('makale', 15))):
            pp = p.get('paper') or p
            if pp.get('id') and pp.get('title'):
                out.append({'url': 'https://huggingface.co/papers/' + pp['id'], 'text': pp['title'] + ' — ' + (pp.get('summary') or '')[:300].replace('\n', ' '),
                            'author': 'HF günün makalesi', 'pop': '%s oy' % pp.get('upvotes', 0)})
    except Exception as e: print('hf makale hata', e, file=sys.stderr)
    print('huggingface trend:', len(out), 'öğe', file=sys.stderr)
    return out

def socialdata_items():
    s = CFG.get('socialdata', {})
    key = os.environ.get('SOCIALDATA_API_KEY')
    if not (s.get('aktif') and key):
        return []
    # NOT: uç nokta/parametre adları sağlayıcı belgesinden doğrulanmalı (ilk gerçek çalıştırmada kontrol et).
    q = urllib.parse.urlencode({'query': s['arama'], 'type': 'Latest'})
    d = json.loads(get('https://api.socialdata.tools/twitter/search?' + q, {'Authorization': 'Bearer ' + key, 'Accept': 'application/json'}))
    out = []
    for t in d.get('tweets', [])[: s.get('en_fazla', 200)]:
        u = t.get('user', {}).get('screen_name', '')
        out.append({'url': 'https://x.com/%s/status/%s' % (u, t.get('id_str')), 'text': t.get('full_text') or t.get('text') or '', 'author': '@' + u})
    return out

def apify_items():
    a = CFG.get('apify', {})
    tok = os.environ.get('APIFY_TOKEN')
    hs = [h.strip().lstrip('@') for h in a.get('hesaplar', []) if h.strip()]
    if not (a.get('aktif') and tok and hs):
        return []
    # NOT: aktör adı ve girdi alanları Apify'ın güncel belgesinden doğrulanmalı (ilk gerçek çalıştırmada günlüğe bak).
    since = (datetime.date.today() - datetime.timedelta(days=a.get('gun', 2))).isoformat()
    actor = a.get('aktor', 'apidojo~tweet-scraper')
    if a.get('mod', 'hesap') == 'arama':
        terms = ['(%s) since:%s -filter:nativeretweets -filter:replies' % (' OR '.join('from:' + h for h in hs[i:i + 15]), since) for i in range(0, len(hs), 15)]
        inp = {'searchTerms': terms, 'maxItems': a.get('en_fazla', 150), 'sort': 'Latest'}
    else:
        inp = {'twitterHandles': hs, 'maxItems': a.get('en_fazla', 150), 'sort': 'Latest', 'start': since}
    body = json.dumps(inp).encode()
    d = json.loads(get('https://api.apify.com/v2/acts/%s/run-sync-get-dataset-items' % actor,
                       {'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json'}, body, 240))
    if isinstance(d, list):
        print('apify: %d öğe; ilk öğe anahtarları: %s' % (len(d), sorted(d[0].keys())[:25] if d and isinstance(d[0], dict) else '-'), file=sys.stderr)
        if d and isinstance(d[0], dict) and not (d[0].get('text') or d[0].get('fullText')):
            print('apify ilk öğe (kısaltılmış):', json.dumps(d[0], ensure_ascii=False)[:400], file=sys.stderr)
    else:
        print('apify beklenmeyen yanıt:', json.dumps(d, ensure_ascii=False)[:400], file=sys.stderr)
    out = []
    for t in d if isinstance(d, list) else []:
        text = t.get('text') or t.get('fullText') or ''
        url = t.get('url') or t.get('twitterUrl') or ''
        au = (t.get('author') or {}).get('userName', '')
        if text and url:
            out.append({'url': url, 'text': text, 'author': '@' + au if au else 'X', 'likes': t.get('likeCount', 0)})
    return out

def gemini(prompt):
    key = os.environ['GEMINI_API_KEY']
    url = 'https://generativelanguage.googleapis.com/v1beta/models/'+(os.environ.get('GEMINI_MODEL') or CFG.get('model') or 'gemini-2.5-flash-lite')+':generateContent?key=' + key
    body = json.dumps({'contents': [{'parts': [{'text': prompt}]}], 'generationConfig': {'responseMimeType': 'application/json', 'temperature': .3}}).encode()
    r = json.loads(get(url, {'Content-Type': 'application/json'}, body, 90))
    return json.loads(r['candidates'][0]['content']['parts'][0]['text'])

def openai_compat(prompt, base, key, model):
    def call(js):
        b = {'model': model, 'temperature': .3,
             'messages': [{'role': 'system', 'content': 'Yalnız geçerli JSON döndür.'}, {'role': 'user', 'content': prompt}]}
        if js: b['response_format'] = {'type': 'json_object'}
        r = json.loads(get(base + '/chat/completions', {'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'}, json.dumps(b).encode(), 120))
        return r['choices'][0]['message']['content']
    import time
    def retry(js):
        for k in range(4):
            try:
                return call(js)
            except urllib.error.HTTPError as e:
                if e.code != 429 or k == 3: raise
                w = 25 * (k + 1)
                print('429: %d sn bekleniyor' % w, file=sys.stderr); time.sleep(w)
    try:
        txt = retry(True)
    except urllib.error.HTTPError as e:
        if e.code != 400: raise
        print('JSON modu başarısız, serbest metinle yeniden deneniyor', file=sys.stderr)
        txt = retry(False)
    m = re.search(r'[\[{].*[\]}]', txt, re.S)
    return json.loads(m.group(0) if m else txt)

def llm(prompt):
    sg = (os.environ.get('GUNDEM_SAGLAYICI') or CFG.get('saglayici') or 'gemini').lower()
    if sg == 'groq':
        base, key = 'https://api.groq.com/openai/v1', os.environ['GROQ_API_KEY']
        try:
            d = openai_compat(prompt, base, key, CFG.get('model_groq', 'llama-3.3-70b-versatile'))
        except urllib.error.HTTPError as e:
            if e.code != 404: raise
            ids = [m['id'] for m in json.loads(get(base + '/models', {'Authorization': 'Bearer ' + key})).get('data', [])]
            print('Groq model listesi:', ids, file=sys.stderr)
            bad = ('whisper', 'guard', 'tts', 'embed', 'orpheus', 'prompt-guard')
            ok = [i for i in ids if not any(b in i for b in bad)]
            pick = next((i for k in ('gpt-oss-120b', '70b', 'qwen', 'llama', 'gpt-oss') for i in ok if k in i and 'safeguard' not in i), ok[0] if ok else None)
            if not pick: raise
            print('Seçilen model:', pick, file=sys.stderr)
            d = openai_compat(prompt, base, key, pick)
    elif sg == 'openrouter':
        d = openai_compat(prompt, 'https://openrouter.ai/api/v1', os.environ['OPENROUTER_API_KEY'], CFG.get('model_openrouter', 'meta-llama/llama-3.3-70b-instruct:free'))
    else:
        d = gemini(prompt)
    if isinstance(d, dict):  # {"secilen":[...]} biçimini de kabul et
        d = next((v for v in d.values() if isinstance(v, list)), [])
    return d

def kod(i):
    a = 'abcdefghjkmnpqrstuvwxyz'
    return a[i // 23 % 23] + a[i % 23] + str(i * 7 % 10)

def uyusuyor(title, it):
    # başlıktaki özel adlar (Büyük harfle başlayan ya da rakam içeren sözcükler) adayın metninde/adresinde geçmeli
    hay = (it['text'] + ' ' + it['url']).lower()
    ws = re.findall(r"[A-Za-zÇĞİÖŞÜçğıöşü0-9][\w.\-]{2,}", title)
    toks = [t.strip('.-:,') for k, t in enumerate(ws) if any(c.isdigit() for c in t) or (t[0].isupper() and k > 0) or (k == 0 and len(ws) == 1)]
    toks = [t for t in toks if len(t) >= 3]
    return any(t.lower() in hay for t in toks) if toks else True

def summarize(items, n):
    if os.environ.get('GUNDEM_MOCK'):
        return [{'i': kod(i), 'title': 'Örnek özet %d' % i, 'note': 'Sahte yanıt (test).', 'tags': ['test']} for i in range(min(n, len(items)))]
    lst = '\n'.join('[%s] (%s%s) %s' % (kod(i), it['author'], (', ' + it['pop']) if it.get('pop') else ((', beğeni ' + str(it['likes'])) if it.get('likes') else ''), it['text'][:220].replace('\n', ' ')) for i, it in enumerate(items))
    p = ('Ben yapay zekâ gündemini hızlıca öğrenmek istiyorum: şu an herkesin konuştuğu şeyler.\n'
         'ÖNCELİK: yeni çıkan modeller (sürüm/ağırlık yayını), yeni mimari ve teknikler, büyük şirket/laboratuvar duyuruları, '
         'önemli araştırma bulguları, açık kaynakta büyük gelişmeler. Beğeni/puan/yorum sayısı yüksekse daha önemlidir.\n'
         'ELE: müşteri hikâyeleri, tanıtım/pazarlama, genel eğitim yazıları, küçük araç güncellemeleri, aynı olayın tekrarları.\n'
         'En fazla %d haber seç. Her biri için KENDİ CÜMLELERİNLE Türkçe kısa başlık (en fazla 90 karakter; model/ürün adını koru), '
         'tek cümlelik "neden önemli" notu, 1-3 etiket (YALNIZCA şu listeden: %s) ve 1-10 arası önem puanı ver. Metni kopyalama/alıntılama.\n'
         'Her haberin başındaki [kod] değerini AYNEN i alanına yaz (başlık o kodun metniyle uyuşmalı). Yanıt yalnız JSON nesnesi: {"secilen":[{"i":"kod","title":"...","note":"...","tags":["..."],"puan":8}]}\n\n%s') % (n, ', '.join(ETIKETLER), lst)
    return llm(p)

def norm_tags(tags):
    out = []
    for t in tags or []:
        t = str(t).strip().lower()
        if t in ETIKETLER and t not in out: out.append(t)
    return out[:3] or ['diğer']

def main():
    dry = '--dry-run' in sys.argv
    if '--girdi' in sys.argv:
        items = json.load(open(sys.argv[sys.argv.index('--girdi') + 1], encoding='utf-8'))
    else:
        items = []
        for u in CFG.get('rss', []):
            try: items += rss_items(u)
            except Exception as e: print('RSS hata', u, e, file=sys.stderr)
        for fn in (hn_items, hf_items):
            try: items += fn()
            except Exception as e: print(fn.__name__, 'hata', e, file=sys.stderr)
        try: items += apify_items()
        except Exception as e: print('apify hata', e, file=sys.stderr)
        try: items += socialdata_items()
        except Exception as e: print('socialdata hata', e, file=sys.stderr)
    from collections import Counter
    print('kaynaklara göre aday:', dict(Counter(it['author'] for it in items).most_common(30)))
    old = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else []
    seen = {o['url'] for o in old}
    items = [it for it in items if it['url'] not in seen]
    uniq = {}
    for it in items: uniq.setdefault(it['url'], it)
    items = list(uniq.values())
    by = {}
    for it in items: by.setdefault(it['author'] if it['author'].startswith('@') is False else 'X', []).append(it)
    cap = CFG.get('aday_kaynak_basina', 25)
    groups = [g[:cap] for g in by.values()]
    items = []
    for r in range(cap):
        for g in groups:
            if r < len(g): items.append(g[r])
    print('yeni aday:', len(items))
    if not items:
        return
    kodlar = {kod(i): i for i in range(len(items))}
    nmax = CFG.get('max_yeni_gunluk', 12)
    sel = summarize(items, int(nmax * 2))
    today = datetime.date.today().isoformat()
    new = []
    sel = sorted([x for x in sel if isinstance(x, dict)], key=lambda x: -float(x.get('puan', 0) or 0))
    byk = {}
    kcap = CFG.get('secim_kaynak_basina', 3)
    for s_ in sel:
        try: it = items[kodlar[str(s_['i']).strip().lower()]]
        except Exception: continue
        if not uyusuyor(str(s_.get('title', '')), it):
            print('uyuşmayan seçim atıldı:', str(s_.get('title', ''))[:60], '->', it['url'][:60], file=sys.stderr); continue
        s_['_it'] = it
        byk.setdefault('X' if it['author'].startswith('@') else it['author'], []).append(s_)
    order = sorted(byk, key=lambda k: -float(byk[k][0].get('puan', 0) or 0))
    for r in range(kcap):
        for k in order:
            if r < len(byk[k]) and len(new) < nmax:
                s_ = byk[k][r]; it = s_['_it']
                new.append({'date': today, 'title': str(s_['title'])[:120], 'note': str(s_.get('note', ''))[:240], 'url': it['url'],
                            'source': it['author'], 'tags': norm_tags(s_.get('tags'))})
    print('eklenen:', len(new))
    allv = (new + old)[:300]
    if dry:
        print(json.dumps(new, ensure_ascii=False, indent=1)); return
    json.dump(allv, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

main()
