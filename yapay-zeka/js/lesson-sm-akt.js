// Softmax — "2) Softmax bir aktivasyon fonksiyonu mu?": aynı z vektörüne sigmoid (eleman eleman) ve softmax (bütün vektör) uygulanır.
// Bir z'yi oynatınca: sigmoid'de yalnız o çıktı, softmax'ta HEPSİ değişir; softmax toplamı hep 1.
(function(){
  const $=id=>document.getElementById(id); if(!$('smAkt')) return;
  const N=['uyudu','kaçtı','havladı'], CS=['#46c46a','#3a7afe','#f0a032'];
  const f=(v,d=3)=>v.toFixed(d).replace('.',',').replace('-','−');
  const sig=z=>1/(1+Math.exp(-z));
  let prev=null;
  function bars(id,vals,max,changed){
    $(id).innerHTML=vals.map((v,k)=>'<div style="display:grid;grid-template-columns:62px 1fr 52px;gap:6px;align-items:center;margin:3px 0">'+
      '<span style="font-size:12px;color:#ccd5e8">'+N[k]+'</span>'+
      '<span style="height:14px;background:#1a2440;border-radius:4px;overflow:hidden"><span style="display:block;height:100%;width:'+Math.min(100,100*v/max)+'%;background:'+CS[k]+'"></span></span>'+
      '<b style="font-size:12px;text-align:right;'+(changed&&changed[k]?'color:#ffd24a':'color:#ccd5e8')+'">'+f(v)+'</b></div>').join('');
  }
  function render(){
    const z=[0,1,2].map(k=>parseFloat($('smA_z'+k).value));
    z.forEach((v,k)=>$('smA_z'+k+'_v').textContent=f(v,1));
    const s=z.map(sig), e=z.map(Math.exp), S=e.reduce((a,b)=>a+b,0), p=e.map(v=>v/S);
    const chS=prev&&s.map((v,k)=>Math.abs(v-prev.s[k])>1e-9), chP=prev&&p.map((v,k)=>Math.abs(v-prev.p[k])>1e-9);
    bars('smA_sig',s,1,chS); bars('smA_sm',p,1,chP);
    const ss=s.reduce((a,b)=>a+b,0);
    $('smA_sigSum').innerHTML='toplam = <b style="color:'+(Math.abs(ss-1)<0.005?'#46c46a':'#e06a6a')+'">'+f(ss)+'</b> → bir dağılım değil, her nöron kendi başına';
    $('smA_smSum').innerHTML='toplam = <b style="color:#46c46a">'+f(p.reduce((a,b)=>a+b,0))+'</b> → her zaman 1 (olasılık dağılımı)';
    if(prev){
      const k=z.findIndex((v,i)=>v!==prev.z[i]);
      if(k>=0){
        const nS=chS.filter(Boolean).length, nP=chP.filter(Boolean).length;
        $('smA_msg').innerHTML='Yalnız <b>'+N[k]+'</b> skorunu değiştirdin: sigmoid\'de <b>'+nS+'</b> çıktı değişti, softmax\'ta <b>'+nP+'</b> çıktı değişti (sarı). Softmax bir adayı büyütünce öbürleri <b>yer açmak için küçülür</b>.';
      }
    }
    prev={z,s,p};
  }
  [0,1,2].forEach(k=>$('smA_z'+k).addEventListener('input',render));
  $('smA_rst').addEventListener('click',()=>{[2,1,-0.5].forEach((v,k)=>$('smA_z'+k).value=v);prev=null;render();$('smA_msg').innerHTML='Bir skoru oynat: hangi çıktılar değişiyor?';});
  render();
})();
