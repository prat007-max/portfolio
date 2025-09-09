// assets/js/scroll.js
const scroll = new LocomotiveScroll({
  el: document.querySelector("[data-scroll-container]"),
  smooth: true,
  lerp: 0.08,
  multiplier: 1.1,
});

scroll.on("scroll", () => {
  // Future GSAP scroll animations will be added here
});
