// Transformer Bloğu → Simülasyon: minik blok animasyonu + 3B (kedi balığı yedi, d=4).
(function(){
  const host=document.getElementById('tfAnim'); if(!host) return;
  const TOK=['kedi','balığı','yedi'], DIM=['hayvan','yemek','eylem','geçmiş'], HD=['h1','h2','h3','h4','h5','h6'];
  const X=[[1,0,0,0],[0,1,0,0],[0,0,1,1]];
  const WQ=[[0,1],[1,0],[1.5,1.5],[0,0]], WK=[[2,0],[0,2],[0,0],[0,0]];
  const W1=[[1,-1,0,1,0,0.5],[0,1,1,-1,0.5,0],[-1,0,1,0,1,-0.5],[0.5,0,-1,0,1,1]];
  const W2=[[0.5,0,0,0],[0,0.5,0,0],[0,0,0.5,0],[0,0,0,0.5],[0.5,0.5,0,0],[0,0,0.5,0.5]];
  const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((t,v,k)=>t+v*B[k][j],0)));
  const tr=A=>A[0].map((_,j)=>A.map(r=>r[j]));
  const S=mm(mm(X,WQ),tr(mm(X,WK))).map(r=>r.map(v=>v/Math.SQRT2));
  const A=S.map(r=>{const e=r.map(Math.exp),t=e.reduce((a,b)=>a+b,0);return e.map(v=>v/t);});
  const ATT=mm(A,X), R1=X.map((r,i)=>r.map((v,j)=>v+ATT[i][j]));
  const ln=r=>{const m=r.reduce((a,b)=>a+b,0)/r.length,v=r.reduce((a,b)=>a+(b-m)*(b-m),0)/r.length,s=Math.sqrt(v+1e-5);return r.map(x=>(x-m)/s);};
  const N1=R1.map(ln), H=mm(N1,W1).map(r=>r.map(v=>Math.max(0,v))), F=mm(H,W2), R2=N1.map((r,i)=>r.map((v,j)=>v+F[i][j])), O=R2.map(ln);
  const mean=r=>r.reduce((a,b)=>a+b,0)/r.length, sd=r=>{const m=mean(r);return Math.sqrt(r.reduce((a,b)=>a+(b-m)*(b-m),0)/r.length+1e-5);};
  const f=v=>{const r=Math.round(v*100)/100; return (Object.is(r,-0)?0:r).toString().replace('.',',');};
  const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), st=(t,i,n)=>cl(t*n-i);
  const cv=document.createElement('canvas'); cv.width=1000; cv.height=500; cv.style.cssText='width:100%;height:auto;display:block;background:#0d1117;border:1px solid var(--line);border-radius:10px';
  const g=cv.getContext('2d');
  host.innerHTML='<div class="mha-top"><div class="mha-steps" id="tfaSteps"></div><div class="mha-bar"><button class="addbtn" id="tfaPrev">◀ Geri</button><button class="addbtn" id="tfaPlay">⏸ Duraklat</button><button class="addbtn" id="tfaRe">↺ Baştan</button><button class="addbtn" id="tfaNext">İleri ▶</button><div class="mha-scrw"><input type="range" id="tfaScr" min="0" max="1000" value="0" class="mha-scr"><div class="mha-tk" id="tfaTk"></div></div><label>Hız <select id="tfaSpd"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div></div><div class="mha-grid"><div class="mha-3d"><iframe id="tfa3d" title="Minik 3B mimari" src="'+(host.dataset['3d']||'')+'"></iframe></div><div id="tfaCv"></div></div><div class="mha-boxes"><div class="mha-box mha-goal" id="tfaGoal"></div><div class="mha-box mha-soz" id="tfaSoz"></div><div class="mha-box mha-elde" id="tfaElde"></div></div>';
  document.getElementById('tfaCv').appendChild(cv);
  // ---- çizim yardımcıları ----
  function txt(s,x,y,c,sz,al){g.fillStyle=c||'#cdd4e4';g.font=(sz||13)+'px Consolas,monospace';g.textAlign=al||'left';g.fillText(s,x,y);}
  function mat(M,x,y,o){o=o||{}; const cw=o.cw||40, ch=o.ch||28, al=o.alpha==null?1:o.alpha; if(al<=0) return;
    g.save(); g.globalAlpha=al;
    M.forEach((r,i)=>r.forEach((v,j)=>{
      const rev=o.rev?o.rev(i,j):1; if(rev<=0) return;
      const isM=v===null; const a=isM?0:cl(Math.abs(v)/2)*.75+(v===0?0:.12);
      g.fillStyle=isM?'#2a2f3a':(v>=0?'rgba(74,163,255,'+a+')':'rgba(255,107,107,'+a+')');
      g.globalAlpha=al*rev; g.fillRect(x+j*cw,y+i*ch,cw-2,ch-2);
      txt(isM?'−∞':f(v),x+j*cw+(cw-2)/2,y+i*ch+ch/2+4,isM?'#888':'#fff',o.fs||12,'center');
    }));
    g.globalAlpha=al; g.strokeStyle=o.col||'#3b4660'; g.lineWidth=o.col?2:1; g.strokeRect(x-2,y-2,M[0].length*cw+2,M.length*ch+2);
    if(o.title) txt(o.title,x,y-9,o.col||'#9fb0d0',12);
    if(o.rows) o.rows.forEach((s,i)=>txt(s,x-6,y+i*ch+ch/2+4,'#9fb0d0',11,'right'));
    if(o.cols) o.cols.forEach((s,j)=>txt(s,x+j*cw+(cw-2)/2,y+M.length*ch+13,'#9fb0d0',10.5,'center'));
    if(o.hr!=null){g.strokeStyle='#ffd24a';g.lineWidth=2.5;g.strokeRect(x-1,y+o.hr*ch-1,M[0].length*cw,ch);}
    g.restore();}
  function dots(M,x,y,o){o=o||{}; const c=o.c||40, al=o.alpha==null?1:o.alpha; g.save(); g.globalAlpha=al;
    g.strokeStyle='#3b4660'; g.strokeRect(x-2,y-2,M[0].length*c+2,M.length*c+2);
    M.forEach((r,i)=>r.forEach((v,j)=>{const cx=x+j*c+c/2-1, cy=y+i*c+c/2-1; g.fillStyle=v>0?'rgba(235,240,255,'+(.25+.75*v)+')':'#1a2030'; g.beginPath(); g.arc(cx,cy,Math.max(1.5,v*c*.45),0,7); g.fill(); if(v>0) txt(Math.round(v*100)+'%',x+j*c+c-3,y+i*c+c-5,'#ffd24a',9.5,'right');}));
    if(o.title) txt(o.title,x,y-9,o.col||'#9fb0d0',12);
    if(o.rows) o.rows.forEach((s,i)=>txt(s,x-6,y+i*c+c/2+4,'#9fb0d0',11,'right'));
    if(o.cols) o.cols.forEach((s,j)=>txt(s,x+j*c+c/2-1,y-24+(o.title?0:14),'#9fb0d0',10.5,'center'));
    if(o.hr!=null){g.strokeStyle='#ffd24a';g.lineWidth=2.5;g.strokeRect(x-1,y+o.hr*c-1,M[0].length*c,c);}
    g.restore();}
  function op(s,x,y,al){g.save();g.globalAlpha=al==null?1:al;txt(s,x,y,'#ffd24a',20,'center');g.restore();}
  const SC=[
   {tag:'Girdi',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Bir Transformer <b>bloğuna</b> giren şey: «kedi balığı yedi» cümlesinin üç kartı, her biri 4 sayı (X, 3×4). Blok bu üç kartı alıp <b>aynı şekilde</b> (3×4) geri verecek — ama kartlar daha bilgili olacak.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Blok bir <b>toplantı odası</b> gibi: üç kişi (kelime) girer, odadan çıkarken hâlâ üç kişi vardır ama herkes öteki ikisinden bir şeyler öğrenmiştir. Odanın içinde sırayla dört iş yapılır: konuşma (attention), not ekleme (residual), ses dengeleme (LayerNorm), tek başına düşünme (FFN).',
    elde:'<b>📦 Elde ettik:</b> X (3×4). Blok boyunca şekil hep 3×4 kalır; bu yüzden blokları üst üste dizebiliriz.',
    draw:t=>{mat(X,330,110,{cw:70,ch:46,rows:TOK,title:'X  (3 kelime × 4 boyut)',alpha:st(t,0,2),fs:14});
      DIM.forEach((s,j)=>txt(s,330+j*70+34,92,'#9fb0d0',11,'center'));
      txt('→ blok: şekil değişmez (3×4 girer, 3×4 çıkar)',330,330,'#9fb0d0',13);}},
   {tag:'Self-attention',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Her kelime öteki kelimelere bakıp onlardan <b>yüzdeli bir karışım</b> alır (önceki dersin konusu). Burada kısaca: A = dikkat yüzdeleri, ATT = A·X (3×4). Sade tutmak için W<sub>V</sub> ve W<sub>O</sub> birim kabul edildi.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «yedi» dikkatini %'+Math.round(A[2][0]*100)+' kediye, %'+Math.round(A[2][1]*100)+' balığa verdi; ATT satırı = bu iki kartın karışımı: ['+ATT[2].map(f).join(', ')+']. Bu, toplantıda <b>herkesin herkesi dinlemesi</b>: kelimeler arası <b>bilgi alışverişi</b> yalnızca burada olur.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🏢 <b>Toplantı benzetmesi:</b> herkes konuşur, herkes dinler. Ama dinledikten sonra elimizde <b>yalnızca duydukları</b> var; kendi eski kartı henüz yok — bir sonraki adım bunu düzeltir.</div>',
    elde:'<b>📦 Elde ettik:</b> ATT (3×4): her kelimenin çevresinden topladığı bilgi. Henüz X ile birleşmedi.',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      mat(X,40,110,{cw:46,ch:34,title:'X',alpha:a0,fs:12,rows:TOK,cols:DIM}); op('→',270,170,a0);
      dots(A,310,110,{c:56,title:'A (dikkat yüzdeleri)',col:'#ffd24a',alpha:a1,rows:TOK,cols:TOK,hr:2});
      op('A · X =',560,170,a2); mat(ATT,640,110,{cw:46,ch:34,title:'ATT',alpha:a2,fs:12,rows:TOK,hr:2,col:'#ff9b3d'});
      txt('sarı satır: «yedi»',40,330,'#ffd24a',13);}},
   {tag:'Residual: X + ATT',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Attention çıktısı kelimenin <b>eski kartına eklenir</b>: R1 = X + ATT (kestirme yol, «residual»). Eski kart silinmez, üstüne not yazılır.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «yedi»: eski kart ['+X[2].map(f).join(', ')+'] + dinlediği ['+ATT[2].map(f).join(', ')+'] = <b>['+R1[2].map(f).join(', ')+']</b>. Kelime kendi kimliğini (eylem, geçmiş) <b>kaybetmeden</b> hayvan ve yemek bilgisini de aldı.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🏢 <b>Toplantı benzetmesi:</b> toplantıdan sonra kendi defterini <b>silip yeniden yazmazsın</b>; eski sayfanın altına «toplantıda şunu öğrendim» diye not eklersin. Bu yüzden derin ağlarda eski bilgi ve gradyan kaybolmaz.</div>',
    elde:'<b>📦 Elde ettik:</b> R1 (3×4) = eski bilgi + yeni bilgi. Bu toplama, blokları 12–96 kat üst üste dizmeyi mümkün kılan «otoban»dır.',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      mat(X,40,110,{cw:46,ch:34,title:'X (eski kart)',alpha:a0,fs:12,rows:TOK,cols:DIM,hr:2}); op('+',250,170,a1);
      mat(ATT,280,110,{cw:46,ch:34,title:'ATT (dinlediği)',alpha:a1,fs:12,hr:2,cols:DIM,col:'#ff9b3d'}); op('=',500,170,a2);
      mat(R1,530,110,{cw:50,ch:34,title:'R1 = X + ATT',alpha:a2,fs:12,hr:2,cols:DIM,col:'#5fd18a'});
      txt('sarı satır: «yedi» — eylem/geçmiş duruyor, hayvan/yemek eklendi',40,330,'#ffd24a',13);}},
   {tag:'LayerNorm',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Her <b>satırı</b> kendi içinde ayarlarız: satırın ortalamasını çıkarıp standart sapmasına böleriz → her kelimenin 4 sayısı ortalama 0, yayılım 1 olur (LayerNorm; burada γ=1, β=0).',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «yedi» satırı ['+R1[2].map(f).join(', ')+']: ortalama '+f(mean(R1[2]))+', std '+f(sd(R1[2]))+'. Her sayıdan ortalama çıkarılıp std\'ye bölününce → ['+N1[2].map(f).join(', ')+']. Satırın <b>deseni</b> (hangi boyut yüksek) korunur, yalnız <b>ölçeği</b> standartlaşır.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🏢 <b>Toplantı benzetmesi:</b> kimi herkes bağırarak, kimi fısıldayarak konuşmuş olabilir; ses seviyesini <b>eşitlersin</b> ki bir sonraki adım kimsenin sesinden şaşırmasın. Ne söylendiği değişmez, sadece ses düzeyi.</div>',
    elde:'<b>📦 Elde ettik:</b> N1 (3×4): her satırın ortalaması 0, std 1. Katman katman yığılırken sayıların taşmasını/sönmesini önler.',
    draw:t=>{const a0=st(t,0,2),a1=st(t,1,2);
      mat(R1,60,110,{cw:50,ch:34,title:'R1',alpha:a0,fs:12,rows:TOK,cols:DIM,hr:2});
      op('(x − ort) ÷ std →',420,170,a1);
      mat(N1,590,110,{cw:56,ch:34,title:'N1 = LayerNorm(R1)',alpha:a1,fs:12,rows:TOK,cols:DIM,hr:2,col:'#5fd18a'});
      txt('«yedi» satırı: ort '+f(mean(R1[2]))+' → 0, std '+f(sd(R1[2]))+' → 1',60,330,'#ffd24a',13);
      txt('her satır KENDİ içinde ayarlanır (kelimeler birbirine karışmaz)',60,356,'#9fb0d0',12);}},
   {tag:'FFN: tek başına düşünme',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Her kelime kartı <b>tek başına</b> küçük bir sinir ağından geçer: 4 → 6 (W<sub>1</sub>), ReLU (negatifleri sıfırla), 6 → 4 (W<sub>2</sub>). Kelimeler birbirine bakmaz; aynı ağ üç satıra ayrı ayrı uygulanır.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «yedi» satırı N1·W<sub>1</sub> = ['+mm([N1[2]],W1)[0].map(f).join(', ')+'] → ReLU → H = ['+H[2].map(f).join(', ')+'] (negatifler 0) → ·W<sub>2</sub> → F = ['+F[2].map(f).join(', ')+'].'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🏢 <b>Toplantı benzetmesi:</b> toplantıdan sonra herkes <b>kendi masasında</b>, duyduklarını tek başına sindirir. Attention = <b>kelimeler arası</b> konuşma, FFN = <b>kelimenin kendi içinde</b> düşünme. İkisi birbirini tamamlar.</div>',
    elde:'<b>📦 Elde ettik:</b> F (3×4): her kelimenin kendi başına ürettiği «düşünce». Gerçek modellerde FFN, d_model\'in 4 katına genişler (burada 4→6 oyuncak).',
    draw:t=>{const a0=st(t,0,4),a1=st(t,1,4),a2=st(t,2,4),a3=st(t,3,4);
      mat(N1,20,110,{cw:34,ch:30,title:'N1',alpha:a0,fs:11,rows:TOK,hr:2}); op('·',176,160,a0);
      mat(W1,195,100,{cw:32,ch:26,title:'W1 4×6',alpha:a1,fs:10,col:'#b592f0'}); op('→ReLU→',400,160,a2);
      mat(H,470,110,{cw:34,ch:30,title:'H = ReLU(N1·W1)  3×6',alpha:a2,fs:11,hr:2});
      op('·W2 =',700,160,a3); mat(F,740,110,{cw:46,ch:30,title:'F',alpha:a3,fs:11,hr:2,col:'#ff9b3d'});
      txt('sarı satır: «yedi» — her satır ayrı ayrı, aynı W ile',20,330,'#ffd24a',13);}},
   {tag:'Add & Norm (ikinci kez)',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> FFN çıktısı da kestirme yolla eklenir ve yine LayerNorm yapılır: R2 = N1 + F, çıkış = LayerNorm(R2). Böylece <b>blok bitti</b>.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «yedi»: N1 ['+N1[2].map(f).join(', ')+'] + F ['+F[2].map(f).join(', ')+'] = ['+R2[2].map(f).join(', ')+'] → LayerNorm → <b>['+O[2].map(f).join(', ')+']</b>. Yani kelime ne düşündüyse eski kartına eklendi, sonra ses seviyesi yine dengelendi.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🏢 <b>Toplantı benzetmesi:</b> kendi düşünceni de defterine <b>not olarak eklersin</b> (silmeden), sonra ses seviyeni tekrar eşitlersin ve odadan çıkarsın.</div>',
    elde:'<b>📦 Elde ettik:</b> OUT (3×4): bloğun çıktısı. Şekli girdiyle aynı olduğu için bir sonraki blok doğrudan bunu girdi alır.',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      mat(N1,30,110,{cw:44,ch:32,title:'N1',alpha:a0,fs:12,rows:TOK,hr:2}); op('+',230,170,a0);
      mat(F,260,110,{cw:44,ch:32,title:'F',alpha:a0,fs:12,hr:2,col:'#ff9b3d'}); op('=',460,170,a1);
      mat(R2,490,110,{cw:44,ch:32,title:'R2',alpha:a1,fs:12,hr:2}); op('LN →',700,170,a2);
      mat(O,760,110,{cw:50,ch:32,title:'OUT',alpha:a2,fs:11,hr:2,col:'#5fd18a'});
      txt('sarı satır: «yedi»',30,330,'#ffd24a',13);}},
   {tag:'N blok üst üste',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Tek blok = <b>Attention → Add&Norm → FFN → Add&Norm</b>. GPT-2\'de 12, GPT-3\'te 96 böyle blok üst üste dizilir; her bloğun çıktısı bir sonrakinin girdisi, her blokta <b>ayrı W\'ler</b>.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Her blokta kelimeler bir toplantı daha yapar: birinci blok «kim kiminle ilgili»yi, sonraki bloklar daha soyut ilişkileri (özne-nesne, anlam) yakalar. Her toplantının sonunda <b>eski defter korunur</b> (iki residual), bu yüzden 96 kat bile gradyan akabilir.',
    elde:'<b>📦 Elde ettik:</b> Transformer = aynı bloğun (farklı ağırlıklarla) N kez tekrarı. Şekil hep 3×4 (gerçekte T×d_model).',
    draw:t=>{const n=6,a=st(t,0,1);
      for(let i=0;i<n;i++){const al=cl(a*n-i*0.6)*(i<4?1:.5);g.save();g.globalAlpha=al;g.fillStyle='#161d2c';g.strokeStyle=i===0?'#ffd24a':'#4a5878';g.lineWidth=i===0?2.5:1.5;g.fillRect(60+i*150,140,120,150);g.strokeRect(60+i*150,140,120,150);g.restore();
        g.save();g.globalAlpha=al;txt('blok '+(i+1),120+i*150,175,'#cdd4e4',13,'center');txt('Attn',120+i*150,205,'#ff9b3d',11,'center');txt('+ Norm',120+i*150,225,'#5fd18a',11,'center');txt('FFN',120+i*150,245,'#b592f0',11,'center');txt('+ Norm',120+i*150,265,'#5fd18a',11,'center');g.restore();
        if(i<n-1){g.save();g.globalAlpha=al;txt('→',184+i*150,220,'#ffd24a',20,'center');g.restore();}}
      txt('3×4 girer → 3×4 çıkar → bir sonraki blok doğrudan alır',60,330,'#9fb0d0',13);
      txt('GPT-2: 12 blok · GPT-3: 96 blok · her blokta ayrı ağırlıklar',60,356,'#9fb0d0',13);}}
  ];
  const SCENE3D=[0, 1, 2, 3, 4, 5, 6]; const DUR=9; let cur=0,t=0,playing=true,last=0;
  const stepsEl=document.getElementById('tfaSteps');
  stepsEl.innerHTML=SC.map((s,i)=>'<button data-i="'+i+'">'+(i+1)+'. '+s.tag+'</button>').join('');
  function show(){document.getElementById('tfaGoal').innerHTML=SC[cur].goal;document.getElementById('tfaSoz').innerHTML=SC[cur].soz;document.getElementById('tfaElde').innerHTML=SC[cur].elde;
    stepsEl.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('on',i===cur);b.classList.toggle('done',i<cur);});}
  let f3=document.getElementById('tfa3d'),f3ok=false,f3pend=null;
  if(f3)f3.addEventListener('load',()=>{f3ok=true;if(f3pend!=null)f3.contentWindow.postMessage({type:'tf3d',scene:f3pend},'*');});
  function post3d(n){f3pend=n;if(f3&&f3ok)f3.contentWindow.postMessage({type:'tf3d',scene:n},'*');}
  function go(i){cur=cl(i,0,SC.length-1);t=0;post3d(SCENE3D[cur]);try{const r=host.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight+40)host.scrollIntoView({block:'start',behavior:'smooth'});}catch(e){}playing=true;document.getElementById('tfaPlay').textContent='⏸ Duraklat';show();}
  function setScene(i,keepT){ if(i===cur) return; cur=i; post3d(SCENE3D[cur]); show(); }
  function frame(ts){const dt=last?(ts-last)/1000:0;last=ts;
    if(playing&&host.offsetParent){t+=dt*(+document.getElementById('tfaSpd').value)/DUR;
      if(t>=1){ if(cur<SC.length-1){ t-=1; setScene(cur+1); } else { t=1; playing=false; document.getElementById('tfaPlay').textContent='▶ Oynat'; } } }
    document.getElementById('tfaScr').value=Math.round((cur+t)/SC.length*1000);
    if(host.offsetParent){g.clearRect(0,0,1000,500);txt(SC[cur].tag,20,30,'#ffd24a',16);SC[cur].draw(t);}
    requestAnimationFrame(frame);}
  stepsEl.onclick=e=>{const b=e.target.closest('[data-i]');if(b)go(+b.dataset.i);};
  document.getElementById('tfaPrev').onclick=()=>go(cur-1); document.getElementById('tfaNext').onclick=()=>go(cur+1);
  document.getElementById('tfaRe').onclick=()=>go(cur);
  document.getElementById('tfaPlay').onclick=function(){if(t>=1){t=0;}playing=!playing;this.textContent=playing?'⏸ Duraklat':'▶ Oynat';};
  document.getElementById('tfaScr').oninput=function(){const gv=this.value/1000*SC.length;let i=Math.min(SC.length-1,Math.floor(gv));t=gv-i;if(this.value>=1000){i=SC.length-1;t=1;}setScene(i);playing=false;document.getElementById('tfaPlay').textContent='▶ Oynat';};
  document.getElementById('tfaTk').innerHTML=SC.map((_,i)=>'<span style="left:'+((i+.5)/SC.length*100)+'%">'+(i+1)+'</span>'+(i?'<i style="left:'+(i/SC.length*100)+'%"></i>':'')).join('');
  window.__tfAnim={SC,go};
  post3d(0); show(); requestAnimationFrame(frame);
})();
