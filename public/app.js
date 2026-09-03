// ============================================================================
// NEUROFOX FRONTEND — 3D PARALLAX & ANIMATION ENGINE
// ============================================================================
// Ushbu faylda:
// 1. 3D Card Tilt & Parallax (Fizika asosidagi silliq burilish va nur aksi)
// 2. Interaktiv oltin zarrachalar (Golden Embers Canvas)
// 3. Karusel slayderi (Create Your Vision matn animatsiyasi)
// 4. Tablar almashinuvi va formalar validatsiyasi
// 5. HttpOnly Cookie orqali xavfsiz autentifikatsiya

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elementlari
    const perspectiveContainer = document.getElementById('perspectiveContainer');
    const authCard = document.getElementById('authCard');
    const cardGlare = document.getElementById('cardGlare');
    const tabSignUp = document.getElementById('tabSignUp');
    const tabLogIn = document.getElementById('tabLogIn');
    const pillHighlight = document.getElementById('pillHighlight');
    const formTitle = document.getElementById('formTitle');
    const signUpForm = document.getElementById('signUpForm');
    const logInForm = document.getElementById('logInForm');
    const alertBox = document.getElementById('alertBox');
    const dashboardCard = document.getElementById('dashboardCard');

    // Tugmalar
    const signUpBtn = document.getElementById('signUpBtn');
    const logInBtn = document.getElementById('logInBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const btnRefreshApi = document.getElementById('btnRefreshApi');

    // Dashboard elementlari
    const dashUserName = document.getElementById('dashUserName');
    const dashUserEmail = document.getElementById('dashUserEmail');
    const userAvatar = document.getElementById('userAvatar');
    const apiOutput = document.getElementById('apiOutput');

    // ========================================================================
    // 1. 3D CARD TILT & MOUSE PARALLAX (Lerp silliqlash bilan)
    // ========================================================================
    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;
    let isHovered = false;

    // Karta ustida sichqoncha harakati
    window.addEventListener('mousemove', (e) => {
        if (!authCard || window.innerWidth < 860) return;

        const rect = authCard.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        // Sichqonchaning karta markazidan masofasi (-1 dan 1 gacha)
        const mouseX = (e.clientX - cardCenterX) / (window.innerWidth / 2);
        const mouseY = (e.clientY - cardCenterY) / (window.innerHeight / 2);

        // Karta ustida ekanini aniqlash
        const overCard = (
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom
        );

        if (overCard) {
            isHovered = true;
            // Maksimal 8 gradusgacha 3D burilish
            targetX = -mouseY * 8;
            targetY = mouseX * 8;

            // Specular Glare (nur akslanishi) koordinatalari
            const glareX = ((e.clientX - rect.left) / rect.width) * 100;
            const glareY = ((e.clientY - rect.top) / rect.height) * 100;
            authCard.style.setProperty('--glare-x', `${glareX}%`);
            authCard.style.setProperty('--glare-y', `${glareY}%`);
        } else {
            isHovered = false;
            targetX = 0;
            targetY = 0;
        }
    });

    // 60fps silliq fizika interpolatsiyasi (Lerp)
    function animateTilt() {
        if (window.innerWidth >= 860 && authCard) {
            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;

            authCard.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
        }
        requestAnimationFrame(animateTilt);
    }
    animateTilt();

    // ========================================================================
    // 2. INTERAKTIV OLTIN ZARRACHALAR KANVASI (Golden Embers)
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

        // 55 ta oltin zarracha yaratish
        const particles = [];
        const particleCount = 55;

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = height + Math.random() * 50;
                this.size = Math.random() * 2.2 + 0.8;
                this.speedY = Math.random() * 0.7 + 0.3;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.6 + 0.2;
                this.fadeSpeed = Math.random() * 0.003 + 0.002;
                this.hue = 38 + Math.random() * 10; // Oltin-amber rang (HSL)
            }

            update() {
                this.y -= this.speedY;
                this.x += this.speedX;
                this.opacity -= this.fadeSpeed;

                if (this.opacity <= 0 || this.y < -10) {
                    this.reset();
                }
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
            p.y = Math.random() * height; // Boshida ekranga yoyish
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
    // 3. KARUSEL MATNLARI (Create Your Vision Slides)
    // ========================================================================
    const carouselData = [
        {
            title: "Create Your Vision",
            subtitle: "AI-assisted workspace to craft and elevate your ideas."
        },
        {
            title: "Unleash Imagination",
            subtitle: "Generate breathtaking visuals and hyperrealistic concepts in seconds."
        },
        {
            title: "Studio-Grade Power",
            subtitle: "Engineered for designers, artists, and visionaries worldwide."
        }
    ];

    let currentSlide = 0;
    const artTitle = document.getElementById('artTitle');
    const artSubtitle = document.getElementById('artSubtitle');
    const textWrapper = document.querySelector('.carousel-text-wrapper');
    const indicators = document.querySelectorAll('.indicator');

    function setSlide(index) {
        if (index === currentSlide) return;
        currentSlide = index;

        indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === currentSlide);
        });

        if (textWrapper) {
            textWrapper.classList.add('fade-out');
            setTimeout(() => {
                artTitle.textContent = carouselData[currentSlide].title;
                artSubtitle.textContent = carouselData[currentSlide].subtitle;
                textWrapper.classList.remove('fade-out');
            }, 250);
        }
    }

    indicators.forEach((ind) => {
        ind.addEventListener('click', () => {
            const slideIdx = parseInt(ind.getAttribute('data-slide'), 10);
            setSlide(slideIdx);
        });
    });

    // Har 5.5 soniyada avtomatik keyingi slaydga o'tish
    setInterval(() => {
        const next = (currentSlide + 1) % carouselData.length;
        setSlide(next);
    }, 5500);

    // ========================================================================
    // 4. TAB ALMASHINUVI (Sign Up <-> Log In)
    // ========================================================================
    tabSignUp.addEventListener('click', () => {
        tabSignUp.classList.add('active');
        tabLogIn.classList.remove('active');
        pillHighlight.style.transform = 'translateX(0%)';
        formTitle.textContent = 'Create An Account';

        signUpForm.classList.add('active');
        logInForm.classList.remove('active');
        hideAlert();
    });

    tabLogIn.addEventListener('click', () => {
        tabLogIn.classList.add('active');
        tabSignUp.classList.remove('active');
        pillHighlight.style.transform = 'translateX(100%)';
        formTitle.textContent = 'Welcome Back';

        logInForm.classList.add('active');
        signUpForm.classList.remove('active');
        hideAlert();
    });

    // ========================================================================
    // 5. PAROLNI KO'RSATISH / YASHIRISH (Eye Toggle)
    // ========================================================================
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

    // ========================================================================
    // 6. BILDIRISHNOMALAR (Alert Helper)
    // ========================================================================
    function showAlert(type, message) {
        alertBox.className = `alert-box ${type}`;
        alertBox.textContent = message;
        alertBox.style.display = 'block';
    }

    function hideAlert() {
        alertBox.style.display = 'none';
        alertBox.textContent = '';
    }

    function setLoading(btn, isLoading, defaultText) {
        const text = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.btn-spinner');
        if (isLoading) {
            btn.disabled = true;
            text.textContent = 'Processing...';
            spinner.style.display = 'block';
        } else {
            btn.disabled = false;
            text.textContent = defaultText;
            spinner.style.display = 'none';
        }
    }

    // ========================================================================
    // 7. SIGN UP SO'ROVI
    // ========================================================================
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const firstName = document.getElementById('signUpFirstName').value.trim();
        const lastName = document.getElementById('signUpLastName').value.trim();
        const email = document.getElementById('signUpEmail').value.trim();
        const password = document.getElementById('signUpPassword').value;
        const confirmPassword = document.getElementById('signUpConfirmPassword').value;

        if (password !== confirmPassword) {
            showAlert('error', 'Passwords do not match! Please verify.');
            return;
        }

        if (password.length < 6) {
            showAlert('error', 'Password must be at least 6 characters long.');
            return;
        }

        const fullName = `${firstName} ${lastName}`.trim();
        setLoading(signUpBtn, true, 'Create an Account');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // HttpOnly kuki almashinuvi uchun
                body: JSON.stringify({ name: fullName, email, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showAlert('success', 'Account created successfully!');
                signUpForm.reset();
                setTimeout(() => showDashboard(data.user), 600);
            } else {
                showAlert('error', data.message || 'Error creating account');
            }
        } catch (err) {
            showAlert('error', 'Connection error. Please try again.');
        } finally {
            setLoading(signUpBtn, false, 'Create an Account');
        }
    });

    // ========================================================================
    // 8. LOG IN SO'ROVI
    // ========================================================================
    logInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const email = document.getElementById('logInEmail').value.trim();
        const password = document.getElementById('logInPassword').value;

        setLoading(logInBtn, true, 'Log In');

        try {
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showAlert('success', 'Welcome back!');
                logInForm.reset();
                setTimeout(() => showDashboard(data.user), 600);
            } else {
                showAlert('error', data.message || 'Invalid email or password');
            }
        } catch (err) {
            showAlert('error', 'Connection error. Please try again.');
        } finally {
            setLoading(logInBtn, false, 'Log In');
        }
    });

    // ========================================================================
    // 9. DASHBOARD KO'RINISHI VA VERIFIKATSIYA
    // ========================================================================
    function showDashboard(user) {
        authCard.style.display = 'none';
        dashboardCard.style.display = 'block';

        dashUserName.textContent = user.name || 'User';
        dashUserEmail.textContent = user.email || '';
        userAvatar.textContent = (user.name ? user.name[0] : 'U').toUpperCase();

        verifyProtectedApi();
    }

    async function verifyProtectedApi() {
        apiOutput.textContent = 'Verifying HttpOnly credentials...';
        try {
            const res = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            apiOutput.textContent = JSON.stringify(data, null, 2);
        } catch (err) {
            apiOutput.textContent = 'API call failed: ' + err.message;
        }
    }

    if (btnRefreshApi) {
        btnRefreshApi.addEventListener('click', verifyProtectedApi);
    }

    // ========================================================================
    // 10. LOGOUT
    // ========================================================================
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/auth/signout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {
            console.error('Logout error:', e);
        }
        dashboardCard.style.display = 'none';
        authCard.style.display = 'grid';
        showAlert('success', 'You have been signed out successfully.');
    });

    // ========================================================================
    // 11. OLDINGI SESSIYANI TEKSHIRISH
    // ========================================================================
    async function checkSession() {
        try {
            const res = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.user) {
                    showDashboard(data.user);
                }
            }
        } catch (e) {
            // Sessiya yo'q bo'lsa
        }
    }

    checkSession();
});
