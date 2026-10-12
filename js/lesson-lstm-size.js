// LSTM şemalarının (#lstmArch, #lstmPipe) boyutunu kullanıcı ayarlar: genişlik + yükseklik kaydırıcıları.
// preserveAspectRatio=none → şema verilen kutuya tam oturur (isteğe göre uzar/genişler).
(function(){
  function mk(id,label){
    const svg=document.getElementById(id); if(!svg) return;
    const wrap=svg.parentElement, W0=760, H0=390;
    const bar=document.createElement('div');
    bar.style.cssText='display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;font-size:12.5px;color:#ccd5e8;margin:0 0 6px';
    bar.innerHTML='<b>📐 '+label+' boyutu:</b>'+
      '<label>genişlik <input type="range" min="360" max="1400" step="10" value="'+W0+'" style="width:140px"> <span class="sw">'+W0+'</span>px</label>'+
      '<label>yükseklik <input type="range" min="200" max="800" step="10" value="'+H0+'" style="width:140px"> <span class="sh">'+H0+'</span>px</label>'+
      '<button type="button" class="rex-btn" style="padding:2px 10px">↺ varsayılan</button>';
    wrap.parentElement.insertBefore(bar,wrap);
    const [rw,rh]=bar.querySelectorAll('input'), sw=bar.querySelector('.sw'), sh=bar.querySelector('.sh');
    function ap(){
      svg.dataset.sized='1';
      svg.setAttribute('preserveAspectRatio','none');
      svg.style.cssText='display:block;margin:0 auto;max-width:none;min-width:0;width:'+rw.value+'px;height:'+rh.value+'px';
      sw.textContent=rw.value; sh.textContent=rh.value;
    }
    rw.addEventListener('input',ap); rh.addEventListener('input',ap);
    bar.querySelector('button').onclick=()=>{rw.value=W0;rh.value=H0;ap();};
    ap();
  }
  mk('lstmArch','Şema'); mk('lstmPipe','Vana paneli şeması');
})();
