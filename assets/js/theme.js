// js/theme.js
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeToggle');
  const root = document.documentElement;

  // basic theme switch: toggles ".light" class
  btn.addEventListener('click', () => {
    if (root.classList.contains('light')) {
      root.classList.remove('light');
      btn.textContent = '🌙';
    } else {
      root.classList.add('light');
      btn.textContent = '☀️';
    }
  });
});
