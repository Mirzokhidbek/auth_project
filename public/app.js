// ============================================================================
// NEUROFOX FRONTEND INTERAKTIV LOGIKASI
// ============================================================================
// - Sign Up / Log In tab almashinuvi
// - Parollarni ko'rsatish/yashirish
// - Parol va tasdiqlash parolini solishtirish
// - Xavfsiz HttpOnly kuki orqali autentifikatsiya (credentials: 'include')
// - Tizimga kirgach Dashboardni ochish va Logout

document.addEventListener('DOMContentLoaded', () => {
    // Tab elementlari
    const tabSignUp = document.getElementById('tabSignUp');
    const tabLogIn = document.getElementById('tabLogIn');
    const formTitle = document.getElementById('formTitle');
    const signUpForm = document.getElementById('signUpForm');
    const logInForm = document.getElementById('logInForm');
    const alertBox = document.getElementById('alertBox');
    const authCard = document.getElementById('authCard');
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
    // 1. TAB ALMASHINUVI (Sign Up <-> Log In)
    // ========================================================================
    tabSignUp.addEventListener('click', () => {
        tabSignUp.classList.add('active');
        tabLogIn.classList.remove('active');
        formTitle.textContent = 'Create An Account';

        signUpForm.classList.add('active');
        logInForm.classList.remove('active');
        hideAlert();
    });

    tabLogIn.addEventListener('click', () => {
        tabLogIn.classList.add('active');
        tabSignUp.classList.remove('active');
        formTitle.textContent = 'Welcome Back';

        logInForm.classList.add('active');
        signUpForm.classList.remove('active');
        hideAlert();
    });

    // ========================================================================
    // 2. PAROLNI KO'RSATISH / YASHIRISH (Eye Toggle)
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
    // 3. BILDIRISHNOMALAR (Alert Box)
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
    // 4. SIGN UP SO'ROVI
    // ========================================================================
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const firstName = document.getElementById('signUpFirstName').value.trim();
        const lastName = document.getElementById('signUpLastName').value.trim();
        const email = document.getElementById('signUpEmail').value.trim();
        const password = document.getElementById('signUpPassword').value;
        const confirmPassword = document.getElementById('signUpConfirmPassword').value;

        // 1. Parol tasdiqlanishini tekshirish
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
    // 5. LOG IN SO'ROVI
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
    // 6. DASHBOARD KO'RINIShI VA VERIFIKATSIYA
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
    // 7. LOGOUT
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
    // 8. OLDINGI SESSIYANI TEKSHIRISH
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
            // Sessiya yo'q bo'lsa hech narsa qilmaydi
        }
    }

    checkSession();
});
