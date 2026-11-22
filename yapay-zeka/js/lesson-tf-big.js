// Transformer Bloğu — "6️⃣ Bütün Resim": TEK bir blok (attention → +residual → LayerNorm → FFN → +residual → LayerNorm).
// 3 kelime × 4 sayı, tek kafa, FFN 4→6→4 (ReLU), γ=1 β=0. Çıktı yalnız SON kelimeden. İleri yol + geri yayılım ağacı:
// L → y → {w, n₂ → r₂ → {FFN yolu: F → {W₂, b₂, g → u → {W₁, b₁, n₁'e pay}}, kestirme: n₁ → r₁ → {kestirme: x₃, attention yolu: A₁ → {W_O, Z → {W_V, W_Q, W_K}}}}}.
// Yeni halkalar: LayerNorm'un türevi ve residual'ın "iki yoldan topla" davranışı. Gradyanlar sonlu farkla doğrulandı (Python |fark|≈7e-10).
(function(){
  const host=document.getElementById('tfBigMap'); if(!host) return;
  const $=id=>document.getElementById(id);
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>v<0?'('+t(v,d)+')':t(v,d);
  const setH=(id,h)=>{const e=$(id);if(e)e.innerHTML=h;};
  const W=['kedi','süt','içti'],D=4,FF=6,EPS=1e-5;
  const lcg=s=>{let st=s;return()=>{st=(st*1664525+1013904223)%4294967296;return st/4294967296;};};
  const rast=(a,b,s,o)=>{const r=lcg(s);return Array.from({length:a},()=>Array.from({length:b},()=>(r()*2-1)*o));};
  const WQ=rast(D,D,1,0.8),WK=rast(D,D,2,0.8),WV=rast(D,D,3,0.8),WO=rast(D,D,4,0.8),W1=rast(D,FF,5,0.8),W2=rast(FF,D,6,0.8);
  const B1=Array(FF).fill(0.1),B2=Array(D).fill(0),WOUT=[0.7,-0.5,0.6,0.4];
  const X0=[[1.0,0.2,0.5,-0.3],[0.1,0.9,-0.4,0.6],[0.8,0.7,0.3,0.2]],T0=0.9;
  const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,v,k)=>s+v*B[k][j],0)));
  const tr=A=>A[0].map((_,j)=>A.map(r=>r[j]));
  const ln=v=>{const mu=v.reduce((a,b)=>a+b,0)/v.length,va=v.reduce((a,b)=>a+(b-mu)*(b-mu),0)/v.length,s=Math.sqrt(va+EPS);return {n:v.map(a=>(a-mu)/s),s,mu};};
  const lnBack=(v,dn)=>{const {n,s}=ln(v),a=dn.reduce((x,y)=>x+y,0)/dn.length,b=dn.reduce((x,y,k)=>x+y*n[k],0)/dn.length;return dn.map((x,k)=>(x-a-n[k]*b)/s);};
  const E=(cls,key,tex)=>'<span class="xt-edge '+cls+'" data-pop="'+key+'" tabindex="0" role="button" aria-label="türetmeyi göster">\\( '+tex+' \\)</span><span class="xt-ar">→</span>';
  const B=(cls,id,sym,cap)=>'<div class="xt-box '+cls+'" id="tb_'+id+'">'+sym+(cap?'<span class="xt-cap">'+cap+'</span>':'')+'<span class="xt-val" id="tb_'+id+'v">—</span></div>';
  const LF=(cls,id,sym)=>'<div class="xt-box '+cls+' yaprak" id="tb_'+id+'">'+sym+'<span class="xt-val" id="tb_'+id+'v">—</span></div>';
  const kid=(e,c)=>'<div class="xt-kid">'+e+c+'</div>';
  const node=(b,k)=>'<div class="xt-node">'+b+(k?'<div class="xt-kids">'+k+'</div>':'')+'</div>';
  const fbox=(cls,id,sym)=>'<div class="xf-box '+cls+'" id="tf_'+id+'">'+sym+'<span class="xf-val" id="tf_'+id+'v">—</span></div>';
  const fkol=(inner,ad)=>'<div class="xf-kol">'+inner+'<div class="xf-kolad">'+ad+'</div></div>';
  const fok=(key,tex)=>'<div class="xf-ok"><span class="xf-chip" data-pop="'+key+'" tabindex="0" role="button" aria-label="bu adımı anlat">\\( '+tex+' \\)</span><span class="xf-ar">→</span></div>';
  function srcEl(id){let e=document.getElementById('xtsrc-'+id);if(!e){e=document.createElement('div');e.className='xt-src';e.id='xtsrc-'+id;($('tfSrc')||document.body).appendChild(e);}return e;}
  function src(id,title,eq,num,say){srcEl(id).innerHTML='<div class="xp-bas">'+title+'</div><div class="eq">\\( '+eq+' \\)</div>'+(num?'<div class="xp-hes">\\( '+num+' \\)</div>':'')+'<div class="xp-sat">'+say+'</div>';}
  const rowTxt=(a,d=2)=>'('+a.map(v=>f(v,d)).join(' ; ')+')';
  const matTxt=(M,d=2)=>M.map(r=>'<span style="display:block">'+rowTxt(r,d)+'</span>').join('');
  const rowN=a=>'\\begin{pmatrix}'+a.map(v=>t(v,3)).join('&')+'\\end{pmatrix}';
  const norm=M=>Math.sqrt(M.flat().reduce((s,v)=>s+v*v,0));
  const summ=M=>{const fl=M.flat();return '‖∇‖ = '+f(norm(M),3)+'<span style="display:block;font-size:11px;opacity:.8">en büyük |g| = '+f(Math.max(...fl.map(Math.abs)),3)+'</span>';};
  const mtab=(M,d=3)=>'<div style="font-family:ui-monospace,Menlo,monospace;font-size:11.5px;white-space:pre;overflow-x:auto;background:#0e1424;border:1px solid var(--line);border-radius:6px;padding:4px 6px;margin:4px 0">'+M.map(r=>(Array.isArray(r)?r:[r]).map(v=>f(v,d).padStart(d+4)).join(' ')).join('\n')+'</div>';

  host.innerHTML=
    '<div class="ptrow" style="margin-bottom:8px">'+W.map((w,i)=>'<div class="ptcell"><label>x<sub>'+(i+1)+'</sub> · '+w+' (4 sayı)</label><div style="display:flex;gap:3px">'+[0,1,2,3].map(k=>'<input id="tb_x'+i+'_'+k+'" type="number" step="0.1" value="'+X0[i][k]+'" style="width:56px">').join('')+'</div></div>').join('')+
      '<div class="ptcell"><label>hedef (t)</label><input id="tb_t" type="number" step="0.1" value="'+T0+'"></div></div>'+
    '<div class="xf-baslik">▶ İLERİ YOL — <b>tek blok</b> <span>girdi → attention → <b>+ girdi</b> → LayerNorm → FFN → <b>+ LN çıktısı</b> → LayerNorm → çıktı → kayıp</span></div><div class="xf-scroll"><div class="xf-akis">'+
      fkol(fbox('gi','X','X'),'girdi (3×4)')+fok('tb_f_at','\\mathrm{Attention}\\cdot W_O')+
      fkol(fbox('gh','A1','A₁'),'attention çıktısı')+fok('tb_f_r1','+\\,X')+
      fkol(fbox('gh','r1','r₁'),'residual 1')+fok('tb_f_l1','\\mathrm{LayerNorm}')+
      fkol(fbox('gh','n1','n₁'),'normalize')+fok('tb_f_ff','\\mathrm{FFN}')+
      fkol(fbox('gh','F','F'),'FFN çıktısı')+fok('tb_f_r2','+\\,n_1')+
      fkol(fbox('gh','r2','r₂'),'residual 2')+fok('tb_f_l2','\\mathrm{LayerNorm}')+
      fkol(fbox('gh','n2','n₂'),'bloğun çıktısı')+fok('tb_f_y','n_{2,3}\\cdot w')+
      fkol(fbox('gy','y','y'),'çıktı (son kelime)')+fok('tb_f_l','\\tfrac12(y-t)^2')+fkol(fbox('gy','L','L'),'kayıp')+
    '</div></div>'+
    '<div class="xf-baslik" style="margin-top:8px">◀ GERİ YOL — kayıptan dokuz ağırlık grubuna <span>(oklara gel; yeni halkalar: <b>LayerNorm'+"'"+'un türevi</b> ve <b>residual'+"'"+'da iki yoldan toplama</b>)</span></div><div class="xt-scroll"><div class="xt-tree">'+
      node(B('g1 kok','L','L','kayıp'),
        kid(E('g1','tb_Ly','\\tfrac{\\partial L}{\\partial y}=y-t'),
          node(B('g1','y','y','∂L/∂y'),
            kid(E('g2','tb_yw','\\tfrac{\\partial y}{\\partial w}'),LF('g2','w','∂L/∂w'))+
            kid(E('g3','tb_yn2','\\tfrac{\\partial y}{\\partial n_2}'),
              node(B('g3','n2','n₂','∂L/∂n₂'),
                kid(E('g3','tb_ln2','\\tfrac{\\partial n_2}{\\partial r_2}'),
                  node(B('g3','r2','r₂','∂L/∂r₂'),
                    kid(E('g4','tb_r2F','\\tfrac{\\partial r_2}{\\partial F}=1'),
                      node(B('g4','F','F','∂L/∂F (FFN yolu)'),
                        kid(E('g4','tb_FW2','\\tfrac{\\partial F}{\\partial W_2}'),LF('g4','W2','∂L/∂W<sub>2</sub>'))+
                        kid(E('g4','tb_Fb2','\\tfrac{\\partial F}{\\partial b_2}'),LF('g4','b2','∂L/∂b<sub>2</sub>'))+
                        kid(E('g5','tb_Fg','\\tfrac{\\partial F}{\\partial g}'),
                          node(B('g5','g','g','∂L/∂g'),
                            kid(E('g5','tb_gu','\\tfrac{\\partial g}{\\partial u}\\ (\\mathrm{ReLU})'),
                              node(B('g5','u','u','∂L/∂u'),
                                kid(E('g5','tb_uW1','\\tfrac{\\partial u}{\\partial W_1}'),LF('g5','W1','∂L/∂W<sub>1</sub>'))+
                                kid(E('g5','tb_ub1','\\tfrac{\\partial u}{\\partial b_1}'),LF('g5','b1','∂L/∂b<sub>1</sub>'))+
                                kid(E('g5','tb_un1','\\tfrac{\\partial u}{\\partial n_1}'),LF('g5','n1f','n₁\'e FFN payı'))))))))+
                    kid(E('g6','tb_r2n','\\tfrac{\\partial r_2}{\\partial n_1}=1\\ \\text{(kestirme)}'),
                      node(B('g6','n1','n₁','∂L/∂n₁ = kestirme + FFN payı'),
                        kid(E('g6','tb_ln1','\\tfrac{\\partial n_1}{\\partial r_1}'),
                          node(B('g6','r1','r₁','∂L/∂r₁'),
                            kid(E('g7','tb_r1X','\\tfrac{\\partial r_1}{\\partial X}=1\\ \\text{(kestirme)}'),LF('g7','x3','x₃\'e kestirme pay'))+
                            kid(E('g7','tb_r1A','\\tfrac{\\partial r_1}{\\partial A_1}=1'),
                              node(B('g7','A1','A₁','∂L/∂A₁ (attention yolu)'),
                                kid(E('g8','tb_AWO','\\tfrac{\\partial A_1}{\\partial W_O}'),LF('g8','WO','∂L/∂W<sub>O</sub>'))+
                                kid(E('g8','tb_AZ','\\tfrac{\\partial A_1}{\\partial Z}'),
                                  node(B('g8','Z','z₃','∂L/∂z₃'),
                                    kid(E('g9','tb_ZV','\\tfrac{\\partial z_3}{\\partial W_V}'),LF('g9','WV','∂L/∂W<sub>V</sub>'))+
                                    kid(E('g9','tb_ZQ','\\tfrac{\\partial z_3}{\\partial W_Q}'),LF('g9','WQ','∂L/∂W<sub>Q</sub>'))+
                                    kid(E('g9','tb_ZK','\\tfrac{\\partial z_3}{\\partial W_K}'),LF('g9','WK','∂L/∂W<sub>K</sub>')))))))))))))))))+
    '</div></div><div class="callout" id="tbVerdict" style="margin-top:8px"></div>';
  host.querySelectorAll('input').forEach(i=>i.addEventListener('input',fill));

  function fill(){
    const X=[0,1,2].map(i=>[0,1,2,3].map(k=>parseFloat($('tb_x'+i+'_'+k).value)||0)),tg=parseFloat($('tb_t').value)||0,sd=Math.sqrt(D);
    const Q=mm(X,WQ),K=mm(X,WK),V=mm(X,WV);
    const S=Q.map(q=>K.map(k=>q.reduce((s,v,i)=>s+v*k[i],0)/sd));
    const A=S.map(r=>{const m=Math.max(...r),e=r.map(v=>Math.exp(v-m)),s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s);});
    const Z=mm(A,V),A1=mm(Z,WO),r1=X.map((r,i)=>r.map((v,k)=>v+A1[i][k])),L1=r1.map(ln),n1=L1.map(o=>o.n);
    const u=n1.map(r=>B1.map((b,j)=>r.reduce((s,v,a)=>s+v*W1[a][j],0)+b)),g=u.map(r=>r.map(v=>Math.max(0,v)));
    const Fo=g.map(r=>B2.map((b,k)=>r.reduce((s,v,j)=>s+v*W2[j][k],0)+b)),r2=n1.map((r,i)=>r.map((v,k)=>v+Fo[i][k])),L2=r2.map(ln),n2=L2.map(o=>o.n);
    const y=n2[2].reduce((s,v,k)=>s+v*WOUT[k],0),L=0.5*(y-tg)*(y-tg),e=y-tg;
    const dw=n2[2].map(v=>e*v),dn2=WOUT.map(v=>e*v),dr2=lnBack(r2[2],dn2),dF=dr2;
    const dg=g[0].map((_,j)=>dF.reduce((s,v,k)=>s+v*W2[j][k],0)),dW2=g[2].map(v=>dF.map(d=>v*d)),db2=dF;
    const du=dg.map((v,j)=>u[2][j]>0?v:0),dW1=n1[2].map(v=>du.map(d=>v*d)),db1=du;
    const dn1f=[0,1,2,3].map(a=>du.reduce((s,v,j)=>s+v*W1[a][j],0)),dn1=dr2.map((v,k)=>v+dn1f[k]);
    const dr1=lnBack(r1[2],dn1),dA1=dr1,dWO=Z[2].map(v=>dA1.map(d=>v*d)),dZ=[0,1,2,3].map(a=>dA1.reduce((s,v,b)=>s+v*WO[a][b],0));
    const a3=A[2],dV=a3.map(a=>dZ.map(d=>a*d)),dA=V.map(v=>dZ.reduce((s,d,k)=>s+d*v[k],0));
    const sm=a3.reduce((s,a,j)=>s+a*dA[j],0),dS=a3.map((a,j)=>a*(dA[j]-sm));
    const dq=[0,1,2,3].map(k=>K.reduce((s,kk,j)=>s+dS[j]*kk[k],0)/sd),dK=K.map((_,j)=>Q[2].map(q=>dS[j]*q/sd));
    const dWV=mm(tr(X),dV),dWK=mm(tr(X),dK),dWQ=X[2].map(v=>dq.map(d=>v*d));
    // ileri kutular
    setH('tf_Xv',matTxt(X,1));setH('tf_A1v',matTxt(A1));setH('tf_r1v',matTxt(r1));setH('tf_n1v',matTxt(n1));setH('tf_Fv',matTxt(Fo));setH('tf_r2v',matTxt(r2));setH('tf_n2v',matTxt(n2));setH('tf_yv',f(y,3));setH('tf_Lv',f(L,4));
    // geri kutular
    setH('tb_Lv',f(L,4));setH('tb_yv',f(e,3));setH('tb_wv',rowTxt(dw,3));setH('tb_n2v',rowTxt(dn2,3));setH('tb_r2v',rowTxt(dr2,3));setH('tb_Fv',rowTxt(dF,3));
    setH('tb_W2v',summ(dW2));setH('tb_b2v',rowTxt(db2,3));setH('tb_gv',rowTxt(dg,3));setH('tb_uv',rowTxt(du,3));setH('tb_W1v',summ(dW1));setH('tb_b1v',rowTxt(db1,3));setH('tb_n1fv',rowTxt(dn1f,3));
    setH('tb_n1v',rowTxt(dn1,3));setH('tb_r1v',rowTxt(dr1,3));setH('tb_x3v',rowTxt(dr1,3));setH('tb_A1v',rowTxt(dA1,3));setH('tb_WOv',summ(dWO));setH('tb_Zv',rowTxt(dZ,3));
    setH('tb_WVv',summ(dWV));setH('tb_WQv',summ(dWQ));setH('tb_WKv',summ(dWK));
    // ---- ileri pop-up'lar ----
    src('tb_f_at','Attention + W_O','A_1=\\mathrm{Attention}(X)\\,W_O=Z\\,W_O',
      'z_3='+rowN(Z[2])+'\\ \\Rightarrow\\ A_{1,3}=z_3W_O='+rowN(A1[2]),
      '💬 Önceki derslerin bütün işi (🎯 Q/K/V, skor, softmax, karışım; 🧩 W<sub>O</sub>) bu <b>tek oka</b> sığıyor: her kelime diğerlerinden bilgi çekip yeni bir vektör (A₁) üretti. Son kelimenin dikkat payları: '+rowTxt(a3,2)+'.');
    src('tb_f_r1','Residual 1 — girdiyi aynen geç, üstüne düzeltmeyi ekle','r_1=X+A_1',
      'r_{1,3}='+rowN(X[2])+'+'+rowN(A1[2])+'='+rowN(r1[2]),
      '💬 Attention\'ın çıktısı girdinin <b>yerine geçmiyor</b>, onun üstüne <b>eklenir</b>. Kelime kendi özgün bilgisini (x) korur, attention yalnızca bir <b>düzeltme</b> (A₁) ekler. Geri yolda bu toplama gradyanı <b>iki yola birden</b> dağıtır.');
    src('tb_f_l1','LayerNorm 1 — kelimenin sayılarını hizala','n=\\dfrac{r-\\mu}{\\sqrt{\\sigma^2+\\epsilon}}\\quad(\\gamma=1,\\ \\beta=0)',
      '\\mu='+t(L1[2].mu,3)+',\\ \\sigma='+t(L1[2].s,3)+'\\ \\Rightarrow\\ n_{1,3}='+rowN(n1[2]),
      '💬 <b>Tek bir kelimenin</b> 4 sayısı alınır: ortalama (μ = '+f(L1[2].mu,3)+') çıkarılır, standart sapmaya (σ = '+f(L1[2].s,3)+') bölünür → ortalaması 0, yayılımı 1. (Gerçek modelde ardından öğrenilen γ ve β gelir; burada γ=1, β=0 sabit.)');
    src('tb_f_ff','FFN — her kelimeyi ayrı ayrı derinleştir','F=\\max(0,\\,n_1W_1+b_1)\\,W_2+b_2',
      'u_3='+rowN(u[2])+'\\ \\Rightarrow\\ g_3=\\max(0,u_3)='+rowN(g[2])+'\\ \\Rightarrow\\ F_3='+rowN(Fo[2]),
      '💬 4 sayı 6\'ya genişletilir (W<sub>1</sub>), ReLU negatifleri keser (6 sayıdan <b>'+g[2].filter(v=>v>0).length+'</b> tanesi geçti), 4\'e geri daraltılır (W<sub>2</sub>). Her kelimeye <b>aynı ağırlıklarla ama ayrı ayrı</b> uygulanır; kelimeler arası bilgi taşımaz.');
    src('tb_f_r2','Residual 2','r_2=n_1+F','r_{2,3}='+rowN(n1[2])+'+'+rowN(Fo[2])+'='+rowN(r2[2]),'💬 Aynı kestirme mantığı: FFN\'in çıktısı LayerNorm\'dan çıkan vektörün <b>üstüne eklenir</b>.');
    src('tb_f_l2','LayerNorm 2 — bloğun çıktısı','n_2=\\mathrm{LayerNorm}(r_2)','n_{2,3}='+rowN(n2[2]),'💬 Blok çıktısı bir sonraki bloğa girdi olarak gider (GPT-3\'te 96 kez). Burada tek blok var, çıktı doğrudan çıktı katmanına gidiyor.');
    src('tb_f_y','Çıktı katmanı — son kelimeden y','y=n_{2,3}\\cdot w','y='+n2[2].map((v,k)=>t(v,3)+'\\cdot'+tp(WOUT[k],1)).join('+')+'='+t(y,3),'💬 Yalnız son kelimenin vektörü tek sayıya çevrilir (minik GPT / Bütün Resim\'lerdeki aynı kurgu).');
    src('tb_f_l','Kayıp','L=\\tfrac12\\,(y-t)^2','L=\\tfrac12('+t(y,3)+'-'+t(tg,2)+')^2='+t(L,4),'💬 y hedeften ne kadar uzaksa kayıp o kadar büyük. (LayerNorm çıktıyı sınırladığı için y büyük sayılara kolay çıkamaz.)');
    // ---- geri pop-up'lar ----
    src('tb_Ly','∂L/∂y','\\dfrac{\\partial L}{\\partial y}=y-t','y-t='+t(y,3)+'-'+t(tg,2)+'=\\mathbf{'+t(e,3)+'}','💬 Kuvvet kuralı + ½ sadeleşir. Bu sayı ('+f(e,3)+') ağacın geri kalanında çarpan olarak taşınır.');
    src('tb_yw','∂y/∂w — çıktı katmanı (yaprak)','\\dfrac{\\partial L}{\\partial w_k}=e\\cdot n_{2,3,k}','\\dfrac{\\partial L}{\\partial w}='+tp(e,3)+rowN(n2[2])+'=\\mathbf{'+rowN(dw)+'}','💬 y = Σ n<sub>2,3,k</sub>w<sub>k</sub> → ∂y/∂w<sub>k</sub> = n<sub>2,3,k</sub>. <b>Yaprak.</b>');
    src('tb_yn2','∂y/∂n₂ — çıktıdan bloğun çıktısına','\\dfrac{\\partial L}{\\partial n_2}=e\\cdot w','\\dfrac{\\partial L}{\\partial n_2}='+tp(e,3)+rowN(WOUT)+'=\\mathbf{'+rowN(dn2)+'}','💬 y = n<sub>2,3</sub>·w → ∂y/∂n<sub>2,3,k</sub> = w<sub>k</sub>. Sinyal bloğun içine <b>geriden</b> giriyor: önce LayerNorm 2.');
    src('tb_ln2','∂n₂/∂r₂ — LayerNorm\'un türevi','\\dfrac{\\partial L}{\\partial r}=\\dfrac{1}{\\sigma}\\Big(dn-\\overline{dn}-\\hat n\\,\\overline{dn\\cdot\\hat n}\\Big)',
      'dn_2='+rowN(dn2)+',\\ \\overline{dn}='+t(dn2.reduce((a,b)=>a+b,0)/4,3)+'\\ \\Rightarrow\\ dr_2='+rowN(dr2),
      '💬 LayerNorm her sayıyı <b>diğer üçüne bağlı</b> bir şekilde ölçekledi (ortalama ve σ hepsinden hesaplandı), bu yüzden türevi <b>sadece kendi payını değil</b>: gelen sinyalin ortalamasını ve n̂ ile ilişkili kısmını da <b>çıkarır</b>. Sonuç: sinyalin toplamı yaklaşık 0\'a çekilir (Σdr = '+f(dr2.reduce((a,b)=>a+b,0),4)+'), yani LayerNorm gradyanı da hizalar.<br>🔗 Şimdi r<sub>2</sub> = n<sub>1</sub> + F: toplamanın türevi gradyanı <b>iki yola da aynen</b> verir.');
    src('tb_r2F','∂r₂/∂F — residual\'ın FFN yolu','\\dfrac{\\partial L}{\\partial F}=\\dfrac{\\partial L}{\\partial r_2}\\cdot 1','dF='+rowN(dF),'💬 r<sub>2</sub> = n<sub>1</sub> + F → ∂r<sub>2</sub>/∂F = <b>1</b>: FFN yoluna gelen sinyal dr<sub>2</sub>\'nin <b>kendisi</b>. (Diğer yol aşağıdaki "kestirme" dalı.)');
    src('tb_FW2','∂F/∂W₂ — FFN 2. matris (yaprak)','\\dfrac{\\partial L}{\\partial W_2}=g_3^{\\top}\\,dF','\\dfrac{\\partial L}{\\partial W_2}\\ (6\\times4)=g_3^{\\top}dF','💬 F = g·W<sub>2</sub> + b<sub>2</sub>: her hücre = g<sub>j</sub> × dF<sub>k</sub> (dış çarpım). ReLU\'dan geçmeyen g<sub>j</sub>=0 olan satırlar sıfır.'+mtab(dW2));
    src('tb_Fb2','∂F/∂b₂ — FFN 2. bias (yaprak)','\\dfrac{\\partial L}{\\partial b_2}=dF','db_2='+rowN(db2),'💬 Bias doğrudan toplandığı için türevi 1: gradyan dF\'nin kendisi.');
    src('tb_Fg','∂F/∂g — FFN çıkışından ReLU çıktısına','\\dfrac{\\partial L}{\\partial g}=dF\\,W_2^{\\top}','dg='+rowN(dg),'💬 F = g·W<sub>2</sub> → ∂F/∂g = W<sub>2</sub>ᵀ: 4 sayılık sinyal 6 sayılık ara katmana geri taşınır.');
    src('tb_gu','∂g/∂u — ReLU\'nun türevi','\\dfrac{\\partial L}{\\partial u_j}=\\begin{cases}dg_j&u_j>0\\\\0&u_j\\le0\\end{cases}','u='+rowN(u[2])+'\\ \\Rightarrow\\ du='+rowN(du),'💬 ReLU, <b>geçirdiği</b> (u>0) sayılarda sinyali olduğu gibi geri verir, <b>kestiği</b> sayılarda 0 yapar. 6 sayıdan <b>'+u[2].filter(v=>v>0).length+'</b> tanesi canlı.');
    src('tb_uW1','∂u/∂W₁ — FFN 1. matris (yaprak)','\\dfrac{\\partial L}{\\partial W_1}=n_{1,3}^{\\top}\\,du','\\dfrac{\\partial L}{\\partial W_1}\\ (4\\times6)=n_{1,3}^{\\top}du','💬 u = n<sub>1</sub>·W<sub>1</sub> + b<sub>1</sub>: hücre = n<sub>1,a</sub> × du<sub>b</sub>. ReLU\'nun kestiği sütunlar sıfır.'+mtab(dW1));
    src('tb_ub1','∂u/∂b₁ — FFN 1. bias (yaprak)','\\dfrac{\\partial L}{\\partial b_1}=du','db_1='+rowN(du),'💬 Bias doğrudan toplandı: gradyan du\'nun kendisi.');
    src('tb_un1','∂u/∂n₁ — FFN yolundan n₁\'e dönen pay','\\left(\\dfrac{\\partial L}{\\partial n_1}\\right)_{FFN}=du\\,W_1^{\\top}','='+rowN(dn1f),'💬 Sinyal FFN\'den geri n<sub>1</sub>\'e döndü: '+rowTxt(dn1f,3)+'. n<sub>1</sub> iki yerden gradyan alacak: bu FFN yolu ve aşağıdaki <b>kestirme</b> (toplanacaklar).');
    src('tb_r2n','∂r₂/∂n₁ — residual\'ın kestirme yolu','\\dfrac{\\partial L}{\\partial n_1}=\\underbrace{dr_2}_{\\text{kestirme}}+\\underbrace{du\\,W_1^{\\top}}_{\\text{FFN yolu}}',
      'dn_1='+rowN(dr2)+'+'+rowN(dn1f)+'=\\mathbf{'+rowN(dn1)+'}',
      '💬 <b>Residual\'ın gücü burada:</b> n<sub>1</sub> iki yoldan etki ediyor (FFN\'e girdi + doğrudan r<sub>2</sub>\'ye toplama), gradyanı da <b>iki yolun toplamı</b>. Kestirme yol (dr<sub>2</sub>, +1 çarpanı) FFN ne kadar sinyali yutsa da <b>sönmeden</b> geçer: x + F(x)\'in türevi 1 + F\'(x).');
    src('tb_ln1','∂n₁/∂r₁ — LayerNorm 1\'in türevi','\\dfrac{\\partial L}{\\partial r_1}=\\dfrac{1}{\\sigma}\\Big(dn_1-\\overline{dn_1}-\\hat n_1\\,\\overline{dn_1\\cdot\\hat n_1}\\Big)','dr_1='+rowN(dr1),'💬 Aynı LayerNorm türevi, bu kez toplam sinyalle (dn<sub>1</sub>). Σdr<sub>1</sub> = '+f(dr1.reduce((a,b)=>a+b,0),4)+'. <br>🔗 Sonraki halka r<sub>1</sub> = X + A<sub>1</sub>: yine iki yola dağılım.');
    src('tb_r1X','∂r₁/∂X — girdiye kestirme','\\left(\\dfrac{\\partial L}{\\partial x_3}\\right)_{\\text{kestirme}}=dr_1','='+rowN(dr1),'💬 r<sub>1</sub> = X + A<sub>1</sub> → ∂r<sub>1</sub>/∂X = 1: sinyalin bir kopyası <b>attention\'a hiç girmeden</b> doğrudan x<sub>3</sub>\'e (ve oradan önceki bloğa) akar. Çok bloklu ağda gradyanın katmanlar boyunca ulaşabilmesinin sebebi bu otoyol.');
    src('tb_r1A','∂r₁/∂A₁ — residual\'ın attention yolu','\\dfrac{\\partial L}{\\partial A_1}=dr_1\\cdot1','dA_1='+rowN(dA1),'💬 r<sub>1</sub> = X + A<sub>1</sub> → ∂r<sub>1</sub>/∂A<sub>1</sub> = 1: attention yoluna da dr<sub>1</sub> aynen gelir. Buradan sonrası 🎯 Self-Attention Bütün Resim\'inin geri yolu.');
    src('tb_AWO','∂A₁/∂W_O — çıktı matrisi (yaprak)','\\dfrac{\\partial L}{\\partial W_O}=z_3^{\\top}\\,dA_1','\\dfrac{\\partial L}{\\partial W_O}\\ (4\\times4)=z_3^{\\top}dA_1','💬 A<sub>1,3</sub> = z<sub>3</sub>·W<sub>O</sub>: hücre = z<sub>3,a</sub> × dA<sub>1,b</sub>. (Yalnız son kelime kayba girdiği için tek satır katkı veriyor.)'+mtab(dWO));
    src('tb_AZ','∂A₁/∂Z — W_O\'dan geri','\\dfrac{\\partial L}{\\partial z_3}=dA_1\\,W_O^{\\top}','dz_3='+rowN(dZ),'💬 A<sub>1</sub> = Z·W<sub>O</sub> → ∂/∂Z = W<sub>O</sub>ᵀ. <br>🔗 Bundan sonrası tam olarak 🎯 Self-Attention → Bütün Resim\'deki geri yol (V → W<sub>V</sub>; A → softmax → S → q → W<sub>Q</sub> ve K → W<sub>K</sub>); burada d=4 boyutlu: dz<sub>3</sub>\'ten başlayıp aynı adımlar. Sinyal: dV = A<sub>3j</sub>·dz<sub>3</sub>, dA = dz<sub>3</sub>·v<sub>j</sub>, dS = A(dA − ort), dq = Σ dS<sub>j</sub>k<sub>j</sub>/√d, dK = dS<sub>j</sub>q<sub>3</sub>/√d.');
    src('tb_ZV','∂z₃/∂W_V — içerik matrisi (yaprak)','\\dfrac{\\partial L}{\\partial W_V}=X^{\\top}\\,dV,\\quad dV_j=A_{3j}\\,dz_3','dV='+'['+dV.map(r=>rowTxt(r,3)).join(' , ')+']','💬 V = X·W<sub>V</sub>: gradyan <b>üç kelimeden</b> toplanır (W<sub>V</sub> aynı, üç kez kullanıldı).'+mtab(dWV));
    src('tb_ZQ','∂z₃/∂W_Q — sorgu matrisi (yaprak)','\\dfrac{\\partial L}{\\partial W_Q}=x_3^{\\top}\\,dq_3,\\quad dq_3=\\tfrac{1}{\\sqrt d}\\sum_jdS_jk_j','dS='+rowN(dS)+',\\ dq_3='+rowN(dq),'💬 Yalnız son kelimenin sorgusu kayba girdi: gradyan x<sub>3</sub>ᵀ·dq<sub>3</sub> (dış çarpım). Sinyal softmax\'ten geçtiği için V\'ye göre daha dolaylı.'+mtab(dWQ));
    src('tb_ZK','∂z₃/∂W_K — etiket matrisi (yaprak)','\\dfrac{\\partial L}{\\partial W_K}=X^{\\top}\\,dK,\\quad dK_j=\\dfrac{dS_j}{\\sqrt d}\\,q_3','dK='+'['+dK.map(r=>rowTxt(r,3)).join(' , ')+']','💬 K = X·W<sub>K</sub>: gradyan üç kelimeden toplanır.'+mtab(dWK));
    const nm=[['w',norm([dw])],['W₂',norm(dW2)],['b₂',norm([db2])],['W₁',norm(dW1)],['b₁',norm([db1])],['W_O',norm(dWO)],['W_V',norm(dWV)],['W_Q',norm(dWQ)],['W_K',norm(dWK)]];
    const mxn=nm.reduce((a,b)=>b[1]>a[1]?b:a),mnn=nm.reduce((a,b)=>b[1]<a[1]?b:a);
    $('tbVerdict').innerHTML='🔑 <b>Dokuz yaprak, tek kayıp.</b> Residual iki yerde gradyanı <b>iki yola</b> böldü (FFN yolu + kestirme; attention yolu + kestirme) ve n₁\'de iki yolun <b>toplamı</b> ('+rowTxt(dn1,2)+') kullanıldı. LayerNorm geri yolda sinyalin ortalamasını ('+f(dr2.reduce((a,b)=>a+b,0),4)+' ≈ 0) çıkardı. En büyük gradyan <b>'+mxn[0]+'</b> ('+f(mxn[1],3)+'), en küçük <b>'+mnn[0]+'</b> ('+f(mnn[1],3)+') — çıktıya yakın katmanlar daha güçlü sinyal alır, ama kestirme yol sayesinde sinyal <b>X\'e kadar</b> ('+rowTxt(dr1,2)+') zayıflamadan ulaşır.';
    window.__tfBig={X,t:tg,y,L,e,dw,dr2,dn1,dr1,dW1,dW2,dWO,dWV,dWQ,dWK,db1,db2};
  }
  const M=window.MathJax;fill();
  if(M&&M.startup&&M.startup.promise)M.startup.promise.then(()=>M.typesetPromise&&M.typesetPromise([host]).catch(()=>{}));
})();
