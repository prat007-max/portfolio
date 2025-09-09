// js/projects.js
document.addEventListener('DOMContentLoaded', ()=>{

  // flip-card hover handled via CSS .flip-card:hover .flip-card-inner -> rotateY(180deg)
  // add magnetic 3D tilt effect on each flip-card
  document.querySelectorAll('.flip-card').forEach(card=>{
    const inner = card.querySelector('.flip-card-inner');

    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = -y * 10;
      const ry = x * 10;
      inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    card.addEventListener('mouseleave', ()=> {
      inner.style.transform = '';
    });
  });

  // subtle entrance animation via GSAP (if available)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.from('.flip-card', {
      y: 40, opacity: 0, duration: 0.9, stagger: 0.15,
      scrollTrigger: { trigger: '#projects', start: 'top 85%', end: 'bottom 50%', toggleActions: 'play none none reverse', scroller: '#scroll-container' }
    });
  }
});
