/* Trigonometri — Birim çember + dalga simülatörü
   Sol: birim çemberde nokta (cosθ, sinθ). Sağ: aynı açı büyüdükçe çizilen sin/cos dalgası.
   Çemberdeki noktanın yüksekliği (py) ile dalgadaki sin noktasının yüksekliği aynı ölçekte
   tutuluyor (Ccy=WyMid, R=WyAmp) — böylece ikisini birleştiren yatay kesikli çizgi, çemberin
   "açılıp dalgaya dönüşmesini" gerçekten görsel olarak kanıtlıyor. */
(function(){
  'use strict';
  const cv = document.getElementById('trigCanvas');
  if(!cv) return;
  const ctx = cv.getContext('2d');
  const angIn = document.getElementById('trigAngle');
  const angVal = document.getElementById('trigAngleV');
  const read = document.getElementById('trigRead');
  const playBtn = document.getElementById('trigPlay');
  const sinBtn = document.getElementById('trigSinBtn');
  const cosBtn = document.getElementById('trigCosBtn');
  const F = (v,d=4) => (isFinite(v) ? v.toFixed(d) : '—');

  let showSin = true, showCos = true, playing = false, rafId = null, lastT = null;

  const W = cv.width, H = cv.height;
  const Ccx = 150, Ccy = 168, R = 108;
  const Wx0 = 320, Wx1 = 745, Wy0 = 60, Wy1 = 276;
  const WyMid = Ccy, WyAmp = R; // aynı ölçek — kritik: çember ve dalga hizalı olsun
  const angleMaxDeg = 720;

  const toRad = d => d*Math.PI/180;
  const wx = deg => Wx0 + (Wx1-Wx0)*(deg/angleMaxDeg);
  const wy = v => WyMid - v*WyAmp;

  function setActive(btn, on){
    if(on){ btn.style.opacity='1'; btn.style.borderColor = btn.dataset.color; }
    else{ btn.style.opacity='0.4'; btn.style.borderColor = 'var(--line)'; }
  }

  function drawCircleAxes(){
    ctx.strokeStyle='#2a2e36'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(Ccx-R-24,Ccy); ctx.lineTo(Ccx+R+24,Ccy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(Ccx,Ccy-R-24); ctx.lineTo(Ccx,Ccy+R+24); ctx.stroke();
    ctx.strokeStyle='#5a6068'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(Ccx,Ccy,R,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='#8a9099'; ctx.font='11px Segoe UI, Arial'; ctx.textAlign='center';
    ctx.fillText('x = cosθ ekseni', Ccx, Ccy+R+38);
    ctx.save(); ctx.translate(Ccx-R-34, Ccy); ctx.rotate(-Math.PI/2); ctx.fillText('y = sinθ ekseni', 0, 0); ctx.restore();
  }

  function drawWaveAxes(){
    ctx.font='11px Segoe UI, Arial';
    [0,90,180,270,360,450,540,630,720].forEach(d=>{
      const px = wx(d);
      ctx.strokeStyle='#2a2e36'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(px,Wy0); ctx.lineTo(px,Wy1); ctx.stroke();
      ctx.fillStyle='#8a9099'; ctx.textAlign='center';
      ctx.fillText(d+'°', px, Wy1+16);
    });
    [-1,-0.5,0,0.5,1].forEach(v=>{
      const py = wy(v);
      ctx.strokeStyle='#2a2e36'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(Wx0,py); ctx.lineTo(Wx1,py); ctx.stroke();
      ctx.fillStyle='#8a9099'; ctx.textAlign='right';
      ctx.fillText(v.toFixed(1), Wx0-8, py+3);
    });
    ctx.strokeStyle='#5a6068'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(Wx0,wy(0)); ctx.lineTo(Wx1,wy(0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(Wx0,Wy0); ctx.lineTo(Wx0,Wy1); ctx.stroke();
  }

  function drawWaveCurve(fn, color){
    ctx.strokeStyle=color; ctx.lineWidth=2.3; ctx.beginPath();
    let first=true;
    for(let d=0; d<=angleMaxDeg; d+=2){
      const v = fn(toRad(d));
      const px=wx(d), py=wy(v);
      if(first){ ctx.moveTo(px,py); first=false; } else ctx.lineTo(px,py);
    }
    ctx.stroke();
  }

  function drawAngleArc(theta){
    const rr = 24;
    ctx.strokeStyle = '#46c46a'; ctx.lineWidth = 1.6;
    ctx.beginPath();
    const steps = Math.max(2, Math.round(Math.abs(theta)/toRad(4)));
    for(let i=0;i<=steps;i++){
      const a = theta*i/steps;
      const x = Ccx + rr*Math.cos(a), y = Ccy - rr*Math.sin(a);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }

  function render(){
    ctx.fillStyle='#12141a'; ctx.fillRect(0,0,W,H);
    drawCircleAxes();
    drawWaveAxes();

    const deg = parseFloat(angIn.value);
    const degWrap = ((deg % 360) + 360) % 360; // çemberdeki nokta hep 0-360 arası tekrarlar
    const rad = toRad(degWrap);
    const s = Math.sin(rad), c = Math.cos(rad);
    const px = Ccx + c*R, py = Ccy - s*R;

    drawAngleArc(rad);

    // yarıçap çizgisi
    ctx.strokeStyle='#ffd24a'; ctx.lineWidth=2.2;
    ctx.beginPath(); ctx.moveTo(Ccx,Ccy); ctx.lineTo(px,py); ctx.stroke();

    // izdüşümler
    if(showCos){
      ctx.strokeStyle='#f0a032'; ctx.lineWidth=2; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(px,Ccy); ctx.lineTo(px,py); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#f0a032'; ctx.beginPath(); ctx.arc(px,Ccy,3.5,0,Math.PI*2); ctx.fill();
    }
    if(showSin){
      ctx.strokeStyle='#3a7afe'; ctx.lineWidth=2; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(Ccx,py); ctx.lineTo(px,py); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#3a7afe'; ctx.beginPath(); ctx.arc(Ccx,py,3.5,0,Math.PI*2); ctx.fill();
    }

    // çember üstündeki nokta
    ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.arc(px,py,5.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#ffd24a'; ctx.lineWidth=1.6; ctx.stroke();

    // dalga eğrileri (tam aralıkta hep açık)
    if(showCos) drawWaveCurve(Math.cos, '#f0a032');
    if(showSin) drawWaveCurve(Math.sin, '#3a7afe');

    const wpx = wx(deg);
    if(showSin){
      const wpy = wy(s); // py ile aynı formül -> tam hizalı
      // çemberden dalgaya uzanan yatay "açılım" çizgisi — çemberi dalgaya "açan" çizgi tam bu
      ctx.strokeStyle='rgba(58,122,254,0.5)'; ctx.lineWidth=1.3; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(wpx,wpy); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#3a7afe'; ctx.beginPath(); ctx.arc(wpx,wpy,5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.2; ctx.stroke();
    }
    if(showCos){
      const wpyc = wy(c);
      ctx.fillStyle='#f0a032'; ctx.beginPath(); ctx.arc(wpx,wpyc,5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.2; ctx.stroke();
    }

    // dikey "şu an buradayız" çizgisi
    ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=1; ctx.setLineDash([2,2]);
    ctx.beginPath(); ctx.moveTo(wpx,Wy0); ctx.lineTo(wpx,Wy1); ctx.stroke(); ctx.setLineDash([]);

    // efsane
    ctx.font='12px Segoe UI, Arial'; ctx.textAlign='left';
    ctx.fillStyle='#3a7afe'; ctx.fillText('sin θ', Wx1-70, Wy0-8);
    ctx.fillStyle='#f0a032'; ctx.fillText('cos θ', Wx1-20, Wy0-8);

    angVal.textContent = F(deg,0)+'°  ('+F(toRad(deg),3)+' rad)';
    read.innerHTML =
      'θ = '+F(deg,0)+'°  →  sin θ = <b style="color:#3a7afe">'+F(s,4)+'</b>  ·  cos θ = <b style="color:#f0a032">'+F(c,4)+'</b>'+
      '<br><span style="color:var(--muted); font-size:12px">↳ nokta (cos θ, sin θ) = ('+F(c,3)+', '+F(s,3)+') çemberin üstünde. Mavi kesikli = sinθ (yükseklik), turuncu kesikli = cosθ (yatay konum).</span>';
  }

  angIn.addEventListener('input', ()=>{ if(playing) stopPlay(); render(); });
  sinBtn.addEventListener('click', ()=>{ showSin=!showSin; setActive(sinBtn, showSin); render(); });
  cosBtn.addEventListener('click', ()=>{ showCos=!showCos; setActive(cosBtn, showCos); render(); });
  setActive(sinBtn, showSin); setActive(cosBtn, showCos);

  function step(t){
    if(!playing) return;
    if(lastT==null) lastT=t;
    const dt = (t-lastT)/1000; lastT=t;
    let v = parseFloat(angIn.value) + dt*90; // 90°/sn
    if(v>angleMaxDeg) v -= angleMaxDeg;
    angIn.value = v;
    render();
    rafId = requestAnimationFrame(step);
  }
  function startPlay(){
    playing = true; lastT=null; playBtn.textContent='⏸ Durdur';
    rafId = requestAnimationFrame(step);
  }
  function stopPlay(){
    playing = false; playBtn.textContent='▶ Oynat';
    if(rafId) cancelAnimationFrame(rafId);
  }
  playBtn.addEventListener('click', ()=>{ playing ? stopPlay() : startPlay(); });

  render();
})();
