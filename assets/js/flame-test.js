// -------------------------
// Locomotive Scroll Setup
// -------------------------
const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    multiplier: 1.2
});

// -------------------------
// Three.js Flame Setup
// -------------------------
const canvas = document.getElementById("flameCanvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.Camera();
scene.add(camera);

const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
    uniforms: FlameShader.uniforms,
    vertexShader: FlameShader.vertexShader,
    fragmentShader: FlameShader.fragmentShader
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

FlameShader.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);

// Animate Flame
function animate() {
    requestAnimationFrame(animate);
    FlameShader.uniforms.time.value += 0.02;
    renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    FlameShader.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
});
