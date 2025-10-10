// script.js — shared background starfield and UI for index
(function(){
  const canvas = document.getElementById('bg');
  if(!canvas) return;
  const cu = window.CanvasUtils?.setupCanvas(canvas);
  if(!cu) return;
  const { ctx, dpr } = cu;

  const stars = []; const SHOOT = [];
  function seedStars(){ stars.length=0; const w=canvas.width,h=canvas.height; const count = Math.floor((w*h)/(1200*dpr)); for(let i=0;i<count;i++){ stars.push({ x:Math.random()*w, y:Math.random()*h, r:(0.35+Math.random()*1.05)*dpr, a:0.18+Math.random()*0.72, t:Math.random()*Math.PI*2, hue: Math.random()<0.86?230:255 }); } }
  seedStars(); window.addEventListener('resize', seedStars, {passive:true});

  function spawnShoot(){ if(Math.random()<0.018){ SHOOT.push({x:-120*dpr,y:(0.08+Math.random()*0.76)*canvas.height,len:(120+Math.random()*100)*dpr,s:(5+Math.random()*6)*dpr,a:1,w:(1.2+Math.random()*1.6)*dpr,ang:Math.PI/8+Math.random()*Math.PI/16}); } }

  function draw(){ ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#0b0b12'; ctx.fillRect(0,0,canvas.width,canvas.height); const g = ctx.createRadialGradient(canvas.width*0.15, canvas.height*0.2, 0, canvas.width*0.15, canvas.height*0.2, canvas.width*0.9); g.addColorStop(0,'#0d1a3a44'); g.addColorStop(1,'#00000000'); ctx.fillStyle=g; ctx.fillRect(0,0,canvas.width,canvas.height); for(const s of stars){ s.t+=0.02; const tw = s.a + Math.sin(s.t)*0.08; ctx.globalAlpha=Math.max(0.15,Math.min(1,tw)); ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=`hsl(${s.hue} 92% 90%)`; ctx.shadowColor='rgba(109,90,255,0.42)'; ctx.shadowBlur=8*dpr; ctx.fill(); } spawnShoot(); for(let i=SHOOT.length-1;i>=0;i--){ const st = SHOOT[i]; ctx.save(); ctx.globalAlpha = st.a; const dx=Math.cos(st.ang)*st.len, dy=Math.sin(st.ang)*st.len; const grad = ctx.createLinearGradient(st.x, st.y, st.x+dx, st.y+dy); grad.addColorStop(0.55,'rgba(109,90,255,0.92)'); grad.addColorStop(1,'rgba(0,0,64,0)'); ctx.strokeStyle=grad; ctx.lineWidth=st.w; ctx.beginPath(); ctx.moveTo(st.x, st.y); ctx.lineTo(st.x+dx, st.y+dy); ctx.stroke(); ctx.restore(); st.x += Math.cos(st.ang)*st.s; st.y += Math.sin(st.ang)*st.s; st.a -= 0.01; if(st.a<=0||st.x>canvas.width+200||st.y>canvas.height+80) SHOOT.splice(i,1); } requestAnimationFrame(draw); }
  requestAnimationFrame(draw);

  // overlay interactions with focus-trap & escape handling
  const overlay = document.getElementById('overlay');
  const chime = document.getElementById('chime');
  let untrap = ()=>{}; let unescape = ()=>{};
  function burst(x,y){ if(!overlay) return; const ring=document.createElement('span'); ring.className='ring'; ring.style.left=x+'px'; ring.style.top=y+'px'; overlay.appendChild(ring); setTimeout(()=>ring.remove(),900); }
  function enter(){
    try{ chime.currentTime=0; chime.play().catch(()=>{});}catch(e){}
    if(overlay){
      overlay.classList.add('leaving');
      setTimeout(()=>{ overlay.setAttribute('hidden',''); untrap(); unescape(); },650);
      setTimeout(()=>document.getElementById('hero')?.focus(),700);
    }
  }

  if(overlay){
    // trap focus while visible
    overlay.addEventListener('transitionend', ()=>{
      // focus the first focusable
      overlay.querySelector('button, [tabindex]')?.focus();
    }, {once:true});
    untrap = window.UIUtils?.trapFocus(overlay) || (()=>{});
    unescape = window.UIUtils?.onEscape(()=>{ enter(); }) || (()=>{});

    ['click','keydown','touchstart'].forEach(evt=>{ overlay.addEventListener(evt, e=>{ if(evt==='keydown' && !(e.key==='Enter'||e.key===' ')) return; const x=(e.touches?.[0]?.clientX ?? e.clientX) || (document.documentElement.clientWidth/2); const y=(e.touches?.[0]?.clientY ?? e.clientY) || (document.documentElement.clientHeight/2); burst(x,y); enter(); }, {passive:true}); });

    // Direct fallback for Enter button
    var enterBtn = document.getElementById('enterBtn');
    if (enterBtn) {
      enterBtn.addEventListener('click', function(e) {
        burst(e.clientX || window.innerWidth/2, e.clientY || window.innerHeight/2);
        enter();
      });
      enterBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          burst(window.innerWidth/2, window.innerHeight/2);
          enter();
        }
      });
    }
  }

  // parallax
  const devices = document.querySelector('.devices'); const skills = document.querySelector('.skills'); addEventListener('mousemove', e=>{ const cx=(e.clientX/document.documentElement.clientWidth - 0.5); const cy=(e.clientY/document.documentElement.clientHeight - 0.5); if(devices) devices.style.transform=`translate(${cx*8}px, ${cy*5}px)`; if(skills) skills.style.transform=`translate(${cx*-5}px, calc(-50% + ${cy*7}px))`; }, {passive:true});

})();

// ...existing code...
