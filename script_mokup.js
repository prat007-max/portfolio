// Theme toggle + year
(function(){
  const btn=document.getElementById('theme');
  const stored=localStorage.getItem('mk_theme');
  if(stored==='dark'){document.body.classList.add('dark');btn.textContent='☀️'}
  btn.addEventListener('click',()=>{const d=document.body.classList.toggle('dark');btn.textContent=d?'☀️':'🌙';localStorage.setItem('mk_theme',d?'dark':'light')});
  document.getElementById('year').textContent=new Date().getFullYear();
})();

// Simple publication filter
(function(){
  const list=document.getElementById('pubList');
  document.querySelectorAll('[data-filter]').forEach(b=>{
    b.addEventListener('click',()=>{
      const t=b.dataset.filter; 
      list.querySelectorAll('.pub').forEach(p=>{
        p.style.display = (t==='all'|| p.dataset.type===t)?'block':'none';
      });
    });
  });
})();

// Skills fill on scroll
(function(){
  const fills=[...document.querySelectorAll('.skill-fill')];
  if(!('IntersectionObserver' in window)){
    fills.forEach(f=>f.style.width=f.dataset.fill||'80%'); return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=>{if(en.isIntersecting){const el=en.target; el.style.width=el.dataset.fill||'80%'; io.unobserve(el);}});
  },{threshold:0.4});
  fills.forEach(f=>io.observe(f));
})();

// Initialize AOS
document.addEventListener('DOMContentLoaded',()=>{ if (window.AOS) AOS.init({ once:true, duration:700, easing:'ease-out-cubic' }); });

// HERO flame with SVG fallback
(function heroFlame(){
  const canvas = document.getElementById('flame');
  if(!canvas) return;
  if(!window.THREE){
    const wrap=canvas.parentElement;
    wrap.innerHTML = `
      <svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block;mix-blend-mode:screen">
        <defs>
          <radialGradient id="g" cx="50%" cy="60%" r="60%">
            <stop offset="0%" stop-color="#ffd3a3"/>
            <stop offset="60%" stop-color="#ff8c3b"/>
            <stop offset="100%" stop-color="rgba(255,140,59,0)"/>
          </radialGradient>
        </defs>
        <g opacity="0.9">
          <path fill="url(#g)">
            <animate attributeName="d" dur="6s" repeatCount="indefinite" values="
              M300,260 C220,220 210,180 300,80 C390,180 380,220 300,260 Z;
              M300,260 C230,210 210,170 300,90 C390,170 370,220 300,260 Z;
              M300,260 C220,220 210,180 300,80 C390,180 380,220 300,260 Z"/>
          </path>
        </g>
      </svg>`;
    return;
  }
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const geo = new THREE.PlaneGeometry(2,2);
  const uni = { u_time:{value:0}, u_res:{value:new THREE.Vector2(640,320)} };
  const vert = `void main(){ gl_Position = vec4(position, 1.0); }`;
  const frag = `
    precision highp float; uniform vec2 u_res; uniform float u_time; 
    float hash(vec2 p){return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123);} 
    float noise(vec2 p){vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.-2.*f); 
      float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
      return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);} 
    float fbm(vec2 p){float v=0.; float a=0.5; for(int i=0;i<6;i++){v+=a*noise(p); p*=2.1; a*=0.5;} return v;}
    mat2 rot(float a){float c=cos(a), s=sin(a); return mat2(c,-s,s,c);} 
    void main(){
      vec2 uv = gl_FragCoord.xy/u_res.xy; 
      vec2 p = uv - 0.5; p.x *= u_res.x/u_res.y; 
      p.y -= 0.10; 
      float theta = radians(36.0); float slope = tan(theta);
      float cone = smoothstep(0.30, 0.02, abs(p.x) - (p.y*slope + 0.06));
      float base = smoothstep(0.10, -0.12, p.y); 
      float mask = clamp(cone * base, 0.0, 1.0);
      float t = u_time*0.7; 
      float swirlA = fbm((rot(sin(t)*0.24) * vec2(p.x*3.0, p.y*3.4 - t)) + vec2(0.0, t*0.22));
      float swirlB = fbm((rot(cos(t)*0.18) * vec2(p.x*6.2, p.y*5.1 - t*1.15)) + vec2(1.3, -t*0.14));
      float swirl = mix(swirlA, swirlB, 0.6);
      float body = smoothstep(-0.36, 0.66, p.y + swirl*0.28);
      float f = clamp(mask * body, 0.0, 1.0);
      vec3 c1=vec3(1.00,0.46,0.08), c2=vec3(1.00,0.74,0.32), c3=vec3(1.00,0.92,0.72);
      vec3 col = mix(c1,c2,f); col = mix(col,c3,f*f);
      float glow = smoothstep(0.22,1.2,f+base*0.4)*0.35; col += glow*vec3(1.0,0.55,0.15);
      float topFade = smoothstep(0.92,0.67,uv.y); float bottomFade = smoothstep(-0.02,0.18,p.y);
      float a = f * 0.94 * bottomFade * topFade;
      gl_FragColor = vec4(col, a);
    }`;
  const mat = new THREE.ShaderMaterial({vertexShader:vert, fragmentShader:frag, uniforms:uni, transparent:true, depthWrite:false});
  const mesh = new THREE.Mesh(geo, mat); scene.add(mesh);
  const wrap = canvas.parentElement; 
  if ('ResizeObserver' in window){
    const ro = new ResizeObserver(([e])=>{ const {width,height}=e.contentRect; const w=Math.max(1,Math.floor(width)); const h=Math.max(1,Math.floor(height)); renderer.setSize(w,h,false); uni.u_res.value.set(w,h); });
    ro.observe(wrap);
  } else {
    const w=wrap.clientWidth||640, h=wrap.clientHeight||320; renderer.setSize(w,h,false); uni.u_res.value.set(w,h);
    window.addEventListener('resize',()=>{ const w2=wrap.clientWidth||640, h2=wrap.clientHeight||320; renderer.setSize(w2,h2,false); uni.u_res.value.set(w2,h2); });
  }
  const clock = new THREE.Clock();
  function tick(){ uni.u_time.value = clock.getElapsedTime(); renderer.render(scene, cam); requestAnimationFrame(tick); }
  tick();
})();

// Flame rail (side) — half flame that alternates sides
(function railFlame(){
  const canvas = document.getElementById('flameRail');
  if(!canvas || !window.THREE) return;
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const geo = new THREE.PlaneGeometry(2,2);
  const uni = { u_time:{value:0}, u_res:{value:new THREE.Vector2(260,360)}, u_side:{value:0.0} };
  const vert = `void main(){ gl_Position = vec4(position,1.0); }`;
  const frag = `precision highp float; uniform vec2 u_res; uniform float u_time; uniform float u_side; 
    float hash(vec2 p){return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123);} 
    float noise(vec2 p){vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.-2.*f); float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.)); return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);} 
    float fbm(vec2 p){float v=0.; float a=0.5; for(int i=0;i<5;i++){v+=a*noise(p); p*=2.1; a*=0.5;} return v;}
    void main(){
      vec2 uv = gl_FragCoord.xy/u_res.xy; vec2 p = uv - 0.5; p.x *= u_res.x/u_res.y; 
      float side = step(0.5, uv.x);
      if(u_side<0.5) side = 1.0 - side;
      float halfMask = side;
      float slope = tan(radians(34.));
      float cone = smoothstep(0.30, 0.02, abs(p.x) - (p.y*slope + 0.02));
      float base = smoothstep(0.12, -0.12, p.y);
      float fmask = clamp(cone*base,0.0,1.0) * halfMask;
      float t=u_time*0.65; float swirl = fbm(vec2(p.x*4.0, p.y*4.5 - t));
      float body = smoothstep(-0.3,0.6,p.y + swirl*0.22);
      float f = clamp(fmask*body,0.0,1.0);
      vec3 c1=vec3(1.0,0.46,0.08), c2=vec3(1.0,0.74,0.32), c3=vec3(1.0,0.92,0.72);
      vec3 col=mix(c1,c2,f); col=mix(col,c3,f*f);
      gl_FragColor = vec4(col, f*0.92);
    }`;
  const mat = new THREE.ShaderMaterial({vertexShader:vert, fragmentShader:frag, uniforms:uni, transparent:true, depthWrite:false});
  const mesh = new THREE.Mesh(geo, mat); scene.add(mesh);
  function resize(){ const w=canvas.clientWidth||260, h=canvas.clientHeight||360; renderer.setSize(w,h,false); uni.u_res.value.set(w,h);} resize();
  window.addEventListener('resize', resize, {passive:true});
  const clock = new THREE.Clock(); function tick(){ uni.u_time.value=clock.getElapsedTime(); renderer.render(scene, cam); requestAnimationFrame(tick);} tick();
  const rail = canvas; const sections=[...document.querySelectorAll('section.snap')].filter(s=>s.id!=='home');
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ const idx=sections.indexOf(en.target); rail.classList.add('show'); const right = idx % 2 === 0; rail.classList.toggle('right', right); rail.classList.toggle('left', !right); uni.u_side.value = right ? 1.0 : 0.0; }
    });
  },{threshold:0.5});
  sections.forEach(s=>io.observe(s));
})();

// Micro-interactions
(function micro(){
  const btn=document.getElementById('igniteBtn');
  if(btn){
    const strength=14; let raf;
    btn.addEventListener('pointermove',e=>{
      const r=btn.getBoundingClientRect(); const x=(e.clientX - (r.left + r.width/2))/ (r.width/2); const y=(e.clientY - (r.top + r.height/2))/ (r.height/2);
      cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{ btn.style.transform=`translate(${x*strength}px, ${y*strength}px)`; });
    });
    btn.addEventListener('pointerleave',()=>{ btn.style.transform='translate(0,0)'; });
  }
  document.querySelectorAll('.proj').forEach(card=>{
    const rrot=6; let raf;
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect(); const x=(e.clientX - (r.left + r.width/2))/(r.width/2); const y=(e.clientY - (r.top + r.height/2))/(r.height/2);
      cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{ card.style.transform=`rotateX(${-y*rrot}deg) rotateY(${x*rrot}deg)`; card.style.boxShadow='0 24px 50px rgba(10,13,18,.12)'; });
    });
    card.addEventListener('pointerleave',()=>{ card.style.transform='none'; card.style.boxShadow=''; });
  });
})();

// Mobile menu toggle
(function(){
  const nav=document.getElementById('siteNav');
  const btn=document.getElementById('menuBtn');
  btn.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('#primaryNav a').forEach(a=>a.addEventListener('click',()=>{
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
  }));
})();

// Publications overlay
(function(){
  const overlay=document.getElementById('pubOverlay');
  const openBtns=[...document.querySelectorAll('.open-pubs')];
  const closeBtn=document.getElementById('ovClose');
  const list=document.getElementById('allPubsList');
  const search=document.getElementById('pubSearch');
  const chips=[...document.querySelectorAll('.chip')];
  const pubs=[
    {type:'journal', year:2025, title:'Stabilization metrics in lean H2 flames', authors:'Jethani, R.; Smith, J.', venue:'Combustion and Flame', doi:'10.1234/caf.2025.001', bib:'@article{jethani2025,...}'},
    {type:'conf', year:2024, title:'Ignition characteristics of hydrogen/air', authors:'Author, A.; Author, B.', venue:'ASME Turbo-Expo', doi:'10.0000/xyz', bib:'@inproceedings{author2024,...}'},
    {type:'poster', year:2023, title:'Optical access design for HP rigs', authors:'Jethani, R.; Doe, K.', venue:'AIAA SciTech Poster', doi:'', bib:'@misc{jethani2023,...}'}
  ];
  let state={q:'', chip:'all'};
  function render(){
    list.innerHTML='';
    const now=new Date().getFullYear();
    const filtered=pubs.filter(p=>{
      const matchesChip = state.chip==='all' ? true : (state.chip==='recent' ? (now - p.year <= 3) : p.type===state.chip);
      const q=state.q.trim().toLowerCase();
      const matchesQ = !q || [p.title,p.authors,p.venue,String(p.year)].join(' ').toLowerCase().includes(q);
      return matchesChip && matchesQ;
    }).sort((a,b)=>b.year-a.year);
    filtered.forEach(p=>{
      const el=document.createElement('div'); el.className='pub t-card';
      el.innerHTML = `<cite><strong>${p.title}</strong> — ${p.authors}. <em>${p.venue}</em> (${p.year}). ${p.doi?`DOI: <a href="https://doi.org/${p.doi}" target="_blank" rel="noopener">${p.doi}</a>`:''}</cite>
                      <div class="bib"><button class="btn ghost copy-bib">Copy BibTeX</button></div>`;
      el.querySelector('.copy-bib').addEventListener('click',()=>{navigator.clipboard.writeText(p.bib)});
      list.appendChild(el);
    });
  }
  openBtns.forEach(b=>b.addEventListener('click',(e)=>{e.preventDefault(); overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); render(); chips[0].classList.add('active'); }));
  closeBtn.addEventListener('click',()=>{overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true');});
  search.addEventListener('input',e=>{state.q=e.target.value; render();});
  chips.forEach(ch=>ch.addEventListener('click',()=>{chips.forEach(c=>c.classList.remove('active')); ch.classList.add('active'); state.chip=ch.dataset.chip; render();}));
})();
