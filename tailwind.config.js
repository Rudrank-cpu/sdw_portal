/** @type {import('tailwindcss').Config} */
export default {
  darkMode: '[data-theme="dark"]',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Brand blues derived from docs/design.md tokens
        brand: {
          50: '#e6edff',
          100: '#d9e4fb',
          200: '#afc1f4',
          300: '#8ba4ec',
          400: '#637fe0',
          500: '#4765d4',
          600: '#3158c8',
          700: '#2446aa',
          800: '#1e3a8a',
          900: '#18306f',
        },
        gold: {
          400: '#b79a5c',
          500: '#a6874c',
          600: '#8c713d',
        },
        success: {
          500: '#55a889',
          600: '#2f806a',
        },
        danger: {
          500: '#ef8588',
          600: '#d9686e',
        },
        warning: {
          500: '#c59a3a',
          600: '#a87816',
        },
        ink: {
          950: '#05070B',
          900: '#080B10',
          800: '#0B0F16',
          700: '#0D1118',
          600: '#111722',
          500: '#151B25',
        },
      },
    },
  },
  plugins: [],
};