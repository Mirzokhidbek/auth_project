// ============================================================================
// FRONTEND INTERAKTIV LOGIKASI (Client-side JavaScript)
// ============================================================================
// Ushbu faylda:
// 1. Tablarni almashtirish (Sign In <-> Sign Up)
// 2. Parolni ko'rsatish/yashirish
// 3. Parol mustahkamligini jonli hisoblash (Password Strength)
// 4. API bilan xavfsiz kuki almashinuvi (credentials: 'include')
// 5. Sessiya holatini avtomatik aniqlash va Dashboardni ko'rsatish
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elementlari
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');
    const tabIndicator = document.getElementById('tabIndicator');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const alertBox = document.getElementById('alertBox');
    const authCard = document.getElementById('authCard');
    const dashboardCard = document.getElementById('dashboardCard');

    // Tugmalar va formalar
    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const btnTestApi = document.getElementById('btnTestApi');

    // Dashboard elementlari
    const dashUserName = document.getElementById('dashUserName');
    const dashUserEmail = document.getElementById('dashUserEmail');
    const userAvatar = document.getElementById('userAvatar');
    const apiResponseBox = document.getElementById('apiResponseBox');

    // Parol kiritish maydoni va mustahkamlik indikatori
    const signUpPasswordInput = document.getElementById('signUpPassword');
    const strengthBar = document.getElementById('strengthBar');
    const strengthLabel = document.getElementById('strengthLabel');

    // ========================================================================
    // 1. TABLARNI ALMASHTIRISH (Sign In <-> Sign Up)
    // ========================================================================
    tabSignIn.addEventListener('click', () => {
        tabSignIn.classList.add('active');
        tabSignUp.classList.remove('active');
        tabIndicator.style.transform = 'translateX(0)';
        
        signInForm.classList.add('active');
        signUpForm.classList.remove('active');
        hideAlert();
    });

    tabSignUp.addEventListener('click', () => {
        tabSignUp.classList.add('active');
        tabSignIn.classList.remove('active');
        tabIndicator.style.transform = 'translateX(100%)';
        
        signUpForm.classList.add('active');
        signInForm.classList.remove('active');
        hideAlert();
    });

    // ========================================================================
    // 2. PAROLNI KO'RSATISH / YASHIRISH (Show / Hide Password)
    // ========================================================================
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🙈';
            } else {
                input.type = 'password';
                btn.textContent = '👁️';
            }
        });
    });

    // ========================================================================
    // 3. PAROL MUSTAHKAMLIGINI JONLI TEKSHIRISH
    // ========================================================================
    if (signUpPasswordInput) {
        signUpPasswordInput.addEventListener('input', (e) => {
            const val = e.target.value;
            let score = 0;

            if (val.length >= 6) score += 25;
            if (val.length >= 10) score += 25;
            if (/[0-9]/.test(val)) score += 25;
            if (/[^A-Za-z0-9]/.test(val)) score += 25;

            strengthBar.style.width = score + '%';

            if (score === 0) {
                strengthBar.style.backgroundColor = 'transparent';
                strengthLabel.textContent = 'Parol kiritilmadi';
                strengthLabel.style.color = '#9ca3af';
            } else if (score <= 25) {
                strengthBar.style.backgroundColor = '#ef4444'; // Qizil
                strengthLabel.textContent = 'Juda zaif';
                strengthLabel.style.color = '#ef4444';
            } else if (score <= 50) {
                strengthBar.style.backgroundColor = '#f59e0b'; // To'q sariq
                strengthLabel.textContent = 'O\'rtacha';
                strengthLabel.style.color = '#f59e0b';
            } else if (score <= 75) {
                strengthBar.style.backgroundColor = '#3b82f6'; // Ko'k
                strengthLabel.textContent = 'Yaxshi';
                strengthLabel.style.color = '#3b82f6';
            } else {
                strengthBar.style.backgroundColor = '#10b981'; // Yashil
                strengthLabel.textContent = 'Juda kuchli!';
                strengthLabel.style.color = '#10b981';
            }
        });
    }

    // ========================================================================
    // 4. BILDIRISHNOMALARNI BOSHQARISH (Alert Helper)
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

    // Tugma yuklanish holati (Spinner)
    function setBtnLoading(button, isLoading, originalText) {
        const textSpan = button.querySelector('.btn-text');
        const spinner = button.querySelector('.spinner');

        if (isLoading) {
            button.disabled = true;
            textSpan.textContent = 'Kutilmoqda...';
            spinner.style.display = 'block';
        } else {
            button.disabled = false;
            textSpan.textContent = originalText;
            spinner.style.display = 'none';
        }
    }

    // ========================================================================
    // 5. SIGN IN (TIZIMGA KIRISH) SO'ROVI
    // ========================================================================
    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const email = document.getElementById('signInEmail').value.trim();
        const password = document.getElementById('signInPassword').value;

        setBtnLoading(signInBtn, true, 'Tizimga kirish');

        try {
            // MUHIM XAVFSIZLIK JIHATI:
            // credentials: 'include' parametri brauzerga server yuborgan HttpOnly kuki'ni
            // avtomatik qabul qilish va saqlash imkonini beradi.
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Kuki almashinuvi uchun SHART!
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showAlert('success', '✅ ' + data.message);
                signInForm.reset();
                setTimeout(() => {
                    showDashboard(data.user);
                }, 700);
            } else {
                showAlert('error', '❌ ' + (data.message || 'Kirishda xatolik yuz berdi'));
            }
        } catch (err) {
            showAlert('error', '❌ Server bilan bog\'lanishda xatolik yuz berdi');
        } finally {
            setBtnLoading(signInBtn, false, 'Tizimga kirish');
        }
    });

    // ========================================================================
    // 6. SIGN UP (RO'YXATDAN O'TISH) SO'ROVI
    // ========================================================================
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const name = document.getElementById('signUpName').value.trim();
        const email = document.getElementById('signUpEmail').value.trim();
        const password = document.getElementById('signUpPassword').value;

        if (password.length < 6) {
            showAlert('error', '❌ Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
            return;
        }

        setBtnLoading(signUpBtn, true, 'Ro\'yxatdan o\'tish');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Kuki almashinuvi uchun SHART!
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showAlert('success', '🎉 ' + data.message);
                signUpForm.reset();
                setTimeout(() => {
                    showDashboard(data.user);
                }, 700);
            } else {
                showAlert('error', '❌ ' + (data.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi'));
            }
        } catch (err) {
            showAlert('error', '❌ Server bilan bog\'lanishda xatolik yuz berdi');
        } finally {
            setBtnLoading(signUpBtn, false, 'Ro\'yxatdan o\'tish');
        }
    });

    // ========================================================================
    // 7. DASHBOARDNI KO'RSATISH VA FOYDALANUVCHI MA'LUMOTLARI
    // ========================================================================
    function showDashboard(user) {
        authCard.style.display = 'none';
        dashboardCard.style.display = 'block';

        dashUserName.textContent = user.name || 'Foydalanuvchi';
        dashUserEmail.textContent = user.email || '';
        userAvatar.textContent = (user.name ? user.name[0] : 'U').toUpperCase();

        // Himoyalangan API'ni avtomatik tekshirib ko'rsatamiz
        testProtectedApi();
    }

    // ========================================================================
    // 8. HIMOYALANGAN API TESTI (GET /api/auth/me)
    // ========================================================================
    async function testProtectedApi() {
        apiResponseBox.textContent = 'Serverdan ma\'lumot olinmoqda...';
        try {
            // Ushbu so'rovda hech qanday token headerga qo'shilmaydi!
            // Brauzer o'zidagi HttpOnly kukini avtomatik serverga olib boradi.
            const res = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include'
            });

            const data = await res.json();
            apiResponseBox.textContent = JSON.stringify(data, null, 2);
        } catch (err) {
            apiResponseBox.textContent = 'API so\'rovida xatolik yuz berdi: ' + err.message;
        }
    }

    btnTestApi.addEventListener('click', testProtectedApi);

    // ========================================================================
    // 9. LOGOUT (TIZIMDAN CHIQISH)
    // ========================================================================
    logoutBtn.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/auth/signout', {
                method: 'POST',
                credentials: 'include'
            });

            const data = await res.json();

            // Formani yana ko'rsatamiz
            dashboardCard.style.display = 'none';
            authCard.style.display = 'block';
            showAlert('success', '👋 ' + (data.message || 'Tizimdan muvaffaqiyatli chiqdingiz'));
        } catch (err) {
            console.error('Logout xatoligi:', err);
            dashboardCard.style.display = 'none';
            authCard.style.display = 'block';
        }
    });

    // ========================================================================
    // 10. SAHIFA YUKLANGANDA: Oldingi sessiyani tekshirish
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
                    showDashboard(data.user);
                }
            }
        } catch (err) {
            // Agar sessiya bo'lmasa, hech narsa qilmaydi, login formasi turaveradi
        }
    }

    // Sahifa ochilganda mavjud sessiyani tekshirish
    checkExistingSession();
});
