// İlk açılış karşılama ekranı: yalnız ilk ziyarette (ve doğrudan ders bağlantısı yoksa) açılır; sol menüdeki "Hoş geldin" ile yeniden açılır.
(function(){
  const ov=document.getElementById('welcome'); if(!ov) return;
  const KEY='attn_welcome_seen_v1';
  const seen=()=>{try{return localStorage.getItem(KEY)==='1';}catch(e){return false;}};
  const mark=()=>{try{localStorage.setItem(KEY,'1');}catch(e){}};
  function open(){ov.hidden=false;document.body.classList.add('wl-open');setTimeout(()=>{const b=document.getElementById('wlGo');b&&b.focus();},50);}
  function close(){ov.hidden=true;document.body.classList.remove('wl-open');mark();}
  document.getElementById('wlX').onclick=close;
  document.getElementById('wlMap').onclick=()=>{close();const b=document.querySelector('[data-model="yol"]');b&&b.click();};
  document.getElementById('wlGo').onclick=()=>{close();const b=document.querySelector('[data-model="matematik"]');b&&b.click();};
  ov.addEventListener('click',e=>{if(e.target===ov)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!ov.hidden)close();});
  const op=document.getElementById('wlOpen'); if(op) op.onclick=open;
  const deep=/^#(ders|bolum)=/.test(location.hash);
  if(!seen()&&!deep) setTimeout(open,350);
})();
