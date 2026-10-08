// RNN — "Örnek Çalışmalar" (index.html, #rex1 / #rex2 / #rex3): canlı mini RNN örnekleri.
// Her örnek: kontroller (kelime seçimi / kaydırıcılar) → açılmış RNN şekli (SVG) + MathJax'li canlı hesap.
(function(){
  const $=id=>document.getElementById(id);
  const sig=z=>1/(1+Math.exp(-z));
  // Türkçe sayı biçimi: metin için "−0,762", LaTeX için "-0{,}762"
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>{v=z0(v,d);return v<0?'('+t(v,d)+')':t(v,d);};

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



  // Genel BPTT: 3 adım, skaler hücre, çıkış σ(W_hy·h₃), kayıp BCE (y∈{0,1})
  function bptt(xs,wxh,whh,why,y){
    const h=[0],z=[];
    xs.forEach(x=>{const zz=wxh*x+whh*h[h.length-1];z.push(zz);h.push(Math.tanh(zz));});
    const zy=why*h[3],p=sig(zy),L=-(y?Math.log(p):Math.log(1-p));
    const dzy=p-y,dh3=dzy*why;
    const d3=dh3*(1-h[3]*h[3]),d2=d3*whh*(1-h[2]*h[2]),d1=d2*whh*(1-h[1]*h[1]);
    const c3=d3*h[2],c2=d2*h[1],c1=d1*h[0];
    return {h,z,zy,p,L,dzy,dh3,d3,d2,d1,c3,c2,c1,g:c3+c2+c1};
  }
  // ---- haritalar: ileri yol (xf-*) + geri yayılım ağacı (xt-*) + türetme pop-up'ları ----
  const sup=['','₁','₂','₃'];
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

  // İleri yol HTML'i. opt.loss → sonda L kutusu da var.
  function fwdHtml(p,opt){
    let o='<div class="xf-baslik">▶ İLERİ YOL — kelimelerden çıktıya <span>(3 zaman adımı, <b>aynı</b> ağırlıklar tekrar kullanılır)</span></div><div class="xf-scroll"><div class="xf-akis">';
    o+=fkol(fbox('gi',p+'x1','x₁')+fbox('gh',p+'h0','h₀'),'ilk kelime + boş hafıza');
    for(let i=1;i<=3;i++){
      o+=fok(p+'_z'+i,'W_{xh}x_'+i+'{+}W_{hh}h_'+(i-1))+fkol(fbox('gh',p+'z'+i,'z'+sup[i]),'ham toplam');
      o+=fok(p+'_th'+i,'\\tanh')+fkol(fbox('gh',p+'h'+i,'h'+sup[i])+(i<3?fbox('gi',p+'x'+(i+1),'x'+sup[i+1]):''),i<3?'yeni hafıza + sıradaki kelime':'son hafıza');
    }
    o+=fok(p+'_zy','W_{hy}h_3')+fkol(fbox('gy',p+'zy','z<sub>y</sub>'),'çıktı toplamı');
    o+=fok(p+'_p','\\sigma')+fkol(fbox('gy',p+'p','p',opt.pcap),'olasılık');
    if(opt.loss)o+=fok(p+'_L','-\\ln p')+fkol(fbox('gl',p+'L','L'),'kayıp');
    return o+'</div></div>';
  }
  // İleri yol değerleri + pop-up kaynakları (canlı)
  function fwdUpd(p,D,opt){
    const {xs,h,z,zy,pr,wxh,whh,why}=D;
    setT(p+'x1v',f(xs[0],1));setT(p+'h0v','0');
    for(let i=1;i<=3;i++){setT(p+'z'+i+'v',f(z[i-1],3));setT(p+'h'+i+'v',f(h[i],3));if(i<3)setT(p+'x'+(i+1)+'v',f(xs[i],1));}
    setT(p+'zyv',f(zy,3));setT(p+'pv',f(pr,3));if(opt.loss)setT(p+'Lv',f(D.L,3));
    for(let i=1;i<=3;i++){
      const hp=h[i-1];
      src(p+'_z'+i,'z'+sup[i]+' — ham toplam','z_'+i+'=W_{xh}x_'+i+'+W_{hh}h_'+(i-1),
        'z_'+i+'='+t(wxh,2)+'\\cdot'+tp(xs[i-1],1)+'+'+t(whh,2)+'\\cdot'+tp(hp,3)+'='+t(wxh*xs[i-1],3)+'+'+tp(whh*hp,3)+'=\\mathbf{'+t(z[i-1],3)+'}',
        '💬 Kelimenin katkısı (<b>'+f(wxh*xs[i-1],3)+'</b>) ile eski hafızanın katkısı (<b>'+f(whh*hp,3)+'</b>) toplanıyor. '+(i==1?'İlk adımda hafıza boş (h₀=0), yalnız kelime var.':'W<sub>hh</sub> küçükse hafıza katkısı küçüktür: geçmiş "sönük" kalır.'));
      src(p+'_th'+i,'h'+sup[i]+' — yeni hafıza','h_'+i+'=\\tanh(z_'+i+')',
        'h_'+i+'=\\tanh('+tp(z[i-1],3)+')=\\mathbf{'+t(h[i],3)+'}',
        '💬 tanh, z\'yi (−1, 1) aralığına sıkıştırır: <b>'+f(z[i-1],3)+' → '+f(h[i],3)+'</b>. Bu h hem sıradaki adıma hafıza olarak gider'+(i==3?' hem de çıktıya.':'.')+' Eğim 1−h² = <b>'+f(1-h[i]*h[i],3)+'</b> — geri yayılımda bu çarpan sinyali zayıflatır.');
    }
    src(p+'_zy','z<sub>y</sub> — çıktı toplamı','z_y=W_{hy}h_3','z_y='+t(why,2)+'\\cdot'+tp(h[3],3)+'=\\mathbf{'+t(zy,3)+'}',
      '💬 Son hafıza h₃ karar katmanıyla (W<sub>hy</sub>) çarpılıp tek bir "ham puan"a dönüyor. Pozitifse çıktı 0,5\'in üstüne çıkacak.');
    src(p+'_p','p — olasılık','p=\\sigma(z_y)=\\tfrac{1}{1+e^{-z_y}}','p=\\sigma('+tp(zy,3)+')=\\mathbf{'+t(pr,3)+'}',
      '💬 Sigmoid ham puanı 0–1 arasına sıkıştırır: <b>'+f(pr,3)+'</b> = '+opt.psay+'.');
    if(opt.loss){const y=D.y;src(p+'_L','L — kayıp','L=-y\\ln p-(1-y)\\ln(1-p)','L=-\\ln('+(y?t(pr,3):'1-'+t(pr,3))+')=\\mathbf{'+t(D.L,3)+'}\\quad(y='+y+')',
      '💬 Doğru etiket y='+y+' iken ağın doğru sınıfa verdiği olasılık küçükse kayıp büyür. <b>Geri yayılım buradan başlar.</b>');}
  }
  // Geri yayılım ağacı HTML'i (yalnız Örnek 3)
  function bwdHtml(q,K){
    const E=(cls,key,tex)=>'<span class="xt-edge '+cls+'" data-pop="'+key+'" tabindex="0" role="button" aria-label="türetmeyi göster">\\( '+tex+' \\)</span><span class="xt-ar">→</span>';
    const B=(cls,id,sym,cap,key)=>'<div class="xt-box '+cls+'" id="'+id+'"'+(key?' data-pop="'+key+'" tabindex="0" role="button"':'')+'>\\( '+sym+' \\)<span class="xt-cap">'+cap+'</span><span class="xt-val" id="'+id+'v">—</span></div>';
    const LF=(cls,id,sym)=>'<div class="xt-box '+cls+' yaprak" id="'+id+'">'+sym+'<span class="xt-val" id="'+id+'v">—</span></div>';
    const kid=(e,child)=>'<div class="xt-kid">'+e+child+'</div>';
    const node=(box,kids)=>'<div class="xt-node">'+box+(kids?'<div class="xt-kids">'+kids+'</div>':'')+'</div>';
    const step=(t,g)=>{ // t=3,2,1 : z_t düğümü ve altı
      const leafs=kid(E('g4',K+'z'+t+'Wxh','\\tfrac{\\partial z_'+t+'}{\\partial W_{xh}}=x_'+t),LF('g4',q+'tWxh'+t,'dW<sub>xh</sub>|t='+t))+
                  kid(E('g4',K+'z'+t+'Whh','\\tfrac{\\partial z_'+t+'}{\\partial W_{hh}}=h_'+(t-1)),LF('g4',q+'tWhh'+t,'dW<sub>hh</sub>|t='+t));
      let more='';
      if(t>1) more=kid(E('g3',K+'z'+t+'h','\\tfrac{\\partial z_'+t+'}{\\partial h_'+(t-1)+'}=W_{hh}'),
        node(B('g3',q+'th'+(t-1),'h_'+(t-1),'hafıza',K+'z'+t+'h'),
          kid(E('g3',K+'hz'+(t-1),'\\tfrac{\\partial h_'+(t-1)+'}{\\partial z_'+(t-1)+'}=1-h_'+(t-1)+'^2'),step(t-1))));
      return node(B('g3',q+'tz'+t,'z_'+t,'δ'+sup[t],K+'hz'+t),leafs+more);
    };
    const tree=node(B('g1 kok',q+'tL','L','kayıp',K+'Lp'),
      kid(E('g1',K+'Lp','\\tfrac{\\partial L}{\\partial p}=-\\tfrac1p'),
        node(B('g1',q+'tp','p','olasılık',K+'pzy'),
          kid(E('g1',K+'pzy','\\tfrac{\\partial p}{\\partial z_y}=p(1-p)'),
            node(B('g1',q+'tzy','z_y','dz<sub>y</sub>=p−1',K+'zyWhy'),
              kid(E('g2',K+'zyWhy','\\tfrac{\\partial z_y}{\\partial W_{hy}}=h_3'),LF('g2',q+'tWhy','dW<sub>hy</sub>'))+
              kid(E('g3',K+'zyh','\\tfrac{\\partial z_y}{\\partial h_3}=W_{hy}'),
                node(B('g3',q+'th3','h_3','son hafıza',K+'zyh'),
                  kid(E('g3',K+'hz3','\\tfrac{\\partial h_3}{\\partial z_3}=1-h_3^2'),step(3)))))))));
    return '<div class="xf-baslik" style="margin-top:8px">◀ GERİ YOL — kayıptan ağırlıklara <span>(her ok bir türev; üstüne gel → nasıl bulunduğu)</span></div><div class="xt-scroll"><div class="xt-tree">'+tree+'</div></div>'+
      '<div class="callout" id="'+q+'tsum" style="margin-top:8px"></div>';
  }
  function bwdUpd(q,K,D){
    const {whh,wxh,why,h,pr,L,dzy,dh3,d3,d2,d1,c3,c2,c1,y}=D;
    const dh2=d3*whh,dh1=d2*whh,dWhy=dzy*h[3];
    setT(q+'tLv',f(L,3));setT(q+'tpv',f(-y/pr+(1-y)/(1-pr),3));setT(q+'tzyv',f(dzy,3));setT(q+'th3v',f(dh3,3));
    setT(q+'tz3v',f(d3,3));setT(q+'th2v',f(dh2,3));setT(q+'tz2v',f(d2,3));setT(q+'th1v',f(dh1,3));setT(q+'tz1v',f(d1,4));
    setT(q+'tWhyv',f(dWhy,3));
    setT(q+'tWhh3v',f(c3,3));setT(q+'tWhh2v',f(c2,3));setT(q+'tWhh1v','0');
    const sum=document.getElementById(q+'tsum');
    const gx=D.xs[0]*d1+D.xs[1]*d2+D.xs[2]*d3;
    if(sum)sum.innerHTML='<b>Yaprakları topla:</b> W<sub>hh</sub> üç adımda kullanıldı → gerçek gradyan = '+f(c3,3)+' + '+f(c2,3)+' + '+f(c1,3)+' = <b>'+f(D.g,3)+'</b>. W<sub>xh</sub> için de aynı mantık: δ<sub>t</sub>·x<sub>t</sub> toplamı = <b>'+f(gx,3)+'</b>. W<sub>hy</sub> tek yerde kullanıldı → <b>'+f(dWhy,3)+'</b>. '+(D.train?'(Bu örnekte yalnız W<sub>hh</sub> öğreniliyor.)':'');
    setT(q+'tWxh3v',f(D.xs[2]*d3,3));setT(q+'tWxh2v',f(D.xs[1]*d2,3));setT(q+'tWxh1v',f(D.xs[0]*d1,3));
    const S=(k,ti,eq,num,say)=>src(K+''+k,ti,eq,num,say);
    S('Lp','∂L/∂p','\\tfrac{\\partial L}{\\partial p}=-\\tfrac{y}{p}+\\tfrac{1-y}{1-p}',(y?'-\\tfrac{1}{'+t(pr,3)+'}':'\\tfrac{1}{1-'+t(pr,3)+'}')+'=\\mathbf{'+t(-y/pr+(1-y)/(1-pr),3)+'}','💬 Doğru etiket y='+y+'. Ağın verdiği olasılık yanlış yöndeyse kayıp p\'ye çok duyarlıdır: ağı "olasılığı '+(y?'artır':'azalt')+'" diye zorlayan sinyal.');
    S('pzy','∂p/∂z_y','\\tfrac{\\partial p}{\\partial z_y}=p(1-p)','p(1-p)='+t(pr,3)+'\\cdot'+t(1-pr,3)+'=\\mathbf{'+t(pr*(1-pr),3)+'}\\ \\Rightarrow\\ \\tfrac{\\partial L}{\\partial z_y}=p-y=\\mathbf{'+t(dzy,3)+'}','💬 Sigmoidin eğimi. Çarpınca sade bir sonuç çıkar: <b>dz<sub>y</sub> = p − y = '+f(dzy,3)+'</b> ('+(dzy<0?'eksi → "çıkışı büyüt"':'artı → "çıkışı küçült"')+').');
    S('zyWhy','∂z_y/∂W_hy','\\tfrac{\\partial z_y}{\\partial W_{hy}}=h_3','dW_{hy}='+tp(dzy,3)+'\\cdot'+t(h[3],3)+'=\\mathbf{'+t(dWhy,3)+'}','💬 Karar ağırlığının gradyanı = gelen sinyal × girdisi (h₃). h₃ ≈ 0 ise bu ağırlık neredeyse hiç öğrenemez.');
    S('zyh','∂z_y/∂h₃','\\tfrac{\\partial z_y}{\\partial h_3}=W_{hy}','\\tfrac{\\partial L}{\\partial h_3}='+tp(dzy,3)+'\\cdot'+t(why,2)+'=\\mathbf{'+t(dh3,3)+'}','💬 Sinyal çıkış ağırlığıyla çarpılıp hafızaya (h₃) taşınıyor.');
    for(let k=3;k>=1;k--){
      const hh=h[k],dd=[0,d1,d2,d3][k],ddn=[0,d1,d2,d3][k];
      S('hz'+k,'∂h'+sup[k]+'/∂z'+sup[k],'\\tfrac{\\partial h_'+k+'}{\\partial z_'+k+'}=1-h_'+k+'^2',
        '\\delta_'+k+'='+(k==3?tp(dh3,3):tp([0,d1,d2,d3][k+1]*whh,3))+'\\cdot'+t(1-hh*hh,3)+'=\\mathbf{'+t(dd,k==1?4:3)+'}',
        '💬 tanh\'ın eğimi ('+f(1-hh*hh,3)+') sinyalle çarpılır'+(k<3?' (önceki sinyal × W<sub>hh</sub> zaten çarpılmış)':'')+'. Eğim 1\'den küçük olduğu için sinyal her adımda biraz daha küçülür.');
      const hp=h[k-1];
      S('z'+k+'Wxh','∂z'+sup[k]+'/∂W_xh','\\tfrac{\\partial z_'+k+'}{\\partial W_{xh}}=x_'+k,'\\delta_'+k+'\\cdot x_'+k+'='+tp(dd,k==1?4:3)+'\\cdot'+tp(D.xs[k-1],1)+'=\\mathbf{'+t(dd*D.xs[k-1],k==1?4:3)+'}',
        '💬 Bu adımda W<sub>xh</sub>\'nin katkısı = δ × o adımdaki kelime sayısı. '+(D.xs[k-1]===0?'Kelime 0 olduğu için katkı yok.':'Kelime sayısı 1 → katkı δ\'nın kendisi.'));
      S('z'+k+'Whh','∂z'+sup[k]+'/∂W_hh','\\tfrac{\\partial z_'+k+'}{\\partial W_{hh}}=h_'+(k-1),'\\delta_'+k+'\\cdot h_'+(k-1)+'='+tp(dd,k==1?4:3)+'\\cdot'+t(hp,3)+'=\\mathbf{'+t(dd*hp,3)+'}',
        '💬 Bu adımda W<sub>hh</sub>\'nin katkısı = δ × <b>önceki hafıza</b>. '+(k==1?'h₀ = 0 olduğundan t=1\'de katkı hep 0.':'Aynı ağırlık üç adımda kullanıldığı için üç katkı sonunda toplanır.'));
      if(k>1)S('z'+k+'h','∂z'+sup[k]+'/∂h'+sup[k-1],'\\tfrac{\\partial z_'+k+'}{\\partial h_'+(k-1)+'}=W_{hh}','\\tfrac{\\partial L}{\\partial h_'+(k-1)+'}='+tp(dd,3)+'\\cdot'+t(whh,3)+'=\\mathbf{'+t(dd*whh,3)+'}',
        '💬 Sinyal bir adım <b>geriye</b> W<sub>hh</sub> ile çarpılarak taşınıyor — BPTT\'nin kalbi. W<sub>hh</sub>='+f(whh,2)+' olduğundan sinyal her adımda bu oranla çarpılır.');
    }
  }
  // Açılıp kapanan harita kabuğu içeriği
  function mapBody(id){ return '<div id="'+id+'"></div>'; }

  // ---- açılmış RNN şekli (3 adım) ----
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
      o.push('<text x="'+x+'" y="166" text-anchor="middle" fill="'+(c.hCol||tc)+'" font-size="14" font-weight="700">= '+c.h[i]+'</text>');
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
    if(c.loss){
      o.push('<rect x="'+(ox-80-175)+'" y="14" width="140" height="46" rx="10" fill="#4a1d1d" stroke="#e06a6a" stroke-width="2"/>');
      o.push('<text x="'+(ox-80-105)+'" y="34" text-anchor="middle" fill="'+tc+'" font-size="14" font-weight="700">doğru cevap y = '+(c.y===undefined?1:c.y)+'</text>');
      o.push('<text x="'+(ox-80-105)+'" y="51" text-anchor="middle" fill="#e06a6a" font-size="12">'+c.loss+'</text>');
      o.push('<line x1="'+(ox-80-35)+'" y1="37" x2="'+(ox-82)+'" y2="37" stroke="#e06a6a" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#'+uid+')"/>');
    }
    o.push('</svg>');
    return o.join('');
  }

  // ---- ortak: kaydırıcı ↔ değer etiketi ----
  function bind(ids,fn){
    ids.forEach(id=>{const e=$(id);if(e)e.addEventListener('input',fn);});
  }
  function lab(id,v,d=2){const e=$(id+'v');if(e)e.textContent=f(parseFloat(v),d);}
  function setRange(id,v){const e=$(id);if(e){e.value=v;}}

  // ================= Örnek 1: duygu =================
  (function(){
    if(!$('rex1'))return;
    const ids=['rex1a','rex1b','rex1c'], rg=['rex1wxh','rex1whh','rex1why'];
    const wordOf=v=>{const o=[...$('rex1a').options].find(op=>parseFloat(op.value)===v);return o?o.dataset.w:'?';};
    function render(){
      const xs=ids.map(i=>parseFloat($(i).value));
      const wxh=parseFloat($('rex1wxh').value),whh=parseFloat($('rex1whh').value),why=parseFloat($('rex1why').value);
      rg.forEach(i=>lab(i,$(i).value));
      let h=0;const hs=[],zs=[];
      xs.forEach(x=>{const z=wxh*x+whh*h;zs.push(z);h=Math.tanh(z);hs.push(h);});
      const p=sig(why*h);
      $('rex1fig').innerHTML=svg('rx1',{
        words:ids.map(i=>$(i).selectedOptions[0].dataset.w),xs:xs.map(x=>f(x,1)),
        whh:f(whh,2),wxh:f(wxh,2),why:f(why,2),h:hs.map(v=>f(v,3)),
        outLab:'p = '+f(p,2),outSub:p>=0.5?'olumlu olma olasılığı ✓':'olumlu olma olasılığı ✗',outGood:p>=0.5});
      const L=[];
      hs.forEach((hv,i)=>{
        const prev=i?hs[i-1]:0;
        L.push('t='+(i+1)+':\\quad & h_'+(i+1)+'=\\tanh\\big('+t(wxh,2)+'\\cdot '+tp(xs[i],1)+'+'+t(whh,2)+'\\cdot '+tp(prev,3)+'\\big)=\\mathbf{'+t(hv,3)+'}');
      });
      $('rex1calc').innerHTML='\\[\\begin{aligned}'+L.join('\\\\')+'\\end{aligned}\\]'+
        '\\[p=\\sigma\\big('+t(why,2)+'\\cdot '+tp(h,3)+'\\big)=\\mathbf{'+t(p,2)+'}\\quad\\Rightarrow\\quad\\text{'+(p>=0.5?'olumlu':'olumsuz')+'}\\]';
      const y1=parseInt($('rex1y').value,10),r1=bptt(xs,wxh,whh,why,y1);
      $('rex1fig').innerHTML=svg('rx1',{
        words:ids.map(i=>$(i).selectedOptions[0].dataset.w),xs:xs.map(x=>f(x,1)),
        whh:f(whh,2),wxh:f(wxh,2),why:f(why,2),h:hs.map(v=>f(v,3)),
        outLab:'p = '+f(p,2),outSub:p>=0.5?'olumlu olma olasılığı ✓':'olumlu olma olasılığı ✗',outGood:(p>=0.5)===(y1===1),
        y:y1,loss:'L = '+f(r1.L,3)});
      const D1=Object.assign({},r1,{xs,wxh,whh,why,pr:p,y:y1});
      fwdUpd('rx1',D1,{loss:true,pcap:'olumlu olma',psay:p>=0.5?'olumlu yorum':'olumsuz yorum'});bwdUpd('rx1','r1_',D1);
      tx($('rex1calc'));
    }
    $('rex1map').innerHTML=fwdHtml('rx1',{loss:true,pcap:'olumlu olma'})+bwdHtml('rx1','r1_');tx($('rex1map'));
    bind(ids.concat(rg,['rex1y']),render);
    document.querySelectorAll('[data-rex1]').forEach(b=>b.addEventListener('click',()=>{
      const v=b.dataset.rex1.split(',').map(Number);
      ids.forEach((id,i)=>{$(id).value=v[i];});
      if(v.length>3){setRange('rex1wxh',v[3]);setRange('rex1whh',v[4]);setRange('rex1why',v[5]);}
      if(b.dataset.rex1y!==undefined)$('rex1y').value=b.dataset.rex1y;
      render();
    }));
    render();
  })();

  // ================= Örnek 2: sıradaki kelime =================
  (function(){
    if(!$('rex2'))return;
    const rg=['rex2wxh','rex2whh','rex2why'];
    function render(){
      const x1=parseFloat($('rex2a').value);
      const wxh=parseFloat($('rex2wxh').value),whh=parseFloat($('rex2whh').value),why=parseFloat($('rex2why').value);
      rg.forEach(i=>lab(i,$(i).value));
      const xs=[x1,0,0];let h=0;const hs=[];
      xs.forEach(x=>{h=Math.tanh(wxh*x+whh*h);hs.push(h);});
      const p=sig(why*h),miyav=p>=0.5,conf=Math.max(p,1-p);
      $('rex2fig').innerHTML=svg('rx2',{
        words:[$('rex2a').selectedOptions[0].dataset.w,'ve','___'],xs:xs.map(x=>f(x,0)),
        whh:f(whh,2),wxh:f(wxh,2),why:f(why,2),h:hs.map(v=>f(v,3)),
        outLab:'p = '+f(p,2)+' → '+(miyav?'miyav':'hav'),outSub:'miyav olasılığı',outGood:conf>=0.7});
      const L=hs.map((hv,i)=>'t='+(i+1)+':\\quad & h_'+(i+1)+'=\\tanh\\big('+t(wxh,2)+'\\cdot '+tp(xs[i],0)+'+'+t(whh,2)+'\\cdot '+tp(i?hs[i-1]:0,3)+'\\big)=\\mathbf{'+t(hv,3)+'}');
      $('rex2calc').innerHTML='\\[\\begin{aligned}'+L.join('\\\\')+'\\end{aligned}\\]'+
        '\\[p=\\sigma\\big('+t(why,2)+'\\cdot '+tp(h,3)+'\\big)=\\mathbf{'+t(p,2)+'}\\]';
      const msg=conf>=0.7?'Ağ <b>'+(miyav?'"miyav"':'"hav"')+'</b> diyor (%'+Math.round(conf*100)+' emin) — ilk kelimenin bilgisi iki nötr adımdan sonra da duruyor.'
        :'Ağ <b>kararsız</b> (p ≈ '+f(p,2)+'): ilk kelimenin bilgisi iki adımda sönmüş. W<sub>hh</sub>\'yi büyütmeyi dene.';
      $('rex2msg').innerHTML=msg;
      const y2=x1>0?1:0,r2=bptt(xs,wxh,whh,why,y2);
      $('rex2fig').innerHTML=svg('rx2',{
        words:[$('rex2a').selectedOptions[0].dataset.w,'ve','___'],xs:xs.map(x=>f(x,0)),
        whh:f(whh,2),wxh:f(wxh,2),why:f(why,2),h:hs.map(v=>f(v,3)),
        outLab:'p = '+f(p,2)+' → '+(miyav?'miyav':'hav'),outSub:'miyav olasılığı',outGood:conf>=0.7,
        y:y2,loss:'L = '+f(r2.L,3)});
      const D2=Object.assign({},r2,{xs,wxh,whh,why,pr:p,y:y2});
      fwdUpd('rx2',D2,{loss:true,pcap:'miyav olas.',psay:'miyav olasılığı'});bwdUpd('rx2','r2_',D2);
      tx($('rex2calc'));
    }
    $('rex2map').innerHTML=fwdHtml('rx2',{loss:true,pcap:'miyav olas.'})+bwdHtml('rx2','r2_');tx($('rex2map'));
    bind(['rex2a'].concat(rg),render);
    document.querySelectorAll('[data-rex2]').forEach(b=>b.addEventListener('click',()=>{
      const v=b.dataset.rex2.split(',').map(Number);
      setRange('rex2wxh',v[0]);setRange('rex2whh',v[1]);setRange('rex2why',v[2]);
      render();
    }));
    render();
  })();

  // ================= Örnek 3: tek BPTT adımı =================
  (function(){
    if(!$('rex3'))return;
    const Wxh=2,Why=3,xs=[1,0,0];
    let steps=0;
    const fwd=whh=>bptt(xs,Wxh,whh,Why,1);
    const grads=whh=>bptt(xs,Wxh,whh,Why,1);
    function render(){
      const whh=parseFloat($('rex3whh').value),al=parseFloat($('rex3al').value);
      lab('rex3whh',whh,3);lab('rex3al',al,2);
      const r=grads(whh),h=r.h;
      const nw=whh-al*r.g,nr=fwd(nw);
      $('rex3fig').innerHTML=svg('rx3',{
        words:['kedi','ve','___'],xs:['+1','0','0'],whh:f(whh,3),wxh:'2',why:'3',
        h:[1,2,3].map(i=>f(h[i],3)),
        outLab:'p = '+f(r.p,3),outSub:'ağın tahmini (miyav)',outGood:r.p>=0.7,loss:'L = −ln p = '+f(r.L,3)});
      $('rex3calc').innerHTML='\\[\\begin{aligned}'+
        '\\text{1) çıkış:}\\quad&\\tfrac{\\partial L}{\\partial z_y}=p-y='+t(r.p,3)+'-1=\\mathbf{'+t(r.dzy,3)+'}\\\\'+
        '\\text{2) }h_3\\text{\'e:}\\quad&\\tfrac{\\partial L}{\\partial h_3}='+tp(r.dzy,3)+'\\cdot 3=\\mathbf{'+t(r.dh3,3)+'}\\\\'+
        '\\text{3) }z_3\\text{\'e:}\\quad&\\delta_3='+tp(r.dh3,3)+'\\cdot'+t(1-h[3]*h[3],3)+'=\\mathbf{'+t(r.d3,3)+'}\\\\'+
        '\\text{4) }W_{hh}\\,(t{=}3):\\quad&\\delta_3\\cdot h_2='+tp(r.d3,3)+'\\cdot'+t(h[2],3)+'=\\mathbf{'+t(r.c3,3)+'}\\\\'+
        '\\text{5) bir adım geri:}\\quad&\\delta_2='+tp(r.d3,3)+'\\cdot'+t(whh,3)+'\\cdot'+t(1-h[2]*h[2],3)+'=\\mathbf{'+t(r.d2,3)+'}\\\\'+
        '&W_{hh}\\,(t{=}2):\\ \\delta_2\\cdot h_1='+tp(r.d2,3)+'\\cdot'+t(h[1],3)+'=\\mathbf{'+t(r.c2,3)+'}\\\\'+
        '\\text{6) }t=1:\\quad&\\delta_1='+tp(r.d2,3)+'\\cdot'+t(whh,3)+'\\cdot'+t(1-h[1]*h[1],3)+'='+t(r.d1,4)+'\\\\'+
        '&W_{hh}\\,(t{=}1):\\ \\delta_1\\cdot h_0=\\mathbf{0}\\quad(h_0=0)'+
        '\\end{aligned}\\]'+
        '\\[\\frac{\\partial L}{\\partial W_{hh}}='+tp(r.c3,3)+'+'+tp(r.c2,3)+'+0=\\mathbf{'+t(r.g,3)+'}\\]'+
        '\\[\\begin{aligned}W_{hh}&\\leftarrow '+t(whh,3)+'-\\underbrace{'+t(al,2)+'}_{\\alpha}\\cdot'+tp(r.g,3)+'=\\mathbf{'+t(nw,3)+'}\\\\ p&:\\ '+t(r.p,3)+'\\to\\mathbf{'+t(nr.p,3)+'}\\qquad L:\\ '+t(r.L,3)+'\\to '+t(nr.L,3)+'\\end{aligned}\\]';
      const D3=Object.assign({},r,{xs,wxh:Wxh,whh,why:Why,pr:r.p,y:1,train:true});
      fwdUpd('rx3',D3,{loss:true,pcap:'miyav olas.',psay:'ağın "miyav" tahmini'});bwdUpd('rx3','r3_',D3);
      $('rex3steps').textContent=steps;
      $('rex3msg').innerHTML=r.g<0?'Gradyan <b>eksi</b> → W<sub>hh</sub>\'ı <b>büyüt</b> (hafızayı güçlendir). δ<sub>1</sub> ≈ '+f(r.d1,4)+', δ<sub>3</sub> ≈ '+f(r.d3,3)+': sinyal geri giderken '+(Math.abs(r.d3/(r.d1||1e-9))>20?'yaklaşık '+Math.round(Math.abs(r.d3/(r.d1||1e-9)))+' kat ':'')+'sönüyor.'
        :'Gradyan ≈ 0 ya da pozitif → bu ayarda W<sub>hh</sub>\'ı büyütmek p\'yi artırmıyor.';
      tx($('rex3calc'));
    }
    $('rex3map').innerHTML=fwdHtml('rx3',{loss:true,pcap:'miyav olas.'})+bwdHtml('rx3','r3_');tx($('rex3map'));
    $('rex3whh').addEventListener('input',render);
    $('rex3al').addEventListener('input',render);
    $('rex3step').addEventListener('click',()=>{
      const whh=parseFloat($('rex3whh').value),al=parseFloat($('rex3al').value);
      const nw=whh-al*grads(whh).g;
      $('rex3whh').value=Math.max(parseFloat($('rex3whh').min),Math.min(parseFloat($('rex3whh').max),nw));
      steps++;render();
    });
    $('rex3reset').addEventListener('click',()=>{$('rex3whh').value=0.2;steps=0;render();});
    render();
  })();
})();
