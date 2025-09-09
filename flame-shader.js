const canvas = document.getElementById("flame-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

// Flame Shader Geometry
const geometry = new THREE.PlaneGeometry(10, 10);
const material = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0.0 } },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      float strength = 0.5 + 0.5 * sin(uTime + vUv.y * 5.0);
      gl_FragColor = vec4(strength, strength * 0.3, 0.0, 1.0);
    }
  `,
  transparent: true
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function animateFlame() {
  material.uniforms.uTime.value += 0.05;
  renderer.render(scene, camera);
  requestAnimationFrame(animateFlame);
}
animateFlame();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
