/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      colors: {
        charcoal: '#0b1220',
        navy: '#071426',
        brandTeal: '#14b8a6',
        brandCyan: '#22d3ee',
        brandIndigo: '#6366f1',
        brandViolet: '#8b5cf6',
        danger: '#fb7185',
        success: '#34d399',
        warning: '#fbbf24',
      },
      boxShadow: {
        glowTeal: '0 0 0 1px rgba(20,184,166,.25), 0 0 28px rgba(34,211,238,.25)',
        glowIndigo: '0 0 0 1px rgba(99,102,241,.25), 0 0 28px rgba(139,92,246,.22)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '0.92' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        floaty: 'floaty 5.5s ease-in-out infinite',
        subtlePulse: 'subtlePulse 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

