// Self-Attention — "6️⃣ Bütün Resim": 3 kelimelik cümle, d=2. İleri yol: X → Q,K,V → skor → softmax → karışım Z → y → kayıp.
// Geri yayılım ağacı: L → y → z₃ → {V → W_V, A₃ → S₃ → {q₃ → W_Q, K → W_K}} + y → w. Yaprak = 4 ağırlık grubu.
// Çıktı katmanı: yalnız SON kelimenin Z satırı w ile skalara çevrilir (minik GPT'deki "yalnız son konum" ile aynı kurgu).
// Gradyanlar sonlu farkla doğrulandı (Python, |fark| < 1e-10). Pop-up'lar canlı sayılarla türetmeyi gösterir.
(function(){
  const host=document.getElementById('attBigMap'); if(!host) return;
  const $=id=>document.getElementById(id);
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>v<0?'('+t(v,d)+')':t(v,d);
  const setH=(id,h)=>{const e=$(id);if(e)e.innerHTML=h;};
  const W=['kedi','süt','içti'];
  const WQ=[[1.5,-0.8],[0.5,2.0]],WK=[[1.3,1.0],[-1.0,1.8]],WV=[[0.9,0.1],[-0.2,0.6]],WO=[0.7,-0.5];
  const X0=[[1.0,0.2],[0.1,0.9],[0.8,0.7]],T0=0.9;
  const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,v,k)=>s+v*B[k][j],0)));
  const tr=A=>A[0].map((_,j)=>A.map(r=>r[j]));
  const E=(cls,key,tex)=>'<span class="xt-edge '+cls+'" data-pop="'+key+'" tabindex="0" role="button" aria-label="türetmeyi göster">\\( '+tex+' \\)</span><span class="xt-ar">→</span>';
  const B=(cls,id,sym,cap)=>'<div class="xt-box '+cls+'" id="ab_'+id+'">'+sym+(cap?'<span class="xt-cap">'+cap+'</span>':'')+'<span class="xt-val" id="ab_'+id+'v">—</span></div>';
  const LF=(cls,id,sym)=>'<div class="xt-box '+cls+' yaprak" id="ab_'+id+'">'+sym+'<span class="xt-val" id="ab_'+id+'v">—</span></div>';
  const kid=(e,c)=>'<div class="xt-kid">'+e+c+'</div>';
  const node=(b,k)=>'<div class="xt-node">'+b+(k?'<div class="xt-kids">'+k+'</div>':'')+'</div>';
  const fbox=(cls,id,sym)=>'<div class="xf-box '+cls+'" id="af_'+id+'">'+sym+'<span class="xf-val" id="af_'+id+'v">—</span></div>';
  const fkol=(inner,ad)=>'<div class="xf-kol">'+inner+'<div class="xf-kolad">'+ad+'</div></div>';
  const fok=(key,tex)=>'<div class="xf-ok"><span class="xf-chip" data-pop="'+key+'" tabindex="0" role="button" aria-label="bu adımı anlat">\\( '+tex+' \\)</span><span class="xf-ar">→</span></div>';
  function srcEl(id){let e=document.getElementById('xtsrc-'+id);if(!e){e=document.createElement('div');e.className='xt-src';e.id='xtsrc-'+id;($('attSrc')||document.body).appendChild(e);}return e;}
  function src(id,title,eq,num,say){srcEl(id).innerHTML='<div class="xp-bas">'+title+'</div><div class="eq">\\( '+eq+' \\)</div>'+(num?'<div class="xp-hes">\\( '+num+' \\)</div>':'')+'<div class="xp-sat">'+say+'</div>';}
  const rowTxt=(a,d=2)=>'('+a.map(v=>f(v,d)).join(' ; ')+')';
  const matTxt=(M,d=2)=>M.map((r,i)=>'<span style="display:block">'+rowTxt(r,d)+'</span>').join('');

  host.innerHTML=
    '<div class="ptrow" style="margin-bottom:8px">'+W.map((w,i)=>'<div class="ptcell"><label>x<sub>'+(i+1)+'</sub> · '+w+' (2 sayı)</label><div style="display:flex;gap:4px"><input id="ab_x'+i+'_0" type="number" step="0.1" value="'+X0[i][0]+'"><input id="ab_x'+i+'_1" type="number" step="0.1" value="'+X0[i][1]+'"></div></div>').join('')+
      '<div class="ptcell"><label>hedef (t)</label><input id="ab_t" type="number" step="0.1" value="'+T0+'"></div></div>'+
    '<div class="xf-baslik">▶ İLERİ YOL — girdiler <span>(3 kelime × 2 sayı) → Q,K,V → skor → dikkat → karışım → çıktı → kayıp</span></div><div class="xf-scroll"><div class="xf-akis">'+
      fkol(W.map((w,i)=>fbox('gi','x'+i,'x<sub>'+(i+1)+'</sub>·'+w)).join(''),'girdi X')+fok('ab_f_qkv','\\cdot W_Q,\\,W_K,\\,W_V')+
      fkol(fbox('gh','Q','Q')+fbox('gh','K','K')+fbox('gh','V','V'),'sorgu · etiket · içerik')+fok('ab_f_s','QK^{\\top}/\\sqrt d')+
      fkol(fbox('gh','S','S'),'skor (3×3)')+fok('ab_f_a','\\mathrm{softmax}')+
      fkol(fbox('gh','A','A'),'dikkat yüzdeleri')+fok('ab_f_z','A\\cdot V')+
      fkol(fbox('gh','Z','Z'),'yeni temsiller')+fok('ab_f_y','z_3\\cdot w')+
      fkol(fbox('gy','y','y'),'çıktı (son kelime)')+fok('ab_f_l','\\tfrac12(y-t)^2')+fkol(fbox('gy','L','L'),'kayıp')+
    '</div></div>'+
    '<div class="xf-baslik" style="margin-top:8px">◀ GERİ YOL — kayıptan dört ağırlık grubuna <span>(oklara gel → türev; yaprak = gradyan)</span></div><div class="xt-scroll"><div class="xt-tree">'+
      node(B('g1 kok','L','L','kayıp'),
        kid(E('g1','ab_Ly','\\tfrac{\\partial L}{\\partial y}=y-t'),
          node(B('g1','y','y','∂L/∂y'),
            kid(E('g2','ab_yw','\\tfrac{\\partial y}{\\partial w}'),LF('g2','w','∂L/∂w'))+
            kid(E('g3','ab_yz','\\tfrac{\\partial y}{\\partial z_3}'),
              node(B('g3','z3','z<sub>3</sub>','∂L/∂z<sub>3</sub>'),
                kid(E('g4','ab_zV','\\tfrac{\\partial z_3}{\\partial V}'),
                  node(B('g4','V','V','∂L/∂V'),
                    kid(E('g4','ab_VW','\\tfrac{\\partial V}{\\partial W_V}'),LF('g4','WV','∂L/∂W<sub>V</sub>'))))+
                kid(E('g5','ab_zA','\\tfrac{\\partial z_3}{\\partial A_3}'),
                  node(B('g5','A3','A<sub>3</sub>','∂L/∂A<sub>3</sub>'),
                    kid(E('g5','ab_AS','\\tfrac{\\partial A_3}{\\partial S_3}'),
                      node(B('g5','S3','S<sub>3</sub>','∂L/∂S<sub>3</sub>'),
                        kid(E('g6','ab_Sq','\\tfrac{\\partial S_3}{\\partial q_3}'),
                          node(B('g6','q3','q<sub>3</sub>','∂L/∂q<sub>3</sub>'),
                            kid(E('g6','ab_qW','\\tfrac{\\partial q_3}{\\partial W_Q}'),LF('g6','WQ','∂L/∂W<sub>Q</sub>'))))+
                        kid(E('g7','ab_SK','\\tfrac{\\partial S_3}{\\partial K}'),
                          node(B('g7','K','K','∂L/∂K'),
                            kid(E('g7','ab_KW','\\tfrac{\\partial K}{\\partial W_K}'),LF('g7','WK','∂L/∂W<sub>K</sub>'))))))))))))) +
    '</div></div><div class="callout" id="abVerdict" style="margin-top:8px"></div>';
  host.querySelectorAll('input').forEach(i=>i.addEventListener('input',fill));

  function fill(){
    const X=[0,1,2].map(i=>[0,1].map(k=>parseFloat($('ab_x'+i+'_'+k).value)||0)),tg=parseFloat($('ab_t').value)||0,d=2,sd=Math.sqrt(d);
    const Q=mm(X,WQ),K=mm(X,WK),V=mm(X,WV);
    const S=Q.map(q=>K.map(k=>(q[0]*k[0]+q[1]*k[1])/sd));
    const A=S.map(r=>{const m=Math.max(...r),e=r.map(v=>Math.exp(v-m)),s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s);});
    const Z=mm(A,V),z3=Z[2],y=z3[0]*WO[0]+z3[1]*WO[1],L=0.5*(y-tg)*(y-tg);
    const e=y-tg,dw=[e*z3[0],e*z3[1]],dz=[e*WO[0],e*WO[1]];
    const a3=A[2],dV=a3.map(a=>[a*dz[0],a*dz[1]]);
    const dA=V.map(v=>dz[0]*v[0]+dz[1]*v[1]);
    const sm=a3.reduce((s,a,j)=>s+a*dA[j],0),dS=a3.map((a,j)=>a*(dA[j]-sm));
    const dq=[0,1].map(k=>K.reduce((s,kk,j)=>s+dS[j]*kk[k],0)/sd);
    const dK=K.map((_,j)=>[dS[j]*Q[2][0]/sd,dS[j]*Q[2][1]/sd]);
    const dWV=mm(tr(X),dV),dWK=mm(tr(X),dK),dWQ=[0,1].map(a=>[0,1].map(b=>X[2][a]*dq[b]));
    // ileri kutular
    X.forEach((x,i)=>setH('af_x'+i+'v',rowTxt(x,2)));
    setH('af_Qv',matTxt(Q));setH('af_Kv',matTxt(K));setH('af_Vv',matTxt(V));setH('af_Sv',matTxt(S));setH('af_Av',matTxt(A,2));setH('af_Zv',matTxt(Z));
    setH('af_yv',f(y,3));setH('af_Lv',f(L,4));
    // geri kutular
    setH('ab_Lv',f(L,4));setH('ab_yv',f(e,3));setH('ab_wv',rowTxt(dw,3));setH('ab_z3v',rowTxt(dz,3));
    setH('ab_Vv',matTxt(dV,3));setH('ab_A3v',rowTxt(dA,3));setH('ab_S3v',rowTxt(dS,3));setH('ab_q3v',rowTxt(dq,3));setH('ab_Kv',matTxt(dK,3));
    setH('ab_WVv',matTxt(dWV,3));setH('ab_WQv',matTxt(dWQ,3));setH('ab_WKv',matTxt(dWK,3));
    // ---- pop-up kaynakları ----
    const v2=a=>'\\begin{pmatrix}'+t(a[0],3)+'\\\\'+t(a[1],3)+'\\end{pmatrix}';
    const r2=a=>'\\begin{pmatrix}'+t(a[0],3)+'&'+t(a[1],3)+'\\end{pmatrix}';
    const r3=a=>'\\begin{pmatrix}'+a.map(v=>t(v,3)).join('&')+'\\end{pmatrix}';
    const m2=M=>'\\begin{pmatrix}'+M.map(r=>r.map(v=>t(v,3)).join('&')).join('\\\\')+'\\end{pmatrix}';
    // ileri
    src('ab_f_qkv','Q, K, V — girdiden üç ayrı rol','Q=XW_Q,\\quad K=XW_K,\\quad V=XW_V',
      'q_3=x_3W_Q='+r2(X[2])+m2(WQ)+'='+r2(Q[2]),
      '💬 Her kelimenin vektörü <b>üç ayrı öğrenilmiş matrisle</b> çarpılır: sorgu (Q), etiket (K), içerik (V). Burada W\'ler elle seçildi (gerçekte eğitimle bulunur). Örnek: <b>'+W[2]+'</b> kelimesinin sorgusu q<sub>3</sub> = '+rowTxt(Q[2],3)+'.');
    src('ab_f_s','Skor — kim kime uyuyor','S_{ij}=\\dfrac{q_i\\cdot k_j}{\\sqrt d}',
      'S_{31}=\\dfrac{'+t(Q[2][0],3)+'\\cdot'+tp(K[0][0],3)+'+'+t(Q[2][1],3)+'\\cdot'+tp(K[0][1],3)+'}{\\sqrt2}='+t(S[2][0],3),
      '💬 q<sub>i</sub> ile k<sub>j</sub> nokta çarpımı = i. kelimenin j. kelimeye ne kadar uyduğu; √d=√2 ile bölünür (🌡️ termostat). Son satır: '+rowTxt(S[2],3)+'.');
    src('ab_f_a','Softmax — her satır yüzdeye','A_{ij}=\\dfrac{e^{S_{ij}}}{\\sum_k e^{S_{ik}}}',
      'A_{3\\cdot}=\\mathrm{softmax}('+t(S[2][0],3)+',\\,'+t(S[2][1],3)+',\\,'+t(S[2][2],3)+')=('+a3.map(v=>t(v,3)).join(',\\,')+')',
      '💬 Her satır kendi içinde yüzdeye çevrilir (toplamı 1). <b>'+W[2]+'</b> dikkatinin <b>%'+Math.round(a3[0]*100)+'\'ini '+W[0]+'</b>, %'+Math.round(a3[1]*100)+'\'ini '+W[1]+', %'+Math.round(a3[2]*100)+'\'ini kendine veriyor.');
    src('ab_f_z','Karışım — yüzdelerle içerik toplamı','Z=A\\,V,\\qquad z_3=\\sum_j A_{3j}\\,v_j',
      'z_3='+t(a3[0],3)+r2(V[0])+'+'+t(a3[1],3)+r2(V[1])+'+'+t(a3[2],3)+r2(V[2])+'='+r2(z3),
      '💬 <b>'+W[2]+'</b>\'nin yeni temsili: üç kelimenin içeriğinden (V) dikkat yüzdesiyle karışım. Girdideki x<sub>3</sub> artık <b>bağlamla zenginleşmiş</b> z<sub>3</sub> = '+rowTxt(z3,3)+'.');
    src('ab_f_y','Çıktı katmanı — son kelime skaler çıktıya','y=z_3\\cdot w=z_{31}w_1+z_{32}w_2',
      'y='+t(z3[0],3)+'\\cdot'+t(WO[0],1)+'+'+t(z3[1],3)+'\\cdot'+tp(WO[1],1)+'='+t(y,3),
      '💬 Küçük bir çıktı katmanı (w = ('+f(WO[0],1)+' ; '+f(WO[1],1)+')) yalnız <b>son kelimenin</b> z<sub>3</sub>\'ünü tek sayıya çevirir. Bu, bir dil modelinin "son konumdan sonraki kelimeyi tahmin et" kurgusunun minik hâli.');
    src('ab_f_l','Kayıp — hedefe uzaklık','L=\\tfrac12\\,(y-t)^2',
      'L=\\tfrac12('+t(y,3)+'-'+t(tg,2)+')^2=\\tfrac12('+tp(e,3)+')^2='+t(L,4),
      '💬 Çıktı y hedef t\'den ne kadar uzaksa kayıp o kadar büyük. Geri yayılım bu sayıyı küçültmek için her ağırlığın <b>hangi yöne ne kadar</b> oynaması gerektiğini bulur.');
    // geri
    src('ab_Ly','∂L/∂y — kaybın çıktıya türevi','\\dfrac{\\partial L}{\\partial y}=y-t',
      'y-t='+t(y,3)+'-'+t(tg,2)+'=\\mathbf{'+t(e,3)+'}',
      '💬 K2 (kuvvet kuralı) ve ½\'nin sadeleşmesi. Negatif: çıktıyı <b>artırmak</b> kaybı düşürür. <br>🔗 Bu sayı (<b>'+f(e,3)+'</b>) ağacın geri kalanında her adımda çarpan olarak taşınacak.');
    src('ab_yw','∂y/∂w — çıktı ağırlığı (yaprak)','\\dfrac{\\partial L}{\\partial w_k}=e\\cdot z_{3k}',
      '\\dfrac{\\partial L}{\\partial w}='+tp(e,3)+r2(z3)+'=\\mathbf{'+r2(dw)+'}',
      '💬 y = z<sub>31</sub>w<sub>1</sub>+z<sub>32</sub>w<sub>2</sub> → ∂y/∂w<sub>k</sub> = z<sub>3k</sub>. <br>🔗 <b>Gradyan:</b> e × z<sub>3</sub> = '+rowTxt(dw,3)+' — bu bir <b>yaprak</b>; w bu yönün tersine itilir.');
    src('ab_yz','∂y/∂z₃ — çıktıdan son kelimenin temsiline','\\dfrac{\\partial L}{\\partial z_3}=e\\cdot w',
      '\\dfrac{\\partial L}{\\partial z_3}='+tp(e,3)+r2(WO)+'=\\mathbf{'+r2(dz)+'}',
      '💬 y = z<sub>3</sub>·w → ∂y/∂z<sub>3k</sub> = w<sub>k</sub>. <br>🔗 Sinyal artık <b>attention katmanının içine</b> giriyor: z<sub>3</sub> iki yoldan oluşmuştu — içerikler (V) ve yüzdeler (A). Ağaç burada ikiye dallanır.');
    src('ab_zV','∂z₃/∂V — karışımdan içeriklere','\\dfrac{\\partial L}{\\partial v_j}=A_{3j}\\cdot\\dfrac{\\partial L}{\\partial z_3}',
      [0,1,2].map(j=>'\\dfrac{\\partial L}{\\partial v_{'+(j+1)+'}}='+t(a3[j],3)+r2(dz)+'='+r2(dV[j])).join(',\\ '),
      '💬 z<sub>3</sub> = Σ A<sub>3j</sub>·v<sub>j</sub> → her içeriğin payı kadar sinyal alır: <b>çok dikkat verdiğin kelimenin V\'si çok öğrenir</b> ('+W[0]+': %'+Math.round(a3[0]*100)+', '+W[1]+': %'+Math.round(a3[1]*100)+').<br>🔗 Sonraki halka V = X·W_V → gradyan üç kelimeden toplanır.');
    src('ab_VW','∂V/∂W_V — içerik matrisinin gradyanı (yaprak)','\\dfrac{\\partial L}{\\partial W_V}=X^{\\top}\\,\\dfrac{\\partial L}{\\partial V}',
      '\\dfrac{\\partial L}{\\partial W_{V,11}}=\\sum_j x_{j1}\\,dV_{j1}='+t(X[0][0],2)+tp(dV[0][0],3)+'+'+t(X[1][0],2)+tp(dV[1][0],3)+'+'+t(X[2][0],2)+tp(dV[2][0],3)+'='+t(dWV[0][0],3)+'\\ \\Rightarrow\\ '+m2(dWV),
      '💬 V = X·W_V olduğundan W_V\'nin her hücresi, <b>üç kelimenin</b> girdisi × o kelimenin V gradyanının <b>toplamı</b>dır (aynı W üç kez kullanıldı). <br>🔗 <b>Yaprak:</b> bu 2×2 matris W<sub>V</sub>\'yi güncelleyecek gradyan.');
    src('ab_zA','∂z₃/∂A₃ — karışımdan yüzdelere','\\dfrac{\\partial L}{\\partial A_{3j}}=\\dfrac{\\partial L}{\\partial z_3}\\cdot v_j',
      [0,1,2].map(j=>'dA_{3'+(j+1)+'}='+t(dz[0],3)+'\\cdot'+tp(V[j][0],3)+'+'+tp(dz[1],3)+'\\cdot'+tp(V[j][1],3)+'='+t(dA[j],3)).join(',\\ '),
      '💬 z<sub>3</sub> = Σ A<sub>3j</sub>·v<sub>j</sub> → ∂z<sub>3</sub>/∂A<sub>3j</sub> = v<sub>j</sub>: yüzde j\'yi artırmak çıktıyı v<sub>j</sub> yönüne iter; bu yön hataya iyi geliyorsa gradyan <b>negatif</b>dir.<br>🔗 Şimdi yüzdelerin kendisi softmax\'ten çıktı — onların arkasındaki skorlara gideceğiz.');
    src('ab_AS','∂A₃/∂S₃ — softmax\'in türevi','\\dfrac{\\partial L}{\\partial S_{3j}}=A_{3j}\\Big(dA_{3j}-\\sum_k A_{3k}\\,dA_{3k}\\Big)',
      '\\sum_kA_{3k}dA_{3k}='+t(sm,4)+'\\ \\Rightarrow\\ dS_3='+r3(dS),
      '💬 Softmax\'te bir skoru artırmak <b>diğer yüzdeleri düşürür</b>, bu yüzden her sinyal, satırın <b>ağırlıklı ortalamasından</b> ('+f(sm,3)+') farkıyla ölçülür: <br>'+[0,1,2].map(j=>'dS<sub>3'+(j+1)+'</sub> = '+f(a3[j],3)+'·('+f(dA[j],3)+' − ('+f(sm,3)+')) = <b>'+f(dS[j],3)+'</b>').join('<br>')+'<br>🔗 Skor S<sub>3j</sub> = q<sub>3</sub>·k<sub>j</sub>/√2 olduğundan sinyal şimdi hem q<sub>3</sub>\'e hem k<sub>j</sub>\'lere dağılacak.');
    src('ab_Sq','∂S₃/∂q₃ — skordan sorguya','\\dfrac{\\partial L}{\\partial q_3}=\\dfrac{1}{\\sqrt d}\\sum_j dS_{3j}\\,k_j',
      'dq_3=\\tfrac{1}{\\sqrt2}\\big('+tp(dS[0],3)+r2(K[0])+'+'+tp(dS[1],3)+r2(K[1])+'+'+tp(dS[2],3)+r2(K[2])+'\\big)='+r2(dq),
      '💬 S<sub>3j</sub> = q<sub>3</sub>·k<sub>j</sub>/√2 → ∂S<sub>3j</sub>/∂q<sub>3</sub> = k<sub>j</sub>/√2. Sorgu, <b>hedefe uyan etiketlere doğru</b> kaydırılmak ister. <br>🔗 q<sub>3</sub> = x<sub>3</sub>·W<sub>Q</sub> → W<sub>Q</sub> gradyanı bir dış çarpım.');
    src('ab_qW','∂q₃/∂W_Q — sorgu matrisinin gradyanı (yaprak)','\\dfrac{\\partial L}{\\partial W_Q}=x_3^{\\top}\\,dq_3',
      '\\dfrac{\\partial L}{\\partial W_Q}='+v2(X[2])+r2(dq)+'='+m2(dWQ),
      '💬 q<sub>3</sub> = x<sub>3</sub>·W<sub>Q</sub>: bu hücre yalnız <b>x<sub>3</sub></b>\'ten besleniyor. <br>🔗 <b>Önemli:</b> kayıp yalnız <b>son kelimenin</b> çıktısına bağlı olduğu için q<sub>1</sub> ve q<sub>2</sub> hiç kullanılmadı — W<sub>Q</sub> gradyanına <b>sadece son kelime</b> katkı veriyor (K ve V\'de ise üç kelime de katkı verir).');
    src('ab_SK','∂S₃/∂K — skordan etiketlere','\\dfrac{\\partial L}{\\partial k_j}=\\dfrac{dS_{3j}}{\\sqrt d}\\;q_3',
      [0,1,2].map(j=>'dk_{'+(j+1)+'}=\\tfrac{'+t(dS[j],3)+'}{\\sqrt2}'+r2(Q[2])+'='+r2(dK[j])).join(',\\ '),
      '💬 S<sub>3j</sub> = q<sub>3</sub>·k<sub>j</sub>/√2 → ∂S<sub>3j</sub>/∂k<sub>j</sub> = q<sub>3</sub>/√2. Her etiket, <b>kendi skor sinyali</b> kadar q<sub>3</sub> yönünde itilir.<br>🔗 K = X·W<sub>K</sub> → gradyan üç kelimeden toplanır (V\'dekiyle aynı mantık).');
    src('ab_KW','∂K/∂W_K — etiket matrisinin gradyanı (yaprak)','\\dfrac{\\partial L}{\\partial W_K}=X^{\\top}\\,dK',
      '\\dfrac{\\partial L}{\\partial W_{K,11}}=\\sum_j x_{j1}\\,dK_{j1}='+t(X[0][0],2)+tp(dK[0][0],3)+'+'+t(X[1][0],2)+tp(dK[1][0],3)+'+'+t(X[2][0],2)+tp(dK[2][0],3)+'='+t(dWK[0][0],3)+'\\ \\Rightarrow\\ '+m2(dWK),
      '💬 Aynı W<sub>K</sub> her kelimenin etiketini üretti; gradyanı da üç kelimenin <b>toplamı</b>. <br>🔗 <b>Yaprak:</b> dört ağırlık grubunun (w, W<sub>V</sub>, W<sub>Q</sub>, W<sub>K</sub>) hepsi bulundu.');
    const big=[['W_V',dWV],['W_Q',dWQ],['W_K',dWK]].map(([n,M])=>[n,Math.max(...M.flat().map(Math.abs))]);
    $('abVerdict').innerHTML='🔑 <b>Dört yaprak, tek kayıp:</b> en büyük gradyan <b>W<sub>V</sub></b>\'de ('+f(big[0][1],3)+'); <b>W<sub>Q</sub></b>\'da '+f(big[1][1],3)+', <b>W<sub>K</sub></b>\'da '+f(big[2][1],3)+' — Q ve K\'ya sinyal <b>softmax\'ten geçerek</b> ulaştığı için daha zayıf ve dolaylı. Kayıp yalnız son kelimenin çıktısına bağlı olduğundan <b>q<sub>1</sub>, q<sub>2</sub> gradyan almaz</b>; K ve V ise üç kelimeden de sinyal toplar.';
    window.__attBig={X,t:tg,Q,K,V,S,A,Z,y,L,e,dw,dz,dV,dA,dS,dq,dK,dWV,dWK,dWQ};
  }
  const M=window.MathJax;fill();
  if(M&&M.startup&&M.startup.promise)M.startup.promise.then(()=>M.typesetPromise&&M.typesetPromise([host]).catch(()=>{}));
})();
