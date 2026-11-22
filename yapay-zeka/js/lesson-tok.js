// ✂️ Tokenizasyon (BPE) dersi (#model-tok):
//  Simülasyon: küçük bir metinde BPE'yi adım adım öğret — en sık yan yana iki parçayı birleştir,
//              kural listesi, sözlük boyu ↔ metnin parça sayısı, yeni kelimeyi öğrenilen kurallarla parçala.
//  Örnek Çalışmalar: (1) ilk 10 kural, (2) sözlük büyüdükçe parça sayısı, (3) görmediği kelimeler.
//  Motor sayfadaki Python koduyla (bpe.py) birebir aynı: eşitlikte alfabetik sıra, soldan sağa birleştirme.
(function(){
  const host=document.getElementById('tokSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const PRE={
    tr:"evler evlerde evden kitaplar kitaplarda kitaptan okullar okullarda okuldan gözler gözlerde gözden yollar yollarda yoldan elmalar elmalarda elmadan kediler kedilerde kediden kuşlar kuşlarda kuştan dağlar dağlarda dağdan şehirler şehirlerde şehirden",
    en:"low low low low low lower lower newest newest newest newest newest newest widest widest widest"
  };
  // ---- motor (Python bpe.py ile aynı) ----
  function sayac(m){const S=new Map();for(const k of m.split(/\s+/).filter(Boolean)){const w=['▁',...k];const key=w.join('\u0001');const o=S.get(key);if(o)o.n++;else S.set(key,{w,n:1});}return [...S.values()];}
  function ciftler(S){const C=new Map(),ord=[];for(const {w,n} of S)for(let i=0;i+1<w.length;i++){const k=w[i]+'\u0001'+w[i+1];if(!C.has(k)){C.set(k,{a:w[i],b:w[i+1],n:0});ord.push(k);}C.get(k).n+=n;}return [...C.values()];}
  const better=(x,y)=>x.n!==y.n?x.n>y.n:(x.a!==y.a?x.a<y.a:x.b<y.b);
  function birlestir(w,a,b){const o=[];let i=0;while(i<w.length){if(i+1<w.length&&w[i]===a&&w[i+1]===b){o.push(a+b);i+=2;}else{o.push(w[i]);i++;}}return o;}
  function ogren(m,adim){let S=sayac(m);const K=[];for(let s=0;s<adim;s++){const C=ciftler(S);if(!C.length)break;let best=C[0];for(const c of C)if(better(c,best))best=c;K.push(best);S=S.map(({w,n})=>({w:birlestir(w,best.a,best.b),n}));}return {K,S};}
  function kodla(k,K){let w=['▁',...k];for(const r of K)w=birlestir(w,r.a,r.b);return w;}
  const toplam=S=>{let t=0;for(const {w,n} of S)t+=w.length*n;return t;};
  const alfabe=m=>new Set(['▁',...m.replace(/\s+/g,'')]).size;
  window.__tok={sayac,ciftler,ogren,kodla,toplam,alfabe,PRE};
  // ---- renkli parça ----
  const hue=t=>{let h=0;for(const c of t)h=(h*31+c.codePointAt(0))%360;return h;};
  const chip=t=>'<span class="tk-chip" style="background:hsl('+hue(t)+',55%,28%);border-color:hsl('+hue(t)+',60%,48%)">'+esc(t)+'</span>';
  const chips=w=>w.map(chip).join('');
  // ---- durum ----
  let txt=PRE.tr, steps=0, cache=null;
  const run=()=>{if(!cache||cache.steps!==steps||cache.txt!==txt){cache={steps,txt,...ogren(txt,steps)};}return cache;};
  function draw(){
    const {K,S}=run(), A=alfabe(txt), T0=toplam(sayac(txt)), T=toplam(S), C=ciftler(S);
    const done=!C.length;
    $('tokStepN').textContent=K.length;
    $('tokVocab').textContent=A+K.length; $('tokTotal').textContent=T; $('tokT0').textContent=T0;
    // metin görünümü
    $('tokWords').innerHTML=S.map(({w,n})=>'<div class="tk-row">'+chips(w)+(n>1?'<span class="tk-n">×'+n+'</span>':'')+'</div>').join('');
    // en sık çiftler
    const top=[...C].sort((x,y)=>better(x,y)?-1:better(y,x)?1:0).slice(0,6);
    $('tokPairs').innerHTML=done?'<i>Birleştirilecek çift kalmadı: her kelime tek parça.</i>':
      '<table class="tk-tbl"><tr><th>çift</th><th>kaç kez</th></tr>'+top.map((c,i)=>'<tr'+(i===0?' class="on"':'')+'><td>'+chip(c.a)+' + '+chip(c.b)+'</td><td>'+c.n+(i===0?' ← sıradaki':'')+'</td></tr>').join('')+'</table>';
    // kurallar
    $('tokRules').innerHTML=K.length?K.map((r,i)=>'<span class="tk-rule"><b>'+(i+1)+'.</b> '+esc(r.a)+'+'+esc(r.b)+'→'+chip(r.a+r.b)+'</span>').join(''):'<i>Henüz kural yok: sözlük yalnız tek tek harflerden oluşuyor.</i>';
    // öğretmen: adım
    let st;
    if(!K.length) st='<b class="h">✏️ Bu adımda</b>Başlangıç: her kelime harflerine bölündü, başına kelime başı işareti <b>▁</b> kondu. Sözlük = metindeki farklı harfler + ▁ = <b>'+A+'</b> parça. Bütün metin <b>'+T0+'</b> parça tutuyor.';
    else{const r=K[K.length-1];st='<b class="h">✏️ Bu adımda (kural '+K.length+')</b>Bütün metinde yan yana duran çiftler sayıldı. En sık çift '+chip(r.a)+' + '+chip(r.b)+' → <b>'+r.n+' kez</b>. Bu çift yeni tek parça yapıldı: '+chip(r.a+r.b)+'.<br>Sözlük <b>'+(A+K.length-1)+' → '+(A+K.length)+'</b> parça; metin <b>'+toplam(ogren(txt,K.length-1).S)+' → '+T+'</b> parça (bu çiftin her geçtiği yerde 2 parça 1 oldu: −'+r.n+').';}
    $('tokStep').innerHTML=st;
    // öğretmen: sözel
    const words=S.reduce((s,x)=>s+x.n,0), whole=S.filter(x=>x.w.length===1).reduce((s,x)=>s+x.n,0);
    const longest=[...new Set(K.map(r=>r.a+r.b))].sort((x,y)=>[...y].length-[...x].length)[0];
    let soz='<b class="h">🗣️ Ne anlama geliyor?</b>Metin '+words+' kelime; şu an kelime başına ortalama <b>'+(T/words).toFixed(2).replace('.',',')+'</b> parça (başta '+(T0/words).toFixed(2).replace('.',',')+'). ';
    if(!K.length) soz+='Harf düzeyinde hiçbir kelime bilinmiyor ama hiçbir kelime de "tanınmaz" değil: her şey harflerden yazılabilir.';
    else if(whole===words) soz+='Artık her kelime tek parça: sözlük kelime listesine dönüştü. Bu metni çok kısa yazarız ama <b>hiç görmediği kelimede</b> yine harflere düşer — aşağıdaki kutuda dene.';
    else soz+='Öğrenilen en uzun parça '+chip(longest)+'. Sık geçen ekler ve kökler önce birleşir; nadir kelimeler daha uzun süre parçalı kalır. '+(whole?whole+' kelime şimdiden tek parça.':'Henüz hiçbir kelime tek parça değil.');
    $('tokSoz').innerHTML=soz;
    // yeni kelime
    const tw=($('tokTry').value||'').trim().split(/\s+/).filter(Boolean);
    $('tokTryOut').innerHTML=tw.length?tw.map(k=>{const p=kodla(k,K);return '<div class="tk-row">'+chips(p)+'<span class="tk-n">'+p.length+' parça</span></div>';}).join(''):'<i>bir kelime yaz</i>';
    $('tokNext').disabled=$('tokNext5').disabled=$('tokNext20').disabled=done;
  }
  const go=n=>{const C=ciftler(run().S);if(!C.length)return;steps=run().K.length+n;draw();};
  $('tokNext').onclick=()=>go(1); $('tokNext5').onclick=()=>go(5); $('tokNext20').onclick=()=>go(20);
  $('tokReset').onclick=()=>{steps=0;draw();};
  $('tokTry').oninput=draw;
  host.querySelectorAll('.tok-pre').forEach(b=>b.onclick=()=>{
    host.querySelectorAll('.tok-pre').forEach(x=>x.classList.toggle('on',x===b));
    const k=b.dataset.p; $('tokOwnBox').style.display=k==='own'?'':'none';
    txt=k==='own'?($('tokOwn').value||' '):PRE[k]; steps=0;
    $('tokTry').value=k==='en'?'lowest newer':k==='tr'?'kitaplarımızdan masalarda':'';
    draw();});
  $('tokOwn').oninput=()=>{txt=$('tokOwn').value||' ';steps=0;draw();};
  draw();

  // ---- Örnek Çalışmalar ----
  const T=PRE.tr, A=alfabe(T);
  const e1=$('tokEx1'); if(e1){const {K}=ogren(T,10);
    e1.innerHTML='<table class="tk-tbl"><tr><th>#</th><th>birleşen çift</th><th>yeni parça</th><th>kaç kez</th></tr>'+K.map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+chip(r.a)+' + '+chip(r.b)+'</td><td>'+chip(r.a+r.b)+'</td><td>'+r.n+'</td></tr>').join('')+'</table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> İlk kurallar Türkçenin ekleri: '+chip('da')+', '+chip('lar')+', '+chip('ler')+', '+chip('larda')+'. Kimse "ek" kavramını öğretmedi — yalnızca sayıldı, ekler kelimelerden çok daha sık geçtiği için önce onlar parça oldu.</div>';}
  const e2=$('tokEx2'); if(e2){const pts=[];const max=ogren(T,999).K.length;for(let m=0;m<=max;m++)pts.push([m,toplam(ogren(T,m).S)]);
    const X=m=>40+m/max*400, Y=v=>150-v/260*130;
    let s='<svg viewBox="0 0 470 180" style="width:100%;max-width:520px;display:block"><rect width="470" height="180" fill="#0d1426" rx="8"/>';
    [0,100,200].forEach(v=>s+='<line x1="40" x2="440" y1="'+Y(v)+'" y2="'+Y(v)+'" stroke="#1f2a46"/><text x="34" y="'+(Y(v)+3)+'" font-size="9" text-anchor="end" fill="#95a2c2">'+v+'</text>');
    s+='<polyline fill="none" stroke="#5aa0ff" stroke-width="2.5" points="'+pts.map(p=>X(p[0])+','+Y(p[1])).join(' ')+'"/>';
    s+='<polyline fill="none" stroke="#f0a032" stroke-width="2" stroke-dasharray="5 4" points="'+pts.map(p=>X(p[0])+','+Y(A+p[0])).join(' ')+'"/>';
    [0,20,40,max].forEach(m=>s+='<text x="'+X(m)+'" y="168" font-size="9" text-anchor="middle" fill="#95a2c2">'+m+'</text>');
    s+='<text x="440" y="178" font-size="9" text-anchor="end" fill="#95a2c2">kural sayısı →</text></svg>';
    const rows=[0,5,10,20,40,60,max].map(m=>'<tr><td>'+m+'</td><td>'+(A+m)+'</td><td>'+toplam(ogren(T,m).S)+'</td></tr>').join('');
    e2.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start"><div style="flex:1 1 340px;max-width:520px">'+s+'<div class="nl-legend"><span><span class="nl-sw" style="background:#5aa0ff"></span>metnin parça sayısı</span><span><span class="nl-sw" style="background:#f0a032"></span>sözlük boyu</span></div></div><table class="tk-tbl"><tr><th>kural</th><th>sözlük</th><th>metin (parça)</th></tr>'+rows+'</table></div>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> İki çizgi kesişiyor: sözlük büyüdükçe metin kısalıyor. '+max+' kuralda her kelime tek parça (30 parça) ama sözlük '+(A+max)+' oldu — bu artık kelime listesi. Gerçek modeller ortada bir yer seçer: GPT-2 50.257, GPT-4o\'nun tokenizer\'ı yaklaşık 200 bin parça.</div>';}
  const e3=$('tokEx3'); if(e3){const {K}=ogren(T,25);
    const f=()=>{const ws=(($('tokEx3in')||{}).value||'').trim().split(/\s+/).filter(Boolean);$('tokEx3out').innerHTML=ws.map(k=>{const p=kodla(k,K);return '<div class="tk-row"><span style="min-width:150px;display:inline-block;color:#ccd5e8">'+esc(k)+'</span>'+chips(p)+'</div>';}).join('');};
    e3.innerHTML='<div class="nl-ctl"><label>kelimeler <input id="tokEx3in" style="width:340px;max-width:70vw" value="kitaplarımızdan evlerimizde masalarda çiçeklerden araba"></label></div><div id="tokEx3out"></div>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> Metinde hiç geçmeyen '+chip('▁k')+chip('itap')+chip('lar')+'… bile parçalanabildi: bildiği parçaları (kök, '+chip('lar')+', '+chip('dan')+') kullanır, bilmediğini harflere böler. <b>"Bilinmeyen kelime" diye bir şey yok.</b> Gerçek tokenizer\'lar harf yerine <b>bayt</b>tan başladığı için (256 bayt) emoji ve hiç görülmemiş alfabeler bile yazılabilir.</div>';
    $('tokEx3in').oninput=f; f();}
})();
