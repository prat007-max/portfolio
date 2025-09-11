// ----------------- UTIL -----------------
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ----------------- FLAME SHADER (Three.js) -----------------
(function flameShader(){
  const canvas = document.getElementById('flame');
  if(!canvas || reducedMotion){ canvas && (canvas.style.display='none'); return; }

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const geometry = new THREE.PlaneGeometry(2,2);

  const uniforms = {
    u_time: { value: 0.0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_mouse: { value: new THREE.Vector2(-9999,-9999) },
    u_intensity: { value: 1.0 }
  };

  const frag = `precision highp float;
    uniform vec2 u_resolution; uniform float u_time; uniform vec2 u_mouse; uniform float u_intensity;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
    float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
    float fbm(vec2 p){float v=0.0;float a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
    void main(){ vec2 uv=gl_FragCoord.xy/u_resolution.xy; vec2 pos=uv-0.5; pos.x*=u_resolution.x/u_resolution.y;
      float t=u_time*0.7;
      float core = smoothstep(0.2,0.9,1.0 - (pos.y+0.5)*1.6);
      float n = fbm(vec2(pos.x*2.0, pos.y*3.0 - t*0.8));
      float flameshape = core * (0.5 + 0.8*n);
      float radial = smoothstep(0.9,0.2,length(pos.xy*vec2(1.0,0.9)));
      float intensity = clamp(flameshape * radial, 0.0,1.0);
      float smoke = fbm(vec2(pos.x*0.8, pos.y*1.2 - t*0.25));
      smoke = smoothstep(0.2,0.8,smoke);
      vec3 hot = vec3(1.0,0.96,0.8);
      vec3 yellow = vec3(1.0,0.7,0.14);
      vec3 orange = vec3(0.98,0.42,0.08);
      vec3 red = vec3(0.65,0.12,0.03);
      vec3 smokeCol = vec3(0.06,0.06,0.08);
      vec3 col = mix(smokeCol, red, intensity);
      col = mix(col, orange, intensity*0.8);
      col = mix(col, yellow, intensity*0.5);
      col = mix(col, hot, intensity*0.25);
      float flick = 0.12 * noise(vec2(pos.x*5.0 + u_time*0.8, pos.y*3.0));
      float md = length((gl_FragCoord.xy - u_mouse) / u_resolution.xy);
      float mouseBoost = exp(-md*6.0);
      intensity += flick * mouseBoost * 0.6;
      float smokeOverlay = smoothstep(0.25, 0.8, smoke) * (1.0 - intensity*0.6);
      float alpha = clamp(intensity*1.2 + (1.0 - pos.y)*0.2, 0.0, 1.0);
      vec3 finalCol = mix(vec3(0.02,0.02,0.03), col*(0.6 + intensity*0.8), alpha);
      finalCol = mix(finalCol, vec3(0.08,0.08,0.09), smokeOverlay*0.6);
      finalCol = 1.0 - exp(-finalCol * (2.2 * u_intensity));
      float vignette = smoothstep(0.0, 0.8, 1.0 - length(pos)*1.3);
      finalCol *= vignette;
      gl_FragColor = vec4(finalCol, clamp(alpha + (1.0 - smokeOverlay)*0.05, 0.0, 1.0));
    }`;

  const material = new THREE.ShaderMaterial({ fragmentShader: frag, uniforms, transparent:true, depthWrite:false });
  const mesh = new THREE.Mesh(geometry, material); scene.add(mesh);

  const clock = new THREE.Clock();

  function onPointerMove(e){
    const rect = renderer.domElement.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (rect.bottom - e.clientY);
    uniforms.u_mouse.value.set(x,y);
  }
  window.addEventListener('pointermove', onPointerMove, {passive:true});

  function onResize(){ const w=window.innerWidth,h=window.innerHeight; renderer.setSize(w,h); uniforms.u_resolution.value.set(w,h); }
  window.addEventListener('resize', onResize, {passive:true});

  function render(){ uniforms.u_time.value = clock.getElapsedTime(); renderer.render(scene, camera); requestAnimationFrame(render); }
  render();

  // expose for pulses
  window._flameUniforms = uniforms;
})();

// ----------------- UI, Animations & Interactions -----------------
(function UI(){
  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  function heroAnim(){
    if(reducedMotion) return;
    gsap.from("#heroTitle", { y: 22, opacity:0, duration:0.9, ease:"power3.out" });
    gsap.from(".hero-sub", { y: 12, opacity:0, duration:0.75, delay:0.12 });
    gsap.from(".portrait", { scale:0.96, opacity:0, duration:1, ease:"elastic.out(1,0.6)", delay:0.25 });
    gsap.from(".cta .btn", { y:12, opacity:0, duration:0.7, stagger:0.08, delay:0.38 });
  }

  // Magnetic buttons
  function initMagnetics(){
    document.querySelectorAll('.magnetic').forEach(el=>{
      el.addEventListener('pointermove', e=>{
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width/2));
        const dy = (e.clientY - (r.top + r.height/2));
        gsap.to(el, { x: dx*0.12, y: dy*0.08, scale:1.03, duration:0.28 });
      }, {passive:true});
      el.addEventListener('pointerleave', ()=> gsap.to(el, { x:0, y:0, scale:1, duration:0.35 }));
    });
  }

  // Skill fills on scroll
  function initSkillFills(){
    document.querySelectorAll('.skill-fill').forEach(el=>{
      const val = el.dataset.fill || '80%';
      gsap.to(el, { width: val, duration:1.4, ease:'power2.out', scrollTrigger:{ trigger: el, start:'top 85%' }});
    });
  }

  // Experience animation
  function initExperience(){
    gsap.utils.toArray('[data-anim]').forEach((el,i)=>{
      gsap.from(el, { y: 28, opacity:0, duration:0.9, delay:i*0.06, ease:'power3.out', scrollTrigger:{ trigger: el, start:'top 90%'}});
    });
  }

  // Project card tilt
  function initProjectTilt(){
    document.querySelectorAll('.project-card').forEach(card=>{
      card.addEventListener('pointermove', e=>{
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left)/r.width;
        const py = (e.clientY - r.top)/r.height;
        const rx = (py - 0.5) * 6;
        const ry = (px - 0.5) * -6;
        gsap.to(card, { rotateX: rx, rotateY: ry, duration:0.28, ease:'power2.out' });
      }, {passive:true});
      card.addEventListener('pointerleave', ()=> gsap.to(card, { rotateX:0, rotateY:0, duration:0.5, ease:'power2.out' }));
    });
  }

  // Nav link smooth scroll
  function initNavLinks(){
    document.querySelectorAll('.nav-links a').forEach(a=>{
      a.addEventListener('click', e=>{
        e.preventDefault();
        const id = a.getAttribute('href');
        document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // Theme toggle (persist)
  function initThemeToggle(){
    const btn = document.getElementById('themeToggle');
    const stored = localStorage.getItem('pt_theme');
    if(stored === 'dark'){ document.body.classList.add('dark'); btn.textContent = '☀️'; btn.setAttribute('aria-pressed','true'); }
    else { document.body.classList.remove('dark'); btn.textContent = '🌙'; btn.setAttribute('aria-pressed','false'); }

    btn.addEventListener('click', ()=>{
      const nowDark = document.body.classList.toggle('dark');
      btn.textContent = nowDark ? '☀️' : '🌙';
      btn.setAttribute('aria-pressed', String(nowDark));
      localStorage.setItem('pt_theme', nowDark ? 'dark' : 'light');
    });
  }

  // Footer year
  function setYear(){ document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear()); }

  // Init all
  window.addEventListener('DOMContentLoaded', ()=>{
    heroAnim();
    initMagnetics();
    initSkillFills();
    initExperience();
    initProjectTilt();
    initNavLinks();
    initThemeToggle();
    setYear();
  });
  // Magnetic effect for project cards
document.querySelectorAll('.project-card.magnetic').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `rotateY(${x / 20}deg) rotateX(${-y / 20}deg) scale(1.03)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

})();
