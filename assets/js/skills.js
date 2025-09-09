// js/skills.js
document.addEventListener('DOMContentLoaded', () => {
  const skillItems = document.querySelectorAll('.skill-item');

  // use IntersectionObserver to start animation when skills section visible
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        skillItems.forEach(item => {
          const fill = item.querySelector('.skill-fill');
          const pctEl = item.querySelector('.skill-percent');
          const value = parseInt(fill.dataset.value || item.dataset.skill || 80, 10);

          // width animation
          fill.style.width = value + '%';

          // counter animation
          let start = 0;
          const dur = 1000; // ms
          const startTime = performance.now();
          (function tick(now){
            const t = Math.min(1, (now - startTime)/dur);
            const cur = Math.round(t * value);
            pctEl.textContent = cur + '%';
            if (t < 1) requestAnimationFrame(tick);
          })(startTime);
        });

        o.disconnect(); // only run once
      }
    });
  }, { threshold: 0.25 });

  const section = document.querySelector('#skills');
  if (section) obs.observe(section);
});
