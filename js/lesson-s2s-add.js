/* Seq2Seq toplama: encoder(LSTM) → bağlam → decoder(LSTM); ağırlıklar çevrimdışı eğitilmiş (lesson-s2s-weights.js) */
(function(){
  const D=window.S2S_CK; if(!D) return;
  const H=D.H, DM=D.D, V=13, PLUS=10, ST=11, EN=12;
  const NAME=t=>t<10?String(t):(t===PLUS?'+':(t===ST?'&lt;s&gt;':'&lt;e&gt;'));
  const sig=x=>1/(1+Math.exp(-x));
  function cell(W,b,x,h,c){
    const z=new Array(4*H);
    for(let r=0;r<4*H;r++){let s=b[r];const row=W[r];for(let j=0;j<DM;j++)s+=row[j]*x[j];for(let j=0;j<H;j++)s+=row[DM+j]*h[j];z[r]=s;}
    const f=[],i=[],g=[],o=[],c2=[],h2=[];
    for(let k=0;k<H;k++){f[k]=sig(z[k]);i[k]=sig(z[H+k]);g[k]=Math.tanh(z[2*H+k]);o[k]=sig(z[3*H+k]);c2[k]=f[k]*c[k]+i[k]*g[k];h2[k]=o[k]*Math.tanh(c2[k]);}
    return {h:h2,c:c2,f,i,g,o};
  }
  function run(ck,a,b){
    const P=ck.W, src=[a,PLUS,b], enc=[]; let h=new Array(H).fill(0), c=new Array(H).fill(0);
    for(const t of src){const r=cell(P.We,P.be,P.emb[t],h,c);h=r.h;c=r.c;enc.push({tok:t,h:r.h,c:r.c});}
    const ctx={h:h.slice(),c:c.slice()}, dec=[]; let tok=ST;
    for(let s=0;s<3;s++){
      const r=cell(P.Wd,P.bd,P.emb[tok],h,c);h=r.h;c=r.c;
      const lg=P.Wo.map((row,k)=>{let q=P.bo[k];for(let j=0;j<H;j++)q+=row[j]*h[j];return q;});
      const mx=Math.max(...lg),ex=lg.map(v=>Math.exp(v-mx)),sm=ex.reduce((x,y)=>x+y,0),p=ex.map(v=>v/sm);
      let best=0;for(let k=1;k<V;k++)if(lg[k]>lg[best])best=k;
      dec.push({inp:tok,out:best,p:p[best],h:r.h,c:r.c});tok=best;
    }
    return {enc,ctx,dec,code:dec[0].out*169+dec[1].out*13+dec[2].out};
  }
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
   '<div style="overflow-x:auto"><svg id="sa_svg" style="min-width:640px;width:100%;max-width:820px;display:block;margin:0 auto" role="img" aria-label="Encoder-decoder toplama animasyonu"></svg></div>'+
   '<div id="sa_msg" class="callout" style="margin-top:8px"></div>'+
   '<div style="font-size:13px;color:#ccd5e8;margin:12px 0 4px"><b>10×10 sınav:</b> her hücre modelin o toplama için verdiği cevap (yeşil doğru, kırmızı yanlış; <span style="outline:2px dashed #f0a032;padding:0 4px">kesikli çerçeve</span> = eğitimde HİÇ görmediği 10 soru). Bir hücreye tıkla.</div>'+
   '<div style="overflow-x:auto"><table id="sa_grid" class="rex-tbl" style="border-collapse:collapse;font-size:11.5px;text-align:center"></table></div><div id="sa_score" style="font-size:13px;margin-top:6px"></div>';
  const sa=document.getElementById('sa_a'),sb=document.getElementById('sa_b');
  for(let i=0;i<10;i++){sa.add(new Option(i,i));sb.add(new Option(i,i));}
  sa.value=st.a;sb.value=st.b;
  const ckb=document.getElementById('sa_ck');
  D.ck.forEach((c,i)=>{const b=document.createElement('button');b.className='addbtn';b.textContent='epoch '+c.ep;b.dataset.i=i;b.style.marginRight='4px';ckb.appendChild(b);});
  const hm=(vals,x,y,w,hgt,col)=>{ // ısı şeridi
    let s='';const cw=w/vals.length;vals.forEach((v,k)=>{const a=Math.min(1,Math.abs(v));s+='<rect x="'+(x+k*cw)+'" y="'+y+'" width="'+(cw-0.6)+'" height="'+hgt+'" fill="'+(v>=0?'rgba(70,196,106,':'rgba(224,106,106,')+(0.12+0.88*a)+')"/>';});
    return s;};
  function draw(){
    const ck=D.ck[st.ci],r=run(ck,st.a,st.b),S=st.step;
    // S: 1..3 encoder adımları, 4 bağlam, 5..7 decoder adımları
    const X0=24,CW=96,GAP=34;let s='<defs><marker id="saAr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#95a2c2"/></marker></defs>';
    s+='<text x="'+(X0)+'" y="-2" font-size="11" fill="#95a2c2">ENCODER — okur</text>';
    const cx=i=>X0+i*(CW+GAP);
    r.enc.forEach((e,i)=>{
      const on=S>=i+1,x=cx(i);
      s+='<g opacity="'+(on?1:.25)+'"><rect x="'+x+'" y="60" width="'+CW+'" height="86" rx="10" fill="#17203a" stroke="'+(S===i+1?'#ffd54a':'#3a7afe')+'" stroke-width="'+(S===i+1?3:1.5)+'"/>'+
        '<text x="'+(x+CW/2)+'" y="76" text-anchor="middle" font-size="10" fill="#95a2c2">LSTM hücre</text>'+
        '<text x="'+(x+4)+'" y="92" font-size="9" fill="#95a2c2">c</text>'+hm(e.c,x+14,84,CW-20,9)+
        '<text x="'+(x+4)+'" y="118" font-size="9" fill="#95a2c2">h</text>'+hm(e.h,x+14,110,CW-20,9)+'</g>';
      s+='<g opacity="'+(on?1:.25)+'"><line x1="'+(x+CW/2)+'" y1="190" x2="'+(x+CW/2)+'" y2="148" stroke="#95a2c2" marker-end="url(#saAr)"/><rect x="'+(x+CW/2-22)+'" y="190" width="44" height="30" rx="7" fill="#0e1424" stroke="#3a7afe"/><text x="'+(x+CW/2)+'" y="210" text-anchor="middle" font-size="16" font-weight="700" fill="#ccd5e8">'+NAME(e.tok)+'</text></g>';
      if(i<2)s+='<line x1="'+(x+CW)+'" y1="103" x2="'+(x+CW+GAP-2)+'" y2="103" stroke="#95a2c2" stroke-width="2" marker-end="url(#saAr)" opacity="'+(S>=i+2?1:.25)+'"/>';
    });
    // bağlam
    const bx=cx(3)+4;
    s+='<g opacity="'+(S>=4?1:.25)+'"><line x1="'+(cx(2)+CW)+'" y1="103" x2="'+(bx-2)+'" y2="103" stroke="#e06a6a" stroke-width="3" marker-end="url(#saAr)"/>'+
      '<rect x="'+bx+'" y="52" width="112" height="102" rx="12" fill="rgba(224,106,106,.12)" stroke="#e06a6a" stroke-width="'+(S===4?3.5:2)+'"/><text x="'+(bx+56)+'" y="70" text-anchor="middle" font-size="12" font-weight="700" fill="#e06a6a">🍾 bağlam</text>'+
      '<text x="'+(bx+6)+'" y="94" font-size="9" fill="#95a2c2">c</text>'+hm(r.ctx.c,bx+16,86,90,9)+'<text x="'+(bx+6)+'" y="118" font-size="9" fill="#95a2c2">h</text>'+hm(r.ctx.h,bx+16,110,90,9)+
      '<text x="'+(bx+56)+'" y="144" text-anchor="middle" font-size="9.5" fill="#95a2c2">'+(2*H)+' sayı = tüm soru</text></g>';
    // decoder
    const dx0=bx+112+GAP;
    s+='<text x="'+dx0+'" y="-2" font-size="11" fill="#95a2c2">DECODER — üretir</text>';
    r.dec.forEach((d,i)=>{
      const on=S>=5+i,x=dx0+i*(CW+GAP-8);
      s+='<g opacity="'+(on?1:.25)+'"><rect x="'+x+'" y="60" width="'+(CW-8)+'" height="86" rx="10" fill="#17203a" stroke="'+(S===5+i?'#ffd54a':'#46c46a')+'" stroke-width="'+(S===5+i?3:1.5)+'"/>'+
        '<text x="'+(x+(CW-8)/2)+'" y="76" text-anchor="middle" font-size="10" fill="#95a2c2">LSTM hücre</text>'+
        '<text x="'+(x+4)+'" y="92" font-size="9" fill="#95a2c2">c</text>'+hm(d.c,x+14,84,CW-28,9)+
        '<text x="'+(x+4)+'" y="118" font-size="9" fill="#95a2c2">h</text>'+hm(d.h,x+14,110,CW-28,9)+
        '<line x1="'+(x+(CW-8)/2)+'" y1="60" x2="'+(x+(CW-8)/2)+'" y2="30" stroke="#46c46a" stroke-width="2" marker-end="url(#saAr)"/>'+
        '<rect x="'+(x+(CW-8)/2-26)+'" y="2" width="52" height="26" rx="7" fill="#0e1424" stroke="#46c46a"/><text x="'+(x+(CW-8)/2)+'" y="21" text-anchor="middle" font-size="15" font-weight="700" fill="#46c46a">'+NAME(d.out)+'</text>'+
        '<line x1="'+(x+(CW-8)/2)+'" y1="190" x2="'+(x+(CW-8)/2)+'" y2="148" stroke="#95a2c2" marker-end="url(#saAr)"/><rect x="'+(x+(CW-8)/2-24)+'" y="190" width="48" height="30" rx="7" fill="#0e1424" stroke="#46c46a"/><text x="'+(x+(CW-8)/2)+'" y="210" text-anchor="middle" font-size="14" font-weight="700" fill="#ccd5e8">'+NAME(d.inp)+'</text>'+
        '<text x="'+(x+(CW-8)/2)+'" y="236" text-anchor="middle" font-size="9.5" fill="#95a2c2">%'+Math.round(d.p*100)+' emin</text></g>';
      if(i<2)s+='<line x1="'+(x+CW-8)+'" y1="103" x2="'+(x+CW-8+GAP-10)+'" y2="103" stroke="#95a2c2" stroke-width="2" marker-end="url(#saAr)" opacity="'+(S>=6+i?1:.25)+'"/>';
    });
    const W=dx0+3*(CW+GAP-8);
    document.getElementById('sa_svg').setAttribute('viewBox','0 -14 '+Math.round(W+10)+' 264');
    document.getElementById('sa_svg').innerHTML=s;
    const ans=r.dec[0].out*10+r.dec[1].out, tgt=st.a+st.b, ok=(r.code===(Math.floor(tgt/10)*169+(tgt%10)*13+EN));
    const out=r.dec.slice(0,2).map(d=>NAME(d.out)).join('')+(r.dec[2].out===EN?'':' …');
    const msgs=['Henüz bir şey okunmadı. <b>İleri ▶</b>’ya bas.','Encoder 1. kelimeyi okudu: <b>'+st.a+'</b>.','Encoder 2. kelimeyi okudu: <b>+</b> (durum öncekiyle birleşti).','Encoder 3. kelimeyi okudu: <b>'+st.b+'</b>. Artık elinde <b>tek bir durum</b> var.','🍾 Bağlam: soru ('+st.a+' + '+st.b+') bu <b>'+(2*H)+' sayıya</b> sıkıştı. Decoder yalnız bunu görecek.','Decoder 1. basamağı üretti: <b>'+NAME(r.dec[0].out)+'</b> (%'+Math.round(r.dec[0].p*100)+' emin). Girdisi: başlangıç işareti.','Decoder 2. basamağı üretti: <b>'+NAME(r.dec[1].out)+'</b> (girdisi kendi önceki çıktısı).','Decoder bitiş işaretini üretti → cevap: <b>'+out+'</b>. '];
    let m=msgs[S]||msgs[7];
    if(S>=7)m+=(ok?'✅ Doğru ('+st.a+' + '+st.b+' = '+tgt+').':'❌ Yanlış — doğrusu '+tgt+'.')+(TEST.has(st.a*10+st.b)?' <i>Bu soru eğitimde hiç görülmemişti.</i>':'');
    document.getElementById('sa_msg').innerHTML=m;
  }
  function grid(){
    const ck=D.ck[st.ci];let h='<tr><th></th>';for(let b=0;b<10;b++)h+='<th style="padding:2px 6px">+'+b+'</th>';h+='</tr>';
    for(let a=0;a<10;a++){h+='<tr><th style="padding:2px 6px">'+a+'</th>';for(let b=0;b<10;b++){
      const code=ck.preds[a*10+b],t0=Math.floor(code/169),t1=Math.floor(code/13)%13,t2=code%13,tg=a+b,ok=code===Math.floor(tg/10)*169+(tg%10)*13+EN;
      const txt=t2===EN?(t0<10&&t1<10?''+t0+t1:'?'):'?';
      const sel=(a===st.a&&b===st.b);
      h+='<td data-a="'+a+'" data-b="'+b+'" style="cursor:pointer;padding:3px 6px;border:1px solid var(--line);background:'+(ok?'rgba(70,196,106,.25)':'rgba(224,106,106,.3)')+';'+(TEST.has(a*10+b)?'outline:2px dashed #f0a032;outline-offset:-2px;':'')+(sel?'box-shadow:inset 0 0 0 2px #ffd54a;':'')+'">'+txt+'</td>';}h+='</tr>';}
    document.getElementById('sa_grid').innerHTML=h;
    const nT=D.test.filter(i=>ck.preds[i]===Math.floor((Math.floor(i/10)+i%10)/10)*169+((Math.floor(i/10)+i%10)%10)*13+EN).length;
    document.getElementById('sa_score').innerHTML='<b>epoch '+ck.ep+':</b> eğitim soruları <b>'+ck.train+'/90</b> doğru · eğitimde hiç görülmeyen sorular <b>'+ck.test+'/10</b> doğru · kayıp (eğitim, soru başına) <b>'+ck.loss.toFixed(3)+'</b>';
  }
  function all(){draw();grid();[...ckb.children].forEach(b=>{const on=+b.dataset.i===st.ci;b.style.background=on?COL[st.ci]:'var(--panel)';b.style.color=on?'#fff':'var(--text)';b.style.border='1px solid var(--line)';});}
  ckb.addEventListener('click',e=>{if(e.target.dataset.i!==undefined){st.ci=+e.target.dataset.i;st.step=7;all();}});
  sa.addEventListener('change',()=>{st.a=+sa.value;st.step=0;all();});sb.addEventListener('change',()=>{st.b=+sb.value;st.step=0;all();});
  document.getElementById('sa_next').addEventListener('click',()=>{st.step=st.step>=7?1:st.step+1;all();});
  document.getElementById('sa_all').addEventListener('click',()=>{st.step=7;all();});
  document.getElementById('sa_rst').addEventListener('click',()=>{st.step=0;all();});
  document.getElementById('sa_grid').addEventListener('click',e=>{const t=e.target.closest('td[data-a]');if(!t)return;st.a=+t.dataset.a;st.b=+t.dataset.b;sa.value=st.a;sb.value=st.b;st.step=7;all();});
  window.__s2sAdd=st;
  all();
})();
