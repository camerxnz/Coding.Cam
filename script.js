// Viewport-safe sizing and starfield for shared background canvas
(function(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.getElementById('bg');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  function size(){
    const w = document.documentElement.clientWidth;
    const h = document.documentElement.clientHeight;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  addEventListener('resize', size, {passive:true});
  size();

  // Lightweight starfield with occasional shooting star
  const stars = []; const SHOOT=[];
  function seedStars(){
    stars.length = 0;
    const w = canvas.width; const h = canvas.height;
    const count = Math.floor((w*h)/(1400 * dpr));
    for(let i=0;i<count;i++){
      stars.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: (0.4+Math.random()*1.1)*dpr,
        a: 0.2+Math.random()*0.7,
        t: Math.random()*Math.PI*2,
        hue: Math.random()<0.85? 230: 255
      });
    }
  }
  seedStars();
  addEventListener('resize', seedStars, {passive:true});

  function spawnShoot(){
    if(Math.random()<0.012){
      SHOOT.push({x:-120*dpr,y:(0.1+Math.random()*0.7)*canvas.height,len:(120+Math.random()*80)*dpr,s: (5+Math.random()*5)*dpr, a:1, w:(1.2+Math.random()*1.6)*dpr, ang:Math.PI/8+Math.random()*Math.PI/18});
    }
  }

  function draw(){
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // deep background tint
    ctx.fillStyle = '#0b0b12';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    // gradient vignette
    const g = ctx.createRadialGradient(canvas.width*0.15, canvas.height*0.2, 0, canvas.width*0.15, canvas.height*0.2, canvas.width*0.9);
    g.addColorStop(0,'#0d1a3a33'); g.addColorStop(1,'#00000000');
    ctx.fillStyle=g; ctx.fillRect(0,0,canvas.width,canvas.height);
    // stars
    for(const s of stars){
      s.t += 0.02; const tw = s.a + Math.sin(s.t)*0.08;
      ctx.globalAlpha = Math.max(0.15, Math.min(1, tw));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `hsl(${s.hue} 90% 90%)`;
      ctx.shadowColor = 'rgba(109,90,255,0.4)';
      ctx.shadowBlur = 8*dpr;
      ctx.fill();
    }
    // shooting stars
    spawnShoot();
    for(let i=SHOOT.length-1;i>=0;i--){
      const st = SHOOT[i];
      ctx.save();
      ctx.globalAlpha = st.a;
      const dx = Math.cos(st.ang)*st.len, dy = Math.sin(st.ang)*st.len;
      const grad = ctx.createLinearGradient(st.x, st.y, st.x+dx, st.y+dy);
      grad.addColorStop(0.6,'rgba(109,90,255,0.8)');
      grad.addColorStop(1,'rgba(0,0,64,0)');
      ctx.strokeStyle = grad; ctx.lineWidth = st.w; ctx.beginPath();
      ctx.moveTo(st.x, st.y); ctx.lineTo(st.x+dx, st.y+dy); ctx.stroke();
      ctx.restore();
      st.x += Math.cos(st.ang)*st.s; st.y += Math.sin(st.ang)*st.s; st.a -= 0.01;
      if(st.a<=0 || st.x>canvas.width+200 || st.y>canvas.height+80) SHOOT.splice(i,1);
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // Overlay enter animation
  const overlay = document.getElementById('overlay');
  const chime = document.getElementById('chime');
  function burst(x,y){
    const ring = document.createElement('span');
    ring.className = 'ring';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    overlay.appendChild(ring);
    setTimeout(()=> ring.remove(), 900);
  }
  function enter(){
    try{ chime.currentTime = 0; chime.play().catch(()=>{});}catch(e){}
    overlay.classList.add('leaving');
    setTimeout(()=> overlay.setAttribute('hidden',''), 650);
    setTimeout(()=> document.getElementById('hero')?.focus(), 700);
  }
  ['click','keydown','touchstart'].forEach(evt=>{
    overlay.addEventListener(evt, e=>{
      if(evt==='keydown' && !(e.key==='Enter' || e.key===' ')) return;
      const x = (e.touches?.[0]?.clientX ?? e.clientX) || (document.documentElement.clientWidth/2);
      const y = (e.touches?.[0]?.clientY ?? e.clientY) || (document.documentElement.clientHeight/2);
      burst(x,y);
      enter();
    }, {passive:true});
  });

  // Subtle parallax for devices and skills
  const devices = document.querySelector('.devices');
  const skills = document.querySelector('.skills');
  addEventListener('mousemove', e=>{
    const cx = (e.clientX/document.documentElement.clientWidth - 0.5);
    const cy = (e.clientY/document.documentElement.clientHeight - 0.5);
    if(devices) devices.style.transform = `translate(${cx*6}px, ${cy*4}px)`;
    if(skills) skills.style.transform = `translate(${cx*-4}px, calc(-50% + ${cy*6}px))`;
  });

})();
