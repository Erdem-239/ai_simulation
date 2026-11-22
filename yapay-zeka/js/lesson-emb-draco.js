// Kelime Temsili — Örnek 4'ün devamı: "Draco sorunu". Aynı mini kitaba Draco eklenir; word2vec Draco'yu Harry'ye YAKIN bulur
// ama arkadaş mı düşman mı ayıramaz. Aynı motor (skip-gram, tam softmax, D=4, pencere 1, SEED 1, lr 2, 500 epoch).
(function(){
  const host=document.getElementById('embDraco'); if(!host) return;
  const $=id=>document.getElementById(id);
  const TEMEL=["harry kitap okudu","ron kitap okudu","hermione kitap okudu","harry büyü yaptı","ron büyü yaptı","hermione büyü yaptı","dumbledore büyü öğretti","snape büyü öğretti","dumbledore hogwarts yönetti","snape hogwarts yönetti","hogwarts büyülü kale"];
  const DRACO=["draco kitap okudu","draco büyü yaptı","draco hile yaptı","draco alay etti"];
  const CUMLE=TEMEL.concat(DRACO);
  const SOZ=["harry","ron","hermione","dumbledore","snape","hogwarts","kitap","büyü","okudu","yaptı","öğretti","yönetti","büyülü","kale","draco","hile","alay","etti"];
  const ID={};SOZ.forEach((w,i)=>ID[w]=i);const V=SOZ.length,D=4,SEED=1,SC=0.3,EP=500,LR=2.0;
  const fm=(v,d=2)=>(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',').replace(/^-/,'−');
  const PAIRS=[];CUMLE.forEach(c=>{const k=c.split(' ').map(x=>ID[x]);k.forEach((m,i)=>{for(let j=Math.max(0,i-1);j<Math.min(k.length,i+2);j++)if(j!==i)PAIRS.push([m,k[j]]);});});
  const lcg=s=>()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};
  function init(){const r=lcg(SEED),W=[],C=[];for(let i=0;i<V;i++){const a=[];for(let d=0;d<D;d++)a.push((r()-.5)*2*SC);W.push(a);}for(let i=0;i<V;i++){const a=[];for(let d=0;d<D;d++)a.push((r()-.5)*2*SC);C.push(a);}return {W,C};}
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
  const ISIM=["harry","ron","hermione","draco","snape","dumbledore"];
  const st=init();let trained=false;
  host.innerHTML=
   '<div style="border-left:3px solid #e06a6a;padding:6px 12px;margin:14px 0 8px"><div style="font-size:13.5px;color:#ccd5e8;line-height:1.7"><b>😈 Draco sorunu: yakın olmak = arkadaş olmak mı?</b> Aynı kitaba <b>Draco</b>\'yu da ekliyoruz. Draco harry ile aynı yerlerde geçiyor ("draco kitap okudu", "draco büyü yaptı"), ek olarak kendine özgü "draco hile yaptı", "draco alay etti" cümleleri var. Soru: word2vec Draco\'nun <b>düşman</b> olduğunu fark eder mi?</div></div>'+
   '<div style="font-size:12.5px;color:#aeb9d4;line-height:1.7;margin-bottom:8px">Eklenen cümleler: '+DRACO.map(c=>'“'+c+'”').join(' · ')+' → toplam '+CUMLE.length+' cümle, '+V+' kelime, <b>'+PAIRS.length+' çift</b>.</div>'+
   '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px"><button class="rex-btn" id="ed_go">▶ Draco\'lu kitapla eğit ('+EP+' epoch)</button><span id="ed_st" style="font-size:13px"></span></div>'+
   '<div id="ed_out"></div>';
  function draw(){
    $('ed_st').innerHTML=trained?'<span style="color:#46c46a">✔ eğitildi</span>':'<span style="color:#e06a6a">henüz eğitilmedi</span>';
    if(!trained){$('ed_out').innerHTML='';window.__embDraco={trained:false};return;}
    const W=st.W,ref=W[ID.harry];
    const sim=ISIM.filter(w=>w!=='harry').map(w=>[w,cos(ref,W[ID[w]])]).sort((a,b)=>b[1]-a[1]);
    const mx=Math.max(...sim.map(x=>x[1]));
    const bars=sim.map(([w,c])=>'<tr><td><b>'+w+'</b></td><td style="width:55%"><div style="height:10px;border-radius:5px;background:'+(w==='draco'?'#e06a6a':'#5aa0e0')+';width:'+Math.max(2,Math.round(Math.max(0,c)*100))+'%"></div></td><td>'+fm(c)+'</td></tr>').join('');
    $('ed_out').innerHTML=
     '<div style="font-size:13px;color:#ccd5e8;margin:6px 0 4px"><b>harry\'ye cosine benzerliği</b> (1 = aynı yön):</div><table class="rex-tbl" style="font-size:12.5px"><tr><th>kelime</th><th>benzerlik</th><th>cosine</th></tr>'+bars+'</table>'+
     '<p style="font-size:13.5px;color:#ccd5e8;line-height:1.7">Draco harry\'ye <b>'+fm(cos(ref,W[ID.draco]))+'</b> benziyor: ron ve hermione kadar yakın değil (onlar harry ile <b>tamamen aynı</b> cümle kalıplarında geçiyor), ama '+(cos(ref,W[ID.draco])>cos(ref,W[ID.snape])?'öğretmenlerden (snape '+fm(cos(ref,W[ID.snape]))+', dumbledore '+fm(cos(ref,W[ID.dumbledore]))+') daha yakın':'öğretmenlerle aynı düzeyde')+'. Sebep: "kitap okudu / büyü yaptı" bağlamlarını harry ile paylaşıyor. Draco\'ya özgü "hile yaptı / alay etti" onu biraz uzaklaştırdı, <b>ama "düşman" diye bir yön vektörde yok</b>: yalnızca "harry gibi bağlamlarda geçiyor, bir kısmında farklı" bilgisi var. Bir dost ile bir düşman, aynı sayfalarda aynı fiilleri alıyorsa, word2vec için aynı şeydir.</p>'+
     '<div class="callout">🧭 <b>Neden sıradaki dersler gerekli?</b> Word2vec yalnızca <b>kimin yanında geçtiğine</b> bakıyor ve her kelimeye <b>tek bir</b> vektör veriyor. "Harry, Draco\'yu savundu" ile "Harry, Draco\'dan nefret etti" aynı Draco vektörünü kullanır. İlişkiyi görmek için cümleyi <b>sırayla ve bütün olarak</b> okumak gerekir: <b>LSTM/GRU</b> sırayı ve hafızayı ekler → <b>attention</b> uzaktaki kelimelere de bakar → <b>Transformer</b> her kelimenin vektörünü o cümleye göre yeniden hesaplar. Dürüst not: bu modeller de "iyi/kötü"yü bilmez; kitapta Draco\'nun yanında hep olumsuz kelimeler geçtiği için <b>istatistik olarak</b> öyle öğrenirler.</div>';
    window.__embDraco={trained:true,W:st.W,sim};
  }
  $('ed_go').addEventListener('click',()=>{if(!trained){egit(st);trained=true;}draw();});
  window.__embDracoTrain=()=>{if(!trained){egit(st);trained=true;}draw();return window.__embDraco;};
  draw();
})();
