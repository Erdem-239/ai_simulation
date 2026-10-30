// Neural Network — "6️⃣ Bütün Resim": geri yayılım ağacı (L → z_y → {W⁽²⁾, b⁽²⁾, h₁ → z_h1 → {w₁₁,w₁₂,b₁}, h₂ → z_h2 → {w₂₁,w₂₂,b₂}}).
// İleri yol lesson-nn.js'teki renderMatrixChain'de; bu dosya nokta seçiciyi, L kutusunu, ağacı ve pop-up kaynaklarını kurar.
// Ağırlıklar Simülasyon'daki nnW* kutularından okunur; lesson-nn.js renderForward() her seferinde __nnBigRender'ı çağırır.
(function(){
  const tree=document.getElementById('nnBigTree'); if(!tree) return;
  const $=id=>document.getElementById(id);
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=4)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=4)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=4)=>v<0?'('+t(v,d)+')':t(v,d);
  const sig=z=>1/(1+Math.exp(-z));
  const P=[[0,0,0],[0,1,1],[1,0,1],[1,1,0]];
  const ids=['nnW11','nnW12','nnB1','nnW21','nnW22','nnB2','nnW31','nnW32','nnB3'];
  const setT=(id,v)=>{const e=$(id);if(e)e.textContent=v;};

  const E=(cls,key,tex)=>'<span class="xt-edge '+cls+'" data-pop="'+key+'" tabindex="0" role="button" aria-label="türetmeyi göster">\\( '+tex+' \\)</span><span class="xt-ar">→</span>';
  const B=(cls,id,sym,cap,key)=>'<div class="xt-box '+cls+'" id="nb_'+id+'"'+(key?' data-pop="'+key+'" tabindex="0"':'')+'>'+sym+(cap?'<span class="xt-cap">'+cap+'</span>':'')+'<span class="xt-val" id="nb_'+id+'v">—</span></div>';
  const LF=(cls,id,sym,key)=>'<div class="xt-box '+cls+' yaprak" id="nb_'+id+'" data-pop="'+key+'" tabindex="0">'+sym+'<span class="xt-val" id="nb_'+id+'v">—</span></div>';
  const kid=(e,c)=>'<div class="xt-kid">'+e+c+'</div>';
  const node=(b,k)=>'<div class="xt-node">'+b+(k?'<div class="xt-kids">'+k+'</div>':'')+'</div>';
  const hid=n=>{const j=n+1,c=n?'g4':'g2';
    return node(B(c,'h'+j,'h<sub>'+j+'</sub>','∂L/∂h'+j,'nb_h'+j),
      kid(E(c,'nb_s'+j,'\\tfrac{\\partial h_'+j+'}{\\partial z_{h'+j+'}}=h_'+j+'(1-h_'+j+')'),
        node(B(c,'zh'+j,'z<sub>h'+j+'</sub>','δ'+j+' = ∂L/∂z<sub>h'+j+'</sub>','nb_zh'+j),
          kid(E(c,'nb_w'+j+'1','\\tfrac{\\partial z_{h'+j+'}}{\\partial w_{'+j+'1}}=x_1'),LF(c,'w'+j+'1','∂L/∂w<sub>'+j+'1</sub>','nb_w'+j+'1'))+
          kid(E(c,'nb_w'+j+'2','\\tfrac{\\partial z_{h'+j+'}}{\\partial w_{'+j+'2}}=x_2'),LF(c,'w'+j+'2','∂L/∂w<sub>'+j+'2</sub>','nb_w'+j+'2'))+
          kid(E(c,'nb_b'+j,'\\tfrac{\\partial z_{h'+j+'}}{\\partial b_'+j+'}=1'),LF(c,'b'+j,'∂L/∂b<sub>'+j+'</sub>','nb_b'+j)))));};
  tree.innerHTML=node(B('g1 kok','L','L','kayıp','nb_Lk'),
    kid(E('g1','nb_zy','\\tfrac{\\partial L}{\\partial z_y}=\\hat y-y'),
      node(B('g1','zy','z<sub>y</sub>','δ<sub>y</sub> = ∂L/∂z<sub>y</sub>','nb_zyk'),
        kid(E('g3','nb_w31','\\tfrac{\\partial z_y}{\\partial w_{31}}=h_1'),LF('g3','w31','∂L/∂w<sub>31</sub>','nb_w31'))+
        kid(E('g3','nb_w32','\\tfrac{\\partial z_y}{\\partial w_{32}}=h_2'),LF('g3','w32','∂L/∂w<sub>32</sub>','nb_w32'))+
        kid(E('g3','nb_b3','\\tfrac{\\partial z_y}{\\partial b_3}=1'),LF('g3','b3','∂L/∂b<sub>3</sub>','nb_b3'))+
        kid(E('g2','nb_h1','\\tfrac{\\partial z_y}{\\partial h_1}=w_{31}'),hid(0))+
        kid(E('g4','nb_h2','\\tfrac{\\partial z_y}{\\partial h_2}=w_{32}'),hid(1)))));

  function srcEl(id){let e=document.getElementById('xtsrc-'+id);if(!e){e=document.createElement('div');e.className='xt-src';e.id='xtsrc-'+id;($('nnBigSrc')||document.body).appendChild(e);}return e;}
  // başlık, sembolik türev, (isteğe bağlı) zincir yolu, bu halka: yerel × gelen = sonuç, sözel
  function src(id,title,eq,why,yol,hes,say){
    srcEl(id).innerHTML='<div class="xp-bas">'+title+'</div><div class="eq">\\( '+eq+' \\)</div>'+(why?'<div class="xp-sat">'+why+'</div>':'')+
      (yol?'<div class="xp-sat">📍 <b>L\'den buraya:</b></div><div class="xp-hes">\\( \\begin{aligned}'+yol+'\\end{aligned} \\)</div>':'')+
      '<div class="xp-sat">🔗 <b>Bu halka</b> (yerel türev × gelen gradyan):</div><div class="xp-hes">\\( '+hes+' \\)</div><div class="xp-sat">'+say+'</div>';
  }
  const sign=v=>v>0?'pozitif → bu sayı azaltılırsa kayıp düşer':v<0?'negatif → bu sayı artırılırsa kayıp düşer':'sıfır → bu noktada bu sayının kayba etkisi yok';

  function fill(){
    const k=window.__nnBigPt===undefined?2:window.__nnBigPt,[x1,x2,y]=P[k];
    document.querySelectorAll('.nnbig-pt').forEach(b=>b.classList.toggle('on',+b.dataset.pt===k));
    document.querySelectorAll('.nnbig-ptlab').forEach(e=>e.textContent='('+x1+','+x2+')');
    const W=ids.map(id=>parseFloat($(id)&&$(id).value)||0);
    const zh1=W[0]*x1+W[1]*x2+W[2],zh2=W[3]*x1+W[4]*x2+W[5],h1=sig(zh1),h2=sig(zh2),zy=W[6]*h1+W[7]*h2+W[8],p=sig(zy);
    const L=-(y?Math.log(p+1e-12):Math.log(1-p+1e-12));
    const dy=p-y,s1=h1*(1-h1),s2=h2*(1-h2),dh1=dy*W[6],dh2=dy*W[7],d1=dh1*s1,d2=dh2*s2;
    const G={w31:dy*h1,w32:dy*h2,b3:dy,w11:d1*x1,w12:d1*x2,b1:d1,w21:d2*x1,w22:d2*x2,b2:d2};
    setT('nbfL',f(L,4));setT('nb_Lv',f(L,4));setT('nb_zyv',f(dy));setT('nb_h1v',f(dh1));setT('nb_h2v',f(dh2));setT('nb_zh1v',f(d1));setT('nb_zh2v',f(d2));
    Object.keys(G).forEach(n=>setT('nb_'+n+'v',f(G[n])));
    // ---- pop-up kaynakları ----
    src('nb_L','L — kayıp (ikili çapraz entropi)','L=-[\\,y\\ln\\hat y+(1-y)\\ln(1-\\hat y)\\,]','y='+y+' olduğu için '+(y?'ikinci terim sıfırlanır: L = −ln ŷ.':'ilk terim sıfırlanır: L = −ln(1−ŷ).'),
      '','L=-\\ln('+(y?t(p):'1-'+t(p))+')=\\mathbf{'+t(L)+'}','💬 Tahmin doğru cevaba ne kadar yakınsa kayıp o kadar 0\'a yaklaşır; geri yayılım buradan başlar.');
    srcEl('nb_Lk').innerHTML=srcEl('nb_L').innerHTML;
    src('nb_zy','∂L/∂z<sub>y</sub> = ŷ − y — çıktıdan ilk adım','\\frac{\\partial L}{\\partial z_y}=\\frac{\\partial L}{\\partial \\hat y}\\cdot\\frac{\\partial \\hat y}{\\partial z_y}=\\Big(\\frac{\\hat y-y}{\\hat y(1-\\hat y)}\\Big)\\cdot\\hat y(1-\\hat y)=\\hat y-y',
      'Çapraz entropinin türevi ile σ\'nın türevi σ(1−σ) çarpılınca payda sadeleşir; geriye sadece <b>tahmin − gerçek</b> kalır (Aktivasyon dersindeki dL/dz = p − y).','',
      '\\delta_y=\\hat y-y='+t(p)+'-'+y+'=\\mathbf{'+t(dy)+'}','💬 '+(dy>0?'Tahmin olması gerekenin üstünde: z_y küçülmeli.':dy<0?'Tahmin olması gerekenin altında: z_y büyümeli.':'Tahmin tam doğru.')+' Bu sayı aşağıdaki her dala çarpan olarak iner.');
    srcEl('nb_zyk').innerHTML=srcEl('nb_zy').innerHTML;
    const yolY='\\delta_y&=\\hat y-y='+t(p)+'-'+y+'='+t(dy);
    [['w31','w_{31}','h_1',h1],['w32','w_{32}','h_2',h2],['b3','b_3','1',1]].forEach(([n,sym,inp,v])=>{
      src('nb_'+n,'∂L/∂'+sym.replace(/[{}_]/g,'')+' — çıktı katmanının '+(n==='b3'?'bias\'ı':'ağırlığı'),'\\frac{\\partial L}{\\partial '+sym+'}=\\delta_y\\cdot\\frac{\\partial z_y}{\\partial '+sym+'}=\\delta_y\\cdot '+inp,
        'z<sub>y</sub> = w₃₁h₁ + w₃₂h₂ + b₃ olduğu için '+sym.replace(/[{}_]/g,'')+'\'nin yerel türevi, onunla çarpılan şey: <b>'+(n==='b3'?'1':inp.replace('_',''))+'</b>.',yolY,
        '\\underbrace{'+tp(v)+'}_{\\text{yerel}}\\times\\underbrace{'+tp(dy)+'}_{\\delta_y}=\\mathbf{'+t(G[n])+'}','💬 Gradyan '+sign(G[n])+'. Bu tek noktanın katkısı; eğitim 4 noktanın ortalamasını kullanır (5️⃣ Simülasyon → 3) Güncelle).');
    });
    [[1,dh1,s1,d1,h1,zh1,W[6]],[2,dh2,s2,d2,h2,zh2,W[7]]].forEach(([j,dh,s,d,h,zh,w3])=>{
      const yolH=yolY+'\\\\ \\tfrac{\\partial L}{\\partial h_'+j+'}&=\\delta_y\\cdot w_{3'+j+'}='+tp(dy)+'\\cdot'+tp(w3,2)+'='+t(dh);
      src('nb_h'+j,'∂L/∂h'+j+' — hata gizli katmana iner','\\frac{\\partial L}{\\partial h_'+j+'}=\\delta_y\\cdot\\frac{\\partial z_y}{\\partial h_'+j+'}=\\delta_y\\cdot w_{3'+j+'}',
        'h'+j+' çıktı nöronuna w₃'+j+' ağırlığıyla bağlı; bu yüzden hatanın h'+j+'\'ye düşen payı w₃'+j+' ile ölçeklenir.',yolY,
        '\\underbrace{'+tp(w3,2)+'}_{w_{3'+j+'}}\\times\\underbrace{'+tp(dy)+'}_{\\delta_y}=\\mathbf{'+t(dh)+'}','💬 w₃'+j+' büyükse h'+j+' hatadan büyük pay alır; '+(Math.abs(w3)<0.05?'şu an w₃'+j+' ≈ 0, h'+j+' neredeyse hiç sinyal almıyor.':'işareti, h'+j+'\'nin artmasının kaybı artırıp azaltacağını söyler.'));
      srcEl('nb_h'+j+'k');
      src('nb_s'+j,'∂h'+j+'/∂z<sub>h'+j+'</sub> = σ′ — sigmoid\'in türevi','\\frac{\\partial h_'+j+'}{\\partial z_{h'+j+'}}=\\sigma(z_{h'+j+'})\\,(1-\\sigma(z_{h'+j+'}))=h_'+j+'(1-h_'+j+')',
        'Sigmoid\'in türevi kendi çıktısıyla yazılır (Aktivasyon dersi). En fazla 0,25 (z=0); z büyük/küçükse sıfıra yaklaşır.',yolH,
        '\\underbrace{'+t(h)+'\\cdot(1-'+t(h)+')}_{='+t(s)+'}\\times\\underbrace{'+tp(dh)+'}_{\\partial L/\\partial h_'+j+'}=\\mathbf{'+t(d)+'}',
        '💬 z<sub>h'+j+'</sub> = '+f(zh,2)+' noktasında sinyalin <b>%'+(s*100).toFixed(s<0.1?2:1).replace('.',',')+'\'i</b> geçiyor.'+(s<0.01?' Nöron doymuş: bu noktada gizli katman ağırlıkları neredeyse hiç öğrenemez.':''));
      const yolZ=yolH+'\\\\ \\delta_'+j+'&=\\tfrac{\\partial L}{\\partial h_'+j+'}\\cdot h_'+j+'(1-h_'+j+')='+tp(dh)+'\\cdot'+t(s)+'='+t(d);
      [['w'+j+'1','w_{'+j+'1}','x_1',x1],['w'+j+'2','w_{'+j+'2}','x_2',x2],['b'+j,'b_'+j,'1',1]].forEach(([n,sym,inp,v])=>{
        src('nb_'+n,'∂L/∂'+sym.replace(/[{}_]/g,'')+' — gizli katmanın '+(n[0]==='b'?'bias\'ı':'ağırlığı'),'\\frac{\\partial L}{\\partial '+sym+'}=\\delta_'+j+'\\cdot\\frac{\\partial z_{h'+j+'}}{\\partial '+sym+'}=\\delta_'+j+'\\cdot '+inp,
          'z<sub>h'+j+'</sub> = w<sub>'+j+'1</sub>x₁ + w<sub>'+j+'2</sub>x₂ + b<sub>'+j+'</sub>; yerel türev, bu sayının çarptığı şey: <b>'+(n[0]==='b'?'1':inp.replace('_',''))+'</b>.',yolZ,
          '\\underbrace{'+tp(v,0)+'}_{\\text{yerel}}\\times\\underbrace{'+tp(d)+'}_{\\delta_'+j+'}=\\mathbf{'+t(G[n])+'}',
          '💬 '+(v===0?'Bu noktada '+inp.replace('_','')+' = 0: ağırlık o girdiyi hiç görmedi, gradyanı tam 0 (bu noktadan öğrenmez).':'Gradyan '+sign(G[n])+'.')+' Zincir: kayıp → çıktı → h'+j+' → σ′ → bu ağırlık; dört yerel türevin çarpımı.');
      });
    });
    srcEl('nb_zh1k');
    ['h1','h2','zh1','zh2'].forEach(n=>{srcEl('nb_'+n).innerHTML=srcEl(n[0]==='h'?'nb_'+n:'nb_s'+n.slice(2)).innerHTML;});
    const mx=Object.keys(G).reduce((a,n)=>Math.abs(G[n])>Math.abs(G[a])?n:a,'w31');
    $('nnBigVerdict').innerHTML='🔑 Nokta <b>('+x1+','+x2+')</b>, y='+y+': ŷ = <b>'+f(p,4)+'</b>, kayıp <b>'+f(L,4)+'</b>. Dokuz yaprak bu noktanın gradyanları; en büyüğü <b>∂L/∂'+mx.replace(/(\d)/g,m=>'₀₁₂₃₄₅₆₇₈₉'[m])+'</b> = '+f(G[mx])+'. Gizli katmana inen sinyal σ′ ile ölçeklenir: h₁ dalında %'+(s1*100).toFixed(1).replace('.',',')+', h₂ dalında %'+(s2*100).toFixed(1).replace('.',',')+' geçiyor. Eğitimde bu ağaç 4 nokta için kurulur, yaprakların ortalaması alınır ve W := W − α·ortalama uygulanır.';
    window.__nnBig={G,L,p,dy,d1,d2};
    const M=window.MathJax;if(M&&M.typesetPromise){const box=$('nnMatrixWrap');if(box&&box.offsetParent){try{M.typesetClear&&M.typesetClear([tree]);}catch(e){}}}
  }
  window.__nnBigRender=fill;
  document.querySelectorAll('.nnbig-pt').forEach(b=>b.addEventListener('click',()=>{window.__nnBigPt=+b.dataset.pt;if(window.__nnRender)window.__nnRender();else fill();}));
  fill();
  const M=window.MathJax;
  if(M&&M.startup&&M.startup.promise)M.startup.promise.then(()=>M.typesetPromise&&M.typesetPromise([tree]).catch(()=>{}));
})();
