const canvas = document.getElementById("flameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas to Hero section
function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Flame particles
const flames = [];
const colors = ["#ff4000", "#ff7300", "#ffaa00", "#ffdd55"];

class Flame {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = canvas.width / 2 + (Math.random() - 0.5) * 200; // centered spread
        this.y = canvas.height + 10;
        this.size = Math.random() * 8 + 2;
        this.speedY = Math.random() * 2 + 1.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.5;
        this.alphaDecay = Math.random() * 0.01 + 0.005;
    }

    update() {
        this.y -= this.speedY;
        this.alpha -= this.alphaDecay;
        if (this.alpha <= 0) this.reset();
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Create initial flames
function createFlames(count = 200) {
    for (let i = 0; i < count; i++) flames.push(new Flame());
}
createFlames();

// Animate flames
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    flames.forEach(f => {
        f.update();
        f.draw();
    });
    requestAnimationFrame(animate);
}
animate();