// Seq2Seq Simülasyon — "🔬 Hücrenin içi" (gerçek hesap: W·x + U·h₋₁ + b → kapılar → c, h → çıktı) ve
// "📈 Ağırlıklar nasıl değişti" (4 kontrol noktasının ısı haritaları + tek ağırlığın yolculuğu).
// Ağırlıklar lesson-s2s-weights.js'ten; soru/model seçimi lesson-s2s-add.js'in durumunu (window.__s2sAdd) paylaşır.
(function(){
  const host=document.getElementById('s2sInside'),D=window.S2S_CK; if(!host||!D) return;
  const H=D.H,DM=D.D,V=13,PLUS=10,ST=11,EN=12,$=id=>document.getElementById(id);
  const NAME=t=>t<10?String(t):(t===PLUS?'+':(t===ST?'&lt;s&gt;':'&lt;e&gt;'));
  const sig=x=>1/(1+Math.exp(-x));
  const fm=(v,d=2)=>(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',').replace(/^-/,'−');
  const GN=['f (unutma)','i (giriş)','c̃ (aday)','o (çıkış)'],GS=['f','i','c̃','o'],GC=['#e0a030','#46c46a','#c77dff','#5aa0e0'];
  function cellDetail(W,b,x,hp,cp){
    const wx=[],uh=[],z=[];
    for(let r=0;r<4*H;r++){let a=0,u=0;const row=W[r];for(let j=0;j<DM;j++)a+=row[j]*x[j];for(let j=0;j<H;j++)u+=row[DM+j]*hp[j];wx[r]=a;uh[r]=u;z[r]=b[r]+a+u;}
    const f=[],i=[],g=[],o=[],c=[],h=[];
    for(let k=0;k<H;k++){f[k]=sig(z[k]);i[k]=sig(z[H+k]);g[k]=Math.tanh(z[2*H+k]);o[k]=sig(z[3*H+k]);c[k]=f[k]*cp[k]+i[k]*g[k];h[k]=o[k]*Math.tanh(c[k]);}
    return {W,b,x,hp,cp,wx,uh,z,f,i,g,o,c,h};
  }
  function trace(ck,a,bb){
    const P=ck.W,cells=[];let h=new Array(H).fill(0),c=new Array(H).fill(0);
    [a,PLUS,bb].forEach((t,n)=>{const d=cellDetail(P.We,P.be,P.emb[t],h,c);d.role='enc';d.n=n+1;d.tok=t;cells.push(d);h=d.h;c=d.c;});
    let tok=ST;
    for(let s=0;s<3;s++){
      const d=cellDetail(P.Wd,P.bd,P.emb[tok],h,c);d.role='dec';d.n=s+1;d.tok=tok;
      d.lg=P.Wo.map((row,k)=>{let q=P.bo[k];for(let j=0;j<H;j++)q+=row[j]*d.h[j];return q;});
      const mx=Math.max(...d.lg),ex=d.lg.map(v=>Math.exp(v-mx)),sm=ex.reduce((x,y)=>x+y,0);d.p=ex.map(v=>v/sm);
      let best=0;for(let k=1;k<V;k++)if(d.lg[k]>d.lg[best])best=k;d.out=best;cells.push(d);h=d.h;c=d.c;tok=best;
    }
    return cells;
  }
  const ui={cell:0,gate:0,k:null,step:0};
  const strip=(vals,w,hgt)=>{const cw=w/vals.length;let s='<svg width="'+w+'" height="'+hgt+'" style="display:block">';vals.forEach((v,j)=>{const a=Math.min(1,Math.abs(v));s+='<rect x="'+(j*cw)+'" y="0" width="'+Math.max(1,cw-0.6)+'" height="'+hgt+'" fill="'+(v>=0?'rgba(70,196,106,':'rgba(224,106,106,')+(0.12+0.88*a)+')"><title>'+fm(v,3)+'</title></rect>';});return s+'</svg>';};
  host.innerHTML=
   '<div style="font-size:13px;color:#ccd5e8;line-height:1.7;margin:4px 0 10px">A\'daki her "LSTM hücre" kutusu aslında şu hesabı yapıyor. Aşağıda <b>seçtiğin soru ve modelin gerçek ağırlıklarıyla</b> bir hücreyi, bir nöronu açıyoruz. Soru ve model A bölümündeki seçimle aynı (oradan değiştir, burası takip eder).</div>'+
   '<div id="si_cells" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"></div>'+
   '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:8px;font-size:13px"><span>Hangi nöron? (24 gizli nörondan biri)</span><select id="si_k" class="rex-sel"></select><span id="si_kinfo" style="color:var(--muted)"></span></div>'+
   '<div id="si_head" style="font-size:13px;color:#ccd5e8;line-height:1.7;margin-bottom:6px"></div>'+
   '<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;margin:10px 0">'+
     '<div style="flex:1 1 520px;min-width:0;overflow-x:auto"><svg id="si_cellsvg" viewBox="0 0 760 390" style="width:100%;max-width:680px;min-width:500px;display:block;margin:0 auto" role="img" aria-label="Seçilen nöron için LSTM hücre şeması"></svg></div>'+
     '<div style="flex:1 1 260px;min-width:0"><div style="font-size:13px;color:#ccd5e8;line-height:1.6;margin-bottom:6px">🧱 <b>Hücrenin mimarisi.</b> Soldaki şema, seçtiğin <b>tek nöronun</b> hesabı: 24 nöronun her biri aynı şemayı kendi ağırlıklarıyla çalıştırır.</div>'+
     '<div style="display:flex;gap:6px;margin-bottom:8px"><button class="addbtn" id="si_next" style="background:var(--blue);color:#fff">İleri ▶</button><button class="addbtn" id="si_rst" style="background:var(--panel);color:var(--text);border:1px solid var(--line)">↺ Sıfırla</button></div>'+
     '<div id="si_stepmsg" class="callout" style="font-size:13px;line-height:1.6"></div>'+
     '<div style="font-size:12px;color:#aeb9d4;line-height:1.7;margin-top:8px"><b>Şemada:</b> <span style="color:#7ad8e8">x</span> = girdinin gömmesi (8 sayı), <span style="color:#f0a0a0">hₜ₋₁</span> = önceki durum (24 sayı), <b>W·x</b> ve <b>U·h</b> = bu nöronun ağırlıklarıyla çarpım toplamları (tablodaki sütunlar), ⊗ çarp, ⊕ topla, σ/tanh aktivasyon, üstteki yeşil hat = uzun hafıza c, alttaki kırmızı hat = h.</div></div></div>'+
   '<div id="si_tbl"></div>'+
   '<div id="si_gatebtn" style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 4px;font-size:13px;align-items:center"></div>'+
   '<div style="overflow-x:auto"><svg id="si_bars" style="min-width:560px;width:100%;max-width:760px;display:block"></svg></div>'+
   '<div id="si_out"></div>'+'';
  const hostE=document.getElementById('s2sWeights');
  if(hostE) hostE.innerHTML=
   '<div style="font-size:13px;color:#ccd5e8;line-height:1.7;margin:4px 0 10px">Eğitim başında ağırlıklar rastgele; her adımda hata geriye yayılır ve <b>bütün ağırlıklar çok az</b> oynar. Bir ısı haritasında yeşil = pozitif, kırmızı = negatif ağırlık. Sayfada eğitimin <b>4 anlık fotoğrafı</b> var (epoch 0, 30, 150, 800); aralarında her adımı tutmuyoruz. Bir kutuya tıklarsan o <b>tek ağırlığın</b> yolculuğunu görürsün.</div>'+
   '<div id="si_mbtn" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"></div><div id="si_maps" style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start;overflow-x:auto"></div>'+
   '<div id="si_jour" class="callout" style="margin-top:10px"></div><div id="si_params" style="font-size:12.5px;color:var(--muted);margin-top:6px"></div>';
  const ks=$('si_k');for(let k=0;k<H;k++)ks.add(new Option('nöron '+(k+1),k));
  function render(){
    const S=window.__s2sAdd;if(!S)return;const ck=D.ck[S.ci],cells=trace(ck,S.a,S.b),d=cells[ui.cell];
    if(ui.k===null){let bk=0;d.h.forEach((v,k)=>{if(Math.abs(v)>Math.abs(d.h[bk]))bk=k;});ui.k=bk;}
    ks.value=ui.k;const k=ui.k;
    $('si_cells').innerHTML=cells.map((c,i)=>'<button class="addbtn" data-ci="'+i+'" style="'+(i===ui.cell?'background:'+(c.role==='enc'?'#3a7afe':'#46c46a')+';color:#fff':'background:var(--panel);color:var(--text)')+';border:1px solid var(--line)">'+(c.role==='enc'?'Encoder':'Decoder')+' '+c.n+' · girdi '+NAME(c.tok)+'</button>').join('');
    $('si_kinfo').textContent='(bu hücrede en etkin nöron: '+(function(){let bk=0;d.h.forEach((v,j)=>{if(Math.abs(v)>Math.abs(d.h[bk]))bk=j;});return bk+1;})()+')';
    $('si_head').innerHTML='<b>'+(d.role==='enc'?'Encoder':'Decoder')+' hücre '+d.n+'</b> · epoch <b>'+ck.ep+'</b> · soru '+S.a+' + '+S.b+' · girdi: <b>'+NAME(d.tok)+'</b>. Hücreye üç şey giriyor: <b>x</b> (girdinin 8 sayılık gömmesi), <b>h₋₁</b> (önceki durum, 24 sayı), <b>c₋₁</b> (önceki uzun hafıza, 24 sayı).'+
     '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:6px;font-size:12px"><div>x ('+DM+')'+strip(d.x,96,12)+'</div><div>h₋₁ ('+H+')'+strip(d.hp,192,12)+'</div><div>c₋₁ ('+H+')'+strip(d.cp,192,12)+'</div></div>';
    let t='<div style="font-size:13px;color:#ccd5e8;margin:8px 0 4px"><b>Nöron '+(k+1)+'</b> için dört kapı. Her kapı aynı kalıpla hesaplanır: <b>z = W·x + U·h₋₁ + b</b>, sonra aktivasyon.</div><div style="overflow-x:auto"><table class="rex-tbl" style="font-size:12.5px;text-align:center"><tr><th>kapı</th><th>W·x</th><th>U·h₋₁</th><th>b</th><th>z (toplam)</th><th>aktivasyon</th><th>değer</th></tr>';
    const acts=['σ','σ','tanh','σ'],vals=[d.f[k],d.i[k],d.g[k],d.o[k]];
    for(let g=0;g<4;g++){const r=g*H+k;t+='<tr><td style="color:'+GC[g]+'"><b>'+GN[g]+'</b></td><td>'+fm(d.wx[r],3)+'</td><td>'+fm(d.uh[r],3)+'</td><td>'+fm(d.b[r],3)+'</td><td>'+fm(d.z[r],3)+'</td><td>'+acts[g]+'(z)</td><td><b>'+fm(vals[g],3)+'</b></td></tr>';}
    t+='</table></div><div style="font-size:13px;color:#ccd5e8;line-height:1.9;margin-top:8px">'+
      '<b>c</b> = f · c₋₁ + i · c̃ = '+fm(d.f[k],3)+' × '+fm(d.cp[k],3)+' + '+fm(d.i[k],3)+' × '+fm(d.g[k],3)+' = <b>'+fm(d.c[k],3)+'</b> <span style="color:var(--muted)">(unutma kapısı eski hafızayı ne kadar tutacağını, giriş kapısı adayı ne kadar yazacağını söyler)</span><br>'+
      '<b>h</b> = o · tanh(c) = '+fm(d.o[k],3)+' × tanh('+fm(d.c[k],3)+') = <b>'+fm(d.h[k],3)+'</b> <span style="color:var(--muted)">(bu nöronun bu adımdaki çıktısı; sonraki hücreye ve çıktı katmanına gider)</span></div>';
    $('si_tbl').innerHTML=t;
    // --- seçilen nöron için hücre şeması + adım adım ---
    const kk=k,V={f:d.f[kk],i:d.i[kk],o:d.o[kk],cp:d.cp[kk],ct:d.g[kk],fc:d.f[kk]*d.cp[kk],ic:d.i[kk]*d.g[kk],c:d.c[kk],tc:Math.tanh(d.c[kk]),h:d.h[kk],lbl:'dot',xTxt:'x (8 sayı)',hpTxt:'hₜ₋₁ (24)',x:0,hp:0,
      Wt:{f:[d.wx[kk],d.uh[kk],d.b[kk]],i:[d.wx[H+kk],d.uh[H+kk],d.b[H+kk]],c:[d.wx[2*H+kk],d.uh[2*H+kk],d.b[2*H+kk]],o:[d.wx[3*H+kk],d.uh[3*H+kk],d.b[3*H+kk]]},
      zz:{f:d.z[kk],i:d.z[H+kk],c:d.z[2*H+kk],o:d.z[3*H+kk]}};
    const B=x=>'<b>'+x+'</b>',n3=x=>fm(x,3);
    const STEPS=[
     {hl:[],m:'Şemadaki sayılar seçtiğin nöronun gerçek değerleri. <b>İleri ▶</b> ile hesabı sırayla kur.'},
     {hl:['x','h0','fbox','ibox','gbox','obox'],m:'<b>1) Kapılar.</b> x ve hₜ₋₁ dört kutuya girer; her kutu kendi ağırlıklarıyla <b>z = W·x + U·h + b</b> hesaplar, sonra aktivasyon: f='+B(n3(V.f))+', i='+B(n3(V.i))+', c̃='+B(n3(V.ct))+', o='+B(n3(V.o))+'. (Sayılar tablodaki gibi.)'},
     {hl:['c0','mulf','fbox'],m:'<b>2) Unut.</b> Eski hafıza c₋₁ unutma kapısıyla çarpılır: f·c₋₁ = '+n3(V.f)+' × '+n3(V.cp)+' = '+B(n3(V.fc))+'. f 1\'e yakınsa hafıza korunur, 0\'a yakınsa silinir.'},
     {hl:['mului','ibox','gbox'],m:'<b>3) Yeni bilgi.</b> Aday c̃ giriş kapısıyla çarpılır: i·c̃ = '+n3(V.i)+' × '+n3(V.ct)+' = '+B(n3(V.ic))+'. i yeni bilginin ne kadarının defter\'e yazılacağını söyler.'},
     {hl:['plus'],m:'<b>4) Topla.</b> c = f·c₋₁ + i·c̃ = '+n3(V.fc)+' + '+n3(V.ic)+' = '+B(n3(V.c))+'. Yeni uzun hafıza.'},
     {hl:['ct'],m:'<b>5) Hafızayı ilet.</b> c = '+B(n3(V.c))+' sağdaki yeşil hattan <b>bir sonraki hücreye</b> gider (otoban).'},
     {hl:['tanhe'],m:'<b>6) Sıkıştır.</b> tanh(c) = tanh('+n3(V.c)+') = '+B(n3(V.tc))+' (−1…+1 arası).'},
     {hl:['mulo','obox'],m:'<b>7) Çıkış kapısı.</b> h = o · tanh(c) = '+n3(V.o)+' × '+n3(V.tc)+' = '+B(n3(V.h))+'. Hafızanın ne kadarının dışarı söyleneceği.'},
     {hl:['ht'],m:'<b>8) Bitti.</b> h = '+B(n3(V.h))+' '+(d.role==='dec'?'çıktı katmanına (13 skor) ve bir sonraki hücreye':'bir sonraki hücreye')+' gider. <b style="color:#46c46a">✓ Bu nöronun hesabı tamam.</b>'}];
    const stp=STEPS[ui.step];
    $('si_cellsvg').innerHTML=window.lstmCellSvg?window.lstmCellSvg('si_',V,stp.hl):'';
    $('si_stepmsg').innerHTML='<div style="color:var(--muted);font-size:11.5px;margin-bottom:3px">Adım '+ui.step+' / 8</div>'+stp.m;
    $('si_next').textContent=ui.step>=8?'↺ Baştan':'İleri ▶';
    $('si_gatebtn').innerHTML='<span>Bu kapının z\'sine <b>kim ne kadar katkı yaptı?</b></span>'+GS.map((n,g)=>'<button class="addbtn" data-g="'+g+'" style="'+(g===ui.gate?'background:'+GC[g]+';color:#111':'background:var(--panel);color:var(--text)')+';border:1px solid var(--line)">'+n+'</button>').join('');
    // katkı çubukları: 8 girdi terimi + 24 durum terimi
    const g=ui.gate,r=g*H+k,row=d.W[r],terms=[];
    for(let j=0;j<DM;j++)terms.push({l:'x'+(j+1),v:row[j]*d.x[j],w:row[j],a:d.x[j]});
    for(let j=0;j<H;j++)terms.push({l:'h'+(j+1),v:row[DM+j]*d.hp[j],w:row[DM+j],a:d.hp[j]});
    const mx=Math.max(0.05,...terms.map(q=>Math.abs(q.v))),W=740,bw=W/terms.length,mid=60;let s='<line x1="0" y1="'+mid+'" x2="'+W+'" y2="'+mid+'" stroke="#334063"/>';
    terms.forEach((q,i)=>{const hh=Math.abs(q.v)/mx*50;s+='<rect x="'+(i*bw+1)+'" y="'+(q.v>=0?mid-hh:mid)+'" width="'+(bw-2)+'" height="'+Math.max(0.5,hh)+'" fill="'+(q.v>=0?'#46c46a':'#e06a6a')+'"><title>'+q.l+': W='+fm(q.w,3)+' × girdi='+fm(q.a,3)+' = '+fm(q.v,3)+'</title></rect>';if(i%2===0||i<DM)s+='<text x="'+(i*bw+bw/2)+'" y="'+(mid+(i<DM?72:72))+'" text-anchor="middle" font-size="8" fill="#95a2c2">'+q.l+'</text>';});
    s+='<text x="0" y="8" font-size="10" fill="#95a2c2">'+GN[g]+' · nöron '+(k+1)+' · her çubuk = bir ağırlık × bir girdi (üstüne gel: sayılar). Soldaki 8 çubuk W·x, sağdaki 24 çubuk U·h₋₁</text>';
    const sv=$('si_bars');sv.setAttribute('viewBox','0 0 '+W+' 140');sv.innerHTML=s;
    if(d.role==='dec'){
      let o='<div style="font-size:13px;color:#ccd5e8;margin:12px 0 4px"><b>Decoder\'ın son işi:</b> h (24 sayı) çıktı katmanında 13 skora çevrilir (her sembol için <b>skor = W_o · h + b_o</b>), softmax olasılığa çevirir, en yüksek olan seçilir.</div><div style="overflow-x:auto"><table class="rex-tbl" style="font-size:12px;text-align:center"><tr><th>sembol</th>'+d.lg.map((_,j)=>'<th'+(j===d.out?' style="color:#46c46a"':'')+'>'+NAME(j)+'</th>').join('')+'</tr><tr><td>skor</td>'+d.lg.map(v=>'<td>'+fm(v,1)+'</td>').join('')+'</tr><tr><td>olasılık</td>'+d.p.map((v,j)=>'<td'+(j===d.out?' style="color:#46c46a;font-weight:700"':'')+'>%'+Math.round(v*100)+'</td>').join('')+'</tr></table></div><div style="font-size:13px;margin-top:4px">Seçilen: <b style="color:#46c46a">'+NAME(d.out)+'</b> (%'+Math.round(d.p[d.out]*100)+' emin)</div>';
      $('si_out').innerHTML=o;
    }else $('si_out').innerHTML='<div style="font-size:12.5px;color:var(--muted);margin-top:8px">Encoder hücresi çıktı üretmez: yalnız (c, h) durumunu bir sonraki hücreye iletir. Çıktı katmanı yalnız decoder\'da var (hücre 4-6\'yı seç).</div>';
  }
  $('si_cells').addEventListener('click',e=>{const b=e.target.closest('[data-ci]');if(b){ui.cell=+b.dataset.ci;render();}});
  $('si_gatebtn').addEventListener('click',e=>{const b=e.target.closest('[data-g]');if(b){ui.gate=+b.dataset.g;render();}});
  ks.addEventListener('change',()=>{ui.k=+ks.value;render();});
  $('si_next').addEventListener('click',()=>{ui.step=ui.step>=8?1:ui.step+1;render();});
  $('si_rst').addEventListener('click',()=>{ui.step=0;render();});
  // ---- ağırlık ısı haritaları ----
  const MATS=[['emb','Gömme tablosu (13×8)',14,'satır = sembol, sütun = gömme boyutu'],['We','Encoder W (96×32)',4,'satırlar 4 kapı × 24 nöron (f,i,c̃,o), sütunlar: ilk 8 = x ağırlığı, son 24 = h₋₁ ağırlığı'],['Wd','Decoder W (96×32)',4,'encoder ile aynı şekil, ayrı ağırlıklar'],['Wo','Çıktı katmanı (13×24)',7,'satır = çıktı sembolü, sütun = gizli nöron']];
  let mi=1,sel=null;
  const mb=$('si_mbtn');
  function drawMaps(){
    mb.innerHTML=MATS.map((m,i)=>'<button class="addbtn" data-m="'+i+'" style="'+(i===mi?'background:#5aa0e0;color:#fff':'background:var(--panel);color:var(--text)')+';border:1px solid var(--line)">'+m[1]+'</button>').join('')+'<span style="font-size:12px;color:var(--muted);align-self:center">'+MATS[mi][3]+'</span>';
    const key=MATS[mi][0],px=MATS[mi][2],sets=D.ck.map(c=>c.W[key]),R=sets[0].length,Cc=sets[0][0].length;
    let mx=0;sets.forEach(M=>M.forEach(r=>r.forEach(v=>{if(Math.abs(v)>mx)mx=Math.abs(v);})));
    const dl=sets[3].map((r,i)=>r.map((v,j)=>v-sets[0][i][j]));let dmx=0;dl.forEach(r=>r.forEach(v=>{if(Math.abs(v)>dmx)dmx=Math.abs(v);}));
    const stats=M=>{let s=0;M.forEach(r=>r.forEach(v=>s+=Math.abs(v)));return s/(R*Cc);};
    const wrap=[];
    sets.forEach((M,i)=>wrap.push({M,t:'epoch '+D.ck[i].ep,sc:mx,sub:'ort |w| = '+fm(stats(M),3)}));
    wrap.push({M:dl,t:'değişim (800 − 0)',sc:dmx,sub:'ort |Δ| = '+fm(stats(dl),3)});
    $('si_maps').innerHTML=wrap.map((w,i)=>'<div style="text-align:center;font-size:12px"><div style="margin-bottom:3px"><b>'+w.t+'</b></div><canvas data-w="'+i+'" width="'+(Cc*px)+'" height="'+(R*px)+'" style="cursor:crosshair;border:1px solid var(--line)"></canvas><div style="color:var(--muted);margin-top:3px">'+w.sub+'</div></div>').join('');
    document.querySelectorAll('#si_maps canvas').forEach((cv,i)=>{const w=wrap[i],g=cv.getContext('2d');
      for(let r=0;r<R;r++)for(let c=0;c<Cc;c++){const v=w.M[r][c],a=Math.min(1,Math.abs(v)/w.sc);g.fillStyle=(v>=0?'rgba(70,196,106,':'rgba(224,106,106,')+(0.06+0.94*a)+')';g.fillRect(c*px,r*px,px,px);}
      if(sel&&sel.m===mi){g.strokeStyle='#ffd54a';g.lineWidth=2;g.strokeRect(sel.c*px,sel.r*px,px,px);}
      if(key==='We'||key==='Wd'){g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;for(let q=1;q<4;q++){g.beginPath();g.moveTo(0,q*H*px);g.lineTo(Cc*px,q*H*px);g.stroke();}g.beginPath();g.moveTo(DM*px,0);g.lineTo(DM*px,R*px);g.stroke();}
      cv.addEventListener('click',e=>{const b=cv.getBoundingClientRect(),c=Math.floor((e.clientX-b.left)/b.width*Cc),r=Math.floor((e.clientY-b.top)/b.height*R);sel={m:mi,r,c};drawMaps();journey();});});
  }
  function journey(){
    const el=$('si_jour');if(!sel){el.innerHTML='💡 Bir ısı haritasındaki küçük bir kareye tıkla: o <b>tek ağırlığın</b> 4 kontrol noktasındaki değerini göreceksin.';return;}
    const key=MATS[sel.m][0],vals=D.ck.map(c=>c.W[key][sel.r][sel.c]);let who;
    if(key==='emb')who='<b>'+NAME(sel.r)+'</b> sembolünün gömmesinin '+(sel.c+1)+'. boyutu';
    else if(key==='Wo')who='çıktı katmanı: <b>'+NAME(sel.r)+'</b> skorunun gizli nöron '+(sel.c+1)+'\'e bağlanan ağırlığı';
    else{const g=Math.floor(sel.r/H),k=sel.r%H;who=(key==='We'?'encoder':'decoder')+' · kapı <b>'+GS[g]+'</b> · nöron '+(k+1)+' · '+(sel.c<DM?'girdi x'+(sel.c+1)+' ağırlığı (W)':'önceki durum h'+(sel.c-DM+1)+' ağırlığı (U)');}
    const mx=Math.max(0.1,...vals.map(Math.abs)),W=360,Hh=90;let pts=vals.map((v,i)=>[20+i*(W-40)/3,Hh/2-v/mx*(Hh/2-12)]);
    let s='<svg viewBox="0 0 '+W+' '+Hh+'" width="'+W+'" style="max-width:100%;display:block;margin:6px 0"><line x1="10" y1="'+(Hh/2)+'" x2="'+(W-10)+'" y2="'+(Hh/2)+'" stroke="#334063"/><polyline fill="none" stroke="#ffd54a" stroke-width="2" points="'+pts.map(p=>p.join(',')).join(' ')+'"/>';
    pts.forEach((p,i)=>{s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4" fill="#ffd54a"/><text x="'+p[0]+'" y="'+(p[1]<Hh/2?p[1]+16:p[1]-8)+'" text-anchor="middle" font-size="10" fill="#e9edf8">'+fm(vals[i],2)+'</text><text x="'+p[0]+'" y="'+(Hh-1)+'" text-anchor="middle" font-size="9" fill="#95a2c2">ep '+D.ck[i].ep+'</text>';});
    el.innerHTML='🎯 <b>Seçilen ağırlık:</b> '+who+'.<br>Değerleri: '+vals.map((v,i)=>'epoch '+D.ck[i].ep+': <b>'+fm(v,3)+'</b>').join(' → ')+s+'</svg><span style="font-size:12.5px;color:var(--muted)">Her ağırlık kendi yolunu izler: bazıları büyür, bazıları işaret değiştirir, bazıları neredeyse yerinde kalır. Tek bir ağırlığa bakıp "ne öğrendi" demek zor; öğrenilen şey bütün ağırlıkların birlikte oluşturduğu örüntü.</span>';
  }
  mb.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b){mi=+b.dataset.m;sel=null;drawMaps();journey();}});
  const P0=D.ck[0].W;let np=0;['emb','We','Wd','Wo'].forEach(k=>np+=P0[k].length*P0[k][0].length);['be','bd','bo'].forEach(k=>np+=P0[k].length);
  $('si_params').textContent='Bu ağın toplam '+np.toLocaleString('tr-TR')+' ağırlığı var (gömme + encoder + decoder + çıktı katmanı + bias\'lar). Eğitim bunların hepsini birlikte ayarlıyor.';
  // A–F haritası: bağlantıya tıkla → ilgili bölüme kay (kapalı sahne ise önce aç)
  document.addEventListener('click',e=>{
    const a=e.target.closest('a.s2s-go');if(!a)return;e.preventDefault();
    const t=document.getElementById(a.dataset.goto);if(!t)return;
    const sh=t.querySelector('.sahne-head.closed');if(sh)sh.click();
    t.scrollIntoView({behavior:'smooth',block:'start'});
  });
  window.__s2sInsideRender=render;
  window.__s2sInsideCheck=()=>{const S=window.__s2sAdd,r=window.__s2sRun(D.ck[S.ci],S.a,S.b),t=trace(D.ck[S.ci],S.a,S.b);let m=0;r.enc.forEach((e,i)=>e.h.forEach((v,j)=>m=Math.max(m,Math.abs(v-t[i].h[j]))));r.dec.forEach((d,i)=>{d.h.forEach((v,j)=>m=Math.max(m,Math.abs(v-t[3+i].h[j])));if(d.out!==t[3+i].out)m=9;});return m;};
  drawMaps();journey();render();
})();
