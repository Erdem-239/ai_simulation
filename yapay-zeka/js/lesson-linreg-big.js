// Lineer Regresyon — "6️⃣ Bütün Resim": Simülasyon'daki canlı Θ₀, Θ₁ ve veri noktalarıyla
// ileri yol (x → h → hata → E) + geri yayılım ağacı (E → hᵢ → Θ₀, Θ₁ yaprakları) + türetme pop-up'ları.
// Veri/Θ değerleri js/lesson-linreg.js'teki window.__linState()'ten okunur; her recompute() sonunda yeniden çizilir.
(function(){
  const host=document.getElementById('linBigMap'); if(!host) return;
  const $=id=>document.getElementById(id);
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>v<0?'('+t(v,d)+')':t(v,d);
  const setT=(id,v)=>{const e=$(id);if(e)e.textContent=v;};

  const E=(cls,key,tex)=>'<span class="xt-edge '+cls+'" data-pop="'+key+'" tabindex="0" role="button" aria-label="türetmeyi göster">\\( '+tex+' \\)</span><span class="xt-ar">→</span>';
  const B=(cls,id,sym,cap)=>'<div class="xt-box '+cls+'" id="lg_'+id+'">'+sym+(cap?'<span class="xt-cap">'+cap+'</span>':'')+'<span class="xt-val" id="lg_'+id+'v">—</span></div>';
  const LF=(cls,id,sym)=>'<div class="xt-box '+cls+' yaprak" id="lg_'+id+'">'+sym+'<span class="xt-val" id="lg_'+id+'v">—</span></div>';
  const kid=(e,c)=>'<div class="xt-kid">'+e+c+'</div>';
  const node=(b,k)=>'<div class="xt-node">'+b+(k?'<div class="xt-kids">'+k+'</div>':'')+'</div>';
  const fbox=(cls,id,sym)=>'<div class="xf-box '+cls+'" id="lgf_'+id+'">'+sym+'<span class="xf-val" id="lgf_'+id+'v">—</span></div>';
  const fkol=(inner,ad)=>'<div class="xf-kol">'+inner+'<div class="xf-kolad">'+ad+'</div></div>';
  const fok=(key,tex)=>'<div class="xf-ok"><span class="xf-chip" data-pop="'+key+'" tabindex="0" role="button" aria-label="bu adımı anlat">\\( '+tex+' \\)</span><span class="xf-ar">→</span></div>';

  function srcEl(id){let e=document.getElementById('xtsrc-'+id);if(!e){e=document.createElement('div');e.className='xt-src';e.id='xtsrc-'+id;($('linSrc')||document.body).appendChild(e);}return e;}
  function src(id,title,eq,num,say){srcEl(id).innerHTML='<div class="xp-bas">'+title+'</div><div class="eq">\\( '+eq+' \\)</div>'+(num?'<div class="xp-hes">\\( '+num+' \\)</div>':'')+'<div class="xp-sat">'+say+'</div>';}

  let builtM=-1;
  function build(m){
    let o='<div class="xf-baslik">▶ İLERİ YOL — veriden maliyete <span>(her nokta için aynı Θ₀, Θ₁ kullanılır; Simülasyon\'daki noktalar ve Θ canlı)</span></div><div class="xf-scroll"><div class="xf-akis">';
    let xs='',hs='',es='';
    for(let i=0;i<m;i++){xs+=fbox('gi','x'+i,'x<sub>'+(i+1)+'</sub>');hs+=fbox('gh','h'+i,'h<sub>'+(i+1)+'</sub>');es+=fbox('gy','e'+i,'e<sub>'+(i+1)+'</sub>');}
    o+=fkol(xs,'girdiler')+fok('lg_h','\\Theta_0{+}\\Theta_1 x')+fkol(hs,'tahminler')+fok('lg_e','h-y')+fkol(es,'hatalar')+fok('lg_E','\\tfrac{1}{2m}\\sum e^2')+fkol(fbox('gl','E','E'),'maliyet');
    o+='</div></div>';
    let kids='';
    for(let i=0;i<m;i++){
      const n=i+1;
      kids+=kid(E('g1','lg_Eh'+i,'\\tfrac{\\partial E}{\\partial h_'+n+'}=\\tfrac{e_'+n+'}{m}'),
        node(B('g3','h'+i,'h<sub>'+n+'</sub>','tahmin '+n),
          kid(E('g2','lg_h0_'+i,'\\tfrac{\\partial h_'+n+'}{\\partial \\Theta_0}=1'),LF('g2','a0_'+i,'Θ<sub>0</sub> katkısı '+n))+
          kid(E('g4','lg_h1_'+i,'\\tfrac{\\partial h_'+n+'}{\\partial \\Theta_1}=x_'+n),LF('g4','a1_'+i,'Θ<sub>1</sub> katkısı '+n))));
    }
    o+='<div class="xf-baslik" style="margin-top:8px">◀ GERİ YOL — maliyetten parametrelere <span>(her ok bir türev; üstüne gel → nasıl bulunduğu)</span></div><div class="xt-scroll"><div class="xt-tree">'+node(B('g1 kok','E','E','maliyet'),kids)+'</div></div>';
    o+='<div class="xf-baslik" style="margin-top:8px">➕ YAPRAKLARI TOPLA — gerçek gradyan</div><div class="xt-scroll"><div class="xt-tree" style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">'+
      '<div class="xt-kid">'+E('g2','lg_d0','\\tfrac{\\partial E}{\\partial \\Theta_0}=\\textstyle\\sum_i(\\text{katkı}_{0,i})')+LF('g2','d0','∂E/∂Θ<sub>0</sub>')+'</div>'+
      '<div class="xt-kid">'+E('g4','lg_d1','\\tfrac{\\partial E}{\\partial \\Theta_1}=\\textstyle\\sum_i(\\text{katkı}_{1,i})')+LF('g4','d1','∂E/∂Θ<sub>1</sub>')+'</div>'+
      '<div class="xt-kid">'+E('g3','lg_up','\\Theta:=\\Theta-\\alpha\\,\\tfrac{\\partial E}{\\partial \\Theta}')+LF('g3','nw','yeni Θ')+'</div></div></div>';
    host.innerHTML=o;builtM=m;
    const M=window.MathJax;if(M&&M.startup&&M.startup.promise){M.startup.promise.then(()=>{if(M.typesetPromise){if(M.typesetClear)M.typesetClear([host]);return M.typesetPromise([host]);}}).catch(()=>{});}
  }

  function fill(){
    const S=window.__linState&&window.__linState();if(!S)return;
    const {data,t0,t1,alpha}=S,m=data.length;
    if(m!==builtM)build(m);
    const h=data.map(([x])=>t0+t1*x),e=data.map(([x,y],i)=>h[i]-y);
    const E_=e.reduce((s,v)=>s+v*v,0)/(2*m);
    const c0=e.map(v=>v/m),c1=e.map((v,i)=>v*data[i][0]/m);
    const d0=c0.reduce((a,b)=>a+b,0),d1=c1.reduce((a,b)=>a+b,0);
    data.forEach(([x,y],i)=>{
      const n=i+1;
      setT('lgf_x'+i+'v',f(x,2));setT('lgf_h'+i+'v',f(h[i],3));setT('lgf_e'+i+'v',f(e[i],3));
      setT('lg_h'+i+'v',f(e[i]/m,3));setT('lg_a0_'+i+'v',f(c0[i],3));setT('lg_a1_'+i+'v',f(c1[i],3));
      src('lg_Eh'+i,'∂E/∂h'+n,'\\tfrac{\\partial E}{\\partial h_'+n+'}=\\tfrac{e_'+n+'}{m}','\\tfrac{\\partial E}{\\partial h_'+n+'}=\\tfrac{'+t(e[i],3)+'}{'+m+'}=\\mathbf{'+t(e[i]/m,3)+'}',
        '💬 E = 1/(2m)·Σe² içinde e'+n+' yalnızca kendi karesinde var: türev 2e·(1/2m) = e/m. Hata <b>'+(e[i]>0?'pozitif (çizgi noktanın üstünde)':e[i]<0?'negatif (çizgi noktanın altında)':'sıfır')+'</b> → '+(e[i]>0?'tahmini aşağı çekmek':e[i]<0?'tahmini yukarı çekmek':'dokunmaya gerek yok')+' maliyeti düşürür.');
      src('lg_h0_'+i,'∂h'+n+'/∂Θ₀','\\tfrac{\\partial h_'+n+'}{\\partial \\Theta_0}=1','\\text{katkı}_{0,'+n+'}=\\tfrac{e_'+n+'}{m}\\cdot1='+tp(e[i]/m,3)+'\\cdot1=\\mathbf{'+t(c0[i],3)+'}',
        '💬 h = Θ₀ + Θ₁x içinde Θ₀\'ın katsayısı 1: Θ₀ artarsa tahmin <b>aynı miktarda</b> artar. Bu yüzden nokta '+n+'\'in Θ₀ katkısı doğrudan e/m.');
      src('lg_h1_'+i,'∂h'+n+'/∂Θ₁','\\tfrac{\\partial h_'+n+'}{\\partial \\Theta_1}=x_'+n,'\\text{katkı}_{1,'+n+'}=\\tfrac{e_'+n+'}{m}\\cdot x_'+n+'='+tp(e[i]/m,3)+'\\cdot'+tp(x,2)+'=\\mathbf{'+t(c1[i],3)+'}',
        '💬 Θ₁ eğimdir: tahmin Θ₁\'e x kat duyarlı. x uzaktaki bir noktada (x='+f(x,2)+') eğim değişimi tahmini çok oynatır, o yüzden katkı e/m × x.');
    });
    setT('lgf_Ev',f(E_,4));setT('lg_Ev',f(E_,4));
    setT('lg_d0v',f(d0,4));setT('lg_d1v',f(d1,4));
    setT('lg_nwv',f(t0-alpha*d0,3)+' ; '+f(t1-alpha*d1,3));
    src('lg_h','h — tahmin','h_i=\\Theta_0+\\Theta_1x_i','\\begin{aligned}'+data.map(([x],i)=>'h_'+(i+1)+'&='+t(t0,3)+'+'+tp(t1,3)+'\\cdot'+tp(x,2)+'=\\mathbf{'+t(h[i],3)+'}').join('\\\\')+'\\end{aligned}',
      '💬 Aynı iki sayı (Θ₀, Θ₁) her nokta için kullanılıyor — doğru bu iki sayıdan ibaret.');
    src('lg_e','e — hata','e_i=h_i-y_i','\\begin{aligned}'+data.map(([x,y],i)=>'e_'+(i+1)+'&='+tp(h[i],3)+'-'+tp(y,2)+'=\\mathbf{'+t(e[i],3)+'}').join('\\\\')+'\\end{aligned}',
      '💬 Hata = tahmin − gerçek. Çizginin noktanın <b>üstünde</b> kaldığı yerde pozitif, altında kaldığı yerde negatif.');
    src('lg_E','E — maliyet','E=\\tfrac{1}{2m}\\textstyle\\sum_i e_i^2','E=\\tfrac{1}{2\\cdot'+m+'}('+e.map(v=>t(v*v,3)).join('+')+')=\\mathbf{'+t(E_,4)+'}',
      '💬 Kare almak işareti siler ve büyük hataları daha çok cezalar; ortalamaya bölüyoruz (2 türevde sadeleşsin diye).');
    src('lg_d0','∂E/∂Θ₀ — yaprakları topla','\\tfrac{\\partial E}{\\partial \\Theta_0}=\\textstyle\\sum_i \\tfrac{e_i}{m}','\\tfrac{\\partial E}{\\partial \\Theta_0}='+c0.map(v=>tp(v,3)).join('+')+'=\\mathbf{'+t(d0,4)+'}',
      '💬 Θ₀ <b>her noktanın tahminini</b> etkilediği için gerçek gradyan, noktaların katkılarının <b>toplamı</b> (ortalama hata). Simülasyon\'daki Adım 3 ile aynı sayı.');
    src('lg_d1','∂E/∂Θ₁ — yaprakları topla','\\tfrac{\\partial E}{\\partial \\Theta_1}=\\textstyle\\sum_i \\tfrac{e_i x_i}{m}','\\tfrac{\\partial E}{\\partial \\Theta_1}='+c1.map(v=>tp(v,3)).join('+')+'=\\mathbf{'+t(d1,4)+'}',
      '💬 Eğim parametresi uzaktaki noktalardan (büyük x) daha çok etkilenir. Simülasyon\'daki Adım 3\'ün ikinci satırıyla aynı sayı.');
    src('lg_up','Θ güncelle','\\Theta:=\\Theta-\\alpha\\tfrac{\\partial E}{\\partial \\Theta}','\\begin{aligned}\\Theta_0&='+t(t0,3)+'-'+t(alpha,3)+'\\cdot'+tp(d0,4)+'=\\mathbf{'+t(t0-alpha*d0,4)+'}\\\\ \\Theta_1&='+t(t1,3)+'-'+t(alpha,3)+'\\cdot'+tp(d1,4)+'=\\mathbf{'+t(t1-alpha*d1,4)+'}\\end{aligned}',
      '💬 Gradyanın <b>ters yönünde</b>, α kadar küçük bir adım: maliyet düşer. Bu satırı tekrar tekrar uygulamak = gradyan alçalma.');
    const sm=$('linBigSum');if(sm)sm.innerHTML='Şu an: Θ₀ = <b>'+f(t0,4)+'</b>, Θ₁ = <b>'+f(t1,4)+'</b> · E = <b>'+f(E_,4)+'</b> · ∂E/∂Θ₀ = <b>'+f(d0,4)+'</b>, ∂E/∂Θ₁ = <b>'+f(d1,4)+'</b>. Simülasyon\'da ▶ / ⏭ ile ilerlet, burada her şeyin değiştiğini gör.';
  }
  window.__linBigRender=fill;
  fill();
})();
