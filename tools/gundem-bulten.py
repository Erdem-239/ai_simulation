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
    since = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
    terms = []
    for i in range(0, len(hs), 15):
        q = ' OR '.join('from:' + h for h in hs[i:i + 15])
        terms.append('(%s) since:%s -filter:nativeretweets -filter:replies' % (q, since))
    actor = a.get('aktor', 'apidojo~tweet-scraper')
    body = json.dumps({'searchTerms': terms, 'maxItems': a.get('en_fazla', 150), 'sort': 'Latest'}).encode()
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
    try:
        txt = call(True)
    except urllib.error.HTTPError as e:
        if e.code != 400: raise
        print('JSON modu başarısız, serbest metinle yeniden deneniyor', file=sys.stderr)
        txt = call(False)
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

def summarize(items, n):
    if os.environ.get('GUNDEM_MOCK'):
        return [{'i': i, 'title': 'Örnek özet %d' % i, 'note': 'Sahte yanıt (test).', 'tags': ['test']} for i in range(min(n, len(items)))]
    lst = '\n'.join('[%d] (%s%s) %s' % (i, it['author'], (', beğeni ' + str(it['likes'])) if it.get('likes') else '', it['text'][:500].replace('\n', ' ')) for i, it in enumerate(items))
    p = ('Aşağıda numaralı gönderiler var. İlgi alanım: %s.\n'
         'Yalnız önemli ve özgün gelişmeleri seç (en fazla %d), reklam/tekrar/sohbeti ele.\n'
         'Her seçilen için KENDİ CÜMLELERİNLE Türkçe kısa bir başlık (en fazla 90 karakter) ve tek cümlelik not yaz; '
         'metni kopyalama/alıntılama. 1-3 küçük harfli Türkçe etiket ver.\n'
         'Yanıt yalnız JSON nesnesi: {"secilen":[{"i":numara,"title":"...","note":"...","tags":["..."]}]}\n\n%s') % (CFG['ilgi'], n, lst)
    return llm(p)

def main():
    dry = '--dry-run' in sys.argv
    if '--girdi' in sys.argv:
        items = json.load(open(sys.argv[sys.argv.index('--girdi') + 1], encoding='utf-8'))
    else:
        items = []
        for u in CFG.get('rss', []):
            try: items += rss_items(u)
            except Exception as e: print('RSS hata', u, e, file=sys.stderr)
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
    items = list(uniq.values())[:150]
    print('yeni aday:', len(items))
    if not items:
        return
    sel = summarize(items, CFG.get('max_yeni_gunluk', 12))
    today = datetime.date.today().isoformat()
    new = []
    for s in sel:
        try: it = items[int(s['i'])]
        except Exception: continue
        new.append({'date': today, 'title': str(s['title'])[:120], 'note': str(s.get('note', ''))[:240], 'url': it['url'],
                    'source': it['author'], 'tags': [str(t)[:24] for t in (s.get('tags') or [])][:3]})
    print('eklenen:', len(new))
    allv = (new + old)[:300]
    if dry:
        print(json.dumps(new, ensure_ascii=False, indent=1)); return
    json.dump(allv, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

main()
