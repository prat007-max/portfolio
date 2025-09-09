const FlameShader = {
    uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2() }
    },
    vertexShader: `
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec2 resolution;

        void main() {
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            float color = 0.0;
            color += sin(uv.y * 12.0 + time * 3.0) * 0.5 + 0.5;
            color *= uv.y;
            gl_FragColor = vec4(color * 1.2, color * 0.5, 0.1, 1.0);
        }
    `
};
