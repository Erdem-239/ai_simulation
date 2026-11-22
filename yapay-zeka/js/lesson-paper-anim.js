// Makale dersi → Simülasyon: minik encoder-decoder (kedi balığı yedi → cat ate fish) + 3B.
(function(){
  const host=document.getElementById('ppAnim'); if(!host) return;
  const SRC=['kedi','balığı','yedi'], TGT=['<s>','cat','ate'], NXT=['cat','ate','fish'], VOC=['cat','ate','fish','<e>'], DIM=['hayvan','yemek','eylem','geçmiş'];
  const X=[[1,0,0,0],[0,1,0,0],[0,0,1,1]], D=[[0,0,0,1],[1,0,0,0],[0,0,1,1]];
  const WQ=[[0,1],[1,0],[1.5,1.5],[0,0]], WK=[[2,0],[0,2],[0,0],[0,0]];
  const W1=[[1,-1,0,1,0,0.5],[0,1,1,-1,0.5,0],[-1,0,1,0,1,-0.5],[0.5,0,-1,0,1,1]];
  const W2=[[0.5,0,0,0],[0,0.5,0,0],[0,0,0.5,0],[0,0,0,0.5],[0.5,0.5,0,0],[0,0,0.5,0.5]];
  const WKc=[[1,0],[0,1],[0,0],[0,0]], WQc=[[-1,-0.5],[0.5,-1],[-0.5,1.5],[1,0]];
  const WO=[[1,-0.75,1.25,-0.5],[0.5,-1.5,0,0.25],[-1.5,1,0,0.25],[0,1,-1.25,0]];
  const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((t,v,k)=>t+v*B[k][j],0)));
  const tr=A=>A[0].map((_,j)=>A.map(r=>r[j]));
  const ln=r=>{const m=r.reduce((a,b)=>a+b,0)/r.length,v=r.reduce((a,b)=>a+(b-m)*(b-m),0)/r.length,s=Math.sqrt(v+1e-5);return r.map(x=>(x-m)/s);};
  const smx=(r,m,i)=>{const e=r.map((v,j)=>m&&j>i?0:Math.exp(v)),t=e.reduce((a,b)=>a+b,0);return e.map(v=>v/t);};
  const S=mm(mm(X,WQ),tr(mm(X,WK))).map(r=>r.map(v=>v/Math.SQRT2)), A=S.map((r,i)=>smx(r,0,i));
  const R1=X.map((r,i)=>r.map((v,j)=>v+mm(A,X)[i][j])), N1=R1.map(ln);
  const H=mm(N1,W1).map(r=>r.map(v=>Math.max(0,v))), F=mm(H,W2), M=N1.map((r,i)=>r.map((v,j)=>v+F[i][j])).map(ln);
  const DS=mm(mm(D,WQ),tr(mm(D,WK))).map(r=>r.map(v=>v/Math.SQRT2)), DA=DS.map((r,i)=>smx(r,1,i)), DZ=mm(DA,D);
  const DN=D.map((r,i)=>r.map((v,j)=>v+DZ[i][j])).map(ln);
  const Qc=mm(DN,WQc), Kc=mm(M,WKc), Sc=mm(Qc,tr(Kc)).map(r=>r.map(v=>v/Math.SQRT2)), Ac=Sc.map(r=>smx(r,0,0)), C=mm(Ac,M);
  const DC=DN.map((r,i)=>r.map((v,j)=>v+C[i][j])).map(ln), LG=mm(DC,WO), P=LG.map(r=>smx(r,0,0));
  const SMASK=DS.map((r,i)=>r.map((v,j)=>j>i?null:v));
  const f=v=>{const r=Math.round(v*100)/100; return (Object.is(r,-0)?0:r).toString().replace('.',',');};
  const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), st=(t,i,n)=>cl(t*n-i);
  const pc=v=>Math.round(v*100);
  const TOK=SRC;
  const cv=document.createElement('canvas'); cv.width=1000; cv.height=500; cv.style.cssText='width:100%;height:auto;display:block;background:#0d1117;border:1px solid var(--line);border-radius:10px';
  const g=cv.getContext('2d');
  host.innerHTML='<div class="mha-top"><div class="mha-steps" id="ppaSteps"></div><div class="mha-bar"><button class="addbtn" id="ppaPrev">◀ Geri</button><button class="addbtn" id="ppaPlay">⏸ Duraklat</button><button class="addbtn" id="ppaRe">↺ Baştan</button><button class="addbtn" id="ppaNext">İleri ▶</button><div class="mha-scrw"><input type="range" id="ppaScr" min="0" max="1000" value="0" class="mha-scr"><div class="mha-tk" id="ppaTk"></div></div><label>Hız <select id="ppaSpd"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div></div><div class="mha-grid"><div class="mha-3d" id="ppaOver"></div><div id="ppaCv"></div></div><div class="mha-boxes"><div class="mha-box mha-goal" id="ppaGoal"></div><div class="mha-box mha-soz" id="ppaSoz"></div><div class="mha-box mha-elde" id="ppaElde"></div></div>';
  document.getElementById('ppaCv').appendChild(cv);
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
  const AN=t=>'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">📖 <b>Çevirmen benzetmesi:</b> '+t+'</div>';
  const SC=[
   {tag:'Girdiler',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Makalenin modeli bir <b>çeviri</b> modeli: kaynak cümle <b>«kedi balığı yedi»</b> (Türkçe) → hedef <b>«cat ate fish»</b> (İngilizce). İki ayrı girdi var: <b>encoder</b> kaynağı, <b>decoder</b> şimdiye kadar yazılan hedefi (&lt;s&gt; cat ate) alır.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Makaledeki ilk fikir: okuyan taraf (encoder) ile yazan taraf (decoder) <b>ayrı</b>. Decoder girdisi <b>bir kayık</b>: «&lt;s&gt; cat ate» görünürken sıradaki kelime «fish» olmalı. Sayılar elle seçildi; gömme + konum bilgisinin eklendiği kabul edildi.'+AN('kaynak metin masanın üstünde duruyor; çevirmen yazdığı kısmı da önünde görüyor ve sıradaki kelimeyi arıyor.'),
    elde:'<b>📦 Elde ettik:</b> Kaynak X (3×4) ve hedef girdisi D (3×4). Sağdaki tablo yerine bu iki kümeyi izleyeceğiz.',
    draw:t=>{const a=st(t,0,2);mat(X,60,110,{cw:46,ch:36,title:'kaynak X (encoder girdisi)',alpha:a,fs:12,rows:SRC,cols:DIM,col:'#3fc7c1'});
      mat(D,560,110,{cw:46,ch:36,title:'hedef girdisi D (decoder)',alpha:st(t,1,2),fs:12,rows:TGT,cols:DIM,col:'#4aa3ff'});
      txt('Türkçe: kedi balığı yedi',60,330,'#9fb0d0',13);txt('İngilizce (yazılan kısım): <s> cat ate  →  sıradaki: fish',480,330,'#9fb0d0',13);}},
   {tag:'Encoder: kaynağı oku',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Encoder, kaynak cümleyi <b>Transformer Bloğu</b> dersindeki gibi işler: self-attention → Add&Norm → FFN → Add&Norm. Makalede bu blok <b>6 kez</b> üst üste; burada bir tane.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «yedi» artık kendi kartında «kedi ve balık» bilgisini de taşıyor (M sonuç tablosunun son satırı). Bu çıktıya <b>bellek</b> deniyor: kaynak cümlenin, bağlamla zenginleşmiş hâli. Decoder bunu <b>okuyacak ama değiştirmeyecek</b>.'+AN('kaynak metni <b>iyice anlayıp</b> notlarını çıkardın (bellek). Artık metne bakmadan değil, bu notlara bakarak yazacaksın.'),
    elde:'<b>📦 Elde ettik:</b> M (3×4) = encoder çıktısı. Üç kaynak kelimenin her biri bağlamıyla birlikte duruyor; decoder çapraz attention ile bunlara başvuracak.',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      mat(X,40,110,{cw:46,ch:34,title:'X',alpha:a0,fs:12,rows:SRC,col:'#3fc7c1'});
      g.save();g.globalAlpha=a1;g.fillStyle='#161d2c';g.strokeStyle='#ffd24a';g.lineWidth=2;g.fillRect(280,110,250,102);g.strokeRect(280,110,250,102);g.restore();
      g.save();g.globalAlpha=a1;txt('Encoder bloğu (× 6)',405,140,'#ffd24a',14,'center');txt('self-attention',405,162,'#ff9b3d',12,'center');txt('+ Add&Norm · FFN · Add&Norm',405,184,'#5fd18a',12,'center');g.restore();
      op('→',255,165,a1);op('→',555,165,a2);
      mat(M,600,110,{cw:46,ch:34,title:'M  (bellek)',alpha:a2,fs:12,rows:SRC,hr:2,col:'#5fd18a'});
      txt('sarı satır: «yedi» — artık kedi + balık bilgisi de var',40,330,'#ffd24a',13);}},
   {tag:'Decoder: maskeli self-attention',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Decoder önce <b>kendi yazdıklarına</b> bakar: &lt;s&gt; cat ate. Ama <b>maskeli</b>: bir kelime sağındakini (henüz yazılmamışı) göremez. Sonuç Add&Norm ile DN.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «ate» satırı: %'+pc(DA[2][0])+' &lt;s&gt;, %'+pc(DA[2][1])+' cat, %'+pc(DA[2][2])+' kendi. «&lt;s&gt;» yalnız kendini görebilir (%100). Bu, GPT\'nin kullandığı attention: <b>geçmişe bak, geleceğe bakma</b>, çünkü gelecek henüz yok (üretirken kopya çekilemez).'+AN('önce <b>kendi yazdığın cümlenin</b> tutarlı olup olmadığına bakıyorsun: «cat» dedim, şimdi fiil gelmeli.'),
    elde:'<b>📦 Elde ettik:</b> DN (3×4): hedef tarafının kendi içinde bağlamlanmış hâli. Henüz kaynak cümleyle hiç temas yok.',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      mat(SMASK,40,110,{cw:50,ch:34,title:'skor (üst üçgen −∞)',alpha:a0,fs:12,rows:TGT,cols:TGT});
      op('softmax →',270,170,a1);dots(DA,330,110,{c:58,title:'maskeli dikkat',col:'#ff9b3d',alpha:a1,rows:TGT,cols:TGT,hr:2});
      op('→ +D, LN →',590,170,a2);mat(DN,680,110,{cw:46,ch:34,title:'DN',alpha:a2,fs:12,rows:TGT,hr:2,col:'#4aa3ff'});
      txt('sarı satır: «ate»',40,330,'#ffd24a',13);}},
   {tag:'Çapraz attention (köprü)',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Makaleyi diğerlerinden ayıran adım: <b>Q decoder\'dan</b> (DN·W<sub>Q</sub>), <b>K ve V encoder\'dan</b> (M). Yani hedef taraf kaynak cümlenin hangi kelimesine bakacağını seçer.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «&lt;s&gt;» → %'+pc(Ac[0][0])+' <b>kedi</b> («cat» yazılacak), «cat» → %'+pc(Ac[1][2])+' <b>yedi</b> («ate» yazılacak), «ate» → %'+pc(Ac[2][1])+' <b>balığı</b> («fish» yazılacak). Türkçe SOV, İngilizce SVO: <b>sıra değişti</b> ama dikkat doğru kelimeyi buldu. Bu tabloya <b>hizalama</b> (alignment) denir.'+AN('yazarken <b>kaynak metne dönüp</b> «şimdi hangi kelimeyi çeviriyorum?» diye bakıyorsun; parmağın kelimeden kelimeye atlıyor.'),
    elde:'<b>📦 Elde ettik:</b> Ac (3×3): satır = yazılan taraf, sütun = kaynak kelime. Bu dikkat Bahdanau 2014\'te RNN\'e eklenen fikirdir; makale onu bütün modelin yapı taşı yaptı. (Hizalama burada bilerek elle kuruldu; eğitilmiş bir ağ bunu kendisi bulur.)',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      mat(Qc,30,110,{cw:46,ch:34,title:'Q = DN·W_Q (decoder)',alpha:a0,fs:12,rows:TGT,col:'#4aa3ff'});
      mat(tr(Kc),270,110,{cw:46,ch:34,title:'Kᵀ (encoder\'dan)',alpha:a0,fs:12,cols:SRC,col:'#3fc7c1'});
      op('softmax →',545,170,a1);
      dots(Ac,680,110,{c:62,title:'çapraz dikkat (hizalama)',col:'#ffd24a',alpha:a1,rows:TGT,cols:SRC});
      g.save();g.globalAlpha=a2;g.strokeStyle='#ffd24a';g.lineWidth=2;[[0,0],[1,2],[2,1]].forEach(([i,j])=>g.strokeRect(680+j*62-1,110+i*62-1,62,62));g.restore();
      txt('<s>→kedi · cat→yedi · ate→balığı',30,330,'#ffd24a',13);txt('çeviri sırası kaynağa göre değişiyor',30,356,'#9fb0d0',12);}},
   {tag:'Karışım + residual',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Çapraz dikkat yüzdeleriyle encoder belleği karıştırılır (C = A<sub>c</sub>·M), decoder kartına eklenir ve LayerNorm yapılır: DC = LN(DN + C). (Makalede arkasından bir FFN daha var; burada kısaltıldı.)',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «cat» pozisyonunun yeni kartı artık <b>yedi\'nin bilgisini</b> (eylem, geçmiş) taşıyor: «bundan sonra bir fiil gelmeli». «ate» pozisyonu <b>balığı\'nın</b> bilgisini (yemek) alıyor: «sıradaki nesne».'+AN('kaynakta baktığın kelimenin <b>anlamını</b> kendi notlarına yazdın; artık ne yazacağını bu not söylüyor.'),
    elde:'<b>📦 Elde ettik:</b> DC (3×4): her yazma pozisyonu için «kaynaktan alınan bilgi + o ana kadar yazılanlar».',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      dots(Ac,30,110,{c:50,title:'Ac',alpha:a0,rows:TGT,cols:SRC});op('·',215,160,a0);mat(M,240,110,{cw:46,ch:34,title:'M',alpha:a0,fs:12,rows:SRC,col:'#3fc7c1'});
      op('=',450,160,a1);mat(C,480,110,{cw:46,ch:34,title:'C = Ac·M',alpha:a1,fs:12,rows:TGT,col:'#ff9b3d'});
      op('+DN → LN →',720,160,a2);mat(DC,800,110,{cw:46,ch:34,title:'DC',alpha:a2,fs:11,rows:TGT,col:'#5fd18a'});
      txt('her satır: «bu pozisyonda ne yazılmalı?» bilgisi',30,330,'#9fb0d0',13);}},
   {tag:'Linear + softmax: sıradaki kelime',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Her pozisyonun kartı bir <b>Linear</b> katmanla (4×4) sözlükteki 4 kelimeye puanlanır, softmax ile yüzdeye çevrilir. Burada sözlük: cat, ate, fish, &lt;e&gt;.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «&lt;s&gt;» pozisyonu → <b>cat</b> (%'+pc(P[0][0])+'); «cat» → <b>ate</b> (%'+pc(P[1][1])+'); «ate» → <b>fish</b> (%'+pc(P[2][2])+'). Her pozisyon <b>kendisinden sonraki</b> kelimeyi tahmin ediyor; eğitimde hedef dizinin tamamı tek geçişte öğretilir (teacher forcing).'+AN('notlarına bakıp sözlükten <b>en uygun kelimeyi</b> seçiyorsun.'),
    elde:'<b>📦 Elde ettik:</b> Üç pozisyonda da doğru kelime: cat, ate, fish. Gerçek sözlükte 30–50 bin kelime olur; hesap aynı.',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      mat(DC,30,110,{cw:46,ch:34,title:'DC',alpha:a0,fs:11,rows:TGT});op('·',225,160,a0);mat(WO,250,110,{cw:46,ch:34,title:'W  4×4',alpha:a0,fs:11,col:'#b592f0'});
      op('=',445,160,a1);mat(LG,475,110,{cw:50,ch:34,title:'puanlar',alpha:a1,fs:12,rows:TGT,cols:VOC});
      op('softmax →',770,160,a2);dots(P,860,110,{c:34,title:'olasılık',col:'#ffd24a',alpha:a2,rows:TGT,cols:VOC});
      txt('tahmin: '+P.map(r=>VOC[r.indexOf(Math.max(...r))]).join(' · '),30,330,'#ffd24a',15);}},
   {tag:'Üretim döngüsü',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Gerçek çeviride «ate» henüz yazılmamış olur. Model <b>her seferinde yalnız bir kelime</b> üretir, onu hedefe ekler ve bütün decoder\'ı yeniden çalıştırır; encoder belleği M ise <b>bir kez</b> hesaplanıp tekrar kullanılır.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Tur 1: «&lt;s&gt;» → cat. Tur 2: «&lt;s&gt; cat» → ate. Tur 3: «&lt;s&gt; cat ate» → fish. Tur 4: «… fish» → &lt;e&gt; (bitti). Makalenin 2017\'deki devrimi: eğitimde bütün tablo <b>paralel</b>, üretimde sıralı.'+AN('önce ilk kelimeyi yazıp, sonra <b>yazdığını da önüne koyarak</b> ikinci kelimeye geçiyorsun; kaynak not defteri hep aynı kalıyor.'),
    elde:'<b>📦 Elde ettik:</b> Makaledeki bütün akış: encoder (×6) → bellek → decoder (×6: maskeli self + çapraz + FFN) → Linear + softmax → kelime → tekrar. Sonraki modeller yalnız encoder (BERT) ya da yalnız decoder (GPT) tarafını alır.',
    draw:t=>{const rows=[['<s>','cat'],['<s> cat','ate'],['<s> cat ate','fish'],['<s> cat ate fish','<e>']];
      rows.forEach(([a,b],i)=>{const al=st(t,i,4)>0?1:0.25;g.save();g.globalAlpha=Math.max(.25,st(t,i,4));txt('tur '+(i+1)+':',60,130+i*64,'#9fb0d0',14);
        g.fillStyle='#161d2c';g.strokeStyle='#4aa3ff';g.strokeRect(150,110+i*64,300,40);g.fillRect(150,110+i*64,300,40);txt(a,160,136+i*64,'#cdd4e4',14);
        txt('→  decoder  →',470,136+i*64,'#ffd24a',14);g.strokeStyle='#5fd18a';g.strokeRect(640,110+i*64,110,40);txt(b,695,136+i*64,'#5fd18a',16,'center');g.restore();});
      txt('encoder belleği M her turda aynı (bir kez hesaplandı)',60,400,'#9fb0d0',13);}}
  ];
  const SCENE3D=[0, 1, 2, 3, 4, 5, 6]; const DUR=9; let cur=0,t=0,playing=true,last=0;
  const stepsEl=document.getElementById('ppaSteps');
  stepsEl.innerHTML=SC.map((s,i)=>'<button data-i="'+i+'">'+(i+1)+'. '+s.tag+'</button>').join('');
  function show(){document.getElementById('ppaGoal').innerHTML=SC[cur].goal;document.getElementById('ppaSoz').innerHTML=SC[cur].soz;document.getElementById('ppaElde').innerHTML=SC[cur].elde;
    stepsEl.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('on',i===cur);b.classList.toggle('done',i<cur);});}
  const OV=window.__ppOverBuild?window.__ppOverBuild(document.getElementById('ppaOver')):null;
  const FOC=[['in-enc','in-dec'],['in-enc','sa-enc','ff-enc'],['in-dec','sa-dec'],['sa-dec','cross','bridge','ff-enc'],['cross','ff-dec'],['ff-dec','linear','softmax'],null];
  function post3d(n){if(OV)OV.focus(FOC[n]);}
  function go(i){cur=cl(i,0,SC.length-1);t=0;post3d(SCENE3D[cur]);try{const r=host.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight+40)host.scrollIntoView({block:'start',behavior:'smooth'});}catch(e){}playing=true;document.getElementById('ppaPlay').textContent='⏸ Duraklat';show();}
  function setScene(i,keepT){ if(i===cur) return; cur=i; post3d(SCENE3D[cur]); show(); }
  function frame(ts){const dt=last?(ts-last)/1000:0;last=ts;
    if(playing&&host.offsetParent){t+=dt*(+document.getElementById('ppaSpd').value)/DUR;
      if(t>=1){ if(cur<SC.length-1){ t-=1; setScene(cur+1); } else { t=1; playing=false; document.getElementById('ppaPlay').textContent='▶ Oynat'; } } }
    document.getElementById('ppaScr').value=Math.round((cur+t)/SC.length*1000);
    if(host.offsetParent){g.clearRect(0,0,1000,500);txt(SC[cur].tag,20,30,'#ffd24a',16);SC[cur].draw(t);}
    requestAnimationFrame(frame);}
  stepsEl.onclick=e=>{const b=e.target.closest('[data-i]');if(b)go(+b.dataset.i);};
  document.getElementById('ppaPrev').onclick=()=>go(cur-1); document.getElementById('ppaNext').onclick=()=>go(cur+1);
  document.getElementById('ppaRe').onclick=()=>go(cur);
  document.getElementById('ppaPlay').onclick=function(){if(t>=1){t=0;}playing=!playing;this.textContent=playing?'⏸ Duraklat':'▶ Oynat';};
  document.getElementById('ppaScr').oninput=function(){const gv=this.value/1000*SC.length;let i=Math.min(SC.length-1,Math.floor(gv));t=gv-i;if(this.value>=1000){i=SC.length-1;t=1;}setScene(i);playing=false;document.getElementById('ppaPlay').textContent='▶ Oynat';};
  document.getElementById('ppaTk').innerHTML=SC.map((_,i)=>'<span style="left:'+((i+.5)/SC.length*100)+'%">'+(i+1)+'</span>'+(i?'<i style="left:'+(i/SC.length*100)+'%"></i>':'')).join('');
  window.__ppAnim={SC,go};
  post3d(0); show(); requestAnimationFrame(frame);
})();
