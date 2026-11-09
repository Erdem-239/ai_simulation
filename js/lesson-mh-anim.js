// Multi-Head → Simülasyon: bu derse özel sıralı sahne animasyonu (mimari yok, kavram var).
// Minik örnek: "kabarık mavi yaratık", d=4, 2 kafa (d_k=2). Her kafanın KENDİ W_Q,W_K,W_V'si → kendi dikkat deseni → çıktılar yapışır → W_O → residual.
(function(){
  const host=document.getElementById('mhAnim'); if(!host) return;
  const TOK=['kabarık','mavi','yaratık'], DIM=['sıfat','renk','isim','doku'];
  const X=[[1,0,0,1],[1,1,0,0],[0,0,1,0]];
  const WQ=[[[0,0],[0,0],[2,0],[0,0]],[[0,0],[0,0],[0,2],[0,0]]];
  const WK=[[[0,0],[0,0],[0,0],[2,0]],[[0,0],[2*0+0,2],[0,0],[0,0]]];
  WK[1]=[[0,0],[0,2],[0,0],[0,0]];
  const WV=[[[0,0],[0,0],[0,0],[1,0]],[[0,0],[0,1],[0,0],[0,0]]];
  const WO=[[0,0,0,1],[0,0,0,0],[0,0,0,0],[0,1,0,0]];
  const CH=['#4aa3ff','#ff9b3d'];
  const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((t,v,k)=>t+v*B[k][j],0)));
  const tr=A=>A[0].map((_,j)=>A.map(r=>r[j]));
  const Q=[0,1].map(i=>mm(X,WQ[i])), K=[0,1].map(i=>mm(X,WK[i])), V=[0,1].map(i=>mm(X,WV[i]));
  const S=[0,1].map(i=>mm(Q[i],tr(K[i])).map(r=>r.map(v=>v/Math.SQRT2)));
  const A=S.map(M=>M.map((r,i)=>{const e=r.map((v,j)=>j<=i?Math.exp(v):0), t=e.reduce((a,b)=>a+b,0); return e.map(v=>v/t);}));
  const Hh=[0,1].map(i=>mm(A[i],V[i]));
  const CAT=X.map((_,r)=>[...Hh[0][r],...Hh[1][r]]);
  const DEL=mm(CAT,WO), OUT=X.map((r,i)=>r.map((v,j)=>v+DEL[i][j]));
  const WQbig=WQ[0].map((r,i)=>[...r,...WQ[1][i]]), Qbig=mm(X,WQbig);
  const f=v=>{const r=Math.round(v*100)/100; return (Object.is(r,-0)?0:r).toString().replace('.',',');};
  const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), st=(t,i,n)=>cl(t*n-i);   // t: 0..1 sahne ilerlemesi; st: i. aşamanın 0..1 ilerlemesi
  const cv=document.createElement('canvas'); cv.width=1000; cv.height=500; cv.style.cssText='width:100%;height:auto;display:block;background:#0d1117;border:1px solid var(--line);border-radius:10px';
  const g=cv.getContext('2d');
  host.innerHTML='<div class="mha-top"><div class="mha-steps" id="mhaSteps"></div><div class="mha-bar"><button class="addbtn" id="mhaPrev">◀ Geri</button><button class="addbtn" id="mhaPlay">⏸ Duraklat</button><button class="addbtn" id="mhaRe">↺ Baştan</button><button class="addbtn" id="mhaNext">İleri ▶</button><div class="mha-scrw"><input type="range" id="mhaScr" min="0" max="1000" value="0" class="mha-scr"><div class="mha-tk" id="mhaTk"></div></div><label>Hız <select id="mhaSpd"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div></div><div class="mha-grid"><div class="mha-3d"><iframe id="mha3d" title="Minik 3B mimari" src="'+(host.dataset['3d']||'')+'"></iframe></div><div id="mhaCv"></div></div><div class="mha-boxes"><div class="mha-box mha-goal" id="mhaGoal"></div><div class="mha-box mha-soz" id="mhaSoz"></div><div class="mha-box mha-elde" id="mhaElde"></div></div>';
  document.getElementById('mhaCv').appendChild(cv);
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
  const colsN=['q1','q2'];
  // ---- sahneler ----
  const SC=[
   {tag:'Girdi',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Cümlemiz «kabarık mavi yaratık». Her kelime 4 sayılık bir kart (d = 4). Bu minik örnekte sayılar elle seçildi: <b>sıfat</b>, <b>renk</b>, <b>isim</b>, <b>doku</b> boyutları.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «kabarık» = sıfat + dokulu, «mavi» = sıfat + renk, «yaratık» = isim. Tek başına «yaratık» kartında ne rengini ne dokusunu bilir; bunu çevresinden öğrenmesi gerekir.',
    elde:'<b>📦 Elde ettik:</b> X (3×4): üç kelime, her biri 4 sayı. Sonraki sahnelerde bu X\'e iki farklı <b>kafa</b> bakacak.',
    draw:t=>{mat(X,330,110,{cw:70,ch:46,rows:TOK,title:'X  (3 kelime × 4 boyut)',alpha:st(t,0,2),fs:14});
      DIM.forEach((s,j)=>txt(s,330+j*70+34,92,'#9fb0d0',11,'center'));
      txt('→ her satır bir kelimenin kartı',330,330,'#9fb0d0',13);}},
   ...[0,1].map(h=>({tag:'Kafa '+(h+1)+' kendi W\'leri',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> <b style="color:'+CH[h]+'">Kafa '+(h+1)+'</b> X\'i <b>kendi</b> üç küçük tablosuyla (W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>, her biri 4×2) çarpar → kendi Q, K, V\'sini çıkarır. Başka hiçbir kafa bu tablolara dokunmaz.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> '+(h===0?'Bu kafanın W<sub>Q</sub>\'su <b>isim</b> satırını okuyup «ben <b>dokulu</b> bir şey arıyorum» sorusuna çeviriyor; W<sub>K</sub> kelimelerin <b>doku</b> boyutunu «bende doku var» etiketine çeviriyor. Yani kafa 1 = doku kafası.':'Bu kafanın W<sub>Q</sub>\'su isim satırından «ben bir <b>renk</b> arıyorum» sorusu çıkarıyor; W<sub>K</sub> <b>renk</b> boyutunu etiket yapıyor. Aynı X, <b>başka</b> W → başka soru. Kafa 2 = renk kafası.'),
    elde:'<b>📦 Elde ettik:</b> Q'+(h+1)+', K'+(h+1)+', V'+(h+1)+' (her biri 3×2). Hepsi bu kafaya özel. Dikkat: 4 boyutluk kartlar 2 boyuta indi (d<sub>k</sub> = d ÷ kafa sayısı = 2).',
    draw:t=>{const c=CH[h];
      [['W_Q',WQ[h],Q[h],'Q'],['W_K',WK[h],K[h],'K'],['W_V',WV[h],V[h],'V']].forEach(([n,W,R,nm],i)=>{
        const a=st(t,i,3), x0=90+i*320;
        mat(W,x0,90,{cw:36,ch:28,col:c,title:n+'^('+(h+1)+')  4×2',alpha:a,fs:11,rows:DIM});
        op('↓  X ·',x0+30,230,a);
        mat(R,x0,250,{cw:36,ch:28,col:c,title:nm+(h+1)+' = X · '+n+'  (3×2)',alpha:a,fs:12,rows:TOK});});
      txt('X (3×4) üç kafaya da aynı; fark W tablolarında',90,400,'#9fb0d0',13);
      txt('bu kafanın kendi renkli tabloları',90,425,c,13);}})),
   {tag:'Her kafa kendi dikkat deseni',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Her kafa kendi Q ve K\'sını çarpıp (Q·Kᵀ ÷ √d<sub>k</sub>) kendi skor tablosunu çıkarır, <b>üst üçgen kapatılır</b> (kelime sağındakini göremez) ve her satıra softmax uygulanır. Sonuç: iki ayrı <b>dikkat deseni</b>.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «yaratık» satırına bak (sarı çerçeve): <b style="color:'+CH[0]+'">kafa 1</b> %89 «kabarık»a bakıyor (doku arıyordu), <b style="color:'+CH[1]+'">kafa 2</b> %89 «mavi»ye bakıyor (renk arıyordu). Aynı cümle, aynı kelime, iki <b>farklı</b> bakış. Çoklu kafanın bütün fikri bu.',
    elde:'<b>📦 Elde ettik:</b> İki 3×3 dikkat tablosu (her satırın toplamı %100). Bunlar, hangi kelimenin hangisinden <b>ne kadar</b> alacağını söyler.',
    draw:t=>{[0,1].forEach(h=>{const x=110+h*470, a=st(t,h,2);
      dots(A[h],x+30,120,{c:56,title:'kafa '+(h+1)+' — dikkat deseni',col:CH[h],alpha:a,rows:TOK,cols:TOK,hr:2});
      txt('(satır = soran, sütun = bakılan)',x+30,320,'#9fb0d0',11);});
      txt('üst üçgen boş: kelime sağındakini göremez (maske)',110,395,'#9fb0d0',12);}},
   {tag:'A·V: kendi karışımı',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Her kafa kendi dikkat yüzdeleriyle kendi V\'sini karıştırır (A·V). Satır başına: yüzde × değer + yüzde × değer…',
    soz:'<b>🗣️ Ne anlama geliyor?</b> «yaratık» için kafa 1: %89×V<sub>kabarık</sub> ≈ <b>doku bilgisi</b>; kafa 2: %89×V<sub>mavi</sub> ≈ <b>renk bilgisi</b>. Her kafa kelimeye <b>kendi</b> önerisini hazırladı; henüz kimse kelimeyi değiştirmedi.',
    elde:'<b>📦 Elde ettik:</b> Her kafadan bir 3×2 çıktı (kafa 1: '+f(Hh[0][2][0])+', '+f(Hh[0][2][1])+' ; kafa 2: '+f(Hh[1][2][0])+', '+f(Hh[1][2][1])+' «yaratık» satırında).',
    draw:t=>{[0,1].forEach(h=>{const x=60+h*480, a=st(t,h,2);
      mat(A[h].map(r=>r.map(v=>v*2)),x,100,{cw:44,ch:30,col:CH[h],title:'A'+(h+1)+' (yüzde ×2 gösterim)',alpha:a,rows:TOK,hr:2,fs:11});
      op('·',x+144,160,a); mat(V[h],x+170,100,{cw:44,ch:30,col:CH[h],title:'V'+(h+1),alpha:a,fs:11,hr:2});
      op('=',x+280,160,a); mat(Hh[h],x+300,100,{cw:44,ch:30,col:CH[h],title:'kafa'+(h+1)+' çıktısı',alpha:a,fs:12,hr:2});});
      txt('sarı satır: «yaratık»',60,300,'#ffd24a',13);}},
   {tag:'Yapıştır + W_O + residual',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> İki kafanın çıktısı <b>yan yana yapıştırılır</b> (3×2 | 3×2 → 3×4), W<sub>O</sub> (4×4) ile karıştırılır, sonuç kelimenin <b>eski kartına eklenir</b> (residual).',
    soz:'<b>🗣️ Ne anlama geliyor?</b> W<sub>O</sub> kafaların önerilerini kelimenin kendi boyutlarına geri yerleştirir: kafa 1\'in doku bilgisi → <b>doku</b> boyutuna, kafa 2\'nin renk bilgisi → <b>renk</b> boyutuna. «yaratık» artık <b>mavi + dokulu</b> bir yaratık. Kafalar arasındaki TEK iletişim burası.',
    elde:'<b>📦 Elde ettik:</b> X\' = X + Concat·W<sub>O</sub>. «yaratık» kartı: ['+X[2].map(f).join(', ')+'] → <b>['+OUT[2].map(f).join(', ')+']</b>. İşte «kabarık mavi yaratık».',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      const c1=CAT.map(r=>r.slice(0,2)), c2=CAT.map(r=>r.slice(2));
      mat(c1,40,100,{cw:38,ch:30,col:CH[0],title:'kafa 1',alpha:a0,fs:11,hr:2}); mat(c2,126,100,{cw:38,ch:30,col:CH[1],title:'kafa 2',alpha:a0,fs:11,hr:2});
      op('·',200,160,a1); mat(WO,225,100,{cw:34,ch:30,title:'W_O  4×4',alpha:a1,fs:11});
      op('=',385,160,a1); mat(DEL,410,100,{cw:38,ch:30,title:'Δ (öneri)',alpha:a1,fs:11,hr:2});
      op('+',580,160,a2); mat(X,605,100,{cw:34,ch:30,title:'X (eski)',alpha:a2,fs:11,hr:2});
      op('=',745,160,a2); mat(OUT,770,100,{cw:34,ch:30,title:"X' (yeni)",alpha:a2,fs:11,hr:2,cols:DIM});
      txt('sarı satır: «yaratık» — 0 → renk ve doku kazandı',40,330,'#ffd24a',13);}},
   {tag:'Aynı iş, tek büyük tabloda',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Gerçek modellerde iki küçük W<sub>Q</sub>\'yu ayrı tutmazlar: yan yana dizip <b>tek büyük W<sub>Q</sub></b> (4×4) yaparlar. Kafa i = büyük tablonun i. <b>sütun dilimi</b>. Hesap aynı, yalnız saklama farklı.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Sağdaki X·W<sub>Q</sub><sup>büyük</sup> sonucunun ilk iki sütunu = kafa 1\'in Q\'su, son iki sütunu = kafa 2\'nin Q\'su (üstteki sahneden birebir aynı). GPT-2\'de bu tablo 768×768 ve 12 dilime bölünür; K ve V için de aynı. Mimari sayfalarındaki «12 kafa» kartlarının nereden geldiği budur.',
    elde:'<b>📦 Elde ettik:</b> «Kafa» = ayrı bir model değil, tek büyük tablonun <b>sütun dilimi</b>. Kafa sayısını artırmak ağırlık sayısını artırmaz, yalnız dilimleri inceltir (d<sub>k</sub> = d ÷ h).',
    draw:t=>{const a0=st(t,0,3),a1=st(t,1,3),a2=st(t,2,3);
      mat(WQ[0],40,110,{cw:34,ch:30,col:CH[0],title:'W_Q^(1)',alpha:a0,fs:11}); mat(WQ[1],122,110,{cw:34,ch:30,col:CH[1],title:'W_Q^(2)',alpha:a0,fs:11});
      op('⟹',230,175,a1); mat(WQbig,265,110,{cw:34,ch:30,title:'tek W_Q  4×4',alpha:a1,fs:11});
      [0,1].forEach(h=>{g.save();g.globalAlpha=a1;g.strokeStyle=CH[h];g.lineWidth=3;g.strokeRect(265+h*68-2,110-2,66,124);g.restore();});
      op('→  X · W_Q =',470,175,a2); mat(Qbig,560,110,{cw:38,ch:30,title:'Q  3×4 = [Q1 | Q2]',alpha:a2,fs:11,rows:TOK});
      [0,1].forEach(h=>{g.save();g.globalAlpha=a2;g.strokeStyle=CH[h];g.lineWidth=3;g.strokeRect(560+h*76-2,110-2,76,94);g.restore();});
      txt('mavi dilim = kafa 1, turuncu dilim = kafa 2',40,330,'#9fb0d0',13);}}
  ];
  const SCENE3D=[0,1,2,3,4,5,6]; const DUR=9; let cur=0,t=0,playing=true,last=0;
  const stepsEl=document.getElementById('mhaSteps');
  stepsEl.innerHTML=SC.map((s,i)=>'<button data-i="'+i+'">'+(i+1)+'. '+s.tag+'</button>').join('');
  function show(){document.getElementById('mhaGoal').innerHTML=SC[cur].goal;document.getElementById('mhaSoz').innerHTML=SC[cur].soz;document.getElementById('mhaElde').innerHTML=SC[cur].elde;
    stepsEl.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('on',i===cur);b.classList.toggle('done',i<cur);});}
  let f3=document.getElementById('mha3d'),f3ok=false,f3pend=null;
  if(f3)f3.addEventListener('load',()=>{f3ok=true;if(f3pend!=null)f3.contentWindow.postMessage({type:'mh3d',scene:f3pend},'*');});
  function post3d(n){f3pend=n;if(f3&&f3ok)f3.contentWindow.postMessage({type:'mh3d',scene:n},'*');}
  function go(i){cur=cl(i,0,SC.length-1);t=0;post3d(SCENE3D[cur]);try{const r=host.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight+40)host.scrollIntoView({block:'start',behavior:'smooth'});}catch(e){}playing=true;document.getElementById('mhaPlay').textContent='⏸ Duraklat';show();}
  function setScene(i,keepT){ if(i===cur) return; cur=i; post3d(SCENE3D[cur]); show(); }
  function frame(ts){const dt=last?(ts-last)/1000:0;last=ts;
    if(playing&&host.offsetParent){t+=dt*(+document.getElementById('mhaSpd').value)/DUR;
      if(t>=1){ if(cur<SC.length-1){ t-=1; setScene(cur+1); } else { t=1; playing=false; document.getElementById('mhaPlay').textContent='▶ Oynat'; } } }
    document.getElementById('mhaScr').value=Math.round((cur+t)/SC.length*1000);
    if(host.offsetParent){g.clearRect(0,0,1000,500);txt(SC[cur].tag,20,30,'#ffd24a',16);SC[cur].draw(t);}
    requestAnimationFrame(frame);}
  stepsEl.onclick=e=>{const b=e.target.closest('[data-i]');if(b)go(+b.dataset.i);};
  document.getElementById('mhaPrev').onclick=()=>go(cur-1); document.getElementById('mhaNext').onclick=()=>go(cur+1);
  document.getElementById('mhaRe').onclick=()=>go(cur);
  document.getElementById('mhaPlay').onclick=function(){if(t>=1){t=0;}playing=!playing;this.textContent=playing?'⏸ Duraklat':'▶ Oynat';};
  document.getElementById('mhaScr').oninput=function(){const gv=this.value/1000*SC.length;let i=Math.min(SC.length-1,Math.floor(gv));t=gv-i;if(this.value>=1000){i=SC.length-1;t=1;}setScene(i);playing=false;document.getElementById('mhaPlay').textContent='▶ Oynat';};
  document.getElementById('mhaTk').innerHTML=SC.map((_,i)=>'<span style="left:'+((i+.5)/SC.length*100)+'%">'+(i+1)+'</span>'+(i?'<i style="left:'+(i/SC.length*100)+'%"></i>':'')).join('');
  window.__mhAnim={SC,A,Hh,OUT,CAT,Qbig,go};
  post3d(0); show(); requestAnimationFrame(frame);
})();
