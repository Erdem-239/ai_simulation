// CNN → Simülasyon: minik animasyon + 3B (6x6 resim, dikey kenar filtresi).
(function(){
  const host=document.getElementById('cnAnim'); if(!host) return;
  const IMG=[0,1,2,3,4,5].map(()=>[0,0,1,1,0,0]);
  const K=[[1,0,-1],[1,0,-1],[1,0,-1]];
  const MAP=[0,1,2,3].map(i=>[0,1,2,3].map(j=>{let s=0;for(let a=0;a<3;a++)for(let b=0;b<3;b++)s+=IMG[i+a][j+b]*K[a][b];return s;}));
  const RL=MAP.map(r=>r.map(v=>Math.max(0,v)));
  const PL=[0,1].map(i=>[0,1].map(j=>Math.max(RL[2*i][2*j],RL[2*i][2*j+1],RL[2*i+1][2*j],RL[2*i+1][2*j+1])));
  const FL=[[PL[0][0],PL[0][1],PL[1][0],PL[1][1]]];
  const WF=[[0.2,0.5],[0.5,-0.1],[0.2,0.5],[0.5,-0.1]];
  const WFd=[[0.2,0.5],[0.5,-0.1],[0.2,0.5],[0.5,-0.1]];
  const LG=[[0,1].map(c=>FL[0].reduce((s,v,k)=>s+v*WFd[k][c],0))];
  const SM=(()=>{const e=LG[0].map(Math.exp),t=e[0]+e[1];return [[e[0]/t,e[1]/t]];})();
  const CLS=['dikey çubuk','yatay çubuk'];
  const f=v=>{const r=Math.round(v*100)/100; return (Object.is(r,-0)?0:r).toString().replace('.',',');};
  const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), st=(t,i,n)=>cl(t*n-i);
  const TOK=['','',''], DIM=[];
  const cv=document.createElement('canvas'); cv.width=1000; cv.height=500; cv.style.cssText='width:100%;height:auto;display:block;background:#0d1117;border:1px solid var(--line);border-radius:10px';
  const g=cv.getContext('2d');
  host.innerHTML='<div class="mha-top"><div class="mha-steps" id="cnaSteps"></div><div class="mha-bar"><button class="addbtn" id="cnaPrev">◀ Geri</button><button class="addbtn" id="cnaPlay">⏸ Duraklat</button><button class="addbtn" id="cnaRe">↺ Baştan</button><button class="addbtn" id="cnaNext">İleri ▶</button><div class="mha-scrw"><input type="range" id="cnaScr" min="0" max="1000" value="0" class="mha-scr"><div class="mha-tk" id="cnaTk"></div></div><label>Hız <select id="cnaSpd"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div></div><div class="mha-grid"><div class="mha-3d"><iframe id="cna3d" title="Minik 3B mimari" src="'+(host.dataset['3d']||'')+'"></iframe></div><div id="cnaCv"></div></div><div class="mha-boxes"><div class="mha-box mha-goal" id="cnaGoal"></div><div class="mha-box mha-soz" id="cnaSoz"></div><div class="mha-box mha-elde" id="cnaElde"></div></div>';
  document.getElementById('cnaCv').appendChild(cv);
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
   {tag:'Resim',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Bilgisayar için resim bir <b>sayı tablosu</b>: burada 6×6 küçük bir siyah-beyaz resim (1 = beyaz piksel, 0 = siyah). Ortada iki sütun genişliğinde <b>dikey bir çubuk</b> var.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Biz çubuğu gözümüzle görürüz; ağ ise yalnız sayıları görür. Görevi: «bu resimde <b>dikey çubuk</b> mu var, <b>yatay çubuk</b> mu?» sorusunu cevaplamak. Bunu piksel piksel değil, <b>küçük desenlere bakarak</b> yapacak.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🔍 <b>Büyüteç benzetmesi:</b> resmi tek seferde değil, elinde küçük bir <b>büyüteçle</b> gezerek inceleyeceğiz.</div>',
    elde:'<b>📦 Elde ettik:</b> I (6×6) = 36 sayı. Tam bağlı bir ağ bunu 36 ayrı girdi sayardı; konvolüsyon ise komşu pikselleri birlikte görür.',
    draw:t=>{mat(IMG,330,100,{cw:50,ch:44,title:'resim  6×6',alpha:st(t,0,2),fs:13,col:'#ffd24a'});
      txt('0 = siyah, 1 = beyaz',330,390,'#9fb0d0',13);}},
   {tag:'Filtre (büyüteç)',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Küçük bir <b>3×3 filtre</b> seçiyoruz: «sol taraf parlak, sağ taraf karanlık mı?» diye soran <b>dikey kenar dedektörü</b>. Sol sütun +1, orta 0, sağ sütun −1.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Filtre 9 sayılık bir <b>desen şablonu</b>. Resmin bir 3×3 parçası bu şablonla örtüşürse (solda beyaz, sağda siyah) toplam <b>büyük artı</b> çıkar; tersi ise <b>eksi</b>; düz bölgede <b>0</b>. Bu filtreyi biz elle seçtik; gerçek ağda <b>eğitim</b> bulur.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🔍 <b>Büyüteç benzetmesi:</b> filtre, üstünde «dikey çizgi gördüm mü?» sorusu yazan <b>özel bir büyüteç</b>. Yalnız o deseni arar.</div>',
    elde:'<b>📦 Elde ettik:</b> K (3×3), 9 ağırlık. Resim ne kadar büyük olursa olsun <b>aynı 9 sayı</b> kullanılır — konvolüsyonun parametre tasarrufu buradan gelir.',
    draw:t=>{mat(K,400,110,{cw:70,ch:60,title:'filtre K  3×3  (dikey kenar)',alpha:st(t,0,2),fs:16,col:'#b592f0'});
      txt('sol sütun +1 · orta 0 · sağ sütun −1',400,360,'#9fb0d0',13);}},
   {tag:'Filtre resmin üstünde kayar',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Filtreyi resmin sol üstüne koyup 9 çarpımı toplarız; sonra <b>bir piksel kaydırıp</b> tekrar ederiz. 6×6 resimde 3×3 pencere 4×4 = 16 konuma sığar; her konum haritada bir hücre.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Sarı pencerenin altındaki 9 piksel filtreyle <b>çarpılıp toplanır</b>. Pencere çubuğun <b>sol kenarına</b> gelince (solda 0, sağda 1) sonuç <b>−3</b>; <b>sağ kenarına</b> gelince <b>+3</b>; çubuğun tam üstünde ya da düzlükte 0. Harita «dikey kenar tam burada» diye işaretlenmiş oldu.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🔍 <b>Büyüteç benzetmesi:</b> büyüteci resmin üstünde <b>satır satır gezdirip</b> her durakta «burada dikey çizgi var mı?» puanı yazıyorsun; puanlar bir harita olur.</div>',
    elde:'<b>📦 Elde ettik:</b> 16 puandan oluşan özellik haritası (4×4). Aynı filtre her yerde kullanıldı, yani çubuk resmin <b>neresinde olursa olsun</b> bulunur.',
    draw:t=>{const k=Math.min(15,Math.floor(t*16)),ri=Math.floor(k/4),ci=k%4;
      mat(IMG,30,110,{cw:34,ch:32,title:'resim',fs:11,col:'#4a5878'});
      g.save();g.strokeStyle='#ffd24a';g.lineWidth=3;g.strokeRect(30+ci*34-1,110+ri*32-1,3*34,3*32);g.restore();
      mat(K,290,110,{cw:34,ch:32,title:'filtre',fs:11,col:'#b592f0'});
      let s=0,parts=[];for(let a=0;a<3;a++)for(let b=0;b<3;b++){const p=IMG[ri+a][ci+b],w=K[a][b];s+=p*w;if(p*w!==0)parts.push((p*w>0?'+':'')+(p*w));}
      txt('pencere ('+(ri+1)+'. satır, '+(ci+1)+'. sütun)',30,330,'#ffd24a',13);
      txt('Σ = '+(parts.length?parts.join(' '):'0 (hepsi sıfır)')+'  =  '+s,30,356,'#ffd24a',14);
      mat(MAP,470,110,{cw:46,ch:36,title:'özellik haritası',fs:13,col:'#5fd18a',rev:(i,j)=>(i*4+j<=k)?1:0});
      g.save();g.strokeStyle='#ffd24a';g.lineWidth=2.5;g.strokeRect(470+ci*46-1,110+ri*36-1,46,36);g.restore();
      txt('16 konumun '+(k+1)+'.\'si',470,300,'#9fb0d0',13);}},
   {tag:'Özellik haritası',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> 16 konumun hepsi dolunca elimizde <b>özellik haritası</b> (4×4) var: filtrenin her konumdaki puanı. Her satır aynı: [−3, −3, +3, +3].',
    soz:'<b>🗣️ Ne anlama geliyor?</b> <b>−3</b> = «burada çubuğun sol kenarı var» (solda 0, sağda 1 geçişi), <b>+3</b> = «çubuğun sağ kenarı», yani karşı yönde bir geçiş. Haritanın iki kenarı bulduğunu, ikisinin de <b>her satırda</b> aynı yerde olduğunu görüyoruz → çizgi <b>dikey</b>.',
    elde:'<b>📦 Elde ettik:</b> MAP (4×4). Artık ağ piksellere değil <b>«kenar var/yok»</b> bilgisine bakıyor.',
    draw:t=>{mat(MAP,330,100,{cw:80,ch:56,title:'özellik haritası  4×4',alpha:st(t,0,2),fs:17,col:'#5fd18a'});
      txt('−3: sol kenar   ·   +3: sağ kenar   ·   her satır aynı → dikey çizgi',230,380,'#9fb0d0',13);}},
   {tag:'ReLU',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Haritadaki <b>negatif sayılar 0 yapılır</b> (ReLU: max(0, x)). Yani yalnızca «bu deseni buldum» diyen güçlü artı puanlar kalır.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> −3 «sol kenar» demekti, bizim filtre ise «solda parlak, sağda koyu» arıyordu; sol kenar bu deseni <b>aramadığımız tersi</b>. ReLU bu «hayır» sonuçlarını siler, yalnızca +3\'ler (aradığımız desen) kalır.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🔍 <b>Büyüteç benzetmesi:</b> «bulamadım» notlarını çöpe atıp yalnızca «buldum!» notlarını bırakıyorsun.</div>',
    elde:'<b>📦 Elde ettik:</b> RELU (4×4) = [0, 0, 3, 3] her satırda. Doğrusal olmayan bu adım olmasa art arda filtreler tek bir filtreye indirgenirdi.',
    draw:t=>{const a0=st(t,0,2),a1=st(t,1,2);
      mat(MAP,60,110,{cw:60,ch:46,title:'harita',alpha:a0,fs:15,col:'#5fd18a'}); op('ReLU: max(0, x) →',400,205,a1);
      mat(RL,520,110,{cw:60,ch:46,title:'ReLU sonrası',alpha:a1,fs:15,col:'#ff9b3d'});
      txt('negatifler 0 oldu',60,340,'#9fb0d0',13);}},
   {tag:'Max-pool 2×2',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> Haritayı 2×2\'lik bloklara bölüp her bloktan <b>en büyük sayıyı</b> alırız (max-pool). 4×4 → 2×2.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Sağ üst blok [[3,3],[3,3]] → <b>3</b>; sol üst blok [[0,0],[0,0]] → <b>0</b>. Yani «bu bölgede deseni buldum mu?» sorusu kalır, <b>tam olarak hangi pikselde</b> olduğu unutulur. Küçük kaymalara karşı dayanıklılık buradan gelir.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🔍 <b>Büyüteç benzetmesi:</b> resmi dört bölgeye ayırıp her bölge için <b>tek cümlelik rapor</b> yazıyorsun: «bu köşede güçlü bir şey var mı?»</div>',
    elde:'<b>📦 Elde ettik:</b> POOL (2×2) = [[0,3],[0,3]]. Veri 4 kat küçüldü, en önemli bilgi (çubuk sağ yarıda) kaldı.',
    draw:t=>{const a0=st(t,0,2),a1=st(t,1,2);
      mat(RL,60,110,{cw:60,ch:46,title:'ReLU haritası',alpha:a0,fs:15});
      [[0,0],[0,1],[1,0],[1,1]].forEach(([i,j],k)=>{g.save();g.globalAlpha=a0;g.strokeStyle=['#4aa3ff','#ff9b3d','#b592f0','#5fd18a'][k];g.lineWidth=3;g.strokeRect(60+j*120-1,110+i*92-1,120,92);g.restore();});
      op('max →',400,205,a1);
      mat(PL,520,150,{cw:90,ch:60,title:'havuz sonrası 2×2',alpha:a1,fs:18,col:'#ff9b3d'});
      txt('her renkli blokta en büyük sayı seçilir',60,340,'#9fb0d0',13);}},
   {tag:'Düzleştir + karar',
    goal:'<b>🎯 Bu adımda ne yapıyoruz?</b> 2×2\'lik tablo tek sıraya dizilir (4 sayı), küçük bir <b>tam bağlı katmana</b> girer (4×2 ağırlık) → iki sınıf için puan (dikey / yatay), softmax ile yüzdeye çevrilir.',
    soz:'<b>🗣️ Ne anlama geliyor?</b> Düzleşmiş [0, 3, 0, 3] × ağırlıklar → dikey puanı <b>'+f(LG[0][0])+'</b>, yatay puanı <b>'+f(LG[0][1])+'</b> → softmax: <b>%'+Math.round(SM[0][0]*100)+' dikey</b>, %'+Math.round(SM[0][1]*100)+' yatay. Ağ «bu resimde sağ yarıda dikey bir kenar var, bu da dikey çubuk demektir» diye karar verdi.'+'<div style="margin-top:5px;padding:4px 8px;border-left:3px solid #ff9b3d;background:rgba(255,155,61,.08)">🔍 <b>Büyüteç benzetmesi:</b> dört bölgenin raporları <b>jüriye</b> verilir; jüri hangi raporlara ne kadar güveneceğini ağırlıklarla bilir ve oy verir.</div>',
    elde:'<b>📦 Elde ettik:</b> Resim → «%'+Math.round(SM[0][0]*100)+' dikey çubuk». Gerçek ağda filtre ve ağırlıklar elle değil <b>eğitimle</b> bulunur (Örnek Çalışmalar).',
    draw:t=>{const a0=st(t,0,4),a1=st(t,1,4),a2=st(t,2,4),a3=st(t,3,4);
      mat(PL,30,110,{cw:50,ch:44,title:'2×2',alpha:a0,fs:14}); op('→ düzleştir →',250,160,a1);
      mat(FL,350,130,{cw:46,ch:44,title:'1×4',alpha:a1,fs:14}); op('·',560,160,a2);
      mat(WFd,590,100,{cw:46,ch:30,title:'W  4×2',alpha:a2,fs:12,col:'#b592f0'}); op('=',730,160,a3);
      mat(LG,760,130,{cw:60,ch:44,title:'puanlar',alpha:a3,fs:13,cols:['dikey','yatay']});
      txt('softmax → %'+Math.round(SM[0][0]*100)+' dikey · %'+Math.round(SM[0][1]*100)+' yatay',30,340,'#ffd24a',16);}}
  ];
  const SCENE3D=[0, 1, 2, 3, 4, 5, 6]; const DUR=9; let cur=0,t=0,playing=true,last=0;
  const stepsEl=document.getElementById('cnaSteps');
  stepsEl.innerHTML=SC.map((s,i)=>'<button data-i="'+i+'">'+(i+1)+'. '+s.tag+'</button>').join('');
  function show(){document.getElementById('cnaGoal').innerHTML=SC[cur].goal;document.getElementById('cnaSoz').innerHTML=SC[cur].soz;document.getElementById('cnaElde').innerHTML=SC[cur].elde;
    stepsEl.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('on',i===cur);b.classList.toggle('done',i<cur);});}
  let f3=document.getElementById('cna3d'),f3ok=false,f3pend=null;
  if(f3)f3.addEventListener('load',()=>{f3ok=true;if(f3pend!=null)f3.contentWindow.postMessage({type:'cn3d',scene:f3pend},'*');});
  function post3d(n){f3pend=n;if(f3&&f3ok)f3.contentWindow.postMessage({type:'cn3d',scene:n},'*');}
  function go(i){cur=cl(i,0,SC.length-1);t=0;post3d(SCENE3D[cur]);try{const r=host.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight+40)host.scrollIntoView({block:'start',behavior:'smooth'});}catch(e){}playing=true;document.getElementById('cnaPlay').textContent='⏸ Duraklat';show();}
  function setScene(i,keepT){ if(i===cur) return; cur=i; post3d(SCENE3D[cur]); show(); }
  function frame(ts){const dt=last?(ts-last)/1000:0;last=ts;
    if(playing&&host.offsetParent){t+=dt*(+document.getElementById('cnaSpd').value)/DUR;
      if(t>=1){ if(cur<SC.length-1){ t-=1; setScene(cur+1); } else { t=1; playing=false; document.getElementById('cnaPlay').textContent='▶ Oynat'; } } }
    document.getElementById('cnaScr').value=Math.round((cur+t)/SC.length*1000);
    if(host.offsetParent){g.clearRect(0,0,1000,500);txt(SC[cur].tag,20,30,'#ffd24a',16);SC[cur].draw(t);}
    requestAnimationFrame(frame);}
  stepsEl.onclick=e=>{const b=e.target.closest('[data-i]');if(b)go(+b.dataset.i);};
  document.getElementById('cnaPrev').onclick=()=>go(cur-1); document.getElementById('cnaNext').onclick=()=>go(cur+1);
  document.getElementById('cnaRe').onclick=()=>go(cur);
  document.getElementById('cnaPlay').onclick=function(){if(t>=1){t=0;}playing=!playing;this.textContent=playing?'⏸ Duraklat':'▶ Oynat';};
  document.getElementById('cnaScr').oninput=function(){const gv=this.value/1000*SC.length;let i=Math.min(SC.length-1,Math.floor(gv));t=gv-i;if(this.value>=1000){i=SC.length-1;t=1;}setScene(i);playing=false;document.getElementById('cnaPlay').textContent='▶ Oynat';};
  document.getElementById('cnaTk').innerHTML=SC.map((_,i)=>'<span style="left:'+((i+.5)/SC.length*100)+'%">'+(i+1)+'</span>'+(i?'<i style="left:'+(i/SC.length*100)+'%"></i>':'')).join('');
  window.__cnAnim={SC,go};
  post3d(0); show(); requestAnimationFrame(frame);
})();
