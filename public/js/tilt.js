// ============================================================================
// 3D CARD TILT & SPECULAR GLARE PHYSICS ENGINE
// ============================================================================

export class CardTiltEngine {
    constructor(cardId = 'authCard') {
        this.card = document.getElementById(cardId);
        if (!this.card) return;

        this.currentX = 0;
        this.currentY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.maxTilt = 7; // Maximum tilt degrees

        this.bindEvents();
        this.startLoop();
    }

    bindEvents() {
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mouseleave', () => this.onMouseLeave());
    }

    onMouseMove(e) {
        if (!this.card || this.card.style.display === 'none' || window.innerWidth < 860) return;

        const rect = this.card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = (e.clientX - centerX) / (window.innerWidth / 2);
        const mouseY = (e.clientY - centerY) / (window.innerHeight / 2);

        const isOver = (
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom
        );

        if (isOver) {
            this.targetX = -mouseY * this.maxTilt;
            this.targetY = mouseX * this.maxTilt;

            // Specular Glare Coordinates
            const glareX = ((e.clientX - rect.left) / rect.width) * 100;
            const glareY = ((e.clientY - rect.top) / rect.height) * 100;
            this.card.style.setProperty('--glare-x', `${glareX}%`);
            this.card.style.setProperty('--glare-y', `${glareY}%`);
        } else {
            this.targetX = 0;
            this.targetY = 0;
        }
    }

    onMouseLeave() {
        this.targetX = 0;
        this.targetY = 0;
    }

    startLoop() {
        const loop = () => {
            if (this.card && this.card.style.display !== 'none' && window.innerWidth >= 860) {
                this.currentX += (this.targetX - this.currentX) * 0.08;
                this.currentY += (this.targetY - this.currentY) * 0.08;
                this.card.style.transform = `rotateX(${this.currentX.toFixed(2)}deg) rotateY(${this.currentY.toFixed(2)}deg)`;
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}
