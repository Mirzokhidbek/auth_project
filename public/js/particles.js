// ============================================================================
// 3D PARTICLES ENGINE (GOLDEN EMBERS CANVAS)
// ============================================================================

export class ParticleEngine {
    constructor(canvasId = 'particlesCanvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50;
        this.isRunning = false;

        this.resize();
        this.initParticles();
        this.bindEvents();
        this.start();
    }

    resize() {
        if (!this.canvas) return;
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle(true));
        }
    }

    createParticle(randomY = false) {
        return {
            x: Math.random() * this.width,
            y: randomY ? Math.random() * this.height : this.height + Math.random() * 40,
            size: Math.random() * 2.2 + 0.8,
            speedY: Math.random() * 0.7 + 0.3,
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.6 + 0.2,
            fadeSpeed: Math.random() * 0.003 + 0.002,
            hue: 38 + Math.random() * 10
        };
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        const loop = () => {
            if (!this.isRunning) return;
            this.updateAndDraw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    updateAndDraw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.y -= p.speedY;
            p.x += p.speedX;
            p.opacity -= p.fadeSpeed;

            if (p.opacity <= 0 || p.y < -10) {
                this.particles[i] = this.createParticle(false);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${p.hue}, 95%, 55%, ${p.opacity})`;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = `hsl(${p.hue}, 95%, 50%)`;
                this.ctx.fill();
            }
        }
    }
}
