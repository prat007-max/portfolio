/* scripts.js
   Replace the big inline "Fullpage + GSAP + UI logic" block with this file.
   This script assumes:
   - GSAP + ScrollTrigger are already loaded (you included GSAP in the page)
   - fullPage.js is available (your original HTML includes it)
   - Three shader is already running and window._flameUniforms may exist
*/

(function(){
  // -- helpers --
  function $q(sel, ctx=document) { return ctx.querySelector(sel); }
  function $qa(sel, ctx=document) { return Array.from(ctx.querySelectorAll(sel)); }

  // ---------- 1) TABS for About ----------
  function initAboutTabs(){
    const tabs = $qa('.tab');
    if(!tabs.length) return;
    tabs.forEach(tab=>{
      tab.addEventListener('click', ()=>{
        // remove active
        tabs.forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        // hide all tab-content
        $qa('.tab-content').forEach(tc=>tc.classList.add('hidden'));
        const id = tab.dataset.tab;
        const el = document.getElementById(id);
        if(el) el.classList.remove('hidden');
      });
    });
  }

  // ---------- 2) Skills animation (GSAP + ScrollTrigger) ----------
  function initSkillsAnimation(){
    if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // fallback simple animate on scroll into view
      const skills = $qa('.skill-fill');
      const observer = new IntersectionObserver((entries, obs)=>{
        entries.forEach(entry => {
          if(entry.isIntersecting){
            skills.forEach(s=> s.style.width = (s.getAttribute('data-fill') || '80%'));
            obs.disconnect();
          }
        });
      }, {threshold:0.25});
      const skillsSection = document.getElementById('skills');
      if(skillsSection) observer.observe(skillsSection);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    $qa('.skill-fill').forEach(fill => {
      const target = fill.getAttribute('data-fill') || '80%';
      gsap.fromTo(fill, { width: '0%' }, {
        width: target,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: fill,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  }

  // ---------- 3) Magnetic CTA buttons (subtle) ----------
  function initMagnetic(){
    $qa('.magnetic').forEach(el=>{
      el.style.willChange = 'transform';
      el.addEventListener('pointermove', (e)=>{
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width/2);
        const dy = e.clientY - (r.top + r.height/2);
        const tx = dx * 0.12;
        const ty = dy * 0.08;
        gsap.to(el, { x: tx, y: ty, scale: 1.03, duration: 0.22, ease:'power2.out' });
      });
      el.addEventListener('pointerleave', ()=> gsap.to(el, { x:0, y:0, scale:1, duration:0.35, ease:'power2.out' }));
    });
  }

  // ---------- 4) Flip cards + pointer tilt ----------
  function initFlipAndTilt(){
    $qa('.flip-card').forEach(card=>{
      const inner = $q('.flip-card-inner', card);
      if(!inner) return;
      // hover flip (also keep CSS-based hover for safety)
      card.addEventListener('mouseenter', ()=> inner.style.transform = 'rotateY(180deg)');
      card.addEventListener('mouseleave', ()=> inner.style.transform = 'rotateY(0deg)');

      // pointer tilt inside
      card.addEventListener('pointermove', (e)=>{
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * 8; // tilt X
        const ry = (px - 0.5) * -8; // tilt Y
        // keep rotateY(0deg) baseline so flip doesn't interfere
        inner.style.transform = `rotateY(0deg) translateZ(0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('pointerleave', ()=> inner.style.transform = 'rotateY(0deg)');
    });
  }

  // ---------- 5) GSAP entry animations for timeline/projects/pubs ----------
  function initGSAPTriggers(){
    if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Timeline cards
    gsap.utils.toArray('.timeline-card').forEach((el,i)=>{
      gsap.fromTo(el, { x:-30, opacity:0 }, {
        x:0, opacity:1, duration:0.7, delay: i*0.06,
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    // Projects pop
    gsap.utils.toArray('.projects-grid .flip-card').forEach((el,i)=>{
      gsap.from(el, { y:40, opacity:0, duration:0.8, delay: i*0.06, ease:'power3.out', scrollTrigger:{ trigger: el, start:'top 85%'} });
    });

    // Publications
    gsap.utils.toArray('.pub-grid > div').forEach((el,i)=>{
      gsap.from(el, { y:24, opacity:0, duration:0.7, delay:i*0.04, scrollTrigger:{ trigger: el, start:'top 90%'} });
    });
  }

  // ---------- 6) Publications "View All" button behavior ----------
  function initPublicationsButton(){
    // The HTML already has a link; ensure it opens in a new tab. If not present, create small CTA.
    const existing = document.querySelector('.pub-cta');
    if(existing) return;
    const section = document.getElementById('publications');
    if(!section) return;
    const a = document.createElement('a');
    a.href = 'publications.html';
    a.target = '_blank';
    a.className = 'pub-cta';
    a.textContent = 'View Full Publications →';
    section.appendChild(a);
  }

  // ---------- 7) Contact icons injection ----------
  function initContactIcons(){
    const cw = document.querySelector('.contact-wrapper');
    if(!cw) return;

    // Only inject if not already present
    if(cw.querySelector('.contact-socials')) return;

    const wrap = document.createElement('div');
    wrap.className = 'contact-socials';

    const links = [
      { href:'https://instagram.com', title:'Instagram', html:'<i class="fab fa-instagram"></i>' },
      { href:'https://scholar.google.com', title:'Google Scholar', html:'<i class="fas fa-graduation-cap"></i>' },
      { href:'https://linkedin.com', title:'LinkedIn', html:'<i class="fab fa-linkedin"></i>' },
      { href:'mailto:ptiwari4@vols.utk.edu', title:'Email', html:'<i class="fas fa-envelope"></i>' }
    ];

    links.forEach(l=>{
      const a = document.createElement('a');
      a.href = l.href;
      a.title = l.title;
      a.target = l.href.startsWith('http') ? '_blank' : '_self';
      a.innerHTML = l.html;
      wrap.appendChild(a);
    });

    cw.appendChild(wrap);
  }

  // ---------- 8) Contact form handling (dummy) ----------
  function initContactForm(){
    const form = document.getElementById('contactForm');
    if(!form) return;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if(btn) gsap.to(btn, { scale:0.96, duration:0.08, yoyo:true, repeat:1 });
      // small toast
      const t = document.createElement('div'); t.className = 'simple-alert'; t.textContent = 'Thanks — demo does not send mail.';
      document.body.appendChild(t);
      setTimeout(()=> t.remove(), 2200);
      form.reset();
    });
  }

  // ---------- 9) Subtle flame interaction on CTA hover ----------
  function initFlameInteraction(){
    const ctas = document.querySelectorAll('.cta .magnetic, .btn-magnetic');
    if(!ctas.length) return;
    ctas.forEach(el=>{
      el.addEventListener('pointerenter', ()=> {
        if(window._flameUniforms && window._flameUniforms.u_intensity) {
          gsap.to(window._flameUniforms.u_intensity, { value: 1.6, duration: 0.28 });
        }
      });
      el.addEventListener('pointerleave', ()=> {
        if(window._flameUniforms && window._flameUniforms.u_intensity) {
          gsap.to(window._flameUniforms.u_intensity, { value: 1.0, duration: 0.5 });
        }
      });
    });
  }

  // ---------- 10) Init fullpage nav links behavior ----------
  function initNavLinks(){
    document.querySelectorAll('nav a, .nav-bar a').forEach(a=>{
      a.addEventListener('click', (ev)=>{
        ev.preventDefault();
        const href = a.getAttribute('href').replace('#','');
        if(typeof fullpage_api !== 'undefined') {
          try { fullpage_api.moveTo(href); } catch(e) { location.hash = '#'+href; }
        } else {
          // fallback: smooth scroll
          const el = document.getElementById(href);
          if(el) el.scrollIntoView({ behavior:'smooth', block:'start' });
        }
      });
    });
  }

  // ---------- 11) Build everything ----------
  function initAll(){
    try {
      initAboutTabs();
      initSkillsAnimation();
      initMagnetic();
      initFlipAndTilt();
      initGSAPTriggers();
      initPublicationsButton();
      initContactIcons();
      initContactForm();
      initFlameInteraction();
      initNavLinks();
    } catch(err){
      console.error('initAll error', err);
    }
  }

  // Run at load
  if(document.readyState === 'loading'){
    window.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Re-run some layout on resize (debounced)
  let rt;
  window.addEventListener('resize', ()=> {
    clearTimeout(rt); rt = setTimeout(()=> {
      // nothing heavy — we can refresh ScrollTrigger if present
      if(typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      // if fullpage present, rebuild
      try { if(typeof fullpage_api !== 'undefined') fullpage_api.reBuild(); } catch(e){}
    }, 220);
  });

})();
