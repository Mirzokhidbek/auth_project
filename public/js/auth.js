// ============================================================================
// AUTHENTICATION MODULE (AUTH MANAGER)
// ============================================================================
// Handles: Sign Up, Sign In, Session Verification, Logout, Password Visibility,
// and Tab Switching.

import { t } from './i18n.js';

export class AuthManager {
    constructor(callbacks = {}) {
        this.onAuthSuccess = callbacks.onAuthSuccess || (() => {});
        this.onAuthLogout = callbacks.onAuthLogout || (() => {});

        this.authCard = document.getElementById('authCard');
        this.tabSignUp = document.getElementById('tabSignUp');
        this.tabLogIn = document.getElementById('tabLogIn');
        this.pillHighlight = document.getElementById('pillHighlight');
        this.formTitle = document.getElementById('formTitle');
        this.signUpForm = document.getElementById('signUpForm');
        this.logInForm = document.getElementById('logInForm');
        this.alertBox = document.getElementById('alertBox');
        this.logoutBtn = document.getElementById('logoutBtn');

        this.activeTab = 'signup'; // 'signup' | 'login'

        this.init();
    }

    init() {
        this.bindTabs();
        this.bindEyeToggles();
        this.bindForms();
        this.bindLogout();
    }

    bindTabs() {
        this.tabSignUp?.addEventListener('click', () => this.switchTab('signup'));
        this.tabLogIn?.addEventListener('click', () => this.switchTab('login'));
    }

    switchTab(tab) {
        this.activeTab = tab;
        this.hideAlert();

        if (tab === 'signup') {
            this.tabSignUp?.classList.add('active');
            this.tabLogIn?.classList.remove('active');
            if (this.pillHighlight) this.pillHighlight.style.transform = 'translateX(0%)';
            if (this.formTitle) this.formTitle.textContent = t('titleSignUp');
            this.signUpForm?.classList.add('active');
            this.logInForm?.classList.remove('active');
        } else {
            this.tabLogIn?.classList.add('active');
            this.tabSignUp?.classList.remove('active');
            if (this.pillHighlight) this.pillHighlight.style.transform = 'translateX(100%)';
            if (this.formTitle) this.formTitle.textContent = t('titleLogIn');
            this.logInForm?.classList.add('active');
            this.signUpForm?.classList.remove('active');
        }
    }

    updateTitle() {
        if (this.formTitle) {
            this.formTitle.textContent = (this.activeTab === 'signup') ? t('titleSignUp') : t('titleLogIn');
        }
    }

    bindEyeToggles() {
        document.querySelectorAll('.eye-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const input = document.getElementById(targetId);
                if (!input) return;

                if (input.type === 'password') {
                    input.type = 'text';
                    btn.style.color = '#f59e0b';
                } else {
                    input.type = 'password';
                    btn.style.color = '';
                }
            });
        });
    }

    showAlert(type, message) {
        if (!this.alertBox) return;
        this.alertBox.className = `alert-box ${type}`;
        this.alertBox.textContent = message;
        this.alertBox.style.display = 'block';
    }

    hideAlert() {
        if (!this.alertBox) return;
        this.alertBox.style.display = 'none';
        this.alertBox.textContent = '';
    }

    bindForms() {
        // Sign Up
        this.signUpForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            this.hideAlert();

            const firstName = document.getElementById('signUpFirstName')?.value.trim();
            const lastName = document.getElementById('signUpLastName')?.value.trim();
            const email = document.getElementById('signUpEmail')?.value.trim();
            const password = document.getElementById('signUpPassword')?.value;
            const confirmPassword = document.getElementById('signUpConfirmPassword')?.value;

            if (password !== confirmPassword) {
                this.showAlert('error', t('alertPasswordMismatch'));
                return;
            }

            if (password.length < 6) {
                this.showAlert('error', t('alertPasswordLength'));
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
                    this.showAlert('success', t('alertAccountCreated'));
                    this.signUpForm.reset();
                    setTimeout(() => {
                        this.hideAlert();
                        this.onAuthSuccess(data.user);
                    }, 500);
                } else {
                    let errorMsg = t('alertGenericError');
                    if (data.code === 'EMAIL_ALREADY_EXISTS') errorMsg = t('alertEmailExists');
                    else if (data.code === 'FIELDS_REQUIRED') errorMsg = t('alertFieldsRequired');
                    else if (data.code === 'PASSWORD_TOO_SHORT') errorMsg = t('alertPasswordLength');
                    else if (data.message) errorMsg = data.message;
                    this.showAlert('error', errorMsg);
                }
            } catch (err) {
                this.showAlert('error', t('alertConnectionError'));
            }
        });

        // Log In
        this.logInForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            this.hideAlert();

            const email = document.getElementById('logInEmail')?.value.trim();
            const password = document.getElementById('logInPassword')?.value;

            try {
                const res = await fetch('/api/auth/signin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    this.showAlert('success', t('alertWelcomeBack'));
                    this.logInForm.reset();
                    setTimeout(() => {
                        this.hideAlert();
                        this.onAuthSuccess(data.user);
                    }, 500);
                } else {
                    let errorMsg = t('alertInvalidCredentials');
                    if (data.code === 'FIELDS_REQUIRED') errorMsg = t('alertFieldsRequired');
                    else if (data.message) errorMsg = data.message;
                    this.showAlert('error', errorMsg);
                }
            } catch (err) {
                this.showAlert('error', t('alertConnectionError'));
            }
        });
    }

    bindLogout() {
        this.logoutBtn?.addEventListener('click', async () => {
            try {
                await fetch('/api/auth/signout', {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (e) {
                console.error('Logout error:', e);
            }
            this.onAuthLogout();
            this.showAlert('success', t('alertSignedOut'));
        });
    }

    async checkExistingSession() {
        try {
            const res = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.user) {
                    this.onAuthSuccess(data.user);
                }
            }
        } catch (e) {
            // No active session
        }
    }
}
