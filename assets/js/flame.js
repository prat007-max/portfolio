const canvas = document.getElementById("flameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const flames = [];
const colors = ["#ff4000", "#ff7300", "#ffaa00", "#ffdd55"];

let mouse = {
  x: undefined,
  y: undefined,
  radius: 150 // Influence area for turbulence
};

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

class Flame {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 10;
    this.size = Math.random() * 10 + 3;
    this.speedY = Math.random() * 3 + 2;
    this.speedX = Math.random() * 1 - 0.5;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.alpha = Math.random() * 0.5 + 0.5;
  }

  update() {
    // Add turbulence near mouse
    let dx = this.x - mouse.x;
    let dy = this.y - mouse.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < mouse.radius) {
      // Push flame away from cursor
      this.x += dx / distance * 3;
      this.y += dy / distance * 3;
    }

    // Normal upward flame motion
    this.y -= this.speedY;
    this.x += this.speedX;

    // Fade effect
    this.alpha -= 0.006;

    // Reset when out of bounds
    if (this.y <= 0 || this.alpha <= 0) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 25;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function createFlames() {
  for (let i = 0; i < 220; i++) {
    flames.push(new Flame());
  }
}
createFlames();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  flames.forEach((flame) => {
    flame.update();
    flame.draw();
  });
  requestAnimationFrame(animate);
}

animate();

// Handle window resizing
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
