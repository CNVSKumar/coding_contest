/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080a10',
          surface: '#0f1322',
          card: 'rgba(21, 29, 52, 0.35)',
          border: 'rgba(255, 255, 255, 0.06)',
          primary: '#6366f1', // Indigo
          primaryHover: '#4f46e5',
          secondary: '#06b6d4', // Cyan
          success: '#10b981', // Emerald
          warning: '#f59e0b', // Amber
          danger: '#ef4444', // Red
          textPrimary: '#f3f4f6',
          textSecondary: '#9ca3af',
          textMuted: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(99, 102, 241, 0.15)',
        'glow-secondary': '0 0 15px rgba(6, 182, 212, 0.15)',
        'glow-success': '0 0 15px rgba(16, 185, 129, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
