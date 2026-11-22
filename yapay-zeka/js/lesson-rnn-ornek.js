// RNN — "Örnek Çalışmalar" (index.html, #rex1 / #rex2 / #rex3): KENDİ KENDİNİ EĞİTEN mini RNN'ler.
// Ağırlıkları elle vermiyoruz: kötü bir başlangıçtan, gradyan inişiyle (ileri → geri yayılım → güncelle) ağ kendisi buluyor.
// Her örnek: eğitim verisi tablosu + ▶ eğit düğmesi + kayıp eğrisi + açılmış RNN şekli + canlı hesap +
// açılıp kapanan "büyük resim" (ileri yol + geri yayılım ağacı + türetme pop-up'ları).
(function(){
  const $=id=>document.getElementById(id);
  const sig=z=>1/(1+Math.exp(-z));
  // Türkçe sayı biçimi: metin için "−0,762", LaTeX için "-0{,}762"
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>{v=z0(v,d);return v<0?'('+t(v,d)+')':t(v,d);};
  const sup=['','₁','₂','₃'];

  // ---- MathJax (debounce'lu) ----
  const pend=new Map();
  function tx(el){
    if(!el||pend.has(el))return;
    pend.set(el,requestAnimationFrame(()=>{
      pend.delete(el);
      const M=window.MathJax;
      if(!M||!M.startup||!M.startup.promise)return;   // başlangıç typeset'i zaten yapacak
      M.startup.promise.then(()=>{
        if(!M.typesetPromise)return;
        if(M.typesetClear)M.typesetClear([el]);
        return M.typesetPromise([el]);
      }).catch(()=>{});
    }));
  }

  // ================= model: 3 adımlık skaler RNN + BPTT =================
  // w=[Wxh,Whh,Why]; çıkış σ(Why·h₃); kayıp = ikili çapraz entropi (y∈{0,1}); h₀=0
  function bptt(xs,w,y){
    const [wxh,whh,why]=w,h=[0],z=[];
    xs.forEach(x=>{const zz=wxh*x+whh*h[h.length-1];z.push(zz);h.push(Math.tanh(zz));});
    const zy=why*h[3],p=sig(zy),L=-(y?Math.log(p):Math.log(1-p));
    const dzy=p-y,dh3=dzy*why;
    const d3=dh3*(1-h[3]*h[3]),d2=d3*whh*(1-h[2]*h[2]),d1=d2*whh*(1-h[1]*h[1]);
    const c3=d3*h[2],c2=d2*h[1],c1=d1*h[0];
    return {h,z,zy,p,L,dzy,dh3,d3,d2,d1,c3,c2,c1,
            gh:c3+c2+c1, gx:d3*xs[2]+d2*xs[1]+d1*xs[0], gy:dzy*h[3]};
  }

  // ================= haritalar: ileri yol (xf-*) + geri yayılım ağacı (xt-*) + pop-up kaynakları =================
  function srcEl(id){
    let e=document.getElementById('xtsrc-'+id);
    if(!e){e=document.createElement('div');e.className='xt-src';e.id='xtsrc-'+id;(document.getElementById('rexSrc')||document.body).appendChild(e);}
    return e;
  }
  function src(id,title,eq,num,say){
    srcEl(id).innerHTML='<div class="xp-bas">'+title+'</div><div class="eq">\\( '+eq+' \\)</div>'+
      (num?'<div class="xp-hes">\\( '+num+' \\)</div>':'')+'<div class="xp-sat">'+say+'</div>';
  }
  const setT=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  const fbox=(cls,id,sym,cap)=>'<div class="xf-box '+cls+'" id="'+id+'">'+sym+'<span class="xf-val" id="'+id+'v">—</span>'+(cap?'<span class="xf-cap">'+cap+'</span>':'')+'</div>';
  const fkol=(inner,ad)=>'<div class="xf-kol">'+inner+'<div class="xf-kolad">'+ad+'</div></div>';
  const fok=(key,tex)=>'<div class="xf-ok"><span class="xf-chip" data-pop="'+key+'" tabindex="0" role="button" aria-label="bu adımı anlat">\\( '+tex+' \\)</span><span class="xf-ar">→</span></div>';

  function fwdHtml(q,pcap){
    let o='<div class="xf-baslik">▶ İLERİ YOL — kelimelerden kayba <span>(3 zaman adımı, <b>aynı</b> ağırlıklar tekrar kullanılır)</span></div><div class="xf-scroll"><div class="xf-akis">';
    o+=fkol(fbox('gi',q+'x1','x₁')+fbox('gh',q+'h0','h₀'),'ilk kelime + boş hafıza');
    for(let i=1;i<=3;i++){
      o+=fok(q+'_z'+i,'W_{xh}x_'+i+'{+}W_{hh}h_'+(i-1))+fkol(fbox('gh',q+'z'+i,'z'+sup[i]),'ham toplam');
      o+=fok(q+'_th'+i,'\\tanh')+fkol(fbox('gh',q+'h'+i,'h'+sup[i])+(i<3?fbox('gi',q+'x'+(i+1),'x'+sup[i+1]):''),i<3?'yeni hafıza + sıradaki kelime':'son hafıza');
    }
    o+=fok(q+'_zy','W_{hy}h_3')+fkol(fbox('gy',q+'zy','z<sub>y</sub>'),'çıktı toplamı');
    o+=fok(q+'_p','\\sigma')+fkol(fbox('gy',q+'p','p',pcap),'olasılık');
    o+=fok(q+'_L','-y\\ln p-(1-y)\\ln(1-p)')+fkol(fbox('gl',q+'L','L'),'kayıp');
    return o+'</div></div>';
  }
  function fwdUpd(q,D,psay){
    const {xs,h,z,zy,p,wxh,whh,why,y}=D;
    setT(q+'x1v',f(xs[0],1));setT(q+'h0v','0');
    for(let i=1;i<=3;i++){setT(q+'z'+i+'v',f(z[i-1],3));setT(q+'h'+i+'v',f(h[i],3));if(i<3)setT(q+'x'+(i+1)+'v',f(xs[i],1));}
    setT(q+'zyv',f(zy,3));setT(q+'pv',f(p,3));setT(q+'Lv',f(D.L,3));
    for(let i=1;i<=3;i++){
      const hp=h[i-1];
      src(q+'_z'+i,'z'+sup[i]+' — ham toplam','z_'+i+'=W_{xh}x_'+i+'+W_{hh}h_'+(i-1),
        'z_'+i+'='+t(wxh,2)+'\\cdot'+tp(xs[i-1],1)+'+'+t(whh,2)+'\\cdot'+tp(hp,3)+'='+t(wxh*xs[i-1],3)+'+'+tp(whh*hp,3)+'=\\mathbf{'+t(z[i-1],3)+'}',
        '💬 Kelimenin katkısı (<b>'+f(wxh*xs[i-1],3)+'</b>) ile eski hafızanın katkısı (<b>'+f(whh*hp,3)+'</b>) toplanıyor. '+(i==1?'İlk adımda hafıza boş (h₀=0), yalnız kelime var.':'W<sub>hh</sub> küçükse hafıza katkısı küçüktür: geçmiş "sönük" kalır.'));
      src(q+'_th'+i,'h'+sup[i]+' — yeni hafıza','h_'+i+'=\\tanh(z_'+i+')',
        'h_'+i+'=\\tanh('+tp(z[i-1],3)+')=\\mathbf{'+t(h[i],3)+'}',
        '💬 tanh, z\'yi (−1, 1) aralığına sıkıştırır: <b>'+f(z[i-1],3)+' → '+f(h[i],3)+'</b>. Bu h hem sıradaki adıma hafıza olarak gider'+(i==3?' hem de çıktıya.':'.')+' Eğim 1−h² = <b>'+f(1-h[i]*h[i],3)+'</b> — geri yayılımda bu çarpan sinyali zayıflatır.');
    }
    src(q+'_zy','z<sub>y</sub> — çıktı toplamı','z_y=W_{hy}h_3','z_y='+t(why,2)+'\\cdot'+tp(h[3],3)+'=\\mathbf{'+t(zy,3)+'}',
      '💬 Son hafıza h₃ karar katmanıyla (W<sub>hy</sub>) çarpılıp tek bir "ham puan"a dönüyor. Pozitifse çıktı 0,5\'in üstüne çıkar.');
    src(q+'_p','p — olasılık','p=\\sigma(z_y)=\\tfrac{1}{1+e^{-z_y}}','p=\\sigma('+tp(zy,3)+')=\\mathbf{'+t(p,3)+'}',
      '💬 Sigmoid ham puanı 0–1 arasına sıkıştırır: <b>'+f(p,3)+'</b> = '+psay+'.');
    src(q+'_L','L — kayıp','L=-y\\ln p-(1-y)\\ln(1-p)','L=-\\ln('+(y?t(p,3):'1-'+t(p,3))+')=\\mathbf{'+t(D.L,3)+'}\\quad(y='+y+')',
      '💬 Doğru etiket y='+y+' iken ağın doğru sınıfa verdiği olasılık küçükse kayıp büyür. <b>Geri yayılım buradan başlar.</b> <span style="opacity:.8">(Formülün okunuşu: Yapı Taşları → İstatistik → <i>Değerlendirme Metrikleri</i>.)</span>');
  }
  // q = kutu id öneki, K = pop-up anahtar öneki
  function bwdHtml(q,K){
    const E=(cls,key,tex)=>'<span class="xt-edge '+cls+'" data-pop="'+K+key+'" tabindex="0" role="button" aria-label="türetmeyi göster">\\( '+tex+' \\)</span><span class="xt-ar">→</span>';
    const B=(cls,id,sym,cap,key)=>'<div class="xt-box '+cls+'" id="'+q+'t'+id+'"'+(key?' data-pop="'+K+key+'" tabindex="0" role="button"':'')+'>\\( '+sym+' \\)<span class="xt-cap">'+cap+'</span><span class="xt-val" id="'+q+'t'+id+'v">—</span></div>';
    const LF=(cls,id,sym)=>'<div class="xt-box '+cls+' yaprak" id="'+q+'t'+id+'">'+sym+'<span class="xt-val" id="'+q+'t'+id+'v">—</span></div>';
    const kid=(e,child)=>'<div class="xt-kid">'+e+child+'</div>';
    const node=(box,kids)=>'<div class="xt-node">'+box+(kids?'<div class="xt-kids">'+kids+'</div>':'')+'</div>';
    const step=tt=>{
      const leafs=kid(E('g4','z'+tt+'Wxh','\\tfrac{\\partial z_'+tt+'}{\\partial W_{xh}}=x_'+tt),LF('g4','Wxh'+tt,'dW<sub>xh</sub>|t='+tt))+
                  kid(E('g4','z'+tt+'Whh','\\tfrac{\\partial z_'+tt+'}{\\partial W_{hh}}=h_'+(tt-1)),LF('g4','Whh'+tt,'dW<sub>hh</sub>|t='+tt));
      let more='';
      if(tt>1) more=kid(E('g3','z'+tt+'h','\\tfrac{\\partial z_'+tt+'}{\\partial h_'+(tt-1)+'}=W_{hh}'),
        node(B('g3','h'+(tt-1),'h_'+(tt-1),'hafıza','z'+tt+'h'),
          kid(E('g3','hz'+(tt-1),'\\tfrac{\\partial h_'+(tt-1)+'}{\\partial z_'+(tt-1)+'}=1-h_'+(tt-1)+'^2'),step(tt-1))));
      return node(B('g3','z'+tt,'z_'+tt,'δ'+sup[tt],'hz'+tt),leafs+more);
    };
    const tree=node(B('g1 kok','L','L','kayıp','Lp'),
      kid(E('g1','Lp','\\tfrac{\\partial L}{\\partial p}=-\\tfrac{y}{p}+\\tfrac{1-y}{1-p}'),
        node(B('g1','p','p','olasılık','pzy'),
          kid(E('g1','pzy','\\tfrac{\\partial p}{\\partial z_y}=p(1-p)'),
            node(B('g1','zy','z_y','dz<sub>y</sub>=p−y','zyWhy'),
              kid(E('g2','zyWhy','\\tfrac{\\partial z_y}{\\partial W_{hy}}=h_3'),LF('g2','Why','dW<sub>hy</sub>'))+
              kid(E('g3','zyh','\\tfrac{\\partial z_y}{\\partial h_3}=W_{hy}'),
                node(B('g3','h3','h_3','son hafıza','zyh'),
                  kid(E('g3','hz3','\\tfrac{\\partial h_3}{\\partial z_3}=1-h_3^2'),step(3)))))))));
    return '<div class="xf-baslik" style="margin-top:8px">◀ GERİ YOL — kayıptan ağırlıklara <span>(her ok bir türev; üstüne gel → nasıl bulunduğu)</span></div><div class="xt-scroll"><div class="xt-tree">'+tree+'</div></div>';
  }
  function bwdUpd(q,K,D){
    const {whh,why,h,p,L,dzy,dh3,d3,d2,d1,c3,c2,c1,y,xs}=D;
    const dh2=d3*whh,dh1=d2*whh,dWhy=dzy*h[3],dd=[0,d1,d2,d3];
    const T=(id,v)=>setT(q+'t'+id+'v',v);
    T('L',f(L,3));T('p',f(-y/p+(1-y)/(1-p),3));T('zy',f(dzy,3));T('h3',f(dh3,3));
    T('z3',f(d3,3));T('h2',f(dh2,3));T('z2',f(d2,3));T('h1',f(dh1,3));T('z1',f(d1,4));T('Why',f(dWhy,3));
    T('Whh3',f(c3,3));T('Whh2',f(c2,3));T('Whh1',f(c1,3));
    T('Wxh3',f(xs[2]*d3,3));T('Wxh2',f(xs[1]*d2,3));T('Wxh1',f(xs[0]*d1,4));
    const S=(k,ti,eq,num,say)=>src(K+k,ti,eq,num,say);
    S('Lp','∂L/∂p','\\tfrac{\\partial L}{\\partial p}=-\\tfrac{y}{p}+\\tfrac{1-y}{1-p}',(y?'-\\tfrac{1}{'+t(p,3)+'}':'\\tfrac{1}{1-'+t(p,3)+'}')+'=\\mathbf{'+t(-y/p+(1-y)/(1-p),3)+'}',
      '💬 Doğru etiket y='+y+'. Ağın verdiği olasılık yanlış yöndeyse kayıp p\'ye çok duyarlıdır: ağı "olasılığı '+(y?'artır':'azalt')+'" diye zorlayan sinyal.');
    S('pzy','∂p/∂z_y','\\tfrac{\\partial p}{\\partial z_y}=p(1-p)','p(1-p)='+t(p,3)+'\\cdot'+t(1-p,3)+'=\\mathbf{'+t(p*(1-p),3)+'}\\ \\Rightarrow\\ \\tfrac{\\partial L}{\\partial z_y}=p-y=\\mathbf{'+t(dzy,3)+'}',
      '💬 Sigmoidin eğimi. Çarpınca sade bir sonuç çıkar: <b>dz<sub>y</sub> = p − y = '+f(dzy,3)+'</b> ('+(dzy<0?'eksi → "çıkışı büyüt"':'artı → "çıkışı küçült"')+').');
    S('zyWhy','∂z_y/∂W_hy','\\tfrac{\\partial z_y}{\\partial W_{hy}}=h_3','dW_{hy}='+tp(dzy,3)+'\\cdot'+tp(h[3],3)+'=\\mathbf{'+t(dWhy,3)+'}',
      '💬 Karar ağırlığının gradyanı = gelen sinyal × girdisi (h₃). h₃ ≈ 0 ise bu ağırlık neredeyse hiç öğrenemez.');
    S('zyh','∂z_y/∂h₃','\\tfrac{\\partial z_y}{\\partial h_3}=W_{hy}','\\tfrac{\\partial L}{\\partial h_3}='+tp(dzy,3)+'\\cdot'+tp(why,2)+'=\\mathbf{'+t(dh3,3)+'}',
      '💬 Sinyal çıkış ağırlığıyla çarpılıp hafızaya (h₃) taşınıyor.');
    for(let k=3;k>=1;k--){
      const hh=h[k],dk=dd[k],hp=h[k-1],nd=k<3?dd[k+1]*whh:dh3;
      S('hz'+k,'∂h'+sup[k]+'/∂z'+sup[k],'\\tfrac{\\partial h_'+k+'}{\\partial z_'+k+'}=1-h_'+k+'^2',
        '\\delta_'+k+'='+tp(nd,3)+'\\cdot'+t(1-hh*hh,3)+'=\\mathbf{'+t(dk,k==1?4:3)+'}',
        '💬 tanh\'ın eğimi ('+f(1-hh*hh,3)+') sinyalle çarpılır'+(k<3?' (önceki sinyal × W<sub>hh</sub> zaten çarpılmış)':'')+'. Eğim 1\'den küçük olduğu için sinyal her adımda biraz daha küçülür.');
      S('z'+k+'Wxh','∂z'+sup[k]+'/∂W_xh','\\tfrac{\\partial z_'+k+'}{\\partial W_{xh}}=x_'+k,'\\delta_'+k+'\\cdot x_'+k+'='+tp(dk,k==1?4:3)+'\\cdot'+tp(xs[k-1],1)+'=\\mathbf{'+t(dk*xs[k-1],k==1?4:3)+'}',
        '💬 Bu adımda W<sub>xh</sub>\'nin katkısı = δ × o adımdaki kelime sayısı. '+(xs[k-1]===0?'Kelime 0 olduğu için katkı yok.':'Kelime sayısı '+f(xs[k-1],0)+' → katkı δ × '+f(xs[k-1],0)+'.'));
      S('z'+k+'Whh','∂z'+sup[k]+'/∂W_hh','\\tfrac{\\partial z_'+k+'}{\\partial W_{hh}}=h_'+(k-1),'\\delta_'+k+'\\cdot h_'+(k-1)+'='+tp(dk,k==1?4:3)+'\\cdot'+tp(hp,3)+'=\\mathbf{'+t(dk*hp,3)+'}',
        '💬 Bu adımda W<sub>hh</sub>\'nin katkısı = δ × <b>önceki hafıza</b>. '+(k==1?'h₀ = 0 olduğundan t=1\'de katkı hep 0.':'Aynı ağırlık üç adımda kullanıldığı için üç katkı sonunda toplanır.'));
      if(k>1)S('z'+k+'h','∂z'+sup[k]+'/∂h'+sup[k-1],'\\tfrac{\\partial z_'+k+'}{\\partial h_'+(k-1)+'}=W_{hh}','\\tfrac{\\partial L}{\\partial h_'+(k-1)+'}='+tp(dk,3)+'\\cdot'+tp(whh,3)+'=\\mathbf{'+t(dk*whh,3)+'}',
        '💬 Sinyal bir adım <b>geriye</b> W<sub>hh</sub> ile çarpılarak taşınıyor — BPTT\'nin kalbi. W<sub>hh</sub>='+f(whh,2)+' olduğundan sinyal her adımda bu oranla çarpılır.');
    }
  }

  // ================= açılmış RNN şekli (3 adım) =================
  function svg(uid,c){
    const cx=[130,320,510],tc='#ccd5e8',mc='#8a96b8',o=[];
    o.push('<svg viewBox="0 0 640 330" style="width:100%; min-width:460px; max-width:600px; display:block; margin:0 auto" role="img" aria-label="Açılmış RNN: 3 zaman adımı">');
    o.push('<defs><marker id="'+uid+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="'+mc+'"/></marker></defs>');
    const ox=cx[2],good=c.outGood;
    o.push('<rect x="'+(ox-80)+'" y="14" width="160" height="46" rx="10" fill="'+(good?'#1d3a2a':'#4a1d1d')+'" stroke="'+(good?'#2ec46a':'#e06a6a')+'" stroke-width="2"/>');
    o.push('<text x="'+ox+'" y="34" text-anchor="middle" fill="'+tc+'" font-size="15" font-weight="700">'+c.outLab+'</text>');
    o.push('<text x="'+ox+'" y="51" text-anchor="middle" fill="'+mc+'" font-size="12">'+c.outSub+'</text>');
    o.push('<line x1="'+ox+'" y1="118" x2="'+ox+'" y2="62" stroke="'+mc+'" stroke-width="2" marker-end="url(#'+uid+')"/>');
    o.push('<text x="'+(ox+10)+'" y="96" fill="#2ec46a" font-size="13" font-weight="700">W<tspan font-size="10" dy="3">hy</tspan><tspan dy="-3"> = '+c.why+'</tspan></text>');
    for(let i=0;i<3;i++){
      const x=cx[i];
      o.push('<rect x="'+(x-60)+'" y="120" width="120" height="60" rx="12" fill="#2a2150" stroke="#9c4dff" stroke-width="2"/>');
      o.push('<text x="'+x+'" y="144" text-anchor="middle" fill="'+tc+'" font-size="16" font-weight="700">h<tspan font-size="11" dy="3">'+(i+1)+'</tspan></text>');
      o.push('<text x="'+x+'" y="166" text-anchor="middle" fill="'+tc+'" font-size="14" font-weight="700">= '+c.h[i]+'</text>');
      o.push('<rect x="'+(x-60)+'" y="250" width="120" height="56" rx="10" fill="#10284a" stroke="#4aa3ff" stroke-width="2"/>');
      o.push('<text x="'+x+'" y="274" text-anchor="middle" fill="'+tc+'" font-size="15" font-weight="700">'+c.words[i]+'</text>');
      o.push('<text x="'+x+'" y="294" text-anchor="middle" fill="#4aa3ff" font-size="13">x<tspan font-size="10" dy="3">'+(i+1)+'</tspan><tspan dy="-3"> = '+c.xs[i]+'</tspan></text>');
      o.push('<line x1="'+x+'" y1="248" x2="'+x+'" y2="182" stroke="'+mc+'" stroke-width="2" marker-end="url(#'+uid+')"/>');
      o.push('<text x="'+(x+8)+'" y="222" fill="#4aa3ff" font-size="12" font-weight="700">W<tspan font-size="9" dy="3">xh</tspan><tspan dy="-3"> = '+c.wxh+'</tspan></text>');
      if(i<2){
        const mx=(x+cx[i+1])/2;
        o.push('<line x1="'+(x+62)+'" y1="150" x2="'+(cx[i+1]-62)+'" y2="150" stroke="#f0a032" stroke-width="2.5" marker-end="url(#'+uid+')"/>');
        o.push('<text x="'+mx+'" y="136" text-anchor="middle" fill="#f0a032" font-size="12" font-weight="700">W<tspan font-size="9" dy="3">hh</tspan><tspan dy="-3"> = '+c.whh+'</tspan></text>');
        o.push('<text x="'+mx+'" y="172" text-anchor="middle" fill="#f0a032" font-size="11">hafıza</text>');
      }
    }
    o.push('<text x="14" y="154" fill="#f0a032" font-size="12" font-weight="700">h<tspan font-size="9" dy="3">0</tspan><tspan dy="-3">=0</tspan></text>');
    o.push('<line x1="42" y1="150" x2="'+(cx[0]-62)+'" y2="150" stroke="#f0a032" stroke-width="2.5" marker-end="url(#'+uid+')"/>');
    // doğru cevap + kayıp kutusu
    o.push('<rect x="'+(ox-80-215)+'" y="14" width="180" height="46" rx="10" fill="#4a1d1d" stroke="#e06a6a" stroke-width="2"/>');
    o.push('<text x="'+(ox-80-125)+'" y="34" text-anchor="middle" fill="'+tc+'" font-size="14" font-weight="700">'+c.yLab+'</text>');
    o.push('<text x="'+(ox-80-125)+'" y="51" text-anchor="middle" fill="#e06a6a" font-size="12">'+c.loss+'</text>');
    o.push('<line x1="'+(ox-80-33)+'" y1="37" x2="'+(ox-82)+'" y2="37" stroke="#e06a6a" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#'+uid+')"/>');
    o.push('</svg>');
    return o.join('');
  }

  // ================= eğitim motoru: bir örneği kurar ve çalıştırır =================
  const REG={};
  function mount(cfg){
    const root=$(cfg.id);if(!root)return;
    const q=cfg.q,K=cfg.K,id=cfg.id;
    const S={w:cfg.init.slice(),ep:0,hist:[],sel:0,timer:null,lr:cfg.lr,lastHeavy:0};
    REG[id]=S;
    const nS=cfg.data.length;

    // ---- iskelet ----
    const wordsTxt=d=>d.w.map((w,i)=>w+'<span class="rex-xv">('+f(d.x[i],0)+')</span>').join(' ');
    let rows='';
    cfg.data.forEach((d,i)=>{rows+='<tr data-i="'+i+'"><td>'+(i+1)+'</td><td>'+wordsTxt(d)+'</td><td>'+cfg.yname[d.y]+'</td><td id="'+id+'p'+i+'">—</td><td id="'+id+'ok'+i+'"></td></tr>';});
    root.innerHTML=
      '<div class="rex-grid"><div>'+
        '<p class="rex-h"><b>🧪 Eğitim verisi</b> <span>(satıra tıkla → şekil ve hesap o cümleyi gösterir)</span></p>'+
        '<div style="overflow-x:auto"><table class="rex-tbl"><tr><th>#</th><th>cümle (kelime → sayı)</th><th>doğru cevap</th><th>ağın p<sub>'+cfg.pname+'</sub></th><th></th></tr>'+rows+'</table></div>'+
        '<div class="rex-ctl"><button class="rex-btn rex-go" id="'+id+'run">▶ eğit</button><button class="rex-btn" id="'+id+'step">🔧 1 adım</button><button class="rex-btn" id="'+id+'reset">↺ başa dön</button>'+
          '<label><span>öğrenme hızı α</span> <input type="range" id="'+id+'lr" min="0.05" max="2" step="0.05" value="'+cfg.lr+'" style="width:100px"><b id="'+id+'lrv" style="color:var(--accent); min-width:34px; text-align:right"></b></label></div>'+
        '<div class="rex-stat" id="'+id+'stat"></div>'+
        '<div class="rex-wts" id="'+id+'wts"></div>'+
        '<div id="'+id+'curve"></div>'+
      '</div><div>'+
        '<p class="rex-h"><b>🏗️ Mimari</b> <span>(seçili cümle, <b>şu anki</b> ağırlıklarla; <span style="color:#f0a032">turuncu</span> = hafıza)</span></p>'+
        '<div style="overflow-x:auto" id="'+id+'fig"></div>'+
      '</div></div>'+
      '<p class="rex-h" style="margin:8px 0 2px"><b>🧮 Hesap</b> <span>(seçili cümle, canlı)</span></p>'+
      '<div class="work" id="'+id+'calc" style="overflow-x:auto"></div>'+
      (cfg.detail?'<p class="rex-h" style="margin:8px 0 2px"><b>🔙 Bir adımın içi — geri yayılım elle, üç ağırlık için</b></p><div class="work" id="'+id+'det" style="overflow-x:auto"></div>':'');
    // büyük resim kabuğu (.acc.xt-wrap) HTML'de statik: lesson-linreg.js toggle/tam ekran dinleyicileri yükleme anında bağlar
    const mapBox=$(id+'map');if(mapBox)mapBox.innerHTML=fwdHtml(q,cfg.pcap)+bwdHtml(q,K);

    // ---- hesaplamalar ----
    function evalAll(){
      const rs=cfg.data.map(d=>bptt(d.x,S.w,d.y));
      let L=0,gx=0,gh=0,gy=0,ok=0;
      rs.forEach((r,i)=>{L+=r.L;gx+=r.gx;gh+=r.gh;gy+=r.gy;ok+=((r.p>=0.5)===(cfg.data[i].y===1))?1:0;});
      return {rs,L:L/nS,gx:gx/nS,gh:gh/nS,gy:gy/nS,ok};
    }
    let A=evalAll();
    function stepOnce(){
      A=evalAll();S.hist.push(A.L);
      S.w=[S.w[0]-S.lr*A.gx,S.w[1]-S.lr*A.gh,S.w[2]-S.lr*A.gy];
      S.ep++;A=evalAll();
    }

    // ---- çizim: ucuz kısım (her tikte) ----
    function curve(){
      const W=300,H=84,pad=4,mx=cfg.maxEp,top=Math.max(0.75,S.hist[0]||0.75);
      const pts=S.hist.concat([A.L]).map((v,i)=>(pad+(W-2*pad)*i/mx).toFixed(1)+','+(H-pad-(H-2*pad)*Math.min(v,top)/top).toFixed(1)).join(' ');
      $(id+'curve').innerHTML='<p class="rex-h" style="margin:6px 0 0"><b>📉 Kayıp eğrisi</b> <span>(düşüyorsa ağ öğreniyor)</span></p>'+
        '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%; max-width:340px; display:block; background:#0e1424; border:1px solid var(--line); border-radius:8px">'+
        '<line x1="'+pad+'" y1="'+(H-pad)+'" x2="'+(W-pad)+'" y2="'+(H-pad)+'" stroke="#33415f"/>'+
        '<text x="'+(W-6)+'" y="'+(H-8)+'" text-anchor="end" fill="#8a96b8" font-size="9">epoch 0 → '+mx+'</text>'+
        '<polyline fill="none" stroke="#4aa3ff" stroke-width="2" points="'+pts+'"/></svg>';
    }
    function cheap(){
      lab();
      cfg.data.forEach((d,i)=>{
        const r=A.rs[i],good=(r.p>=0.5)===(d.y===1);
        setT(id+'p'+i,f(r.p,3));const o=$(id+'ok'+i);o.textContent=good?'✓':'✗';o.style.color=good?'#2ec46a':'#e06a6a';
      });
      root.querySelectorAll('.rex-tbl tr[data-i]').forEach(tr=>tr.classList.toggle('sel',+tr.dataset.i===S.sel));
      $(id+'stat').innerHTML='epoch <b>'+S.ep+'</b> / '+cfg.maxEp+' · ortalama kayıp <b>'+f(A.L,3)+'</b> · doğru <b>'+A.ok+'/'+nS+'</b>'+(S.ep>=cfg.maxEp?' · <span style="color:var(--accent)">bitti</span>':'');
      const nm=['W<sub>xh</sub>','W<sub>hh</sub>','W<sub>hy</sub>'];
      $(id+'wts').innerHTML='<b>⚙️ Ağırlıklar (ağ buldu):</b> '+S.w.map((v,i)=>'<span class="rex-w">'+nm[i]+' '+f(cfg.init[i],2)+' → <b>'+f(v,2)+'</b></span>').join('');
      const d=cfg.data[S.sel],r=A.rs[S.sel];
      $(id+'fig').innerHTML=svg(q+'m',{
        words:d.w,xs:d.x.map(x=>f(x,1)),whh:f(S.w[1],2),wxh:f(S.w[0],2),why:f(S.w[2],2),h:[1,2,3].map(i=>f(r.h[i],3)),
        outLab:'p = '+f(r.p,3),outSub:cfg.pcap,outGood:(r.p>=0.5)===(d.y===1),
        yLab:'doğru: '+cfg.yname[d.y]+' (y='+d.y+')',loss:'L = '+f(r.L,3)});
      curve();
    }
    function lab(){$(id+'lrv').textContent=f(S.lr,2);}

    // ---- çizim: ağır kısım (MathJax + pop-up kaynakları) ----
    function heavy(){
      S.lastHeavy=Date.now();
      const d=cfg.data[S.sel],r=A.rs[S.sel],[wx,wh,wy]=S.w;
      const L=r.h.slice(1).map((hv,i)=>'t='+(i+1)+':\\quad & h_'+(i+1)+'=\\tanh\\big('+t(wx,2)+'\\cdot '+tp(d.x[i],1)+'+'+t(wh,2)+'\\cdot '+tp(r.h[i],3)+'\\big)=\\mathbf{'+t(hv,3)+'}');
      $(id+'calc').innerHTML='\\[\\begin{aligned}'+L.join('\\\\')+'\\end{aligned}\\]'+
        '\\[p=\\sigma\\big('+t(wy,2)+'\\cdot '+tp(r.h[3],3)+'\\big)=\\mathbf{'+t(r.p,3)+'},\\qquad L=-\\ln\\big('+(d.y?t(r.p,3):'1-'+t(r.p,3))+'\\big)=\\mathbf{'+t(r.L,3)+'}\\]';
      tx($(id+'calc'));
      const D=Object.assign({},r,{xs:d.x,wxh:wx,whh:wh,why:wy,y:d.y});
      fwdUpd(q,D,cfg.psay(r.p));bwdUpd(q,K,D);
      // ortalama gradyan tablosu + güncelleme
      let tr='';
      A.rs.forEach((rr,i)=>{tr+='<tr><td>'+(i+1)+'</td><td>'+f(rr.gx,3)+'</td><td>'+f(rr.gh,3)+'</td><td>'+f(rr.gy,3)+'</td></tr>';});
      const nw=[wx-S.lr*A.gx,wh-S.lr*A.gh,wy-S.lr*A.gy];
      $(id+'sum').innerHTML='<table class="rex-tbl"><tr><th>cümle</th><th>dW<sub>xh</sub></th><th>dW<sub>hh</sub></th><th>dW<sub>hy</sub></th></tr>'+tr+
        '<tr class="sel"><td><b>ortalama</b></td><td><b>'+f(A.gx,3)+'</b></td><td><b>'+f(A.gh,3)+'</b></td><td><b>'+f(A.gy,3)+'</b></td></tr></table>'+
        '<div class="callout" style="margin-top:6px"><b>Güncelleme (W ← W − α·ortalama gradyan, α = '+f(S.lr,2)+'):</b> W<sub>xh</sub> '+f(wx,3)+' → <b>'+f(nw[0],3)+'</b> · W<sub>hh</sub> '+f(wh,3)+' → <b>'+f(nw[1],3)+'</b> · W<sub>hy</sub> '+f(wy,3)+' → <b>'+f(nw[2],3)+'</b>. '+
        'Gradyan eksiyse ağırlık <b>büyür</b>, artıysa <b>küçülür</b>: ağ hatayı azaltan yöne kendisi kayıyor.</div>';
      if(cfg.detail){
        const dd=D;
        $(id+'det').innerHTML='\\[\\begin{aligned}'+
          '\\text{1) çıkış:}\\quad&\\tfrac{\\partial L}{\\partial z_y}=p-y='+t(dd.p,3)+'-'+d.y+'=\\mathbf{'+t(dd.dzy,3)+'}\\\\'+
          '\\text{2) }h_3\\text{\'e:}\\quad&\\tfrac{\\partial L}{\\partial h_3}='+tp(dd.dzy,3)+'\\cdot'+tp(wy,3)+'=\\mathbf{'+t(dd.dh3,3)+'}\\\\'+
          '\\text{3) }z_3\\text{\'e:}\\quad&\\delta_3='+tp(dd.dh3,3)+'\\cdot'+t(1-dd.h[3]*dd.h[3],3)+'=\\mathbf{'+t(dd.d3,3)+'}\\\\'+
          '\\text{4) }t{=}3:\\quad&W_{hh}:\\ \\delta_3h_2='+tp(dd.d3,3)+'\\cdot'+t(dd.h[2],3)+'=\\mathbf{'+t(dd.c3,3)+'}\\ ;\\ \\ W_{xh}:\\ \\delta_3x_3=\\mathbf{'+t(dd.d3*d.x[2],3)+'}\\\\'+
          '\\text{5) }\\delta_2:\\quad&\\delta_3\\cdot W_{hh}\\cdot(1-h_2^2)='+tp(dd.d3,3)+'\\cdot'+t(wh,3)+'\\cdot'+t(1-dd.h[2]*dd.h[2],3)+'=\\mathbf{'+t(dd.d2,3)+'}\\\\'+
          '\\text{ }t{=}2:\\quad&W_{hh}:\\ \\delta_2h_1='+tp(dd.d2,3)+'\\cdot'+t(dd.h[1],3)+'=\\mathbf{'+t(dd.c2,3)+'}\\ ;\\ \\ W_{xh}:\\ \\delta_2x_2=\\mathbf{'+t(dd.d2*d.x[1],3)+'}\\\\'+
          '\\text{6) }\\delta_1:\\quad&\\delta_2\\cdot W_{hh}\\cdot(1-h_1^2)='+tp(dd.d2,3)+'\\cdot'+t(wh,3)+'\\cdot'+t(1-dd.h[1]*dd.h[1],3)+'='+t(dd.d1,4)+'\\\\'+
          '\\text{ }t{=}1:\\quad&W_{hh}:\\ \\delta_1h_0=\\mathbf{0}\\ (h_0=0)\\ ;\\ \\ W_{xh}:\\ \\delta_1x_1=\\mathbf{'+t(dd.d1*d.x[0],4)+'}'+
          '\\end{aligned}\\]'+
          '\\[\\begin{aligned}\\tfrac{\\partial L}{\\partial W_{hh}}&='+tp(dd.c3,3)+'+'+tp(dd.c2,3)+'+0=\\mathbf{'+t(dd.gh,3)+'}\\\\'+
          '\\tfrac{\\partial L}{\\partial W_{xh}}&=\\textstyle\\sum_t\\delta_tx_t=\\mathbf{'+t(dd.gx,3)+'}\\\\'+
          '\\tfrac{\\partial L}{\\partial W_{hy}}&=\\tfrac{\\partial L}{\\partial z_y}\\cdot h_3='+tp(dd.dzy,3)+'\\cdot'+tp(dd.h[3],3)+'=\\mathbf{'+t(dd.gy,3)+'}\\end{aligned}\\]'+
          '\\[\\begin{aligned}W_{xh}&\\leftarrow '+t(wx,3)+'-'+t(S.lr,2)+'\\cdot'+tp(dd.gx,3)+'=\\mathbf{'+t(nw[0],3)+'}\\\\'+
          'W_{hh}&\\leftarrow '+t(wh,3)+'-'+t(S.lr,2)+'\\cdot'+tp(dd.gh,3)+'=\\mathbf{'+t(nw[1],3)+'}\\\\'+
          'W_{hy}&\\leftarrow '+t(wy,3)+'-'+t(S.lr,2)+'\\cdot'+tp(dd.gy,3)+'=\\mathbf{'+t(nw[2],3)+'}\\end{aligned}\\]';
        tx($(id+'det'));
      }
    }
    function render(force){
      cheap();
      if(force||Date.now()-S.lastHeavy>350)heavy();
    }
    function stop(){if(S.timer){clearInterval(S.timer);S.timer=null;}$(id+'run').textContent=S.ep>=cfg.maxEp?'✔ bitti':'▶ eğit';}
    function run(){
      if(S.timer){stop();render(true);return;}
      if(S.ep>=cfg.maxEp)return;
      $(id+'run').textContent='⏸ dur';
      S.timer=setInterval(()=>{
        for(let k=0;k<cfg.spt&&S.ep<cfg.maxEp;k++)stepOnce();
        if(S.ep>=cfg.maxEp){stop();render(true);}else render(false);
      },45);
    }
    $(id+'run').addEventListener('click',run);
    $(id+'step').addEventListener('click',()=>{stop();if(S.ep<cfg.maxEp)stepOnce();render(true);});
    $(id+'reset').addEventListener('click',()=>{stop();S.w=cfg.init.slice();S.ep=0;S.hist=[];A=evalAll();render(true);});
    $(id+'lr').addEventListener('input',e=>{S.lr=parseFloat(e.target.value);render(true);});
    root.querySelectorAll('.rex-tbl tr[data-i]').forEach(tr=>tr.addEventListener('click',()=>{S.sel=+tr.dataset.i;render(true);}));
    // test/doğrulama için
    S.step=n=>{for(let i=0;i<n;i++)stepOnce();render(true);};
    render(true);
    tx($(id+'map'));
  }

  // ================= üç örnek =================
  const W3=(a,b,c)=>[a,b,c];
  mount({id:'rex1',q:'rx1',K:'r1_',pname:'olumlu',pcap:'olumlu olma olasılığı',init:W3(0.5,1.2,0.5),lr:0.5,maxEp:300,spt:2,
    yname:['olumsuz','olumlu'],psay:p=>p>=0.5?'olumlu yorum':'olumsuz yorum',
    data:[{w:['kötü','ama','harika'],x:[-1,0,1],y:1},{w:['harika','ama','kötü'],x:[1,0,-1],y:0},
          {w:['harika','ama','harika'],x:[1,0,1],y:1},{w:['kötü','ama','kötü'],x:[-1,0,-1],y:0}]});
  mount({id:'rex2',q:'rx2',K:'r2_',pname:'miyav',pcap:'miyav olasılığı',init:W3(0.5,0.2,0.5),lr:0.5,maxEp:600,spt:4,
    yname:['hav','miyav'],psay:p=>'miyav olasılığı ('+(p>=0.5?'miyav':'hav')+' diyor)',
    data:[{w:['kedi','ve','___'],x:[1,0,0],y:1},{w:['köpek','ve','___'],x:[-1,0,0],y:0}]});
  mount({id:'rex3',q:'rx3',K:'r3_',pname:'miyav',pcap:'miyav olasılığı',init:W3(1.0,0.5,1.0),lr:1.0,maxEp:300,spt:2,detail:true,
    yname:['hav','miyav'],psay:p=>'miyav olasılığı',
    data:[{w:['kedi','ve','___'],x:[1,0,0],y:1}]});
  window.__rex=REG;
})();
