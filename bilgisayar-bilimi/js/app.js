/* Bilgisayar bilimi: sayfa iskeleti, kenar çubuğu, ders sayfaları (tpl-cl) ve yönlendirme */
(function(){
const L=window.BB_LESSONS,NODES=window.BB_NODES,$=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
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
  h+=stage(3,'6️⃣ Örnek Çalışmalar',D.ornek,false);
  h+=stage(6,'7️⃣ Kendini Test Et','<div id="tst-'+k+'"></div>',false);
  h+='<div class="navrow"><span>'+(pv?'<a class="btn" href="#ders='+pv[0]+'">← '+esc(pv[2])+'</a>':'')+'</span><button class="btn" id="dn-'+k+'"></button><span>'+(nx?'<a class="btn" href="#ders='+nx[0]+'">'+esc(nx[2])+' →</a>':'')+'</span></div></div>';
  return h}
NODES.forEach(n=>{const k=n[0];if(!L[k])return;wrap.insertAdjacentHTML('beforeend',build(k,L[k]));
  const m=$('model-'+k);L[k].sim($('sim-'+k));
  const D=L[k];$('tst-'+k).innerHTML=D.test.map((q,qi)=>'<div class="q" data-i="'+qi+'"><b>'+(qi+1)+'. '+esc(q.q)+'</b>'+q.o.map((o,oi)=>'<span class="o" data-o="'+oi+'">'+esc(o)+'</span>').join('')+'<div class="w">'+esc(q.w)+'</div></div>').join('')+'<p class="mono sc" style="color:var(--ac)"></p>';
  let ok=0,c=0;m.querySelectorAll('.q').forEach(q=>{const qq=D.test[+q.dataset.i];q.querySelectorAll('.o').forEach(o=>o.onclick=()=>{if(q.classList.contains('done'))return;q.classList.add('done');c++;const g=+o.dataset.o===qq.a;if(g)ok++;o.classList.add(g?'ok':'bad');if(!g)q.querySelectorAll('.o')[qq.a].classList.add('ok');if(c===D.test.length)m.querySelector('.sc').textContent='Sonuç: '+ok+' / '+c})});
  const dn=$('dn-'+k),sync=()=>{const d=window.__ttDone&&window.__ttDone(k);dn.textContent=d?'✓ Tamamlandı':'✓ Bu dersi tamamladım';dn.className='btn'+(d?' on':'')};sync();dn.onclick=()=>{window.__ttMark(k);sync()};
  m.querySelectorAll('.tpl-head').forEach(h=>h.addEventListener('click',()=>{h.classList.toggle('closed');h.nextElementSibling.classList.toggle('closed')}));
});
/* yol haritası sayfası */
wrap.insertAdjacentHTML('afterbegin','<div class="model active" id="model-yol"><h1>🗺️ Bilgisayar Bilimi — Yol Haritası</h1><p class="sub">Hesaplamanın doğuşundan yapay zekâ ve geleceğe: 4 çağ, 40 ders. Bir derse tıkla; hazır olanlar <b>Sayfada aç</b> ile açılır. Ders sırası, bilgisayar bilimine giriş yapan bir ders serisinin başlık sırasını izler; anlatımlar kendi sözlerimle yazılıdır.</p><div class="pts" id="ttBox"><div id="techProg" style="font-size:14px;color:#ccd5e8;margin-bottom:10px"></div><div class="tt-lesonly" style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--muted);margin-bottom:12px"><span>✔ tamamlandı</span><span>◆ sıradaki</span><span>🔒 kilitli</span><span id="ttHint"></span></div><div id="ttTools"><span class="tt-lab">Harita</span><button id="ttFs">⛶ Tam ekran</button><span class="tt-lesonly" style="display:contents"><span class="tt-sep"></span><span class="tt-lab">Yön</span><button id="ttM_auto">Otomatik</button><button id="ttM_h">↔ Yatay</button><button id="ttM_v">↕ Dikey</button><span class="tt-sep"></span><span class="tt-lab">Boyut</span><button id="ttZm">−</button><button id="ttZv">%100</button><button id="ttZp">+</button></span></div><div id="ttScroll" style="overflow-x:auto"><svg id="techSvg" role="img"></svg></div><div id="techInfo" class="callout" style="margin-top:14px">Bir derse tıkla → ayrıntı burada açılsın.</div></div><span id="ttDir" hidden></span></div>');
const s=document.createElement('script');s.src='js/tree.js?v=202611221800';s.onload=()=>{route()};document.body.appendChild(s);
/* kenar çubuğu */
const ERA={early:['⚙️ DONANIM VE TARİH','46,134,255'],lang1:['💬 YAZILIM VE TEMELLER','156,77,255'],comp:['🌐 ARAYÜZLER VE AĞLAR','255,122,51'],ml:['🤖 YAPAY ZEKÂ VE GELECEK','64,200,170']};
nav.innerHTML='<button class="navbtn active" data-m="yol">🗺️ Yol Haritası</button>'+NODES.map(n=>(ERA[n[0]]?'<div class="sb-era" style="--era-c:'+ERA[n[0]][1]+'"><b>'+ERA[n[0]][0]+'</b></div>':'')+'<button class="navbtn'+(L[n[0]]?'':' soon')+'" data-m="'+n[0]+'">'+n[1]+' '+esc(n[2])+'</button>').join('');
nav.querySelectorAll('.navbtn').forEach(b=>b.onclick=()=>{const k=b.dataset.m;if(k==='yol'){location.hash='';return}L[k]?location.hash='#ders='+k:toast('Bu ders yakında.')});
function show(k){document.querySelectorAll('.model').forEach(m=>m.classList.toggle('active',m.id==='model-'+k));nav.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.m===k));window.scrollTo(0,0)}
function route(){const x=(location.hash.match(/^#ders=(\w+)/)||[])[1];show(x&&L[x]?x:'yol')}
addEventListener('hashchange',route);route();
})();
