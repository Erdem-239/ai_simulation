/* Seq2Seq toplama: 2 katmanlı encoder(LSTM) → bağlam → 2 katmanlı decoder(LSTM).
   Encoder ve decoder'ın AYRI gömme tabloları var (StatQuest'teki seq2seq gibi). Ağırlıklar çevrimdışı eğitilmiş (lesson-s2s-weights.js). */
(function(){
  const D=window.S2S_CK;
  const H=D?D.H:24, DM=D?D.D:8, VD=12, PLUS=10, ST=10, EN=11;
  // encoder sözlüğü: 0-9, + ; decoder sözlüğü: 0-9, <s>, <e>
  const NE=t=>t<10?String(t):'+';
  const ND=t=>t<10?String(t):(t===ST?'&lt;s&gt;':'&lt;e&gt;');
  const sig=x=>1/(1+Math.exp(-x));
  function cell(W,b,x,h,c){
    const n=x.length,z=new Array(4*H);
    for(let r=0;r<4*H;r++){let s=b[r];const row=W[r];for(let j=0;j<n;j++)s+=row[j]*x[j];for(let j=0;j<H;j++)s+=row[n+j]*h[j];z[r]=s;}
    const c2=[],h2=[];
    for(let k=0;k<H;k++){const f=sig(z[k]),i=sig(z[H+k]),g=Math.tanh(z[2*H+k]),o=sig(z[3*H+k]);c2[k]=f*c[k]+i*g;h2[k]=o*Math.tanh(c2[k]);}
    return {h:h2,c:c2};
  }
  // bir zaman adımı, iki katman: 1. katmanın h'si 2. katmanın girdisi
  function step(P,pre,x,s){
    const a=cell(P['W'+pre+'1'],P['b'+pre+'1'],x,s.h1,s.c1), b=cell(P['W'+pre+'2'],P['b'+pre+'2'],a.h,s.h2,s.c2);
    return {h1:a.h,c1:a.c,h2:b.h,c2:b.c};
  }
  const zero=()=>{const z=()=>new Array(H).fill(0);return {h1:z(),c1:z(),h2:z(),c2:z()};};
  function logits(P,h){return P.Wo.map((row,k)=>{let q=P.bo[k];for(let j=0;j<H;j++)q+=row[j]*h[j];return q;});}
  function run(ck,a,b,feed){
    const P=ck.W,enc=[];let s=zero();
    for(const t of [a,PLUS,b]){s=step(P,'e',P.embE[t],s);enc.push({tok:t,h:s.h2,c:s.c2,h1:s.h1,c1:s.c1});}
    const ctx={h1:s.h1.slice(),c1:s.c1.slice(),h2:s.h2.slice(),c2:s.c2.slice()},dec=[];let tok=ST;
    for(let k=0;k<3;k++){
      s=step(P,'d',P.embD[tok],s);
      const lg=logits(P,s.h2),mx=Math.max(...lg),ex=lg.map(v=>Math.exp(v-mx)),sm=ex.reduce((x,y)=>x+y,0),p=ex.map(v=>v/sm);
      let best=0;for(let q=1;q<VD;q++)if(lg[q]>lg[best])best=q;
      dec.push({inp:tok,out:best,p:p[best],pv:p,h:s.h2,c:s.c2,h1:s.h1,c1:s.c1});tok=(feed&&feed[k]!==undefined)?feed[k]:best;
    }
    return {enc,ctx,dec,code:dec[0].out*144+dec[1].out*12+dec[2].out};
  }
  function beam(ck,a,b,width){
    const P=ck.W;let s=zero();
    for(const t of [a,PLUS,b])s=step(P,'e',P.embE[t],s);
    let hyps=[{seq:[],lp:0,s,tok:ST}];
    for(let k=0;k<3;k++){
      const cand=[];
      hyps.forEach(hy=>{
        const s2=step(P,'d',P.embD[hy.tok],hy.s),lg=logits(P,s2.h2);
        const mx=Math.max(...lg),lse=mx+Math.log(lg.reduce((x,v)=>x+Math.exp(v-mx),0));
        for(let q=0;q<VD;q++)cand.push({seq:hy.seq.concat(q),lp:hy.lp+lg[q]-lse,s:s2,tok:q});
      });
      cand.sort((x,y)=>y.lp-x.lp);hyps=cand.slice(0,width);
    }
    return hyps.map(x=>({seq:x.seq,lp:x.lp,p:Math.exp(x.lp)}));
  }

  /* ---- mimari çizimi: 2 katman, ayrı gömme tabloları. r=null → sembolik (Giriş/Nedir), r → canlı değerler ---- */
  const hm=(vals,x,y,w,hgt)=>{let s='';const cw=w/vals.length;vals.forEach((v,k)=>{const a=Math.min(1,Math.abs(v));s+='<rect x="'+(x+k*cw)+'" y="'+y+'" width="'+(cw-0.5)+'" height="'+hgt+'" fill="'+(v>=0?'rgba(70,196,106,':'rgba(224,106,106,')+(0.12+0.88*a)+')"/>';});return s;};
  function archSvg(r,S,id){
    const live=!!r; S=live?S:99;
    const mk='s2sA'+id;
    const CW=92,GAP=28,X0=8,CTX=104;
    const ex=i=>X0+i*(CW+GAP), bx=ex(3)-GAP+16, dx=i=>bx+CTX+22+i*(CW+GAP);
    const Y={out:4,fc:42,l2:84,l1:162,emb:240,tok:282};
    const encT=live?r.enc.map(e=>NE(e.tok)):['7','+','5'], decIn=live?r.dec.map(d=>ND(d.inp)):['&lt;s&gt;','1','2'], decOut=live?r.dec.map(d=>ND(d.out)):['1','2','&lt;e&gt;'];
    let s='<defs><marker id="'+mk+'" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#95a2c2"/></marker></defs>';
    const ar=(x1,y1,x2,y2,c,w,op)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(c||'#95a2c2')+'" stroke-width="'+(w||1.4)+'" marker-end="url(#'+mk+')" opacity="'+(op==null?1:op)+'"/>';
    const cellBox=(x,y,lab,col,on,cur,v)=>{
      let t='<g opacity="'+(on?1:.22)+'"><rect x="'+x+'" y="'+y+'" width="'+CW+'" height="56" rx="9" fill="#17203a" stroke="'+(cur?'#ffd54a':col)+'" stroke-width="'+(cur?3:1.5)+'"/>'+
        '<text x="'+(x+CW/2)+'" y="'+(y+13)+'" text-anchor="middle" font-size="9.5" fill="#95a2c2">'+lab+'</text>';
      if(v){t+='<text x="'+(x+4)+'" y="'+(y+29)+'" font-size="9" fill="#ffd54a">c</text>'+hm(v.c,x+13,y+21,CW-18,9)+'<text x="'+(x+4)+'" y="'+(y+47)+'" font-size="9" fill="#7ec8ff">h</text>'+hm(v.h,x+13,y+39,CW-18,9);}
      else t+='<line x1="'+(x+12)+'" y1="'+(y+26)+'" x2="'+(x+CW-8)+'" y2="'+(y+26)+'" stroke="#ffd54a" stroke-width="1.8"/><text x="'+(x+4)+'" y="'+(y+29)+'" font-size="9" fill="#ffd54a">c</text><line x1="'+(x+12)+'" y1="'+(y+44)+'" x2="'+(x+CW-8)+'" y2="'+(y+44)+'" stroke="#7ec8ff" stroke-width="1.8"/><text x="'+(x+4)+'" y="'+(y+47)+'" font-size="9" fill="#7ec8ff">h</text>';
      return t+'</g>';};
    const box=(x,y,w,h,txt,col,fs,fill,on)=>'<g opacity="'+(on?1:.22)+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="7" fill="'+(fill||'#0e1424')+'" stroke="'+col+'"/><text x="'+(x+w/2)+'" y="'+(y+h/2+fs*0.36)+'" text-anchor="middle" font-size="'+fs+'" font-weight="700" fill="#ccd5e8">'+txt+'</text></g>';
    s+='<text x="'+X0+'" y="-2" font-size="11" fill="#95a2c2">ENCODER — okur (2 katman)</text><text x="'+dx(0)+'" y="-2" font-size="11" fill="#95a2c2">DECODER — üretir (2 katman)</text>';
    for(let i=0;i<3;i++){
      const x=ex(i),on=S>=i+1,cur=S===i+1,cx=x+CW/2,e=live?r.enc[i]:null;
      s+=box(cx-22,Y.tok,44,28,encT[i],'#3a7afe',15,null,on)+'<g opacity="'+(on?1:.22)+'">'+ar(cx,Y.tok,cx,Y.emb+28)+'</g>';
      s+=box(x+8,Y.emb,CW-16,26,'gömme (enc)','#f0a032',10,'rgba(240,160,50,.12)',on)+'<g opacity="'+(on?1:.22)+'">'+ar(cx,Y.emb,cx,Y.l1+57)+'</g>';
      s+=cellBox(x,Y.l1,'Katman 1','#3a7afe',on,cur,e&&{c:e.c1,h:e.h1})+'<g opacity="'+(on?1:.22)+'">'+ar(cx,Y.l1,cx,Y.l2+57)+'</g>';
      s+=cellBox(x,Y.l2,'Katman 2','#3a7afe',on,cur,e&&{c:e.c,h:e.h});
      if(i<2){const op=S>=i+2?1:.22;s+=ar(x+CW,Y.l1+28,x+CW+GAP-2,Y.l1+28,null,1.6,op)+ar(x+CW,Y.l2+28,x+CW+GAP-2,Y.l2+28,null,1.6,op);}
    }
    // bağlam
    const onC=S>=4,c3=ex(2)+CW;
    s+='<g opacity="'+(onC?1:.22)+'">'+ar(c3,Y.l1+28,bx-2,Y.l1+28,'#e06a6a',2.4)+ar(c3,Y.l2+28,bx-2,Y.l2+28,'#e06a6a',2.4)+
      '<rect x="'+bx+'" y="'+(Y.l2-6)+'" width="'+CTX+'" height="'+(Y.l1-Y.l2+68)+'" rx="12" fill="rgba(224,106,106,.12)" stroke="#e06a6a" stroke-width="'+(S===4?3.4:2)+'"/>'+
      '<text x="'+(bx+CTX/2)+'" y="'+(Y.l2+8)+'" text-anchor="middle" font-size="11.5" font-weight="700" fill="#e06a6a">🍾 bağlam</text>';
    if(live){const L=(y,lab,v)=>'<text x="'+(bx+5)+'" y="'+(y+8)+'" font-size="8.5" fill="#95a2c2">'+lab+'</text>'+hm(v,bx+24,y,CTX-30,9);
      s+=L(Y.l2+18,'c²',r.ctx.c2)+L(Y.l2+32,'h²',r.ctx.h2)+L(Y.l1+14,'c¹',r.ctx.c1)+L(Y.l1+28,'h¹',r.ctx.h1);}
    else s+='<text x="'+(bx+CTX/2)+'" y="'+(Y.l2+34)+'" text-anchor="middle" font-size="9.5" fill="#ccd5e8">katman 2: c, h</text><text x="'+(bx+CTX/2)+'" y="'+(Y.l1+30)+'" text-anchor="middle" font-size="9.5" fill="#ccd5e8">katman 1: c, h</text>';
    s+='<text x="'+(bx+CTX/2)+'" y="'+(Y.l1+56)+'" text-anchor="middle" font-size="9" fill="#95a2c2">'+(4*H)+' sayı = tüm soru</text>'+
      ar(bx+CTX,Y.l1+28,dx(0)-2,Y.l1+28,'#e06a6a',2.4)+ar(bx+CTX,Y.l2+28,dx(0)-2,Y.l2+28,'#e06a6a',2.4)+'</g>';
    for(let i=0;i<3;i++){
      const x=dx(i),on=S>=5+i,cur=S===5+i,cx=x+CW/2,d=live?r.dec[i]:null,g='#46c46a';
      s+=box(cx-24,Y.tok,48,28,decIn[i],g,14,null,on)+'<g opacity="'+(on?1:.22)+'">'+ar(cx,Y.tok,cx,Y.emb+28)+'</g>';
      s+=box(x+8,Y.emb,CW-16,26,'gömme (dec)','#5aa0e0',10,'rgba(90,160,224,.12)',on)+'<g opacity="'+(on?1:.22)+'">'+ar(cx,Y.emb,cx,Y.l1+57)+'</g>';
      s+=cellBox(x,Y.l1,'Katman 1',g,on,cur,d&&{c:d.c1,h:d.h1})+'<g opacity="'+(on?1:.22)+'">'+ar(cx,Y.l1,cx,Y.l2+57)+'</g>';
      s+=cellBox(x,Y.l2,'Katman 2',g,on,cur,d&&{c:d.c,h:d.h})+'<g opacity="'+(on?1:.22)+'">'+ar(cx,Y.l2,cx,Y.fc+27)+'</g>';
      s+=box(x+4,Y.fc,CW-8,26,'tam bağlı → softmax','#c77dff',9.5,'rgba(199,125,255,.12)',on)+'<g opacity="'+(on?1:.22)+'">'+ar(cx,Y.fc,cx,Y.out+27)+'</g>';
      s+=box(cx-26,Y.out,52,26,decOut[i],g,14,null,on);
      if(live)s+='<text x="'+(cx+30)+'" y="'+(Y.out+17)+'" font-size="10" fill="#95a2c2" opacity="'+(on?1:.22)+'">%'+Math.round(d.p*100)+'</text>';
      if(i<2){const op=S>=6+i?1:.22;s+=ar(x+CW,Y.l1+28,x+CW+GAP-2,Y.l1+28,null,1.6,op)+ar(x+CW,Y.l2+28,x+CW+GAP-2,Y.l2+28,null,1.6,op);}
    }
    const W=dx(2)+CW+40;
    return {svg:s,vb:'0 -14 '+Math.round(W)+' 330'};
  }
  window.s2sArchSvg=archSvg;
  // Giriş ve Nedir'deki sembolik şemalar
  document.querySelectorAll('svg.s2s-arch').forEach((el,i)=>{const a=archSvg(null,99,'st'+i);el.setAttribute('viewBox',a.vb);el.innerHTML=a.svg;});

  if(!D) return;
  window.__s2sBeam=beam;
  window.__s2sRun=run; window.__s2sParity=()=>{const bad=[];D.ck.forEach((ck,ci)=>{for(let a=0;a<10;a++)for(let b=0;b<10;b++)if(run(ck,a,b).code!==ck.preds[a*10+b])bad.push([ci,a,b]);});return bad;};
  const el=document.getElementById('s2sAdd'); if(!el) return;
  const TEST=new Set(D.test);
  const st={ci:3,a:7,b:5,step:7};
  const COL=['#3a7afe','#f0a032','#46c46a','#c77dff'];
  el.innerHTML=
   '<div class="rex-ctl" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px">'+
   '<span>Soru:</span><select id="sa_a" class="rex-sel"></select><b>+</b><select id="sa_b" class="rex-sel"></select>'+
   '<span style="margin-left:10px">Model:</span><span id="sa_ck"></span></div>'+
   '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><button class="addbtn" id="sa_next" style="background:var(--blue);color:#fff">İleri ▶</button><button class="addbtn" id="sa_all" style="background:var(--panel);color:var(--text);border:1px solid var(--line)">⏭ Hepsini göster</button><button class="addbtn" id="sa_rst" style="background:var(--panel);color:var(--text);border:1px solid var(--line)">↺ Sıfırla</button></div>'+
   '<div id="sa_msg" class="callout" style="margin-top:8px"></div>'+
   '<div id="sa3d" style="margin:12px 0 4px"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px"><b>🧊 Canlı 3B mimari:</b><span style="font-size:12.5px;color:var(--muted,#95a2c2)">sütun = zaman adımı, satır = katman (gömme → Katman 1 → Katman 2 → puan → softmax); her kutu gerçek sayılar, tıkla = içi. <b>İleri ▶</b> 3B görünümü ilerletir.</span><button class="addbtn" id="sa3dtour" style="background:#c77dff;color:#fff">🎬 Animasyonlu tur: 3B + matris çarpımları</button><a class="addbtn" id="sa3dfull" target="_blank" style="background:var(--panel);color:var(--text);border:1px solid var(--line);text-decoration:none">⛶ Tam sayfa</a></div>'+
   '<div class="s3-grid"><iframe id="sa3dfr" loading="lazy" title="Seq2Seq 3B mimari" style="width:100%;height:600px;border:1px solid var(--line);border-radius:10px;background:#0b0e14;display:block"></iframe><div id="s2sTour" class="s2s-tour"></div></div></div>'+
   '<div class="pts" id="s2sSecC" style="border-left:3px solid #46c46a;margin-top:12px"><h3 class="sahne-head closed"><span>B) 📝 10×10 sınav — ağ 100 toplama sorusundan kaçını bilmiş?</span><span class="chev">▸</span></h3><div class="sahne-body closed">'+
   '<div style="font-size:13px;color:#ccd5e8;margin:0 0 4px">Her hücre modelin o toplama için verdiği cevap (yeşil doğru, kırmızı yanlış; <span style="outline:2px dashed #f0a032;padding:0 4px">kesikli çerçeve</span> = eğitimde HİÇ görmediği 10 soru). Bir hücreye tıkla.</div>'+
   '<div style="overflow-x:auto"><table id="sa_grid" class="rex-tbl" style="border-collapse:collapse;font-size:11.5px;text-align:center"></table></div><div id="sa_score" style="font-size:13px;margin-top:6px"></div></div></div>';
  {const h=document.querySelector('#s2sSecC .sahne-head');h.addEventListener('click',()=>{h.classList.toggle('closed');h.nextElementSibling.classList.toggle('closed');});}
  const sa=document.getElementById('sa_a'),sb=document.getElementById('sa_b');
  for(let i=0;i<10;i++){sa.add(new Option(i,i));sb.add(new Option(i,i));}
  sa.value=st.a;sb.value=st.b;
  const ckb=document.getElementById('sa_ck');
  D.ck.forEach((c,i)=>{const b=document.createElement('button');b.className='addbtn';b.textContent='epoch '+c.ep;b.dataset.i=i;b.style.marginRight='4px';ckb.appendChild(b);});
  const truthCode=(a,b)=>{const t=a+b;return Math.floor(t/10)*144+(t%10)*12+EN;};
  function draw(){
    const ck=D.ck[st.ci],r=run(ck,st.a,st.b),S=st.step;
    const tgt=st.a+st.b, ok=r.code===truthCode(st.a,st.b);
    const out=r.dec.slice(0,2).map(d=>ND(d.out)).join('')+(r.dec[2].out===EN?'':' …');
    const msgs=['Henüz bir şey okunmadı. <b>İleri ▶</b>’ya bas.',
      'Encoder 1. token\'ı okudu: <b>'+st.a+'</b>. Önce kendi gömme tablosundan 8 sayıya çevrildi, sonra <b>Katman 1</b>, onun çıktısı (h) da <b>Katman 2</b>\'ye girdi.',
      'Encoder 2. token\'ı okudu: <b>+</b>. Her katman kendi c, h\'sini bir sonraki adıma aktarıyor (yatay oklar).',
      'Encoder 3. token\'ı okudu: <b>'+st.b+'</b>. Artık iki katmanın elinde birer (c, h) durumu var.',
      '🍾 Bağlam: <b>iki katmanın</b> son c ve h\'leri, yani <b>'+(4*H)+' sayı</b>. Decoder\'ın iki katmanı bu değerlerle başlıyor; soru hakkında başka hiçbir şey görmüyor.',
      'Decoder 1. basamağı üretti: <b>'+ND(r.dec[0].out)+'</b> (%'+Math.round(r.dec[0].p*100)+' emin). Girdisi başlangıç işareti; <b>kendi</b> gömme tablosundan geçti, Katman 2\'nin h\'si tam bağlı katman + softmax ile 12 sembole puanlandı.',
      'Decoder 2. basamağı üretti: <b>'+ND(r.dec[1].out)+'</b>. Girdisi kendi önceki çıktısı.',
      'Decoder bitiş işaretini üretti → cevap: <b>'+out+'</b>. '];
    let m=msgs[S]||msgs[7];
    if(S>=7)m+=(ok?'✅ Doğru ('+st.a+' + '+st.b+' = '+tgt+').':'❌ Yanlış — doğrusu '+tgt+'.')+(TEST.has(st.a*10+st.b)?' <i>Bu soru eğitimde hiç görülmemişti.</i>':'');
    document.getElementById('sa_msg').innerHTML=m;
  }
  function grid(){
    const ck=D.ck[st.ci];let h='<tr><th></th>';for(let b=0;b<10;b++)h+='<th style="padding:2px 6px">+'+b+'</th>';h+='</tr>';
    for(let a=0;a<10;a++){h+='<tr><th style="padding:2px 6px">'+a+'</th>';for(let b=0;b<10;b++){
      const code=ck.preds[a*10+b],t0=Math.floor(code/144),t1=Math.floor(code/12)%12,t2=code%12,ok=code===truthCode(a,b);
      const txt=t2===EN&&t0<10&&t1<10?''+t0+t1:'?';
      const sel=(a===st.a&&b===st.b);
      h+='<td data-a="'+a+'" data-b="'+b+'" style="cursor:pointer;padding:3px 6px;border:1px solid var(--line);background:'+(ok?'rgba(70,196,106,.25)':'rgba(224,106,106,.3)')+';'+(TEST.has(a*10+b)?'outline:2px dashed #f0a032;outline-offset:-2px;':'')+(sel?'box-shadow:inset 0 0 0 2px #ffd54a;':'')+'">'+txt+'</td>';}h+='</tr>';}
    document.getElementById('sa_grid').innerHTML=h;
    document.getElementById('sa_score').innerHTML='<b>epoch '+ck.ep+':</b> eğitim soruları <b>'+ck.train+'/90</b> doğru · eğitimde hiç görülmeyen sorular <b>'+ck.test+'/10</b> doğru · kayıp (eğitim, soru başına) <b>'+ck.loss.toFixed(3)+'</b>';
  }
  const fr3=document.getElementById('sa3dfr');fr3.src='harita/s2s-3b.html?embed=1&a='+st.a+'&b='+st.b+'&ck='+st.ci+'&step='+st.step+'&v=202611091433';
  function sync3d(){const m={type:'s2s3d',a:st.a,b:st.b,ci:st.ci,step:st.step};const ts=window.__s2sTourState&&window.__s2sTourState();if(ts){m.step=ts.step;m.focus=ts.ids;}try{fr3.contentWindow&&fr3.contentWindow.postMessage(m,'*');}catch(e){}
    document.getElementById('sa3dfull').href='harita/s2s-3b.html?a='+st.a+'&b='+st.b+'&ck='+st.ci+'&step='+st.step+'&v=202611091433';}
  addEventListener('message',e=>{if(e.data&&e.data.type==='s2s3dReady'&&e.source===fr3.contentWindow)sync3d();});
  window.__s2sSync3d=sync3d;
  document.getElementById('sa3dtour').addEventListener('click',function(){const box=document.getElementById('sa3d'),on=!box.classList.contains('tour');box.classList.toggle('tour',on);
    this.textContent=on?'✕ Turu kapat':'🎬 Animasyonlu tur: 3B + matris çarpımları';if(window.__s2sTourOn)window.__s2sTourOn(on);if(on)box.scrollIntoView({behavior:'smooth',block:'start'});});
  function all(){draw();grid();if(window.__s2sAnimSync)window.__s2sAnimSync();sync3d();if(window.__s2sInsideRender)window.__s2sInsideRender();if(window.__s2sDesenSync)window.__s2sDesenSync();[...ckb.children].forEach(b=>{const on=+b.dataset.i===st.ci;b.style.background=on?COL[st.ci]:'var(--panel)';b.style.color=on?'#fff':'var(--text)';b.style.border='1px solid var(--line)';});}
  ckb.addEventListener('click',e=>{if(e.target.dataset.i!==undefined){st.ci=+e.target.dataset.i;st.step=7;all();}});
  sa.addEventListener('change',()=>{st.a=+sa.value;st.step=0;all();});sb.addEventListener('change',()=>{st.b=+sb.value;st.step=0;all();});
  document.getElementById('sa_next').addEventListener('click',()=>{st.step=st.step>=7?1:st.step+1;all();});
  document.getElementById('sa_all').addEventListener('click',()=>{st.step=7;all();});
  document.getElementById('sa_rst').addEventListener('click',()=>{st.step=0;all();});
  document.getElementById('sa_grid').addEventListener('click',e=>{const t=e.target.closest('td[data-a]');if(!t)return;st.a=+t.dataset.a;st.b=+t.dataset.b;sa.value=st.a;sb.value=st.b;st.step=7;all();});
  window.__s2sAdd=st;
  all();
})();
