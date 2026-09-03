// ============================================================================
// NEUROFOX AI PRICE COMPARISON PLATFORM — FRONTEND ENGINE
// ============================================================================
// 1. 3D Parallax & Golden Embers Background
// 2. HttpOnly Cookie & Bcrypt Authentication (Sign In / Sign Up)
// 3. Gemini 3.6 Flash AI Narx Solishtirish va Do'konlar Tahlili
// 4. Qidiruv tarixi va interaktiv chip-tugmalar

document.addEventListener('DOMContentLoaded', () => {
    // Auth DOM Elementlari
    const authCard = document.getElementById('authCard');
    const aiWorkspace = document.getElementById('aiWorkspace');
    const tabSignUp = document.getElementById('tabSignUp');
    const tabLogIn = document.getElementById('tabLogIn');
    const pillHighlight = document.getElementById('pillHighlight');
    const formTitle = document.getElementById('formTitle');
    const signUpForm = document.getElementById('signUpForm');
    const logInForm = document.getElementById('logInForm');
    const alertBox = document.getElementById('alertBox');
    const signUpBtn = document.getElementById('signUpBtn');
    const logInBtn = document.getElementById('logInBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Workspace DOM Elementlari
    const navUserName = document.getElementById('navUserName');
    const navUserAvatar = document.getElementById('navUserAvatar');
    const priceCompareForm = document.getElementById('priceCompareForm');
    const productQueryInput = document.getElementById('productQueryInput');
    const compareSubmitBtn = document.getElementById('compareSubmitBtn');
    const aiLoadingCard = document.getElementById('aiLoadingCard');
    const resultsContainer = document.getElementById('resultsContainer');
    const historyChipsContainer = document.getElementById('historyChipsContainer');

    // Natijalar DOM Elementlari
    const resCategory = document.getElementById('resCategory');
    const resProductName = document.getElementById('resProductName');
    const resOverview = document.getElementById('resOverview');
    const resBestStore = document.getElementById('resBestStore');
    const resBestSavings = document.getElementById('resBestSavings');
    const resBestPriceUZS = document.getElementById('resBestPriceUZS');
    const resBestPriceUSD = document.getElementById('resBestPriceUSD');
    const resBestStoreLink = document.getElementById('resBestStoreLink');
    const resStoresGrid = document.getElementById('resStoresGrid');
    const resStoresCount = document.getElementById('resStoresCount');
    const resSpecsGrid = document.getElementById('resSpecsGrid');
    const resVerdict = document.getElementById('resVerdict');
    const resWhoBuy = document.getElementById('resWhoBuy');
    const resWhoWait = document.getElementById('resWhoWait');

    // ========================================================================
    // 1. 3D CARD TILT & MOUSE PARALLAX (Login Karta uchun)
    // ========================================================================
    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (e) => {
        if (!authCard || authCard.style.display === 'none' || window.innerWidth < 860) return;

        const rect = authCard.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        const mouseX = (e.clientX - cardCenterX) / (window.innerWidth / 2);
        const mouseY = (e.clientY - cardCenterY) / (window.innerHeight / 2);

        const overCard = (
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom
        );

        if (overCard) {
            targetX = -mouseY * 7;
            targetY = mouseX * 7;
            const glareX = ((e.clientX - rect.left) / rect.width) * 100;
            const glareY = ((e.clientY - rect.top) / rect.height) * 100;
            authCard.style.setProperty('--glare-x', `${glareX}%`);
            authCard.style.setProperty('--glare-y', `${glareY}%`);
        } else {
            targetX = 0;
            targetY = 0;
        }
    });

    function animateTilt() {
        if (authCard && authCard.style.display !== 'none' && window.innerWidth >= 860) {
            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;
            authCard.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
        }
        requestAnimationFrame(animateTilt);
    }
    animateTilt();

    // ========================================================================
    // 2. INTERAKTIV OLTIN ZARRACHALAR (Particles Canvas)
    // ========================================================================
    const canvas = document.getElementById('particlesCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = [];
        const particleCount = 50;

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * width;
                this.y = height + Math.random() * 40;
                this.size = Math.random() * 2.2 + 0.8;
                this.speedY = Math.random() * 0.7 + 0.3;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.6 + 0.2;
                this.fadeSpeed = Math.random() * 0.003 + 0.002;
                this.hue = 38 + Math.random() * 10;
            }
            update() {
                this.y -= this.speedY;
                this.x += this.speedX;
                this.opacity -= this.fadeSpeed;
                if (this.opacity <= 0 || this.y < -10) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 95%, 55%, ${this.opacity})`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = `hsl(${this.hue}, 95%, 50%)`;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            const p = new Particle();
            p.y = Math.random() * height;
            particles.push(p);
        }

        function renderParticles() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            requestAnimationFrame(renderParticles);
        }
        renderParticles();
    }

    // ========================================================================
    // 3. TABLAR VA PAROL KO'RSATISH
    // ========================================================================
    if (tabSignUp && tabLogIn) {
        tabSignUp.addEventListener('click', () => {
            tabSignUp.classList.add('active');
            tabLogIn.classList.remove('active');
            if (pillHighlight) pillHighlight.style.transform = 'translateX(0%)';
            if (formTitle) formTitle.textContent = 'Create An Account';
            signUpForm.classList.add('active');
            logInForm.classList.remove('active');
            hideAlert();
        });

        tabLogIn.addEventListener('click', () => {
            tabLogIn.classList.add('active');
            tabSignUp.classList.remove('active');
            if (pillHighlight) pillHighlight.style.transform = 'translateX(100%)';
            if (formTitle) formTitle.textContent = 'Welcome Back';
            logInForm.classList.add('active');
            signUpForm.classList.remove('active');
            hideAlert();
        });
    }

    document.querySelectorAll('.eye-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input.type === 'password') {
                input.type = 'text';
                btn.style.color = '#f59e0b';
            } else {
                input.type = 'password';
                btn.style.color = '';
            }
        });
    });

    function showAlert(type, message) {
        if (!alertBox) return;
        alertBox.className = `alert-box ${type}`;
        alertBox.textContent = message;
        alertBox.style.display = 'block';
    }

    function hideAlert() {
        if (!alertBox) return;
        alertBox.style.display = 'none';
        alertBox.textContent = '';
    }

    // ========================================================================
    // 4. AUTENTIFIKATSIYA SO'ROVLARI (Sign Up & Sign In)
    // ========================================================================
    signUpForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const firstName = document.getElementById('signUpFirstName').value.trim();
        const lastName = document.getElementById('signUpLastName').value.trim();
        const email = document.getElementById('signUpEmail').value.trim();
        const password = document.getElementById('signUpPassword').value;
        const confirmPassword = document.getElementById('signUpConfirmPassword').value;

        if (password !== confirmPassword) {
            showAlert('error', 'Parollar bir-biriga mos kelmadi!');
            return;
        }

        if (password.length < 6) {
            showAlert('error', 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak.');
            return;
        }

        const fullName = `${firstName} ${lastName}`.trim();

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // HttpOnly Cookie
                body: JSON.stringify({ name: fullName, email, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showAlert('success', 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
                signUpForm.reset();
                setTimeout(() => showAiWorkspace(data.user), 500);
            } else {
                showAlert('error', data.message || 'Xatolik yuz berdi');
            }
        } catch (err) {
            showAlert('error', 'Server bilan bog\'lanishda xatolik.');
        }
    });

    logInForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const email = document.getElementById('logInEmail').value.trim();
        const password = document.getElementById('logInPassword').value;

        try {
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showAlert('success', 'Xush kelibsiz!');
                logInForm.reset();
                setTimeout(() => showAiWorkspace(data.user), 500);
            } else {
                showAlert('error', data.message || 'Email yoki parol noto\'g\'ri');
            }
        } catch (err) {
            showAlert('error', 'Server bilan bog\'lanishda xatolik.');
        }
    });

    // ========================================================================
    // 5. WORKSPACENI KO'RSATISH VA CHIQISH (Show Workspace & Logout)
    // ========================================================================
    function showAiWorkspace(user) {
        if (authCard) authCard.style.display = 'none';
        if (aiWorkspace) aiWorkspace.style.display = 'block';

        if (navUserName) navUserName.textContent = user.name || 'User';
        if (navUserAvatar) navUserAvatar.textContent = (user.name ? user.name[0] : 'U').toUpperCase();

        // O'tgan qidiruvlar tarixini yuklash
        loadSearchHistory();
    }

    logoutBtn?.addEventListener('click', async () => {
        try {
            await fetch('/api/auth/signout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {
            console.error('Logout xatoligi:', e);
        }
        if (aiWorkspace) aiWorkspace.style.display = 'none';
        if (authCard) authCard.style.display = 'grid';
        showAlert('success', 'Tizimdan muvaffaqiyatli chiqdingiz.');
    });

    // ========================================================================
    // 6. AI NARX SOLISHTIRISH FUNKSIYASI (Gemini 3.6 Flash Engine)
    // ========================================================================
    async function executePriceComparison(query) {
        if (!query || query.trim().length === 0) return;

        // UI holatini o'zgartirish
        resultsContainer.style.display = 'none';
        aiLoadingCard.style.display = 'block';
        aiLoadingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Tugmani kutish holatiga o'tkazish
        compareSubmitBtn.disabled = true;
        const btnContent = compareSubmitBtn.querySelector('.btn-content');
        const btnSpinner = compareSubmitBtn.querySelector('.btn-spinner');
        if (btnContent) btnContent.style.display = 'none';
        if (btnSpinner) btnSpinner.style.display = 'block';

        try {
            const res = await fetch('/api/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // HttpOnly Cookie sessiyasi
                body: JSON.stringify({ query: query.trim() })
            });

            const data = await res.json();

            if (res.ok && data.success && data.data) {
                renderComparisonResults(data.data);
                loadSearchHistory(); // Yangi qidiruv tarixga qo'shildi
            } else {
                alert('Xatolik: ' + (data.message || 'AI tahlilida xatolik yuz berdi'));
            }
        } catch (err) {
            console.error('Compare xatoligi:', err);
            alert('Server bilan bog\'lanishda xatolik yuz berdi: ' + err.message);
        } finally {
            aiLoadingCard.style.display = 'none';
            compareSubmitBtn.disabled = false;
            if (btnContent) btnContent.style.display = 'flex';
            if (btnSpinner) btnSpinner.style.display = 'none';
        }
    }

    // Form orqali qidiruv
    priceCompareForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = productQueryInput.value.trim();
        executePriceComparison(q);
    });

    // Tezkor taklif chip-tugmalari (Quick Chips)
    document.querySelectorAll('.prompt-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const q = chip.getAttribute('data-query');
            productQueryInput.value = q;
            executePriceComparison(q);
        });
    });

    // ========================================================================
    // 7. NATIJALARNI RENDER QILISH (Render Comparison Data)
    // ========================================================================
    function renderComparisonResults(data) {
        // 1. Asosiy ma'lumotlar
        resCategory.textContent = data.category || 'Elektronika';
        resProductName.textContent = data.productName || 'Mahsulot';
        resOverview.textContent = data.overview || '';

        // 2. Eng arzon variant (Best Deal)
        if (data.bestDeal) {
            resBestStore.textContent = data.bestDeal.storeName || 'Do\'kon';
            resBestSavings.textContent = data.bestDeal.savings || 'Eng arzon narx';
            resBestPriceUZS.textContent = data.bestDeal.priceUZS || '';
            resBestPriceUSD.textContent = data.bestDeal.priceUSD || '';
            resBestStoreLink.href = data.bestDeal.url || '#';
        }

        // 3. Do'konlar ro'yxati
        resStoresGrid.innerHTML = '';
        if (data.stores && Array.isArray(data.stores)) {
            resStoresCount.textContent = `${data.stores.length} ta ishonchli do'kon tahlil qilindi`;

            data.stores.forEach(store => {
                const storeCard = document.createElement('div');
                storeCard.className = `store-card ${store.isBest ? 'highlight-card' : ''}`;
                storeCard.innerHTML = `
                    <div>
                        <div class="store-card-head">
                            <h4 class="store-card-name">${store.name}</h4>
                            <span class="store-badge">${store.badge || 'Mavjud'}</span>
                        </div>
                        <div class="store-card-price">
                            <div class="card-price-uzs">${store.priceUZS}</div>
                            <div class="card-price-usd">${store.priceUSD}</div>
                        </div>
                        <div class="store-details-list">
                            <div>🚚 ${store.delivery || 'Yetkazib berish mavjud'}</div>
                            <div>🛡️ ${store.warranty || 'Kafolat mavjud'}</div>
                            <div>⭐ Reyting: ${store.rating || 4.8} / 5</div>
                        </div>
                    </div>
                    <a href="${store.url || '#'}" target="_blank" class="store-link-btn">
                        Do'konda ko'rish ↗
                    </a>
                `;
                resStoresGrid.appendChild(storeCard);
            });
        }

        // 4. Texnik xususiyatlar (Specs)
        resSpecsGrid.innerHTML = '';
        if (data.specsComparison && Array.isArray(data.specsComparison)) {
            data.specsComparison.forEach(spec => {
                const specItem = document.createElement('div');
                specItem.className = 'spec-item';
                specItem.innerHTML = `
                    <div class="spec-feature">${spec.feature}</div>
                    <div class="spec-value">${spec.value}</div>
                `;
                resSpecsGrid.appendChild(specItem);
            });
        }

        // 5. AI Ekspert Tavsiyasi
        if (data.recommendation) {
            resVerdict.textContent = data.recommendation.verdict || '';
            resWhoBuy.textContent = data.recommendation.whoShouldBuy || '';
            resWhoWait.textContent = data.recommendation.whoShouldWait || '';
        }

        // Natijalar blokini ko'rsatish
        resultsContainer.style.display = 'flex';
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ========================================================================
    // 8. QIDIRUV TARIXINI YUKLASH VA BOSHQARISH
    // ========================================================================
    async function loadSearchHistory() {
        try {
            const res = await fetch('/api/compare/history', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();

            if (res.ok && data.success && data.history && data.history.length > 0) {
                historyChipsContainer.innerHTML = '';
                data.history.forEach(item => {
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = 'history-chip';
                    chip.textContent = `🔍 ${item.query}`;
                    chip.addEventListener('click', () => {
                        productQueryInput.value = item.query;
                        if (item.data) {
                            renderComparisonResults(item.data);
                        } else {
                            executePriceComparison(item.query);
                        }
                    });
                    historyChipsContainer.appendChild(chip);
                });
            }
        } catch (e) {
            console.error('Tarixni yuklashda xatolik:', e);
        }
    }

    // ========================================================================
    // 9. MAVJUD SESSIYANI TEKSHIRISH (Sahifa yangilanganda)
    // ========================================================================
    async function checkExistingSession() {
        try {
            const res = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.user) {
                    showAiWorkspace(data.user);
                }
            }
        } catch (e) {
            // Sessiya yo'q
        }
    }

    checkExistingSession();
});
