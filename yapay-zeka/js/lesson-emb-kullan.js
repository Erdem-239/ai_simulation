// Kelime Temsili — Örnek 4: "Eğitilmiş vektörleri kullanmak" (mini Hogwarts kitabı). 14 kelime, pencere 1, skip-gram (tam softmax), D=4.
// (1) kitap → çiftler → eğit, (2) en yakın kelimeler (önce/sonra), (3) vektör girdili sınıflandırıcı vs one-hot girdili. Python ile birebir.
(function(){
  const host=document.getElementById('embUse'); if(!host) return;
  const $=id=>document.getElementById(id);
  const CUMLE=["harry kitap okudu","ron kitap okudu","hermione kitap okudu","harry büyü yaptı","ron büyü yaptı","hermione büyü yaptı","dumbledore büyü öğretti","snape büyü öğretti","dumbledore hogwarts yönetti","snape hogwarts yönetti","hogwarts büyülü kale"];
  const SOZ=["harry","ron","hermione","dumbledore","snape","hogwarts","kitap","büyü","okudu","yaptı","öğretti","yönetti","büyülü","kale"];
  const ID={};SOZ.forEach((w,i)=>ID[w]=i);const V=SOZ.length,D=4,SEED=1,SC=0.3,EP=500,LR=2.0;
  const fm=(v,d=2)=>(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',').replace(/^-/,'−');
  function ciftler(w){const out=[];CUMLE.forEach(c=>{const k=c.split(' ').map(x=>ID[x]);k.forEach((m,i)=>{for(let j=Math.max(0,i-w);j<Math.min(k.length,i+w+1);j++)if(j!==i)out.push([m,k[j]]);});});return out;}
  const lcg=s=>()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};
  function init(){const r=lcg(SEED),W=[],C=[];for(let i=0;i<V;i++){const a=[];for(let d=0;d<D;d++)a.push((r()-.5)*2*SC);W.push(a);}for(let i=0;i<V;i++){const a=[];for(let d=0;d<D;d++)a.push((r()-.5)*2*SC);C.push(a);}return {W,C};}
  const PAIRS=ciftler(1);
  function egit(st){
    const {W,C}=st,n=PAIRS.length;
    for(let ep=0;ep<EP;ep++){
      const gW=W.map(()=>new Array(D).fill(0)),gC=C.map(()=>new Array(D).fill(0));
      PAIRS.forEach(([i,j])=>{
        const s=C.map(c=>{let q=0;for(let d=0;d<D;d++)q+=W[i][d]*c[d];return q;}),m=Math.max(...s),e=s.map(v=>Math.exp(v-m)),z=e.reduce((a,b)=>a+b,0);
        for(let k=0;k<V;k++){const dk=e[k]/z-(k===j?1:0);for(let d=0;d<D;d++){gW[i][d]+=dk*C[k][d]/n;gC[k][d]+=dk*W[i][d]/n;}}
      });
      for(let i=0;i<V;i++)for(let d=0;d<D;d++){W[i][d]-=LR*gW[i][d];C[i][d]-=LR*gC[i][d];}
    }
  }
  const cos=(a,b)=>{let x=0,p=0,q=0;for(let d=0;d<D;d++){x+=a[d]*b[d];p+=a[d]*a[d];q+=b[d]*b[d];}return x/Math.sqrt(p*q);};
  function near(W,w,k){const i=ID[w];return SOZ.map((s,j)=>[s,cos(W[i],W[j]),j]).filter(x=>x[2]!==i).sort((a,b)=>b[1]-a[1]).slice(0,k);}
  function sinif(W,egitimli,test,onehot){
    const X=k=>onehot?SOZ.map((s,i)=>i===ID[k]?1:0):W[ID[k]],n=X(egitimli[0][0]).length;let w=new Array(n).fill(0),b=0;
    for(let ep=0;ep<800;ep++){const gw=new Array(n).fill(0);let gb=0;egitimli.forEach(([k,y])=>{const x=X(k);let z=b;for(let d=0;d<n;d++)z+=w[d]*x[d];const p=1/(1+Math.exp(-z));for(let d=0;d<n;d++)gw[d]+=(p-y)*x[d]/egitimli.length;gb+=(p-y)/egitimli.length;});w=w.map((a,d)=>a-1.0*gw[d]);b-=1.0*gb;}
    const out={};test.forEach(k=>{const x=X(k);let z=b;for(let d=0;d<n;d++)z+=w[d]*x[d];out[k]=1/(1+Math.exp(-z));});return out;
  }
  const st0=init(),W0=st0.W.map(r=>r.slice()),st=init();let trained=false;
  host.innerHTML=
   '<div style="font-size:13px;color:#ccd5e8;margin-bottom:6px"><b>📖 Mini "Hogwarts" kitabı</b> (11 kısa cümle, '+V+' farklı kelime) → pencere 1 ile <b>'+PAIRS.length+' eğitim çifti</b>:</div>'+
   '<div style="font-size:12.5px;color:#aeb9d4;line-height:1.7;margin-bottom:8px">'+CUMLE.map(c=>'“'+c+'”').join(' · ')+'</div>'+
   '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px"><button class="rex-btn" id="eu_go">▶ Skip-gram ile eğit ('+EP+' epoch)</button><button class="rex-btn" id="eu_rst">↺ rastgele başlangıca dön</button><span id="eu_st" style="font-size:13px"></span></div>'+
   '<div style="font-size:13px;color:#ccd5e8;margin:8px 0 4px"><b>🔍 1) En yakın kelimeler</b> (cosine benzerliği): kelime seç →</div>'+
   '<div style="margin-bottom:6px"><select id="eu_w" class="rex-sel"></select></div><div id="eu_near"></div>'+
   '<div style="font-size:13px;color:#ccd5e8;margin:14px 0 4px"><b>🧪 2) Vektörü başka bir modele girdi yapmak.</b> Basit bir sınıflandırıcıya yalnızca <b>iki kelimenin etiketini</b> öğretiyoruz: <b>harry = öğrenci</b>, <b>snape = öğretmen</b>. Sonra <b>hiç etiketlemediğimiz</b> kelimelere soruyoruz: öğrenci mi?</div>'+
   '<div id="eu_cls"></div>'+
   '<div class="callout" style="margin-top:10px">🧭 <b>Sınır ve sonraki adım:</b> Bu vektörler her kelime için <b>tek bir</b> sayı listesi. "yüz lira" ile "yüzü güzel"deki "yüz" aynı vektörü alır, cümleye göre değişmez. Sıradaki derslerde bunu çözüyoruz: <b>LSTM/GRU</b> cümleyi sırayla okuyup bir "bağlam özeti" tutar → <b>Seq2Seq</b> bu özetten yeni bir cümle üretir (çeviri) → <b>attention</b> her kelimenin vektörünü cümledeki <b>diğer kelimelere bakarak</b> yeniden hesaplar → <b>Transformer</b> bunu üst üste dizerek ChatGPT\'nin temelini kurar. Yani word2vec "kelimenin sabit vektörü"; sıradakiler "kelimenin <b>bağlamlı</b> vektörü".</div>';
  const sel=$('eu_w');SOZ.forEach(w=>sel.add(new Option(w,w)));sel.value='harry';
  function draw(){
    $('eu_st').innerHTML=trained?'<span style="color:#46c46a">✔ eğitildi</span> ('+EP+' epoch)':'<span style="color:#e06a6a">henüz eğitilmedi: vektörler rastgele</span>';
    const W=trained?st.W:W0,w=sel.value,r=near(W,w,5),r0=near(W0,w,5);
    $('eu_near').innerHTML='<table class="rex-tbl" style="font-size:12.5px"><tr><th>#</th><th>'+w+'\'a en yakın '+(trained?'(eğitim sonrası)':'(rastgele başlangıç)')+'</th><th>cosine</th></tr>'+r.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+x[0]+'</td><td>'+fm(x[1])+'</td></tr>').join('')+'</table>'+(trained?'<div style="font-size:12px;color:var(--muted)">Eğitim öncesi aynı liste: '+r0.map(x=>x[0]).join(', ')+' (rastgele).</div>':'');
    const eg=[['harry',1],['snape',0]],te=['harry','snape','ron','hermione','dumbledore'];
    if(!trained){$('eu_cls').innerHTML='<p style="font-size:13px;color:var(--muted)">Önce yukarıdan ▶ eğit.</p>';window.__embUse={trained:false};return;}
    const pv=sinif(st.W,eg,te,false),po=sinif(st.W,eg,te,true);
    const row=k=>{const e=k==='harry'||k==='snape';return '<tr><td><b>'+k+'</b>'+(e?' <span style="color:var(--muted)">(etiketli)</span>':' <span style="color:#ffd54a">(hiç görmedi)</span>')+'</td><td>%'+Math.round(pv[k]*100)+' öğrenci '+(Math.round(pv[k])===(['harry','ron','hermione'].includes(k)?1:0)?'✅':'❌')+'</td><td>%'+Math.round(po[k]*100)+' öğrenci '+(e?'✅':'🤷')+'</td></tr>';};
    $('eu_cls').innerHTML='<table class="rex-tbl" style="font-size:12.5px"><tr><th>kelime</th><th>girdi = kelime VEKTÖRÜ (4 sayı)</th><th>girdi = ONE-HOT (14 sayı)</th></tr>'+te.map(row).join('')+'</table>'+
     '<p style="font-size:13.5px;color:#ccd5e8;line-height:1.7">Vektör girdili model, ron ve hermione\'yi <b>hiç etiket görmeden</b> öğrenci, dumbledore\'u öğretmen buldu: çünkü onların vektörleri harry ve snape\'in vektörlerine <b>zaten yakın</b> (word2vec yan yana geçmekten öğrenmişti). One-hot girdili model ise etiketsiz kelimeler için <b>%50 ile tahmin yürütemiyor</b>: one-hot\'ta her kelime tamamen ayrı, hiçbir benzerlik taşımıyor. Embedding\'in asıl faydası bu: <b>az etiketle çok şey öğrenmek</b>.</p>';
    window.__embUse={trained:true,pv,po,near:near(st.W,'harry',4).map(x=>[x[0],x[1]]),W:st.W};
  }
  $('eu_go').addEventListener('click',()=>{if(!trained){egit(st);trained=true;}draw();});
  $('eu_rst').addEventListener('click',()=>{const s=init();st.W=s.W;st.C=s.C;trained=false;draw();});
  sel.addEventListener('change',draw);
  window.__embUseTrain=()=>{if(!trained){egit(st);trained=true;}draw();return window.__embUse;};
  draw();
})();
