// ============================================================================
// PRICELY THEME MANAGER (DARK & LIGHT MODE)
// ============================================================================
// Provides smooth, persistent Dark and Light mode toggling across the entire app.

const THEME_KEY = 'pricely_theme';

export class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
        this.toggleButtons = [];
        this.init();
    }

    init() {
        // Apply initial theme
        this.applyTheme(this.currentTheme);

        // Bind all toggle buttons on page
        this.bindButtons();

        // Listen for system theme changes if no explicit preference set
        if (!localStorage.getItem(THEME_KEY) && window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
                this.setTheme(e.matches ? 'light' : 'dark');
            });
        }
    }

    bindButtons() {
        const btns = document.querySelectorAll('.theme-toggle-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleTheme();
            });
            this.toggleButtons.push(btn);
        });
        this.updateButtonsState();
    }

    getTheme() {
        return this.currentTheme;
    }

    setTheme(theme) {
        if (theme !== 'dark' && theme !== 'light') return;
        this.currentTheme = theme;
        localStorage.setItem(THEME_KEY, theme);
        this.applyTheme(theme);
        this.updateButtonsState();

        // Dispatch custom event for modules like particle engine
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    toggleTheme() {
        const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
    }

    updateButtonsState() {
        const isLight = this.currentTheme === 'light';
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            btn.classList.toggle('light-active', isLight);
            btn.setAttribute('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
            btn.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        });
    }
}
