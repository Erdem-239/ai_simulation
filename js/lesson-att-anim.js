// Self-Attention → Simülasyon: bu derse özel sıralı sahne animasyonu + minik 3B mimari.
// Örnek: "kedi balığı yedi", d=4, tek kafa (d_k=2). Sayılar elle seçildi (öğretmek için).
(function(){
  const host=document.getElementById('atAnim'); if(!host) return;
  const TOK=['kedi','balığı','yedi'], DIM=['hayvan','yemek','eylem','geçmiş'];
  const X=[[1,0,0,0],[0,1,0,0],[0,0,1,1]];
  const WQ=[[0,1],[1,0],[1.5,1.5],[0,0]], WK=[[2,0],[0,2],[0,0],[0,0]], WV=[[1,0],[0,1],[0,0],[0,0]];
  const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((t,v,k)=>t+v*B[k][j],0)));
  const tr=A=>A[0].map((_,j)=>A.map(r=>r[j]));
  const Q=mm(X,WQ), K=mm(X,WK), V=mm(X,WV), QK=mm(Q,tr(K)), S=QK.map(r=>r.map(v=>v/Math.SQRT2));
  const smx=(r,m,i)=>{const e=r.map((v,j)=>m&&j>i?0:Math.exp(v)),t=e.reduce((a,b)=>a+b,0);return e.map(v=>v/t);};
  const A=S.map((r,i)=>smx(r,0,i)), AM=S.map((r,i)=>smx(r,1,i)), Z=mm(A,V), ZM=mm(AM,V);
  const SMASK=S.map((r,i)=>r.map((v,j)=>j>i?null:v));
  const pc=v=>Math.round(v*100)+'%';
  const f=v=>{const r=Math.round(v*100)/100; return (Object.is(r,-0)?0:r).toString().replace('.',',');};
  const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), st=(t,i,n)=>cl(t*n-i);
  const cv=document.createElement('canvas'); cv.width=1000; cv.height=500; cv.style.cssText='width:100%;height:auto;display:block;background:#0d1117;border:1px solid var(--line);border-radius:10px';
  const g=cv.getContext('2d');
  host.innerHTML='<div class="mha-top"><div class="mha-steps" id="ataSteps"></div><div class="mha-bar"><button class="addbtn" id="ataPrev">◀ Geri</button><button class="addbtn" id="ataPlay">⏸ Duraklat</button><button class="addbtn" id="ataRe">↺ Baştan</button><button class="addbtn" id="ataNext">İleri ▶</button><div class="mha-scrw"><input type="range" id="ataScr" min="0" max="1000" value="0" class="mha-scr"><div class="mha-tk" id="ataTk"></div></div><label>Hız <select id="ataSpd"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div></div><div class="mha-grid"><div class="mha-3d"><iframe id="ata3d" title="Minik 3B mimari" src="'+(host.dataset['3d']||'')+'"></iframe></div><div id="ataCv"></div></div><div class="mha-boxes"><div class="mha-box mha-goal" id="ataGoal"></div><div class="mha-box mha-soz" id="ataSoz"></div><div class="mha-box mha-elde" id="ataElde"></div></div>';
  document.getElementById('ataCv').appendChild(cv);
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
  const C1='#4aa3ff';
  const SC=[
   {tag:'Girdi',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Cümlemiz «kedi balığı yedi». Her kelime 4 sayılık bir kart (d = 4): <b>hayvan</b>, <b>yemek</b>, <b>eylem</b>, <b>geçmiş</b> boyutları. Sayılar öğretmek için elle seçildi.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «yedi» kartı tek başına yalnızca «bir eylem, geçmiş zaman» der; <b>kim</b> yedi, <b>ne</b> yedi bilmez. Bunu cümledeki öteki kelimelere bakarak öğrenmesi gerekir — self-attention tam bunu yapar.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🧑‍🤝‍🧑 <b>Ali–Ayşe:</b> her kelime bir <b>kişi</b> gibi düşün: kimi aradığını kendisi söyler, kimde ne olduğunu başkaları söyler. Sonraki sahnelerde Ali ile Ayşe’yi izleyeceğiz.</div>',
    elde:'<b>📦 Elde ettik:</b> X (3×4): üç kelime, her biri 4 sayı. Sonraki sahnelerde her kelime bu X\'in <b>aynı cümledeki öteki satırlarına</b> bakacak.',
    draw:t=>{mat(X,330,110,{cw:70,ch:46,rows:TOK,title:'X  (3 kelime × 4 boyut)',alpha:st(t,0,2),fs:14});
      DIM.forEach((s,j)=>txt(s,330+j*70+34,92,'#9fb0d0',11,'center'));
      txt('→ her satır bir kelimenin kartı',330,330,'#9fb0d0',13);}},
   {tag:'Q, K, V',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> X üç ayrı küçük tabloyla (W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>, her biri 4×2) çarpılır → her kelime için bir <b>soru</b> (Q), bir <b>etiket</b> (K), bir <b>değer</b> (V).',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «yedi»nin sorusu Q = ['+Q[2].map(f).join(', ')+']: «hem <b>hayvan</b> hem <b>yemek</b> arıyorum». «kedi»nin etiketi K = ['+K[0].map(f).join(', ')+'] («bende hayvan var»), «balığı»nın K = ['+K[1].map(f).join(', ')+'] («bende yemek var»); «yedi»nin etiketi boş. V = verilecek bilgi. Aynı kelimeden üç ayrı rol çıktı.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🧑‍🤝‍🧑 <b>Ali–Ayşe:</b> Ali acıkmış: <b>Q</b> = «ben <b>yemek</b> arıyorum» (Ali’nin <u>aradığı</u>). Ayşe’nin elinde yemek var: <b>K</b> = «bende <b>yemek</b> var» (Ayşe’nin <u>etiketi</u>). <b>V</b> = Ayşe’nin Ali’ye gerçekten vereceği şey (yemeğin kendisi). Q ile K <b>ayrı</b> tablolardan çıkar; tek kart olsaydı Ali en çok kendine benzerdi («aç» ↔ «aç»). Burada «yedi» Ali, «balığı» Ayşe.</div>',
    elde:'<b>📦 Elde ettik:</b> Q, K, V (her biri 3×2). Aynı X\'ten üç farklı tabloyla çıktıkları için «soran», «etiket» ve «bilgi» ayrı şeyler.',
    draw:t=>{[['W_Q',WQ,Q,'Q'],['W_K',WK,K,'K'],['W_V',WV,V,'V']].forEach(([n,W,R,nm],i)=>{
        const a=st(t,i,3), x0=90+i*320;
        mat(W,x0,90,{cw:36,ch:28,title:n+'  4×2',alpha:a,fs:11,rows:DIM});
        op('↓  X ·',x0+30,230,a);
        mat(R,x0,250,{cw:36,ch:28,title:nm+' = X · '+n+'  (3×2)',alpha:a,fs:12,rows:TOK,hr:2});});
      txt('sarı satır: «yedi»',90,400,'#ffd24a',13);}},
   {tag:'Skor: Q·Kᵀ ÷ √d',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Her kelimenin sorusu <b>herkesin etiketiyle</b> nokta çarpılır (Q·Kᵀ → 3×3), sonra √d<sub>k</sub> = √2 ile bölünür (sayılar kontrolden çıkmasın).',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Satır = soran, sütun = bakılan. «yedi» satırı: kedi <b>'+f(S[2][0])+'</b>, balığı <b>'+f(S[2][1])+'</b>, kendisi <b>'+f(S[2][2])+'</b> — soru ile etiket ne kadar örtüşürse skor o kadar büyük. Skor henüz yüzde değil.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🧑‍🤝‍🧑 <b>Ali–Ayşe:</b> Ali’nin «yemek arıyorum»u ile Ayşe’nin «bende yemek var»ı <b>örtüşünce</b> skor yüksek çıkar ('+f(S[2][1])+'); Ali’nin sorusu ile etiketi boş olan kendi kartı örtüşmez ('+f(S[2][2])+'). Skor = «bu kişide aradığım var mı?» puanı.</div>',
    elde:'<b>📦 Elde ettik:</b> S (3×3) ham benzerlik tablosu. Büyük sayı = «ona bakmaya değer».',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      mat(Q,40,110,{cw:40,ch:34,title:'Q',alpha:a0,fs:12,rows:TOK,hr:2}); op('·',150,170,a0); mat(tr(K),180,110,{cw:40,ch:34,title:'Kᵀ',alpha:a0,fs:12,cols:TOK});
      op('=',300,170,a1); mat(QK,330,110,{cw:46,ch:34,title:'Q·Kᵀ',alpha:a1,fs:12,rows:TOK,cols:TOK,hr:2});
      op('÷√2 =',540,170,a2); mat(S,620,110,{cw:50,ch:34,title:'S (skor)',alpha:a2,fs:12,rows:TOK,cols:TOK,hr:2,col:'#ffd24a'});
      txt('satır = soran, sütun = bakılan',40,330,'#9fb0d0',13);}},
   {tag:'Softmax → dikkat yüzdeleri',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Her <b>satıra</b> softmax uygulanır: skorlar e üzeri alınıp satır toplamına bölünür → her satır toplamı %100 olan yüzdeler. Bu tabloya <b>dikkat deseni</b> (A) denir.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «yedi» dikkatini <b>%'+Math.round(A[2][0]*100)+' kediye, %'+Math.round(A[2][1]*100)+' balığa, %'+Math.round(A[2][2]*100)+' kendine</b> verdi. «kedi» ise %'+Math.round(A[0][1]*100)+' balığa baktı. Skorlar farklıydı; softmax onları «kime ne kadar bakayım» payına çevirdi.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🧑‍🤝‍🧑 <b>Ali–Ayşe:</b> Ali dikkatini Ayşe’ye (yemeği olana) çok, yemeği olmayana az verir; paylar toplam %100.</div>',
    elde:'<b>📦 Elde ettik:</b> A (3×3), her satırı %100. Hangi kelimenin hangisinden <b>ne kadar</b> alacağı belli.',
    draw:t=>{const a0=st(t,0,2),a1=st(t,1,2);
      mat(S,60,110,{cw:50,ch:34,title:'S (skor)',alpha:a0,fs:12,rows:TOK,cols:TOK,hr:2});
      op('softmax →',270,170,a1);
      dots(A,420,110,{c:62,title:'A (dikkat deseni)',col:'#ffd24a',alpha:a1,rows:TOK,cols:TOK,hr:2});
      txt('her SATIR ayrı ayrı %100 yapılır',60,330,'#9fb0d0',13);}},
   {tag:'A·V: karışım',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Her kelime, dikkat yüzdeleriyle <b>V\'leri karıştırır</b> (A·V). Satır başına: yüzde × değer + yüzde × değer + …',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «yedi» için: %'+Math.round(A[2][0]*100)+'×V<sub>kedi</sub> + %'+Math.round(A[2][1]*100)+'×V<sub>balığı</sub> + %'+Math.round(A[2][2]*100)+'×V<sub>yedi</sub> = ['+Z[2].map(f).join(', ')+'] → <b>hem hayvan hem yemek bilgisi</b>. Artık «yedi» kartı «kedinin balığı yemesi»ni taşıyor.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🧑‍🤝‍🧑 <b>Ali–Ayşe:</b> Ali yüzdelerine göre herkesten <b>V</b> alır: Ayşe’den yemek bilgisini çoğunlukla, yemeği olmayandan neredeyse hiç. Ali’nin yeni kartı = aldığı şeylerin karışımı.</div>',
    elde:'<b>📦 Elde ettik:</b> Z = A·V (3×2): her kelimenin <b>yeni, bağlamlı</b> kartı. Z, X\'ten farklı: kelime çevresini içine kattı.',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      mat(A,50,110,{cw:50,ch:34,title:'A',alpha:a0,fs:12,rows:TOK,hr:2}); op('·',230,170,a1); mat(V,260,110,{cw:50,ch:34,title:'V',alpha:a1,fs:12,hr:2,rows:TOK});
      op('=',420,170,a2); mat(Z,450,110,{cw:60,ch:34,title:'Z = A·V',alpha:a2,fs:13,rows:TOK,hr:2,cols:['hayvan','yemek'],col:'#5fd18a'});
      txt('sarı satır: «yedi» — kedi ve balık bilgisi bir arada',50,330,'#ffd24a',13);}},
   {tag:'Maske (GPT gibi)',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Metin üreten modellerde (GPT) bir kelime <b>sağındakini göremez</b>: skor tablosunun üst üçgeni −∞ yapılır, softmax sonrası o hücreler %0 olur. Encoder (BERT) maskesizdir — az önceki hesap.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «kedi» artık balığı göremiyor: %100 kendine bakıyor (maskesizde %'+Math.round(A[0][1]*100)+' balığa bakıyordu). «yedi» ise sona geldiği için hepsini görüyor, hiç değişmedi. Yani <b>son kelime her zaman aynı</b>, öncekiler kısıtlı.',
    elde:'<b>📦 Elde ettik:</b> Maskeli A (alt üçgen). «kedi» Z\'si: maskesiz ['+Z[0].map(f).join(', ')+'] → maskeli ['+ZM[0].map(f).join(', ')+']. Böylece model üretirken geleceğe bakıp kopya çekemez.',
    draw:t=>{const a0=st(t,0,2),a1=st(t,1,2);
      mat(SMASK,40,110,{cw:50,ch:34,title:'S (üst üçgen −∞)',alpha:a0,fs:12,rows:TOK,cols:TOK});
      op('softmax →',270,170,a1);
      dots(AM,420,110,{c:62,title:'A (maskeli)',col:'#ff9b3d',alpha:a1,rows:TOK,cols:TOK,hr:0});
      txt('sarı satır: «kedi» — sağındakini göremiyor',40,330,'#ffd24a',13);
      txt('«yedi» satırı değişmedi (en sonda)',40,355,'#9fb0d0',12);}},
   {tag:'Sonuç: yeni kartlar',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Bütün resmi bir araya getirelim: <b>Attention(Q,K,V) = softmax(Q·Kᵀ/√d)·V</b>. Girdi X (3×4) → çıktı Z (3×2): her kelime artık çevresiyle karışmış bir karta sahip.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «kedi» → balığa yakın bir kart, «balığı» → kediye yakın, «yedi» → ikisinin ortası. Kimse kural yazmadı: W tabloları eğitilince bu bakışlar kendiliğinden çıkar. Tek bir kafa tek tür bakış üretir — fazlası için <b>Multi-Head</b> dersi.',
    elde:'<b>📦 Elde ettik:</b> Self-attention = «herkes herkese soru sorar, yüzdeli karışım alır». Şekil değişmedi (3 kelime → 3 kart); anlam değişti.',
    draw:t=>{const a0=st(t,0,2),a1=st(t,1,2);
      mat(X,40,110,{cw:46,ch:36,title:'X (girdi)',alpha:a0,fs:12,rows:TOK,cols:DIM});
      op('self-attention →',330,185,a1);
      mat(Z,430,110,{cw:70,ch:36,title:'Z (çıktı)',alpha:a1,fs:13,rows:TOK,cols:['hayvan','yemek'],col:'#5fd18a'});
      txt('Attention(Q,K,V) = softmax( Q·Kᵀ / √d ) · V',40,340,'#ffd24a',15);
      txt('benzerlik tablosu → yüzdeler → ağırlıklı karışım',40,366,'#9fb0d0',13);}}
  ];
  const SCENE3D=[0,1,2,3,4,5,6]; const DUR=9; let cur=0,t=0,playing=true,last=0;
  const stepsEl=document.getElementById('ataSteps');
  stepsEl.innerHTML=SC.map((s,i)=>'<button data-i="'+i+'">'+(i+1)+'. '+s.tag+'</button>').join('');
  function show(){document.getElementById('ataGoal').innerHTML=SC[cur].goal;document.getElementById('ataSoz').innerHTML=SC[cur].soz;document.getElementById('ataElde').innerHTML=SC[cur].elde;
    stepsEl.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('on',i===cur);b.classList.toggle('done',i<cur);});}
  let f3=document.getElementById('ata3d'),f3ok=false,f3pend=null;
  if(f3)f3.addEventListener('load',()=>{f3ok=true;if(f3pend!=null)f3.contentWindow.postMessage({type:'at3d',scene:f3pend},'*');});
  function post3d(n){f3pend=n;if(f3&&f3ok)f3.contentWindow.postMessage({type:'at3d',scene:n},'*');}
  function go(i){cur=cl(i,0,SC.length-1);t=0;post3d(SCENE3D[cur]);try{const r=host.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight+40)host.scrollIntoView({block:'start',behavior:'smooth'});}catch(e){}playing=true;document.getElementById('ataPlay').textContent='⏸ Duraklat';show();}
  function setScene(i,keepT){ if(i===cur) return; cur=i; post3d(SCENE3D[cur]); show(); }
  function frame(ts){const dt=last?(ts-last)/1000:0;last=ts;
    if(playing&&host.offsetParent){t+=dt*(+document.getElementById('ataSpd').value)/DUR;
      if(t>=1){ if(cur<SC.length-1){ t-=1; setScene(cur+1); } else { t=1; playing=false; document.getElementById('ataPlay').textContent='▶ Oynat'; } } }
    document.getElementById('ataScr').value=Math.round((cur+t)/SC.length*1000);
    if(host.offsetParent){g.clearRect(0,0,1000,500);txt(SC[cur].tag,20,30,'#ffd24a',16);SC[cur].draw(t);}
    requestAnimationFrame(frame);}
  stepsEl.onclick=e=>{const b=e.target.closest('[data-i]');if(b)go(+b.dataset.i);};
  document.getElementById('ataPrev').onclick=()=>go(cur-1); document.getElementById('ataNext').onclick=()=>go(cur+1);
  document.getElementById('ataRe').onclick=()=>go(cur);
  document.getElementById('ataPlay').onclick=function(){if(t>=1){t=0;}playing=!playing;this.textContent=playing?'⏸ Duraklat':'▶ Oynat';};
  document.getElementById('ataScr').oninput=function(){const gv=this.value/1000*SC.length;let i=Math.min(SC.length-1,Math.floor(gv));t=gv-i;if(this.value>=1000){i=SC.length-1;t=1;}setScene(i);playing=false;document.getElementById('ataPlay').textContent='▶ Oynat';};
  document.getElementById('ataTk').innerHTML=SC.map((_,i)=>'<span style="left:'+((i+.5)/SC.length*100)+'%">'+(i+1)+'</span>'+(i?'<i style="left:'+(i/SC.length*100)+'%"></i>':'')).join('');
  window.__attAnim={SC,A,AM,Z,ZM,go};
  post3d(0); show(); requestAnimationFrame(frame);
})();
