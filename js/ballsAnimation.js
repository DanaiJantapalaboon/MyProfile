const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mouse = { x: null, y: null };
const balls = [];
const numBalls = 10;

class Ball {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dx = (Math.random() - 0.5) * 4;
        this.dy = (Math.random() - 0.5) * 4;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        // Bounce off walls
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx *= -1;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy *= -1;
        }

        // Repel from mouse
        const distX = this.x - mouse.x;
        const distY = this.y - mouse.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < 100) {
            const angle = Math.atan2(distY, distX);
            const force = (100 - distance) / 100;
            this.dx += Math.cos(angle) * force;
            this.dy += Math.sin(angle) * force;
        }

        this.draw();
    }
}

// Collision handling
function resolveCollision(ballA, ballB) {
    const dx = ballB.x - ballA.x;
    const dy = ballB.y - ballA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ballA.radius + ballB.radius) {
        // Calculate angle
        const angle = Math.atan2(dy, dx);

        // Swap velocities (elastic collision in 2D)
        const speedA = Math.sqrt(ballA.dx * ballA.dx + ballA.dy * ballA.dy);
        const speedB = Math.sqrt(ballB.dx * ballB.dx + ballB.dy * ballB.dy);

        const dirA = Math.atan2(ballA.dy, ballA.dx);
        const dirB = Math.atan2(ballB.dy, ballB.dx);

        ballA.dx = speedB * Math.cos(dirB);
        ballA.dy = speedB * Math.sin(dirB);
        ballB.dx = speedA * Math.cos(dirA);
        ballB.dy = speedA * Math.sin(dirA);

        // Push balls apart (so they don’t overlap)
        const overlap = (ballA.radius + ballB.radius - distance) / 2;
        ballA.x -= Math.cos(angle) * overlap;
        ballA.y -= Math.sin(angle) * overlap;
        ballB.x += Math.cos(angle) * overlap;
        ballB.y += Math.sin(angle) * overlap;
    }
}

// Create balls
for (let i = 0; i < numBalls; i++) {
    const radius = 10;
    let x = Math.random() * (canvas.width - radius * 2) + radius;
    let y = Math.random() * (canvas.height - radius * 2) + radius;

    // Prevent spawn overlap
    for (let j = 0; j < balls.length; j++) {
        const dist = Math.hypot(x - balls[j].x, y - balls[j].y);
        if (dist < radius * 2) {
        x = Math.random() * (canvas.width - radius * 2) + radius;
        y = Math.random() * (canvas.height - radius * 2) + radius;
        j = -1; // restart check
        }
    }

    const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    balls.push(new Ball(x, y, radius, color));
}

// Track mouse
window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw balls
    balls.forEach((ball, i) => {
        ball.update();

        // Check collision with other balls
        for (let j = i + 1; j < balls.length; j++) {
            resolveCollision(ball, balls[j]);
        }
    });

    requestAnimationFrame(animate);
}

animate();

// Resize handling
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});