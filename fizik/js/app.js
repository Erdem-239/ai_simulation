/* Bilgisayar bilimi: sayfa iskeleti, kenar çubuğu, ders sayfaları (tpl-cl) ve yönlendirme */
(function(){
const L=window.FZ_LESSONS,NODES=window.FZ_NODES,$=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuf=x=>{x=x.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
const wrap=$('pages'),nav=$('navList');
function toast(t){const e=$('csToast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)}
function stage(n,head,body,open,cls){return '<div class="tpl-cl" data-stage="'+n+'"><div class="tpl-head'+(open?'':' closed')+'"><span>'+head+'</span><span class="chev">▸</span></div><div class="tpl-body'+(open?'':' closed')+'">'+body+'</div></div>'}
function build(k,D){
  const idx=NODES.findIndex(n=>n[0]===k),nx=NODES.slice(idx+1).find(n=>L[n[0]]),pv=NODES.slice(0,idx).reverse().find(n=>L[n[0]]);
  let h='<div class="model cs" id="model-'+k+'">';
  h+=stage(1,'1️⃣ Giriş','<h1>'+D.icon+' '+esc(D.title)+'</h1><p class="sub">'+esc(D.lead)+'</p>'+D.intro,true);
  h+=stage(2,'2️⃣ Hikâye',D.story,true);
  h+=stage(3,'3️⃣ Gerçek Hayatta Nerede',D.real,false);
  h+=stage(4,'4️⃣ Nedir ve Nasıl Çalışır',D.what,false);
  h+=stage(5,'5️⃣ Simülasyon','<div id="sim-'+k+'"></div>',false);
  h+=stage('x','➕ Ekstra — Derinleşme',D.extra||'<p>Bu ders için ek bölüm yok.</p>',false);
  h+=stage(3,'6️⃣ Örnek Çalışmalar',D.ornek,false);
  h+=stage(6,'7️⃣ Kendini Test Et (soru havuzundan)','<div id="tst-'+k+'"></div>',false);
  h+='<div class="navrow"><span>'+(pv?'<a class="btn" href="#ders='+pv[0]+'">← '+esc(pv[2])+'</a>':'')+'</span><button class="btn" id="dn-'+k+'"></button><span>'+(nx?'<a class="btn" href="#ders='+nx[0]+'">'+esc(nx[2])+' →</a>':'')+'</span></div></div>';
  return h}
NODES.forEach(n=>{const k=n[0];if(!L[k])return;wrap.insertAdjacentHTML('beforeend',build(k,L[k]));
  const m=$('model-'+k);L[k].sim($('sim-'+k));
  const D=L[k];const tb=$('tst-'+k);
  const draw=()=>{const pool=shuf(D.test).slice(0,8);tb.innerHTML=pool.map((q,qi)=>{const ord=shuf(q.o.map((_,i)=>i));return '<div class="q" data-i="'+qi+'"><b>'+(qi+1)+'. '+esc(q.q)+'</b>'+ord.map(oi=>'<span class="o" data-o="'+oi+'">'+esc(q.o[oi])+'</span>').join('')+'<div class="w">'+esc(q.w)+'</div></div>'}).join('')+'<p class="mono sc" style="color:var(--ac)"></p><button class="btn" id="rt-'+k+'">↺ Yeni sorular çek</button>';
    let ok=0,c=0;tb.querySelectorAll('.q').forEach(q=>{const qq=pool[+q.dataset.i];q.querySelectorAll('.o').forEach(o=>o.onclick=()=>{if(q.classList.contains('done'))return;q.classList.add('done');c++;const g=+o.dataset.o===qq.a;if(g)ok++;o.classList.add(g?'ok':'bad');if(!g)q.querySelectorAll('.o').forEach(x=>{if(+x.dataset.o===qq.a)x.classList.add('ok')});if(c===pool.length){tb.querySelector('.sc').textContent='Sonuç: '+ok+' / '+c+(ok===c?' 🎉':'');try{const bk='fz_best_'+k;if(ok>(+localStorage.getItem(bk)||0))localStorage.setItem(bk,ok)}catch(e){}}})});
    $('rt-'+k).onclick=draw};draw();
  const dn=$('dn-'+k),sync=()=>{const d=window.__ttDone&&window.__ttDone(k);dn.textContent=d?'✓ Tamamlandı':'✓ Bu dersi tamamladım';dn.className='btn'+(d?' on':'')};sync();dn.onclick=()=>{window.__ttMark(k);sync()};
  m.querySelectorAll('.tpl-head').forEach(h=>h.addEventListener('click',()=>{h.classList.toggle('closed');h.nextElementSibling.classList.toggle('closed')}));
});
/* yol haritası sayfası */
wrap.insertAdjacentHTML('afterbegin','<div class="model active" id="model-yol"><h1>🗺️ Fizik — Evrenin Doğuşundan Günümüze</h1><p class="sub">Evrenin ilk anından bugüne, her şeyin nasıl oluştuğunu en küçükten en büyüğe sırayla öğren: 6 çağ, 28 ders. Her ders bir öncekinin üstüne kurulur (tümevarım). Hazır olanlar <b>Sayfada aç</b> ile açılır; anlatımlar kendi sözlerimle yazılıdır.</p><div class="pts" id="ttBox"><div id="techProg" style="font-size:14px;color:#ccd5e8;margin-bottom:10px"></div><div class="tt-lesonly" style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--muted);margin-bottom:12px"><span>✔ tamamlandı</span><span>◆ sıradaki</span><span>🔒 kilitli</span><span id="ttHint"></span></div><div id="ttTools"><span class="tt-lab">Harita</span><button id="ttFs">⛶ Tam ekran</button><span class="tt-lesonly" style="display:contents"><span class="tt-sep"></span><span class="tt-lab">Yön</span><button id="ttM_auto">Otomatik</button><button id="ttM_h">↔ Yatay</button><button id="ttM_v">↕ Dikey</button><span class="tt-sep"></span><span class="tt-lab">Boyut</span><button id="ttZm">−</button><button id="ttZv">%100</button><button id="ttZp">+</button></span></div><div id="ttScroll" style="overflow-x:auto"><svg id="techSvg" role="img"></svg></div><div id="techInfo" class="callout" style="margin-top:14px">Bir derse tıkla → ayrıntı burada açılsın.</div></div><span id="ttDir" hidden></span></div>');
const s=document.createElement('script');s.src='js/tree.js?v=202611222000';s.onload=()=>{route()};document.body.appendChild(s);
/* kenar çubuğu */
const ERA={newton:['🧰 ALET ÇANTASI','150,170,255'],planck:['⏱️ İLK AN','169,139,255'],hadron:['⚛️ PARÇACIKTAN ÇEKİRDEĞE','255,122,170'],atom:['💡 İLK IŞIK VE KARANLIK MADDE','255,201,60'],yildiz:['⭐ YILDIZLAR VE ELEMENTLER','80,200,240'],gunes:['🪐 GEZEGENLER VE ZAMAN','120,220,150']};
nav.innerHTML='<button class="navbtn active" data-m="yol">🗺️ Yol Haritası</button>'+NODES.map(n=>(ERA[n[0]]?'<div class="sb-era" style="--era-c:'+ERA[n[0]][1]+'"><b>'+ERA[n[0]][0]+'</b></div>':'')+'<button class="navbtn'+(L[n[0]]?'':' soon')+'" data-m="'+n[0]+'">'+n[1]+' '+esc(n[2])+'</button>').join('');
const EQ={kuant:['🧰 Alet çantası testi',['newton','enerji','em','isik','kuant']],kuark:['⏱️ İlk an testi',['planck','kuvvet','enflasyon','madde','higgs','kuark']],nukleo:['⚛️ Parçacık testi',['hadron','notrino','nukleo']]};
Object.keys(EQ).forEach(k=>{});
function eraTest(key){const ids=EQ[key][1].filter(i=>L[i]);const pool=[];ids.forEach(i=>shuf(L[i].test).slice(0,2).forEach(q=>pool.push(q)));
  const qs=shuf(pool).slice(0,14);let m=$('csModal');if(!m){m=document.createElement('div');m.id='csModal';document.body.appendChild(m)}
  m.innerHTML='<div class="cm-box cs"><button class="btn cm-x">✕</button><h2>'+EQ[key][0]+'</h2><p class="sub">Her dersten karışık sorular ('+qs.length+' soru).</p>'+qs.map((q,qi)=>{const ord=shuf(q.o.map((_,i)=>i));return '<div class="q" data-i="'+qi+'"><b>'+(qi+1)+'. '+esc(q.q)+'</b>'+ord.map(oi=>'<span class="o" data-o="'+oi+'">'+esc(q.o[oi])+'</span>').join('')+'<div class="w">'+esc(q.w)+'</div></div>'}).join('')+'<p class="mono sc" style="color:var(--ac)"></p></div>';
  m.classList.add('on');let ok=0,c=0;m.querySelectorAll('.q').forEach(q=>{const qq=qs[+q.dataset.i];q.querySelectorAll('.o').forEach(o=>o.onclick=()=>{if(q.classList.contains('done'))return;q.classList.add('done');c++;const g=+o.dataset.o===qq.a;if(g)ok++;o.classList.add(g?'ok':'bad');if(!g)q.querySelectorAll('.o').forEach(x=>{if(+x.dataset.o===qq.a)x.classList.add('ok')});if(c===qs.length)m.querySelector('.sc').textContent='Sonuç: '+ok+' / '+c})});
  m.querySelector('.cm-x').onclick=()=>m.classList.remove('on')}
nav.querySelectorAll('.navbtn[data-m]').forEach(b=>b.onclick=()=>{const k=b.dataset.m;if(k==='yol'){location.hash='';return}L[k]?location.hash='#ders='+k:toast('Bu ders yakında.')});
Object.keys(EQ).forEach(k=>{const b=nav.querySelector('[data-m="'+k+'"]');const lastId=EQ[k][1][EQ[k][1].length-1];const t=nav.querySelector('[data-m="'+lastId+'"]');if(t)t.insertAdjacentHTML('afterend','<button class="navbtn navbtn-test" data-et="'+k+'">'+EQ[k][0]+'</button>')});
nav.querySelectorAll('[data-et]').forEach(b=>b.onclick=()=>eraTest(b.dataset.et));
function show(k){document.querySelectorAll('.model').forEach(m=>m.classList.toggle('active',m.id==='model-'+k));nav.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.m===k));window.scrollTo(0,0)}
function route(){const x=(location.hash.match(/^#ders=(\w+)/)||[])[1];show(x&&L[x]?x:'yol')}
addEventListener('hashchange',route);route();
})();
