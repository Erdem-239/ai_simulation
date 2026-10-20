/* A4 yazdırma: WebGL tuvali + HTML etiketlerini tek PNG'ye birleştirip yatay A4'e basar. */
window.printA4=function(canvas,render,light){
  render();
  var W=canvas.width,H=canvas.height,cr=canvas.getBoundingClientRect(),k=W/cr.width;
  var c=document.createElement('canvas');c.width=W;c.height=H;var g=c.getContext('2d');
  g.fillStyle='#0b0e14';g.fillRect(0,0,W,H);g.drawImage(canvas,0,0);
  document.querySelectorAll('.lb').forEach(function(el){
    var cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity)<0.08)return;
    var r=el.getBoundingClientRect();if(r.right<cr.left||r.left>cr.right||r.bottom<cr.top||r.top>cr.bottom)return;
    var x=(r.left-cr.left)*k,y=(r.top-cr.top)*k,w=r.width*k,h=r.height*k;
    g.globalAlpha=Math.min(1,parseFloat(cs.opacity));
    g.fillStyle='#10151f';g.strokeStyle=cs.borderTopColor||'#4a5468';g.lineWidth=1.5*k;
    g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,6*k);else g.rect(x,y,w,h);g.fill();g.stroke();
    g.fillStyle='#e7ecf5';g.font='600 '+(11*k)+'px sans-serif';g.textBaseline='middle';
    g.fillText(el.textContent.trim(),x+7*k,y+h/2,w-12*k);g.globalAlpha=1;
  });
  var img=document.getElementById('prImg');
  if(!img){img=document.createElement('img');img.id='prImg';document.body.appendChild(img);
    var st=document.createElement('style');
    st.textContent='#prImg{display:none}@page{size:A4 landscape;margin:8mm}@media print{html,body{background:#fff!important;margin:0!important;height:auto!important;overflow:visible!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}body>*:not(#prImg){display:none!important}#prImg{display:block!important;width:100%;max-height:190mm;object-fit:contain;margin:0 auto}#prImg.light{filter:invert(1) hue-rotate(180deg)}}';
    document.head.appendChild(st);}
  img.className=light?'light':'';
  img.src=c.toDataURL('image/png');
  setTimeout(function(){window.print()},150);
};
