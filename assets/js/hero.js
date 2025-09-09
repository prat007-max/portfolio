// assets/js/hero.js
const canvas = document.getElementById("flameCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;

// Create shader material for V-flame effect
const geometry = new THREE.PlaneGeometry(4, 4, 64, 64);
const material = new THREE.ShaderMaterial({
  uniforms: {
    u_time: { value: 0 },
    u_color: { value: new THREE.Color(0x00ffaa) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float u_time;
    uniform vec3 u_color;
    void main() {
      float noise = sin(vUv.y * 15.0 + u_time * 4.0) * 0.3;
      float flame = smoothstep(0.4, 0.8, vUv.y + noise);
      gl_FragColor = vec4(u_color, flame);
    }
  `,
  transparent: true,
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

const clock = new THREE.Clock();
function animate() {
  material.uniforms.u_time.value = clock.getElapsedTime();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
