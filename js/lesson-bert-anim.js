// BERT ↔ GPT → Simülasyon: BERT animasyonu + 3B (kedi [MASK] yedi).
(function(){
  const host=document.getElementById('btAnim'); if(!host) return;
  const TOK=['kedi','[MASK]','yedi'], DIM=['hayvan','yemek','eylem','geçmiş'], VOC=['balığı','koştu','uyudu','süt'];
  const X=[[1,0,0,0],[0.25,0.25,0.25,0.25],[0,0,1,1]];
  const WQ=[[2,2],[0,0],[2,2],[0,0]], WK=[[2,0],[0,0],[0,2],[0,0]];
  const WO=[[1,-1,1,-1],[0,0,0,1],[1,-1,-1,1],[1,-1,-1,0]];
  const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((t,v,k)=>t+v*B[k][j],0)));
  const tr=A=>A[0].map((_,j)=>A.map(r=>r[j]));
  const smx=(r,m,i)=>{const e=r.map((v,j)=>m&&j>i?0:Math.exp(v)),t=e.reduce((a,b)=>a+b,0);return e.map(v=>v/t);};
  const S=mm(mm(X,WQ),tr(mm(X,WK))).map(r=>r.map(v=>v/Math.SQRT2));
  const A=S.map((r,i)=>smx(r,0,i)), AM=S.map((r,i)=>smx(r,1,i)), Z=mm(A,X), ZM=mm(AM,X);
  const LG=mm([Z[1]],WO), P=[smx(LG[0],0,0)], LGM=mm([ZM[1]],WO), PM=[smx(LGM[0],0,0)];
  const SMASK=S.map((r,i)=>r.map((v,j)=>j>i?null:v));
  const f=v=>{const r=Math.round(v*100)/100; return (Object.is(r,-0)?0:r).toString().replace('.',',');};
  const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), st=(t,i,n)=>cl(t*n-i);
  const pc=v=>Math.round(v*100);
  const cv=document.createElement('canvas'); cv.width=1000; cv.height=500; cv.style.cssText='width:100%;height:auto;display:block;background:#0d1117;border:1px solid var(--line);border-radius:10px';
  const g=cv.getContext('2d');
  host.innerHTML='<div class="mha-top"><div class="mha-steps" id="btaSteps"></div><div class="mha-bar"><button class="addbtn" id="btaPrev">◀ Geri</button><button class="addbtn" id="btaPlay">⏸ Duraklat</button><button class="addbtn" id="btaRe">↺ Baştan</button><button class="addbtn" id="btaNext">İleri ▶</button><div class="mha-scrw"><input type="range" id="btaScr" min="0" max="1000" value="0" class="mha-scr"><div class="mha-tk" id="btaTk"></div></div><label>Hız <select id="btaSpd"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div></div><div class="mha-grid"><div class="mha-3d"><iframe id="bta3d" title="Minik 3B mimari" src="'+(host.dataset['3d']||'')+'"></iframe></div><div id="btaCv"></div></div><div class="mha-boxes"><div class="mha-box mha-goal" id="btaGoal"></div><div class="mha-box mha-soz" id="btaSoz"></div><div class="mha-box mha-elde" id="btaElde"></div></div>';
  document.getElementById('btaCv').appendChild(cv);
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
  const AN=t=>'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">📝 <b>Sınav benzetmesi:</b> '+t+'</div>';
  const SC=[
   {tag:'Boşluklu cümle',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> BERT\'i eğitmek için cümlede <b>rastgele kelimeler gizlenir</b> ([MASK]) ve model onları tahmin etmeye çalışır. Burada: «kedi <b>[MASK]</b> yedi». Gizlenen kelime <b>«balığı»</b> (modele söylenmez).',
    soz:'<b>🗣️ Ne anlama geliyor?</b> [MASK] kartı özel bir <b>«boş» kartı</b>: hangi kelime olduğu hakkında bilgi taşımıyor (4 boyutu eşit, [0,25 …]). Etiketi biz biliyoruz, model bilmiyor; cevabı <b>çevresinden</b> bulması gerekecek.'+AN('«kedi ___ yedi» gibi bir <b>boşluk doldurma sorusu</b>. Eğitim, milyonlarca böyle soru çözdürmek.'),
    elde:'<b>📦 Elde ettik:</b> X (3×4): kedi, [MASK], yedi. Gerçek BERT\'te kelimelerin %15\'i gizlenir; sistem tek bir cümlede birçok soru çözmüş olur.',
    draw:t=>{mat(X,330,110,{cw:70,ch:46,rows:TOK,title:'X  (3 kelime × 4 boyut)',alpha:st(t,0,2),fs:13});
      DIM.forEach((s,j)=>txt(s,330+j*70+34,92,'#9fb0d0',11,'center'));
      txt('gizli kelime (modele söylenmez): balığı',330,350,'#ffd24a',14);}},
   {tag:'Çift yönlü self-attention',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Encoder\'ın self-attention\'ı <b>maskesizdir</b>: her kelime <b>hem solundakine hem sağındakine</b> bakar. Burada A = softmax(Q·Kᵀ/√d) tam bir 3×3 tablo.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> [MASK] satırı: %'+pc(A[1][0])+' <b>kedi</b> (solu), %'+pc(A[1][2])+' <b>yedi</b> (sağı), %'+pc(A[1][1])+' kendi. Boşluğu doldurmak için <b>iki taraftan da ipucu</b> topluyor. GPT\'de bu satır yalnız soldaki kelimeleri görürdü.'+AN('boşluğu doldururken <b>hem öncesindeki hem sonrasındaki</b> kelimelere bakıyorsun: «kedi … yedi» → «yedi» fiili bir <b>yemek</b> bekletiyor.'),
    elde:'<b>📦 Elde ettik:</b> A (3×3), üst üçgen dahil dolu: maske yok. Bu yüzden BERT <b>üretmez</b> (üretirken geleceği henüz bilmezsin), ama anlamada çok güçlüdür.',
    draw:t=>{const a0=st(t,0,2),a1=st(t,1,2);
      mat(S,40,110,{cw:50,ch:34,title:'skor (maske yok)',alpha:a0,fs:12,rows:TOK,cols:TOK});
      op('softmax →',270,170,a1);dots(A,330,110,{c:62,title:'A (çift yönlü)',col:'#ffd24a',alpha:a1,rows:TOK,cols:TOK,hr:1});
      txt('sarı satır: [MASK] — solu da sağı da görüyor',40,330,'#ffd24a',13);txt('üst üçgen BOŞ DEĞİL (GPT\'de boş olurdu)',40,356,'#9fb0d0',12);}},
   {tag:'Karışım: [MASK] kartı dolar',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Dikkat yüzdeleriyle kartlar karıştırılır (Z = A·X; sadelik için W<sub>V</sub> birim). [MASK] kartı artık çevresindeki kelimelerin bilgisini taşıyor.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> [MASK] için Z = ['+Z[1].map(f).join(', ')+']: <b>hayvan</b> ('+f(Z[1][0])+', kediden), <b>eylem + geçmiş</b> ('+f(Z[1][2])+', yediden). Boş kart «hayvan bir şey yedi» bilgisiyle <b>doldu</b>. Yemek boyutu hâlâ düşük: cevap henüz belli değil, çıkış katmanı bunu çözecek.'+AN('boşluğun yanındaki ipuçlarını <b>not defterine</b> topladın: «özne hayvan, fiil yemek».'),
    elde:'<b>📦 Elde ettik:</b> Z (3×4): bağlamlı kartlar. [MASK] satırı artık «bir hayvanın yediği bir şey» tarif ediyor.',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      dots(A,30,110,{c:54,title:'A',alpha:a0,rows:TOK,cols:TOK,hr:1}); op('·',230,170,a1); mat(X,255,110,{cw:46,ch:34,title:'X',alpha:a1,fs:12,hr:1,cols:DIM});
      op('=',470,170,a2); mat(Z,500,110,{cw:50,ch:34,title:'Z = A·X',alpha:a2,fs:12,rows:TOK,hr:1,cols:DIM,col:'#5fd18a'});
      txt('sarı satır: [MASK] — hayvan + eylem bilgisi doldu',30,330,'#ffd24a',13);}},
   {tag:'Çıkış: hangi kelime?',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Yalnız <b>[MASK] pozisyonunun</b> kartı bir Linear katmanla sözlükteki kelimelere puanlanır ve softmax ile olasılığa çevrilir (burada sözlük: balığı, koştu, uyudu, süt).',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Tahmin: <b>balığı %'+pc(P[0][0])+'</b>, süt %'+pc(P[0][3])+', uyudu %'+pc(P[0][2])+', koştu %'+pc(P[0][1])+'. «hayvan + yedi» ipucu <b>balığı</b>\'yı öne çıkardı. Diğer pozisyonlar (kedi, yedi) bu görevde tahmin edilmez; kayıp yalnız maskeli yerde hesaplanır.'+AN('cevap kâğıdına <b>tek bir cevap</b> yazdın: «balığı» (kendinden %'+pc(P[0][0])+' emin).'),
    elde:'<b>📦 Elde ettik:</b> Olasılık dağılımı P (1×4). Gerçekte 30–50 bin kelimelik sözlük; hesap aynı.',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      mat([Z[1]],30,150,{cw:50,ch:44,title:'[MASK] kartı',alpha:a0,fs:12,cols:DIM}); op('·',255,175,a1);
      mat(WO,280,110,{cw:46,ch:34,title:'W  4×4',alpha:a1,fs:11,col:'#b592f0',rows:DIM});
      op('=',480,175,a2); mat(LG,510,150,{cw:56,ch:44,title:'puanlar',alpha:a2,fs:12,cols:VOC});
      dots(P,760,140,{c:56,title:'softmax',col:'#ffd24a',alpha:a2,cols:VOC});
      txt('tahmin: '+VOC[P[0].indexOf(Math.max(...P[0]))]+'  (%'+pc(Math.max(...P[0]))+')',30,330,'#ffd24a',16);}},
   {tag:'Eğitim: kayıp ve öğrenme',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Gerçek cevap «balığı» olduğu için kayıp L = −ln p(balığı) hesaplanır. Bu kayıp geri yayılımla <b>bütün ağırlıkları</b> (W<sub>Q</sub>, W<sub>K</sub>, W<sub>O</sub>, gömme…) küçük adımlarla düzeltir.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> L = −ln('+f(P[0][0])+') = <b>'+f(-Math.log(P[0][0]))+'</b>. Model %100 emin olsaydı L = 0 olurdu. Milyarlarca cümle, her cümlede ~%15 gizli kelime: model bu <b>boşluk doldurma</b> görevini iyileştirmek için <b>dilin kurallarını</b> kendiliğinden öğrenir. Kimse etiket yazmadı: <b>metin kendi sorusunu ve cevabını</b> taşıyor (self-supervised).'+AN('her yanlış cevapta öğretmen sadece «ne kadar yanlış»ı (L) söylüyor; sen hangi bilgiye daha çok bakman gerektiğini <b>kendin</b> ayarlıyorsun.'),
    elde:'<b>📦 Elde ettik:</b> Eğitim döngüsü: cümle → [MASK]\'la → tahmin → kayıp → ağırlık güncelle. Aynı döngü BERT\'ü <b>ham metinden</b> öğretir.',
    draw:t=>{const k=cl(t*2);
      mat(P,60,120,{cw:90,ch:44,title:'p (tahmin)',fs:13,cols:VOC,alpha:1,col:'#ffd24a'});
      mat([[1,0,0,0]],60,230,{cw:90,ch:44,title:'doğru cevap (one-hot)',fs:13,cols:VOC,alpha:1,col:'#5fd18a'});
      op('→  L = −ln p(balığı) = '+f(-Math.log(P[0][0])),620,160,st(t,0,2));
      g.save();g.globalAlpha=st(t,1,2);g.strokeStyle='#f27a88';g.lineWidth=3;g.beginPath();g.moveTo(620,200);g.lineTo(620,300);g.lineTo(520,300);g.stroke();
      txt('geri yayılım: W_Q, W_K, W_O, gömme güncellenir',320,330,'#f27a88',14);g.restore();
      txt('kayıp YALNIZ maskeli pozisyonda (kedi ve yedi tahmin edilmez)',60,400,'#9fb0d0',13);}},
   {tag:'Sağ bağlam olmasaydı (GPT)',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Aynı cümleyi <b>maskeli</b> (soldan sağa) okutalım: [MASK] yalnız <b>soldaki</b> «kedi»yi görür, «yedi»yi göremez.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Maskeli dikkat: [MASK] satırı %'+pc(AM[1][0])+' kedi, %'+pc(AM[1][1])+' kendi, yedi 0. Sonuç: balığı <b>%'+pc(PM[0][0])+'</b> (çift yönlüde %'+pc(P[0][0])+'), uyudu <b>%'+pc(PM[0][2])+'</b> (kedi uyuyabilir de!). «yedi» fiili görülmeyince <b>belirsizlik artıyor</b>.'+AN('boşluğun <b>sağındaki</b> kelimeyi kapatmış gibi: «kedi ___» → balığı mı yedi, uyudu mu, koştu mu? Daha zor.'),
    elde:'<b>📦 Elde ettik:</b> Aynı veride sağ bağlam tahmini <b>kesinleştiriyor</b>. BERT bu yüzden anlama görevlerinde güçlü; GPT ise geleceği göremediği için <b>üretebilir</b>.',
    draw:t=>{const a0=st(t,0,2),a1=st(t,1,2);
      dots(A,40,110,{c:56,title:'BERT: çift yönlü',col:'#ffd24a',alpha:a0,rows:TOK,cols:TOK,hr:1});
      dots(AM,520,110,{c:56,title:'GPT gibi: maskeli',col:'#ff9b3d',alpha:a1,rows:TOK,cols:TOK,hr:1});
      g.save();g.globalAlpha=a0;txt('balığı %'+pc(P[0][0]),40,340,'#5fd18a',16);g.restore();
      g.save();g.globalAlpha=a1;txt('balığı %'+pc(PM[0][0])+' · uyudu %'+pc(PM[0][2]),520,340,'#ff9b3d',16);g.restore();
      txt('[MASK] satırı (sarı) — sağ taraf görünür mü?',40,380,'#9fb0d0',13);}},
   {tag:'BERT ne işe yarar?',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Eğitimden sonra BERT\'in <b>çıktı kartları</b> başka görevler için kullanılır: küçük bir başlık eklenip az etiketli veriyle <b>ince ayar</b> yapılır.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Cümlenin başına eklenen [CLS] kartı tüm cümleyi özetler → <b>sınıflandırma</b> (duygu, spam). Her kelimenin kartı → <b>etiketleme</b> (kişi/yer adı). Cümle kartı → <b>arama / benzerlik</b> (embedding). Üretim ise BERT\'in işi değil.'+AN('sınavı geçen öğrenci artık <b>farklı derslerde</b> az çalışmayla başarılı olur: temel dil bilgisi hazır.'),
    elde:'<b>📦 Elde ettik:</b> BERT = ham metinden öğrenilmiş <b>güçlü bir okuma modeli</b>. Aynı blok (Transformer Bloğu dersi), farklı maske ve farklı eğitim hedefi.',
    draw:t=>{const a=st(t,0,3);
      g.save();g.globalAlpha=Math.max(.3,cl(t*3));g.fillStyle='#161d2c';g.strokeStyle='#4aa3ff';g.lineWidth=2;g.fillRect(40,150,200,110);g.strokeRect(40,150,200,110);txt('BERT (önceden eğitilmiş)',140,195,'#cdd4e4',14,'center');txt('[CLS] kedi balığı yedi',140,225,'#9fb0d0',12,'center');g.restore();
      [['[CLS] kartı → sınıflandırma','duygu: olumlu / olumsuz','#5fd18a'],['her kelime kartı → etiketleme','kedi=HAYVAN, yedi=EYLEM','#ffd24a'],['cümle kartı → benzerlik/arama','«kedi balık yedi» ≈ «kedi ne yer?»','#ff9b3d']].forEach(([a1,b1,c],i)=>{
        const al=cl(t*3-i*0.5);g.save();g.globalAlpha=al;g.strokeStyle=c;g.lineWidth=2;g.beginPath();g.moveTo(240,205);g.lineTo(380,130+i*100);g.stroke();
        g.fillStyle='#161d2c';g.fillRect(380,105+i*100,420,50);g.strokeRect(380,105+i*100,420,50);txt(a1,395,126+i*100,c,13);txt(b1,395,146+i*100,'#9fb0d0',11.5);g.restore();});}}
  ];
  const SCENE3D=[0, 1, 2, 3, 4, 5, 6]; const DUR=9; let cur=0,t=0,playing=true,last=0;
  const stepsEl=document.getElementById('btaSteps');
  stepsEl.innerHTML=SC.map((s,i)=>'<button data-i="'+i+'">'+(i+1)+'. '+s.tag+'</button>').join('');
  function show(){document.getElementById('btaGoal').innerHTML=SC[cur].goal;document.getElementById('btaSoz').innerHTML=SC[cur].soz;document.getElementById('btaElde').innerHTML=SC[cur].elde;
    stepsEl.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('on',i===cur);b.classList.toggle('done',i<cur);});}
  let f3=document.getElementById('bta3d'),f3ok=false,f3pend=null;
  if(f3)f3.addEventListener('load',()=>{f3ok=true;if(f3pend!=null)f3.contentWindow.postMessage({type:'bt3d',scene:f3pend},'*');});
  function post3d(n){f3pend=n;if(f3&&f3ok)f3.contentWindow.postMessage({type:'bt3d',scene:n},'*');}
  function go(i){cur=cl(i,0,SC.length-1);t=0;post3d(SCENE3D[cur]);try{const r=host.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight+40)host.scrollIntoView({block:'start',behavior:'smooth'});}catch(e){}playing=true;document.getElementById('btaPlay').textContent='⏸ Duraklat';show();}
  function setScene(i,keepT){ if(i===cur) return; cur=i; post3d(SCENE3D[cur]); show(); }
  function frame(ts){const dt=last?(ts-last)/1000:0;last=ts;
    if(playing&&host.offsetParent){t+=dt*(+document.getElementById('btaSpd').value)/DUR;
      if(t>=1){ if(cur<SC.length-1){ t-=1; setScene(cur+1); } else { t=1; playing=false; document.getElementById('btaPlay').textContent='▶ Oynat'; } } }
    document.getElementById('btaScr').value=Math.round((cur+t)/SC.length*1000);
    if(host.offsetParent){g.clearRect(0,0,1000,500);txt(SC[cur].tag,20,30,'#ffd24a',16);SC[cur].draw(t);}
    requestAnimationFrame(frame);}
  stepsEl.onclick=e=>{const b=e.target.closest('[data-i]');if(b)go(+b.dataset.i);};
  document.getElementById('btaPrev').onclick=()=>go(cur-1); document.getElementById('btaNext').onclick=()=>go(cur+1);
  document.getElementById('btaRe').onclick=()=>go(cur);
  document.getElementById('btaPlay').onclick=function(){if(t>=1){t=0;}playing=!playing;this.textContent=playing?'⏸ Duraklat':'▶ Oynat';};
  document.getElementById('btaScr').oninput=function(){const gv=this.value/1000*SC.length;let i=Math.min(SC.length-1,Math.floor(gv));t=gv-i;if(this.value>=1000){i=SC.length-1;t=1;}setScene(i);playing=false;document.getElementById('btaPlay').textContent='▶ Oynat';};
  document.getElementById('btaTk').innerHTML=SC.map((_,i)=>'<span style="left:'+((i+.5)/SC.length*100)+'%">'+(i+1)+'</span>'+(i?'<i style="left:'+(i/SC.length*100)+'%"></i>':'')).join('');
  window.__btAnim={SC,go};
  post3d(0); show(); requestAnimationFrame(frame);
})();
