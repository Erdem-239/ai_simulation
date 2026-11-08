// Self-Attention 5️⃣ Simülasyon — kompakt "dikkat laboratuvarı".
// Tek panel: cümle, W (birim / örnek), maske (maskesiz = encoder/BERT, maskeli = GPT), √d.
// Solda küçük dikkat tablosu (satıra tıkla), sağda seçili kelimenin yeni kartı adım adım:
// q·k skorları → ÷√d → (maske) → softmax → Σ a·v = yeni kart; altta maskeli ↔ maskesiz karşılaştırması.
(function(){
  const host=document.getElementById('attSim'); if(!host) return;
  const fm=(v,d=2)=>(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',').replace(/^-/,'−');
  const SENT=[
    {toks:['kedi','sütü','çünkü','açtı'],emb:[[1.0,0.2],[0.3,1.0],[-0.8,-0.3],[0.9,0.6]]},
    {toks:['banka','para','nehir','kıyı'],emb:[[0.9,0.5],[1.0,0.3],[-0.6,0.9],[-0.5,1.0]]}];
  const WS={
    id:{q:[[1,0],[0,1]],k:[[1,0],[0,1]],v:[[1,0],[0,1]]},
    ex:{q:[[1,0.5],[0,1]],k:[[1,0],[0.5,1]],v:[[0.5,0],[0,1.5]]}};
  const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,v,k)=>s+v*B[k][j],0)));
  const st={s:0,w:'id',mask:false,scale:true,sel:3};

  function calc(mask){
    const S=SENT[st.s],X=S.emb,n=X.length,d=2,W=WS[st.w],div=st.scale?Math.sqrt(d):1;
    const Q=mm(X,W.q),K=mm(X,W.k),V=mm(X,W.v);
    const raw=Q.map(q=>K.map(k=>q[0]*k[0]+q[1]*k[1]));
    const sc=raw.map(r=>r.map(v=>v/div));
    const A=sc.map((r,i)=>{const ok=r.map((_,j)=>!mask||j<=i),m=Math.max(...r.filter((_,j)=>ok[j])),e=r.map((v,j)=>ok[j]?Math.exp(v-m):0),t=e.reduce((a,b)=>a+b,0);return e.map(v=>v/t);});
    const Z=mm(A,V);
    return {S,X,n,Q,K,V,raw,sc,A,Z,div};
  }
  const btn=(cls,val,label,on)=>'<button class="addbtn '+cls+'" data-v="'+val+'" style="background:'+(on?'var(--blue)':'var(--panel)')+';color:'+(on?'#fff':'var(--text)')+';border:1px solid var(--line);padding:5px 10px;font-size:12.5px">'+label+'</button>';
  const vec=v=>'('+fm(v[0])+' ; '+fm(v[1])+')';

  function render(){
    const R=calc(st.mask),O=calc(!st.mask),S=R.S,t=S.toks,i=st.sel;
    let h='<div class="as-ctl">'+
      '<span class="as-l">Cümle:</span>'+SENT.map((x,k)=>btn('asS',k,'"'+x.toks.join(' · ')+'"',st.s===k)).join('')+
      '<span class="as-l">Maske:</span>'+btn('asM','0','maskesiz (encoder / BERT)',!st.mask)+btn('asM','1','maskeli (GPT)',st.mask)+
      '<span class="as-l">W:</span>'+btn('asW','id','birim (Q=K=V=X)',st.w==='id')+btn('asW','ex','örnek W (elle seçilmiş)',st.w==='ex')+
      '<label class="as-l" style="cursor:pointer"><input type="checkbox" class="asD"'+(st.scale?' checked':'')+'> ÷√d</label></div>';
    // şekil şeridi
    h+='<div class="as-shape">X <b>4×2</b> → Q, K, V <b>4×2</b> → skor Q·Kᵀ <b>4×4</b> → '+(st.scale?'÷√2 → ':'')+(st.mask?'maske → ':'')+'satır softmax A <b>4×4</b> → A·V = yeni kartlar Z <b>4×2</b> <span style="color:var(--muted)">(girdiyle aynı şekil)</span></div>';
    // tablo
    let tb='<table class="as-tb"><tr><td class="as-ax">bakan ↓ / bakılan →</td>'+t.map(x=>'<td class="as-ch">'+x+'</td>').join('')+'</tr>';
    t.forEach((x,r)=>{tb+='<tr class="as-row'+(r===i?' on':'')+'" data-r="'+r+'"><td class="as-rh">'+x+'</td>'+t.map((_,c)=>{const off=st.mask&&c>r,a=R.A[r][c];
      return off?'<td class="as-c off">kapalı</td>':'<td class="as-c" style="background:rgba(70,196,106,'+(0.08+0.8*a)+')">%'+Math.round(a*100)+'</td>';}).join('')+'</tr>';});
    tb+='</table><div class="as-note">Satıra tıkla → o kelimenin yeni kartı sağda adım adım. Her satırın toplamı %100.</div>';
    // seçili kelime hesabı
    const q=R.Q[i];let st1='<div class="as-step"><b>1) Soru:</b> q<sub>'+t[i]+'</sub> = x · W_Q = <b>'+vec(q)+'</b></div>';
    let st2='<div class="as-step"><b>2) Skorlar:</b> q · k<sub>j</sub>'+(st.scale?' ÷ √2':'')+'<div class="as-list">'+t.map((x,j)=>{const off=st.mask&&j>i;
      return '<div'+(off?' class="off"':'')+'>«'+x+'»: '+(off?'<i>kapalı (gelecek)</i>':vec(q)+'·'+vec(R.K[j])+(st.scale?' ÷ 1,41':'')+' = <b>'+fm(R.sc[i][j])+'</b>')+'</div>';}).join('')+'</div></div>';
    let st3='<div class="as-step"><b>3) Softmax:</b> '+t.map((x,j)=>(st.mask&&j>i)?'«'+x+'» %0':'«'+x+'» <b>%'+Math.round(R.A[i][j]*100)+'</b>').join(' · ')+'</div>';
    let st4='<div class="as-step"><b>4) Yeni kart:</b> z = Σ a<sub>j</sub>·v<sub>j</sub> = '+t.map((x,j)=>(st.mask&&j>i)?'':'%'+Math.round(R.A[i][j]*100)+'·'+vec(R.V[j])).filter(Boolean).join(' + ')+' = <b style="color:#ffd54a">'+vec(R.Z[i])+'</b></div>';
    // maskeli ↔ maskesiz
    const zM=st.mask?R.Z:O.Z,zU=st.mask?O.Z:R.Z;
    let cmp='<div class="as-cmp"><b>🎭 Maskeli ↔ maskesiz: hangi kartlar değişiyor?</b><table class="as-tb2"><tr><td></td><td>maskesiz</td><td>maskeli</td><td></td></tr>'+
      t.map((x,j)=>{const same=Math.abs(zM[j][0]-zU[j][0])<1e-9&&Math.abs(zM[j][1]-zU[j][1])<1e-9;
        return '<tr'+(j===i?' class="on"':'')+'><td>«'+x+'»</td><td>'+vec(zU[j])+'</td><td>'+vec(zM[j])+'</td><td>'+(same?'<span style="color:#46c46a">aynı</span>':'<span style="color:#ff9a6a">farklı</span>')+'</td></tr>';}).join('')+'</table>'+
      '<div class="as-note">Maske yalnız <b>baştaki</b> kelimelerin kartını değiştirir: onlar sağdakileri göremez. <b>Son kelime</b> («'+t[3]+'») iki durumda da herkesi görür, kartı <b>aynı</b>. GPT sıradaki token\'ı bu son karttan tahmin ettiği için maskenin bedeli küçük kalır.</div></div>';
    h+='<div class="as-grid"><div>'+tb+'</div><div class="as-calc"><div class="as-h">«'+t[i]+'» kelimesinin yeni kartı</div>'+st1+st2+st3+st4+'</div></div>'+cmp;
    host.innerHTML=h;
    window.__attSim={A:R.A,Z:R.Z,other:O.Z};
  }
  host.addEventListener('click',e=>{const b=e.target.closest('button,.as-row');if(!b)return;
    if(b.classList.contains('asS')){st.s=+b.dataset.v;}else if(b.classList.contains('asM')){st.mask=b.dataset.v==='1';}
    else if(b.classList.contains('asW')){st.w=b.dataset.v;}else if(b.classList.contains('as-row')){st.sel=+b.dataset.r;}else return;render();});
  host.addEventListener('change',e=>{if(e.target.classList.contains('asD')){st.scale=e.target.checked;render();}});
  render();
})();
