// LSTM — "6️⃣ Bütün Resim": RNN'deki gibi tür seçici (Tek Hücre / many-to-one / many-to-many) +
// her türde 🎮 CANLI ÇALIŞTIR (mimari diyagramı + İleri ▶ / ◀ Geri) + 3 adımlı türlerde ileri yol ve BPTT ağacı.
// Ağırlıklar Simülasyon'daki lv_W/U/b{f,i,c,o}; Tek Hücre girdileri lv_x/lv_hp/lv_cp/lv_y, dizi girdileri ul_x1..3, ul_y1..3.
// Kayıp L = Σ ½(h_t − y_t)² (çıktı olan adımlar); h₀ = c₀ = 0.
(function(){
  const $=id=>document.getElementById(id);
  if(!$('lstmBigSeqMap')) return;
  const sig=z=>1/(1+Math.exp(-z));
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>v<0?'('+t(v,d)+')':t(v,d);
  const G=['f','i','c','o'], GN={f:'f',i:'i',c:'c̃',o:'o'}, P=['W','U','b'];
  const SUB=['₀','₁','₂','₃'];
  let type='tek';
  const MJ=()=>window.MathJax;
  function typeset(el){const M=MJ();if(M&&M.typesetPromise){try{M.typesetClear&&M.typesetClear([el]);}catch(e){}M.typesetPromise([el]).catch(()=>{});}}

  // ---------- model (3 adım) ----------
  function weights(){const W={};G.forEach(g=>{W[g]=P.map(p=>parseFloat($('lv_'+p+g).value));});return W;}
  function model(mode,W){
    W=W||weights();
    const xs=[1,2,3].map(k=>parseFloat($('ul_x'+k).value)), ys=[1,2,3].map(k=>parseFloat($('ul_y'+k).value));
    const out=k=>mode==='m2m'||k===3;
    const S=[null]; let h=0,c=0,L=0;
    for(let k=1;k<=3;k++){
      const x=xs[k-1],z={},a={};
      G.forEach(g=>{z[g]=W[g][0]*x+W[g][1]*h+W[g][2];});
      a.f=sig(z.f);a.i=sig(z.i);a.c=Math.tanh(z.c);a.o=sig(z.o);
      const cn=a.f*c+a.i*a.c,tc=Math.tanh(cn),hn=a.o*tc;
      const q={k,x,hp:h,cp:c,z,a,c:cn,tc,h:hn,y:ys[k-1],out:out(k)};
      q.Lk=q.out?0.5*(hn-q.y)*(hn-q.y):0; L+=q.Lk;
      S.push(q); h=hn;c=cn;
    }
    // BPTT
    const grad={};G.forEach(g=>{grad[g]=[0,0,0];});
    let dhN=0,dcN=0,fN=0;
    for(let k=3;k>=1;k--){
      const q=S[k];
      q.dhDir=q.out?q.h-q.y:0; q.dhU=dhN; q.dh=q.dhDir+dhN;
      q.dcH=q.dh*q.a.o*(1-q.tc*q.tc); q.dcC=dcN*fN; q.dc=q.dcH+q.dcC;
      q.da={f:q.dc*q.cp,i:q.dc*q.a.c,c:q.dc*q.a.i,o:q.dh*q.tc};
      q.dz={f:q.da.f*q.a.f*(1-q.a.f),i:q.da.i*q.a.i*(1-q.a.i),c:q.da.c*(1-q.a.c*q.a.c),o:q.da.o*q.a.o*(1-q.a.o)};
      q.gr={};G.forEach(g=>{q.gr[g]=[q.dz[g]*q.x,q.dz[g]*q.hp,q.dz[g]];grad[g][0]+=q.gr[g][0];grad[g][1]+=q.gr[g][1];grad[g][2]+=q.gr[g][2];});
      q.norm=G.reduce((s,g)=>s+Math.abs(q.gr[g][0])+Math.abs(q.gr[g][1])+Math.abs(q.gr[g][2]),0);
      dhN=G.reduce((s,g)=>s+W[g][1]*q.dz[g],0); dcN=q.dc; fN=q.a.f;
      q.dhPrev=dhN; q.dcPrev=q.dc*q.a.f;
    }
    return {S,L,grad,W};
  }

  // ---------- HTML yardımcıları (Bütün Resim dili) ----------
  const fbox=(cls,id,sym,cap)=>'<div class="xf-box '+cls+'" id="lq_'+id+'">'+sym+'<span class="xf-val" id="lq_'+id+'v">—</span>'+(cap?'<span class="xf-cap">'+cap+'</span>':'')+'</div>';
  const fkol=(inner,ad)=>'<div class="xf-kol">'+inner+'<div class="xf-kolad">'+ad+'</div></div>';
  const fok=(key,tex)=>'<div class="xf-ok"><span class="xf-chip" data-pop="'+key+'" tabindex="0" role="button" aria-label="bu adımı anlat">\\( '+tex+' \\)</span><span class="xf-ar">→</span></div>';
  const E=(cls,key,tex)=>'<span class="xt-edge '+cls+'" data-pop="'+key+'" tabindex="0" role="button" aria-label="türetmeyi göster">\\( '+tex+' \\)</span><span class="xt-ar">→</span>';
  const B=(cls,id,sym,cap)=>'<div class="xt-box '+cls+'" id="lqb_'+id+'">'+sym+'<span class="xt-cap">'+cap+'</span><span class="xt-val">—</span></div>';
  const LF=(cls,id,sym)=>'<div class="xt-box '+cls+' yaprak" id="lqb_'+id+'">'+sym+'<span class="xt-val">—</span></div>';
  const kid=(e,c)=>'<div class="xt-kid">'+e+c+'</div>';
  const node=(b,k)=>'<div class="xt-node">'+b+(k?'<div class="xt-kids">'+k+'</div>':'')+'</div>';

  function fwdRow(k,mode){
    const o=(mode==='m2m'||k===3);
    let s='<div class="xf-baslik" style="margin-top:6px">▶ t = '+k+' — <span>x'+SUB[k]+', h'+SUB[k-1]+', c'+SUB[k-1]+' → kapılar → c'+SUB[k]+' → h'+SUB[k]+(o?' → L'+SUB[k]:' (bu adımda çıktı yok)')+'</span></div><div class="xf-scroll"><div class="xf-akis">';
    s+=fkol(fbox('gi','x'+k,'x'+SUB[k])+fbox('gh','hp'+k,'h'+SUB[k-1])+fbox('gc','cp'+k,'c'+SUB[k-1]),k===1?'girdi + başlangıç (0)':'girdi + önceki hafızalar');
    s+=fok('lq_zg'+k,'\\sigma/\\tanh(Wx{+}Uh{+}b)');
    s+=fkol(fbox('gy','f'+k,'f')+fbox('gy','i'+k,'i')+fbox('gy','g'+k,'c̃')+fbox('gy','o'+k,'o'),'kapılar ve aday');
    s+=fok('lq_c'+k,'f\\,c_{'+(k-1)+'}{+}i\\tilde c');
    s+=fkol(fbox('gc','c'+k,'c'+SUB[k]),'uzun hafıza');
    s+=fok('lq_h'+k,'o\\tanh c_{'+k+'}');
    s+=fkol(fbox('gl','h'+k,'h'+SUB[k],o?'tahmin ŷ'+SUB[k]:''),'kısa hafıza'+(o?' = çıktı':''));
    if(o){s+=fok('lq_L'+k,'\\tfrac12(h_{'+k+'}{-}y_{'+k+'})^2');s+=fkol(fbox('gl','L'+k,'L'+SUB[k])+fbox('gc','y'+k,'y'+SUB[k]),'bu adımın kaybı');}
    return s+'</div></div>';
  }

  // geri ağaç: t adımının c düğümü (δc_t) ve altı
  function cNode(k,mode){
    const zbox=node(B('g4','z'+k,'δz<sup>('+k+')</sup>','4 kapının δ\'sı'),
      kid(E('g4','lq_lf'+k,'\\times x_{'+k+'},\\ h_{'+(k-1)+'},\\ 1'),LF('g4','lf'+k,'12 ağırlık<br>katkısı t='+k))+
      (k>1?kid(E('g1','lq_U'+k,'\\sum_g U_g\\,\\delta z_g^{('+k+')}'),hNode(k-1,mode)):kid(E('g1','lq_U1','U\\cdot\\delta z^{(1)}'),LF('g1','h0','h₀ = 0 (sabit, öğrenilmez)'))));
    const cc=k>1?kid(E('g2','lq_cc'+k,'\\tfrac{\\partial c_{'+k+'}}{\\partial c_{'+(k-1)+'}}=f_{'+k+'}'),cNode(k-1,mode))
                :kid(E('g2','lq_cc1','\\tfrac{\\partial c_1}{\\partial c_0}=f_1'),LF('g2','c0','c₀ = 0 (sabit)'));
    return node(B('g2','c'+k,'δc'+SUB[k],k===3?'h₃\'ten':'h yolu + c otobanı'),kid(E('g4','lq_dz'+k,'\\sigma\'\\!,\\ \\tanh\''),zbox)+cc);
  }
  // h_{k} düğümü (k<3): U üzerinden gelen + (m2m ise) kendi kaybı; c_k'ye h yoluyla ↪ kutusu
  function hNode(k,mode){
    return node(B('g1','h'+k,'δh'+SUB[k],mode==='m2m'?'U yolu + L'+SUB[k]+' yolu':'yalnız U yolu'),
      kid(E('g2','lq_hc'+k,'\\tfrac{\\partial h_{'+k+'}}{\\partial c_{'+k+'}}=o(1{-}\\tanh^2c)'),LF('g2','hc'+k,'↪ δc'+SUB[k]+' (h yolu)')));
  }
  function build(mode){
    let o='<div class="xf-baslik">▶ İLERİ YOL — aynı hücre 3 kez <span>(ağırlıklar ortak; yalnız h ve c bir sonraki adıma geçer)</span></div>';
    for(let k=1;k<=3;k++) o+=fwdRow(k,mode);
    if(mode==='m2m') o+='<div class="xf-baslik" style="margin-top:6px">▶ Toplam kayıp</div><div class="xf-scroll"><div class="xf-akis">'+fkol(fbox('gl','Lb1','L₁')+fbox('gl','Lb2','L₂')+fbox('gl','Lb3','L₃'),'üç adımın kaybı')+fok('lq_Ltot','L{=}L_1{+}L_2{+}L_3')+fkol(fbox('gl','L','L'),'toplam kayıp')+'</div></div>';
    o+='<div id="lstmBpSlotSeq"></div>';
    // geri ağaç
    let rootKids=kid(E('g1','lq_Lh3','\\tfrac{\\partial L}{\\partial h_3}=h_3-y_3'),node(B('g1','h3','δh₃','kayıptan'),kid(E('g2','lq_hc3','\\tfrac{\\partial h_3}{\\partial c_3}=o(1{-}\\tanh^2c)'),cNode(3,mode))));
    if(mode==='m2m'){
      [2,1].forEach(k=>{rootKids+=kid(E('g1','lq_Lh'+k,'\\tfrac{\\partial L}{\\partial h_{'+k+'}}=h_{'+k+'}-y_{'+k+'}'),LF('g1','Ld'+k,'↪ δh'+SUB[k]+' (doğrudan)'));});
    }
    o+='<div class="xf-baslik" style="margin-top:8px">◀ GERİ YOL (BPTT) — kayıptan geçmişe <span>(c otobanında çarpan f; h yolunda U · kapı eğimleri — ↪ kutuları aynı düğümde toplanır)</span></div><div class="xt-scroll"><div class="xt-tree">'+node(B('g1 kok','L','L','kayıp'),rootKids)+'</div></div>';
    return o;
  }

  // ---------- pop-up kaynakları ----------
  function srcEl(id){let e=document.getElementById('xtsrc-'+id);if(!e){e=document.createElement('div');e.className='xt-src';e.id='xtsrc-'+id;($('lstmSrc')||document.body).appendChild(e);}return e;}
  function src(id,title,eq,num,say){srcEl(id).innerHTML='<div class="xp-bas">'+title+'</div><div class="eq">\\( '+eq+' \\)</div>'+(num?'<div class="xp-hes">\\( '+num+' \\)</div>':'')+'<div class="xp-sat">'+say+'</div>';}
  const setT=(id,v)=>{const e=$('lq_'+id);if(e)e.textContent=v;};

  function fill(){
    if(type==='tek') return;
    const mode=type,M=model(mode),S=M.S,W=M.W;
    for(let k=1;k<=3;k++){
      const q=S[k];
      setT('x'+k+'v',f(q.x,2));setT('hp'+k+'v',f(q.hp,3));setT('cp'+k+'v',f(q.cp,3));
      setT('f'+k+'v',f(q.a.f));setT('i'+k+'v',f(q.a.i));setT('g'+k+'v',f(q.a.c));setT('o'+k+'v',f(q.a.o));
      setT('c'+k+'v',f(q.c));setT('h'+k+'v',f(q.h));
      if(q.out){setT('L'+k+'v',f(q.Lk,4));setT('y'+k+'v',f(q.y,2));setT('Lb'+k+'v',f(q.Lk,4));}
    }
    setT('Lv',f(M.L,4));
    // geri ağaç değerleri (geri düğümler lqb_ önekli)
    const tv=(id,v)=>{const e=document.querySelector('#lqb_'+id+' .xt-val');if(e)e.textContent=v;};
    tv('L',f(M.L,4));
    for(let k=1;k<=3;k++){
      const q=S[k];
      tv('h'+k,f(q.dh,4));tv('c'+k,f(q.dc,4));
      const zb=document.querySelector('#lqb_z'+k+' .xt-val');
      if(zb) zb.innerHTML='f '+f(q.dz.f,4)+' · i '+f(q.dz.i,4)+'<br>c̃ '+f(q.dz.c,4)+' · o '+f(q.dz.o,4);
      tv('lf'+k,'Σ|katkı| = '+f(q.norm,4));
      tv('hc'+k,f(q.dcH,4));
      if(mode==='m2m'&&k<3) tv('Ld'+k,f(q.dhDir,4));
    }
    tv('h0',f(S[1].dhPrev,4)+' (kullanılmaz)'); tv('c0',f(S[1].dcPrev,4)+' (kullanılmaz)');
    // ileri pop-up'lar
    for(let k=1;k<=3;k++){
      const q=S[k],a=q.a;
      const zl=g=>(g==='c'?'\\tilde c':g)+'='+(g==='c'?'\\tanh':'\\sigma')+'('+t(W[g][0],2)+'\\cdot'+tp(q.x,2)+'+'+t(W[g][1],2)+'\\cdot'+tp(q.hp,3)+'+'+tp(W[g][2],2)+')=\\mathbf{'+t(a[g],3)+'}';
      src('lq_zg'+k,'t='+k+' — dört kapı','z_g=W_gx_{'+k+'}+U_gh_{'+(k-1)+'}+b_g','\\begin{aligned}'+G.map(zl).join('\\\\')+'\\end{aligned}',
        '💬 '+(k===1?'İlk adımda h₀ = c₀ = 0, kapılar yalnız x₁\'e bakar.':'Aynı 12 ağırlık (Simülasyon\'daki kaydırıcılar) bu adımda da kullanılır; farklı olan yalnız girdiler: x'+SUB[k]+' ve önceki adımın h'+SUB[k-1]+' = '+f(q.hp)+'.')+' Hafızanın %'+Math.round(a.f*100)+'\'i kalıyor, yeninin %'+Math.round(a.i*100)+'\'i giriyor.');
      src('lq_c'+k,'t='+k+' — uzun hafıza','c_{'+k+'}=f\\,c_{'+(k-1)+'}+i\\,\\tilde c','c_{'+k+'}='+t(a.f,3)+'\\cdot'+tp(q.cp,3)+'+'+t(a.i,3)+'\\cdot'+tp(a.c,3)+'=\\mathbf{'+t(q.c,3)+'}',
        '💬 Eski hafıza c'+SUB[k-1]+' yalnızca f ile ölçeklenip yeni içerikle <b>toplanıyor</b> — W ile çarpılmıyor. Bilginin zamanda taşındığı hat bu.');
      src('lq_h'+k,'t='+k+' — kısa hafıza / çıktı','h_{'+k+'}=o\\tanh c_{'+k+'}','h_{'+k+'}='+t(a.o,3)+'\\cdot\\tanh('+tp(q.c,3)+')='+t(a.o,3)+'\\cdot'+tp(q.tc,3)+'=\\mathbf{'+t(q.h,3)+'}',
        '💬 h'+SUB[k]+' iki yere gider: '+(k<3?'bir sonraki adımın kapılarına (U ile)':'')+(q.out?(k<3?' ve ':'')+'çıktıya (ŷ'+SUB[k]+' = h'+SUB[k]+')':'')+'.'+(!q.out?' Bu adımda çıktı yok (many-to-one: cevap yalnız sonda).':''));
      if(q.out) src('lq_L'+k,'t='+k+' — kayıp','L_{'+k+'}=\\tfrac12(h_{'+k+'}-y_{'+k+'})^2','L_{'+k+'}=\\tfrac12('+tp(q.h,3)+'-'+tp(q.y,2)+')^2=\\mathbf{'+t(q.Lk,4)+'}','💬 Hedef y'+SUB[k]+' yukarıdaki girdi satırından.');
    }
    if(mode==='m2m') src('lq_Ltot','Toplam kayıp','L=L_1+L_2+L_3',t(S[1].Lk,4)+'+'+t(S[2].Lk,4)+'+'+t(S[3].Lk,4)+'=\\mathbf{'+t(M.L,4)+'}','💬 Her adımın hatası ayrı ayrı ölçülüp toplanır; geri yolda her L<sub>t</sub> kendi h<sub>t</sub>\'sine girer.');
    // geri pop-up'lar
    for(let k=1;k<=3;k++){
      const q=S[k],a=q.a;
      if(q.out) src('lq_Lh'+k,'∂L/∂h'+SUB[k],'\\tfrac{\\partial L}{\\partial h_{'+k+'}}=h_{'+k+'}-y_{'+k+'}',t(q.h,3)+'-'+tp(q.y,2)+'=\\mathbf{'+t(q.dhDir,4)+'}','💬 Bu adımın kaybından h'+SUB[k]+'\'e doğrudan gelen sinyal.'+(k<3?' ↪ kutusu: δh'+SUB[k]+' düğümünde U yolundan gelenle toplanır.':''));
      src('lq_hc'+k,'∂h'+SUB[k]+'/∂c'+SUB[k]+' — h yolu','\\tfrac{\\partial h}{\\partial c}=o(1-\\tanh^2c)','\\delta c^{h}_{'+k+'}='+tp(q.dh,4)+'\\cdot'+t(a.o,3)+'\\cdot'+t(1-q.tc*q.tc,3)+'=\\mathbf{'+t(q.dcH,4)+'}',
        '💬 h'+SUB[k]+'\'e gelen δ, çıkış kapısı ve tanh\'ın eğiminden geçerek c'+SUB[k]+'\'e iner.'+(k<3?' Bu, δc'+SUB[k]+'\'in <b>iki parçasından biri</b>; diğeri c otobanından (f'+SUB[k+1]+') gelir.':''));
      const prev=k<3?S[k+1]:null;
      src('lq_dz'+k,'t='+k+' — kapıların δ\'sı','\\delta z_g=\\tfrac{\\partial L}{\\partial g}\\cdot g\'(z_g)',
        '\\begin{aligned}'+(k<3?'\\delta c_{'+k+'}&='+t(q.dcH,4)+'+'+tp(q.dcC,4)+'=\\mathbf{'+t(q.dc,4)+'}\\\\':'')+
        '\\delta z_f&='+tp(q.dc,4)+'\\cdot'+tp(q.cp,3)+'\\cdot'+t(a.f*(1-a.f),3)+'='+t(q.dz.f,4)+'\\\\ \\delta z_i&='+tp(q.dc,4)+'\\cdot'+tp(a.c,3)+'\\cdot'+t(a.i*(1-a.i),3)+'='+t(q.dz.i,4)+'\\\\ \\delta z_c&='+tp(q.dc,4)+'\\cdot'+t(a.i,3)+'\\cdot'+t(1-a.c*a.c,3)+'='+t(q.dz.c,4)+'\\\\ \\delta z_o&='+tp(q.dh,4)+'\\cdot'+tp(q.tc,3)+'\\cdot'+t(a.o*(1-a.o),3)+'='+t(q.dz.o,4)+'\\end{aligned}',
        '💬 Tek hücredeki dalların aynısı: f, i, c̃ δc\'den; o ise doğrudan δh\'den beslenir.'+(k===1?' t=1\'de c₀ = 0 olduğu için δz<sub>f</sub> = 0 — unutma kapısının ilk adımda unutacağı bir şey yok.':''));
      let tbl='<table class="xp-tbl" style="font-size:12px;border-collapse:collapse;margin-top:6px"><tr><th></th><th>W (×x'+SUB[k]+')</th><th>U (×h'+SUB[k-1]+')</th><th>b (×1)</th></tr>';
      G.forEach(g=>{tbl+='<tr><td><b>'+GN[g]+'</b></td>'+q.gr[g].map(v=>'<td style="padding:1px 8px;text-align:right">'+f(v,4)+'</td>').join('')+'</tr>';});
      tbl+='</table>';
      srcEl('lq_lf'+k).innerHTML='<div class="xp-bas">t='+k+' — 12 ağırlığın bu adımdaki katkısı</div><div class="eq">\\( dW_g\\mathrel{+}=\\delta z_g\\,x_{'+k+'},\\ dU_g\\mathrel{+}=\\delta z_g\\,h_{'+(k-1)+'},\\ db_g\\mathrel{+}=\\delta z_g \\)</div>'+tbl+
        '<div class="xp-sat">💬 Aynı 12 ağırlık her adımda kullanıldığı için gerçek gradyan üç adımın katkılarının <b>toplamı</b> (aşağıdaki tabloda).'+(k===1?' t=1\'de h₀ = 0 → bütün U katkıları 0.':'')+'</div>';
      if(k>1) src('lq_U'+k,'δh'+SUB[k-1]+' ← t='+k+'\'nin kapıları','\\delta h_{'+(k-1)+'}=\\sum_g U_g\\,\\delta z_g^{('+k+')}'+(mode==='m2m'?'+(h_{'+(k-1)+'}-y_{'+(k-1)+'})':''),
        '\\begin{aligned}&'+G.map(g=>tp(W[g][1],2)+'\\cdot'+tp(q.dz[g],4)).join('+')+'\\\\&='+t(q.dhPrev,4)+(mode==='m2m'?'+'+tp(S[k-1].dhDir,4)+'=\\mathbf{'+t(S[k-1].dh,4)+'}':'=\\mathbf{'+t(S[k-1].dh,4)+'}')+'\\end{aligned}',
        '💬 h'+SUB[k-1]+' t='+k+'\'de dört kapıya U ile girmişti; geri yolda dördünün δ\'sı U ile geri toplanır. <b>RNN\'deki W<sub>hh</sub>·(1−h²) yolunun karşılığı</b> — sönebilen yol bu.');
      else src('lq_U1','h₀ → sabit','\\delta h_0=\\sum_g U_g\\,\\delta z_g^{(1)}',t(S[1].dhPrev,4),'💬 h₀ = 0 bir başlangıç değeri, öğrenilmez; zincir burada biter.');
      if(k>1) src('lq_cc'+k,'∂c'+SUB[k]+'/∂c'+SUB[k-1]+' = f'+SUB[k]+' — gradyan otobanı','\\tfrac{\\partial c_{'+k+'}}{\\partial c_{'+(k-1)+'}}=f_{'+k+'}',
        '\\delta c^{c}_{'+(k-1)+'}='+tp(q.dc,4)+'\\cdot'+t(a.f,3)+'=\\mathbf{'+t(q.dcPrev,4)+'}',
        '💬 Geçmişe giden sinyal bir önceki hafızaya <b>yalnızca f'+SUB[k]+' ile çarpılarak</b> geçer (W yok, tanh\' yok). f ≈ 1 ise sinyal sönmez. δc'+SUB[k-1]+' düğümünde h yolundan (↪) gelenle toplanır.');
      else src('lq_cc1','c₀ → sabit','\\tfrac{\\partial c_1}{\\partial c_0}=f_1',t(S[1].dcPrev,4),'💬 c₀ = 0 bir başlangıç değeri; zincir burada biter.');
    }
    // özet tablo
    const sum=$('lstmBigSeqSum');
    if(sum){
      let h='<div style="overflow-x:auto"><table style="font-size:12.5px;border-collapse:collapse;color:#ccd5e8;min-width:420px"><tr style="color:#8fdc9f"><th style="text-align:left;padding:3px 8px">ağırlık</th><th>t=1</th><th>t=2</th><th>t=3</th><th style="color:#ffd24a">toplam = gradyan</th></tr>';
      G.forEach(g=>P.forEach((p,j)=>{h+='<tr><td style="padding:2px 8px">'+p+'<sub>'+GN[g]+'</sub></td>'+[1,2,3].map(k=>'<td style="padding:2px 8px;text-align:right">'+f(S[k].gr[g][j],4)+'</td>').join('')+'<td style="padding:2px 8px;text-align:right;color:#ffd24a"><b>'+f(M.grad[g][j],4)+'</b></td></tr>';}));
      h+='</table></div>';
      const r=S[3].norm>1e-9?S[1].norm/S[3].norm:0;
      h+='<div class="callout" style="margin-top:8px">💡 <b>Ne öğrendik:</b> t=1\'in katkısı t=3\'ün <b>%'+Math.round(r*100)+'</b>\'i kadar (Σ|katkı|: '+f(S[1].norm,4)+' / '+f(S[3].norm,4)+'). c otobanındaki çarpan f₂·f₃ = '+f(S[2].a.f*S[3].a.f)+(mode==='m2o'?' — kayıp yalnız sonda olduğu için t=1\'e ulaşan her şey bu iki yoldan (c otobanı + U yolu) geçmek zorunda.':' — many-to-many\'de her adım kendi kaybından da doğrudan sinyal aldığı için erken adımlar daha az "aç" kalır.')+'</div>';
      sum.innerHTML=h;
    }
    if(window.__lstmUnroll) window.__lstmUnroll.render();
  }

  // ---------- canlı çalıştır (dizi) ----------
  let sF=0,sB=0;
  const FST=4,BST=3;
  function clrHL(root){root.querySelectorAll('.eq-hl-f,.eq-hl-b').forEach(e=>e.classList.remove('eq-hl-f','eq-hl-b'));}
  function seqStep(){
    const map=$('lstmBigSeqMap'); clrHL(map);
    const M=model(type),S=M.S,info=$('lqStepInfo'),form=$('lqStepFormula');
    if(sB>0){
      const k=4-sB,q=S[k];
      window.__lstmUnroll.setHL({t:k,dir:'b',out:false});
      ['h'+k,'c'+k,'z'+k,'lf'+k].forEach(id=>{const e=$('lqb_'+id);if(e)e.classList.add('eq-hl-b');});
      form.innerHTML='◀ BPTT t='+k+':  δh'+SUB[k]+' = '+f(q.dh,4)+'   δc'+SUB[k]+' = '+(k<3?'h yolu '+f(q.dcH,4)+' + otoban '+f(q.dcC,4)+' = ':'')+'<b>'+f(q.dc,4)+'</b>   →  12 ağırlığa katkı Σ|·| = <b>'+f(q.norm,4)+'</b>';
      info.innerHTML=k===3?'Geri yayılım kayıptan başlar: δh₃ = h₃ − y₃. c₃ ve dört kapının δ\'sı bulunur, 12 ağırlığa ilk katkılar yazılır.':(k===2?'Sinyal t=2\'ye <b>iki yoldan</b> gelir: c otobanı (× f₃ = '+f(S[3].a.f)+') ve h yolu (U · kapı δ\'ları). İkisi δc₂\'de toplanır.':'En başa ulaştık: t=1\'in katkısı ne kadar küçükse ağ ilk kelimeden o kadar az öğrenir. Aşağıdaki tabloda üç adımın katkıları toplanır.');
    } else if(sF>0){
      const k=sF;
      if(k<=3){
        const q=S[k];
        window.__lstmUnroll.setHL({t:k,dir:'f',out:false});
        ['x'+k,'hp'+k,'cp'+k,'f'+k,'i'+k,'g'+k,'o'+k,'c'+k,'h'+k].forEach(id=>{const e=$('lq_'+id);if(e)e.classList.add('eq-hl-f');});
        form.innerHTML='▶ t='+k+':  f='+f(q.a.f)+'  i='+f(q.a.i)+'  c̃='+f(q.a.c)+'  o='+f(q.a.o)+'   c'+SUB[k]+' = '+f(q.a.f)+'·'+f(q.cp)+' + '+f(q.a.i)+'·'+f(q.a.c)+' = <b>'+f(q.c)+'</b>   h'+SUB[k]+' = '+f(q.a.o)+'·tanh('+f(q.c)+') = <b>'+f(q.h)+'</b>';
        info.innerHTML=k===1?'Aynı hücre ilk kelimeyle çalışır: h₀ = c₀ = 0 başlangıç.':'Aynı 12 ağırlık tekrar kullanılır; yeni olan x'+SUB[k]+' ve bir önceki adımdan gelen h'+SUB[k-1]+', c'+SUB[k-1]+'.';
      } else {
        window.__lstmUnroll.setHL({t:0,dir:'f',out:true});
        map.querySelectorAll('.xf-box[id^="lq_L"],.xf-box[id^="lq_y"]').forEach(e=>e.classList.add('eq-hl-f'));
        form.innerHTML='▶ kayıp:  '+[1,2,3].filter(k=>S[k].out).map(k=>'L'+SUB[k]+' = ½('+f(S[k].h)+' − '+f(S[k].y,2)+')² = '+f(S[k].Lk,4)).join('   ')+'   →  L = <b>'+f(M.L,4)+'</b>';
        info.innerHTML=type==='m2o'?'Many-to-one: cevap yalnız son hücreden (ŷ₃ = h₃). Şimdi ◀ Geri\'ye bas.':'Many-to-many: her hücrenin çıktısı kendi hedefiyle karşılaştırılır, kayıplar toplanır. Şimdi ◀ Geri\'ye bas.';
      }
    } else {
      window.__lstmUnroll.setHL(null);
      form.innerHTML='İleri ▶ ile hücreler sırayla çalışır; ◀ Geri ile δ zamanda geriye akar. Yukarıdaki akış ve aşağıdaki ağaçta ilgili kutular aynı anda yanar.';
      info.innerHTML='Diyagramda çizgi kalınlığı = değerin büyüklüğü.';
    }
    $('lqBack').disabled=false;
  }

  // ---------- Tek Hücre canlı ----------
  let tF=0,tB=0;
  const TF=[
    {hl:['x','h0','c0'],ids:['lf_x','lf_h0','lf_c0'],m:M=>'Girdiler: x = '+f(M.x,2)+', h₋₁ = '+f(M.h0,2)+', c₋₁ = '+f(M.c0,2)+'.',i:'Hücreye üç şey girer: o anki kelime x ve geçen adımdan iki hafıza (kısa h, uzun c).'},
    {hl:['fbox','ibox','gbox','obox'],ids:['lf_zf','lf_zi','lf_zc','lf_zo','lf_f','lf_i','lf_g','lf_o'],m:M=>'f = σ('+f(M.z.f)+') = <b>'+f(M.a.f)+'</b>   i = σ('+f(M.z.i)+') = <b>'+f(M.a.i)+'</b>   c̃ = tanh('+f(M.z.c)+') = <b>'+f(M.a.c)+'</b>   o = σ('+f(M.z.o)+') = <b>'+f(M.a.o)+'</b>',i:'Dört kutu aynı girdilere bakar, her birinin kendi W, U, b\'si var: z = W·x + U·h₋₁ + b.'},
    {hl:['mulf','mului','plus','ct'],ids:['lf_c'],m:M=>'c = f·c₋₁ + i·c̃ = '+f(M.a.f)+'·'+f(M.c0,2)+' + '+f(M.a.i)+'·'+f(M.a.c)+' = <b>'+f(M.c)+'</b>',i:'Uzun hafıza güncellenir: eskinin f kadarı kalır, adayın i kadarı eklenir — çarpım yok, toplama.'},
    {hl:['tanhe','mulo','ht'],ids:['lf_tc','lf_h'],m:M=>'h = o·tanh(c) = '+f(M.a.o)+'·'+f(M.tc)+' = <b>'+f(M.h)+'</b>',i:'Hafıza −1…+1\'e sıkıştırılır, çıkış kapısı ne kadarının dışarı söyleneceğini seçer.'},
    {hl:['ht'],ids:['lf_L','lf_y'],m:M=>'L = ½(h − y)² = ½('+f(M.h)+' − '+f(M.y,2)+')² = <b>'+f(M.L,4)+'</b>',i:'Çıktı hedefle karşılaştırılır. Şimdi ◀ Geri\'ye bas.'}
  ];
  const TB=[
    {hl:['ht'],ids:['lb_L','lb_h'],m:M=>'δh = h − y = <b>'+f(M.dh,4)+'</b>',i:'Geri yayılım kayıptan başlar.'},
    {hl:['mulo','tanhe','ct'],ids:['lb_o','lb_c','lb_zo'],m:M=>'∂L/∂o = δh·tanh c = '+f(M.dO,4)+'   δc = δh·o·(1−tanh²c) = <b>'+f(M.dc,4)+'</b>',i:'h\'den iki dal: çıkış kapısına ve hafızaya.'},
    {hl:['mulf','mului','plus','c0'],ids:['lb_f','lb_i','lb_g','lb_cp','lb_zf','lb_zi','lb_zc'],m:M=>'∂L/∂f = δc·c₋₁ = '+f(M.da.f,4)+'   ∂L/∂i = '+f(M.da.i,4)+'   ∂L/∂c̃ = '+f(M.da.c,4)+'   ∂L/∂c₋₁ = δc·f = <b>'+f(M.dcp,4)+'</b>',i:'Toplama düğümü δc\'yi olduğu gibi dağıtır; geçmişe giden yol yalnız f ile çarpılır (gradyan otobanı).'},
    {hl:['fbox','ibox','gbox','obox','x','h0'],ids:G.reduce((r,g)=>r.concat(['lb_W'+g,'lb_U'+g,'lb_b'+g]),[]),m:M=>'12 gradyan = δz × girdi:  dW_f = '+f(M.dz.f*M.x,4)+'  dU_f = '+f(M.dz.f*M.h0,4)+'  …  db_o = '+f(M.dz.o,4),i:'Her yaprak: o kutunun δ\'sı × kendi girdisi (W→x, U→h₋₁, b→1).'}
  ];
  function tekDraw(){
    const svg=$('lbCellSvg'); if(!svg||!window.lstmCellSvg||!window.__lstmBigModel) return;
    const M=window.__lstmBigModel(),Wt={},zz=M.z;
    G.forEach(g=>{Wt[g]=P.map(p=>parseFloat($('lv_'+p+g).value));});
    const st=tB>0?TB[tB-1]:(tF>0?TF[tF-1]:null);
    svg.setAttribute('viewBox','0 0 760 390');
    svg.innerHTML=window.lstmCellSvg('lb_',{f:M.a.f,i:M.a.i,o:M.a.o,cp:M.c0,ct:M.a.c,fc:M.a.f*M.c0,ic:M.a.i*M.a.c,c:M.c,tc:M.tc,h:M.h,Wt:Wt,zz:zz,x:M.x,hp:M.h0},st?st.hl:[]);
    const map=$('lstmBigMap'); if(map){clrHL(map); if(st) st.ids.forEach(id=>{const e=$(id);if(e)e.classList.add(tB>0?'eq-hl-b':'eq-hl-f');});}
    $('lbStepFormula').innerHTML=st?(tB>0?'◀ ':'▶ ')+st.m(M):'İleri ▶ ile hücre adım adım kurulur; ◀ Geri ile gradyan kayıptan 12 ağırlığa akar. Yukarıdaki akış ve aşağıdaki ağaçta ilgili kutu aynı anda yanar.';
    $('lbStepInfo').innerHTML=st?st.i:'Diyagram Simülasyon\'daki ağırlık/girdi kaydırıcılarıyla canlı.';
    $('lbStep').textContent=tF>=TF.length&&!tB?'↺ Baştan':'İleri ▶';
  }

  // ---------- tür seçici ----------
  const NOTE={
    tek:'<b>Tek Hücre</b> — tek bir LSTM adımı: x, h₋₁, c₋₁ → dört kapı → c → h → L. Simülasyon\'da adım adım kurduğumuz hücrenin bütün resmi, pop-up\'larıyla.',
    m2o:'<b>many-to-one</b> — aynı hücre 3 kelimeyi sırayla okur, cevap yalnız <b>son</b> hücreden (ör. cümlenin duygusu). Kayıp tek: L = ½(h₃ − y₃)². Geri yolda t=1\'e ulaşan sinyal c otobanı (f) ve h yolu (U) üzerinden taşınmak zorunda.',
    m2m:'<b>many-to-many (T<sub>x</sub>=T<sub>y</sub>)</b> — her kelimede bir çıktı (ör. her kelimenin türü). Kayıp L = L₁ + L₂ + L₃; her adımın h\'si kendi kaybından da doğrudan sinyal alır.'
  };
  function setType(tp){
    type=tp;
    document.querySelectorAll('.lstm-type-btn').forEach(b=>b.classList.toggle('active',b.dataset.lt===tp));
    $('lstmTypeNote').innerHTML=NOTE[tp];
    $('lstmBigTek').style.display=tp==='tek'?'':'none';
    $('lstmBigSeq').style.display=tp==='tek'?'none':'';
    $('ul_yrow1').style.display=$('ul_yrow2').style.display=tp==='m2m'?'':'none';
    if(tp!=='tek'){
      const bp=$('lstmBpSeq'); bp.remove();
      const map=$('lstmBigSeqMap'); map.innerHTML=build(tp); $('lstmBpSlotSeq').appendChild(bp);
      window.__lstmUnroll.setMode(tp); sF=0;sB=0; fill(); seqStep(); typeset(map);
    }
  }

  // ---------- bağlama ----------
  function init(){
    $('lstmBpSlotTek').appendChild($('lstmBpTek'));
    document.querySelectorAll('.lstm-type-btn').forEach(b=>b.addEventListener('click',()=>setType(b.dataset.lt)));
    $('lbStep').addEventListener('click',()=>{if(tB>0){tB=0;tF=0;}if(tF>=TF.length){tF=0;}else tF++;tekDraw();});
    $('lbBack').addEventListener('click',()=>{tF=TF.length;tB=tB>=TB.length?1:tB+1;tekDraw();});
    $('lbRst').addEventListener('click',()=>{tF=0;tB=0;tekDraw();});
    $('lqStep').addEventListener('click',()=>{if(sB>0){sB=0;sF=0;}sF=sF>=FST?0:sF+1;seqStep();});
    $('lqBack').addEventListener('click',()=>{sF=FST;sB=sB>=BST?1:sB+1;seqStep();});
    $('lqRst').addEventListener('click',()=>{sF=0;sB=0;seqStep();});
    ['ul_x1','ul_x2','ul_x3','ul_y1','ul_y2','ul_y3'].forEach(id=>$(id).addEventListener('input',()=>{const v=$(id+'_v');if(v)v.textContent=parseFloat($(id).value).toFixed(2);fill();if(sF||sB)seqStep();}));
    ['ul_y1','ul_y2','ul_y3'].forEach(id=>{const v=$(id+'_v');if(v)v.textContent=parseFloat($(id).value).toFixed(2);});
    // Simülasyon kaydırıcıları / eğitim → app.js drawPipe → __lstmBigRender
    const prev=window.__lstmBigRender;
    window.__lstmBigRender=function(){if(prev)prev();tekDraw();if(type!=='tek'){fill();if(sF||sB)seqStep();}};
    setType('tek'); tekDraw();
  }
  window.__lstmSeq={model,setType,fill};
  init();
})();
