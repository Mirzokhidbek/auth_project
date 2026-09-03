// ============================================================================
// MAIN APPLICATION BOOTSTRAP (ENTRY POINT)
// ============================================================================

import { setLanguage, getLanguage, applyTranslations, t } from './i18n.js';
import { ParticleEngine } from './particles.js';
import { CardTiltEngine } from './tilt.js';
import { AuthManager } from './auth.js';
import { ComparisonManager } from './comparison.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements
    const authCard = document.getElementById('authCard');
    const aiWorkspace = document.getElementById('aiWorkspace');
    const navUserName = document.getElementById('navUserName');
    const navUserAvatar = document.getElementById('navUserAvatar');

    // 2. Initialize 3D Graphics & Physics
    const particleEngine = new ParticleEngine('particlesCanvas');
    const cardTiltEngine = new CardTiltEngine('authCard');

    // 3. Initialize Comparison Engine
    const comparisonManager = new ComparisonManager();

    // 4. Initialize Auth Manager
    const authManager = new AuthManager({
        onAuthSuccess: (user) => {
            if (authCard) authCard.style.display = 'none';
            if (aiWorkspace) aiWorkspace.style.display = 'block';

            if (navUserName) navUserName.textContent = user.name || 'User';
            if (navUserAvatar) navUserAvatar.textContent = (user.name ? user.name[0] : 'U').toUpperCase();

            // Load user's search history
            comparisonManager.loadHistory();
        },
        onAuthLogout: () => {
            if (aiWorkspace) aiWorkspace.style.display = 'none';
            if (authCard) authCard.style.display = 'grid';
        }
    });

    // 5. Language Switcher Buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            setLanguage(selectedLang);
            authManager.updateTitle();
        });
    });

    // Initial translation pass
    applyTranslations();

    // 6. Vision Carousel on Left Art Card
    initVisionCarousel();

    // 7. Check if user already has an active session
    authManager.checkExistingSession();
});

function initVisionCarousel() {
    const artTitle = document.getElementById('artTitle');
    const artSubtitle = document.getElementById('artSubtitle');
    const textWrapper = document.querySelector('.carousel-text-wrapper');
    const indicators = document.querySelectorAll('.indicator');

    const slides = [
        { titleKey: 'visionSlide1Title', subKey: 'visionSlide1Sub' },
        { titleKey: 'visionSlide2Title', subKey: 'visionSlide2Sub' },
        { titleKey: 'visionSlide3Title', subKey: 'visionSlide3Sub' }
    ];

    let currentSlide = 0;

    function renderSlide(index) {
        currentSlide = index;
        indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === currentSlide);
        });

        if (textWrapper) {
            textWrapper.classList.add('fade-out');
            setTimeout(() => {
                if (artTitle) artTitle.textContent = t(slides[currentSlide].titleKey);
                if (artSubtitle) artSubtitle.textContent = t(slides[currentSlide].subKey);
                textWrapper.classList.remove('fade-out');
            }, 200);
        }
    }

    indicators.forEach((ind) => {
        ind.addEventListener('click', () => {
            const slideIdx = parseInt(ind.getAttribute('data-slide'), 10);
            renderSlide(slideIdx);
        });
    });

    // Auto rotate every 6 seconds
    setInterval(() => {
        const next = (currentSlide + 1) % slides.length;
        renderSlide(next);
    }, 6000);

    // Update current slide on language change
    window.addEventListener('languageChanged', () => {
        if (artTitle) artTitle.textContent = t(slides[currentSlide].titleKey);
        if (artSubtitle) artSubtitle.textContent = t(slides[currentSlide].subKey);
    });
}
