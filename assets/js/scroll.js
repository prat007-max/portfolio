// js/scroll.js
// Make sure GSAP and Locomotive are loaded (index.html loads them before this file)

gsap.registerPlugin(ScrollTrigger);

// initialize Locomotive Scroll
const locoScroll = new LocomotiveScroll({
  el: document.querySelector('#scroll-container'),
  smooth: true,
  multiplier: 1,
  lerp: 0.08
});

// expose for other modules
window.locoScroll = locoScroll;

locoScroll.on('scroll', ScrollTrigger.update);

ScrollTrigger.scrollerProxy('#scroll-container', {
  scrollTop(value) {
    return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  },
  pinType: document.querySelector('#scroll-container').style.transform ? 'transform' : 'fixed'
});

// refresh ScrollTrigger when loco updates
ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
ScrollTrigger.refresh();
