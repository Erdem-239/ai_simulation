/* Seq2Seq Örnek 2: darboğaz sayı sayma (deney değil, aritmetik) */
(function(){
  const el=document.getElementById('s2sBn'); if(!el) return;
  const H=24;
  el.innerHTML='<div class="rex-ctl" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px"><span>Kaynak uzunluğu T:</span><input type="range" id="bnT" min="3" max="60" value="30" style="flex:1;min-width:160px"><b id="bnTv">30</b><span>kelime</span></div><div id="bnOut"></div>';
  const t=document.getElementById('bnT');
  function draw(){
    const T=+t.value,pk=2*H,at=T*H,r=at/pk;document.getElementById('bnTv').textContent=T;
    const wA=Math.min(100,at/(60*H)*100),wP=pk/(60*H)*100;
    document.getElementById('bnOut').innerHTML=
     '<div style="font-size:13px;color:#ccd5e8;line-height:1.9">Klasik Seq2Seq decoder\'ın gördüğü: <b style="color:#e06a6a">'+pk+' sayı</b> (sabit)<div style="height:12px;background:#e06a6a;width:'+wP+'%;border-radius:4px;margin:2px 0 8px"></div>'+
     'Attention\'lı decoder\'ın erişebildiği: <b style="color:#46c46a">'+at+' sayı</b> (T×'+H+')<div style="height:12px;background:#46c46a;width:'+wA+'%;border-radius:4px;margin:2px 0 8px"></div>'+
     'Oran: <b>'+r.toFixed(1)+'×</b> '+(T<=3?'— kısa soruda paket yeter.':T<30?'— fark büyüyor.':'— paket artık çok dar bir boğaz.')+'</div>';
    window.__s2sBn={T,pk,at,r};
  }
  t.addEventListener('input',draw);draw();
})();
