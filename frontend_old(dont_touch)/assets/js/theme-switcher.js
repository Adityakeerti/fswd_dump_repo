/**
 * ============================================================
 * Theme Switcher — Light/Dark Mode Toggle
 * ============================================================
 * Manages light/dark mode switching with localStorage persistence
 * and smooth transitions
 */

class ThemeSwitcher {
    constructor() {
        this.STORAGE_KEY = 'pt-theme-preference';
        this.LIGHT_MODE_CLASS = 'light-mode';
        this.DARK_MODE_CLASS = 'dark-mode';
        this.INITIAL_THEME = 'dark'; // Default to dark
        
        this.init();
    }

    /**
     * Initialize theme switcher
     */
    init() {
        this.loadSavedTheme();
        this.setupEventListeners();
        this.setupSystemPreferenceListener();
    }

    /**
     * Load saved theme from localStorage or system preference
     */
    loadSavedTheme() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        
        if (saved) {
            this.setTheme(saved);
        } else if (this.supportsSystemPreference()) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        } else {
            this.setTheme(this.INITIAL_THEME);
        }
    }

    /**
     * Set theme and apply to document
     */
    setTheme(theme) {
        const validTheme = ['light', 'dark'].includes(theme) ? theme : 'dark';
        
        // Apply theme to document
        document.documentElement.classList.remove(this.LIGHT_MODE_CLASS, this.DARK_MODE_CLASS);
        if (validTheme === 'light') {
            document.documentElement.classList.add(this.LIGHT_MODE_CLASS);
        } else {
            document.documentElement.classList.add(this.DARK_MODE_CLASS);
        }
        
        // Save preference
        localStorage.setItem(this.STORAGE_KEY, validTheme);
        
        // Update all theme toggle buttons
        this.updateToggleButtons(validTheme);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: validTheme } }));
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        if (document.documentElement.classList.contains(this.LIGHT_MODE_CLASS)) {
            return 'light';
        }
        return 'dark';
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const current = this.getCurrentTheme();
        const next = current === 'light' ? 'dark' : 'light';
        this.setTheme(next);
    }

    /**
     * Update theme toggle button states
     */
    updateToggleButtons(theme) {
        const buttons = document.querySelectorAll('[data-theme-toggle]');
        buttons.forEach(btn => {
            const isLight = theme === 'light';
            
            // Update button appearance
            btn.setAttribute('data-theme', theme);
            btn.setAttribute('aria-pressed', isLight.toString());
            
            // Update icon if present
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.remove('bi-moon', 'bi-sun');
                icon.classList.add(isLight ? 'bi-moon' : 'bi-sun');
            }
            
            // Update tooltip
            btn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
        });
    }

    /**
     * Setup event listeners for theme toggles
     */
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-theme-toggle]')) {
                this.toggleTheme();
            }
        });
    }

    /**
     * Listen for system preference changes
     */
    setupSystemPreferenceListener() {
        if (this.supportsSystemPreference()) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                const saved = localStorage.getItem(this.STORAGE_KEY);
                if (!saved) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    /**
     * Check if system preference is supported
     */
    supportsSystemPreference() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all';
    }
}

// Initialize theme switcher when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeSwitcher();
    });
} else {
    new ThemeSwitcher();
}
