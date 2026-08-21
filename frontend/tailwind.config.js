/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          50: '#FCFAF8',
          100: '#FAF7F2',
          150: '#F5EFEB',
          200: '#F0ECE6',
          250: '#EAE6E1',
          300: '#DFCBB9',
          400: '#A68966',
          500: '#735A3A',
          600: '#5E472D',
          700: '#4A3722',
          800: '#332517',
          900: '#1A1A1A',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'lux': '0px 12px 32px rgba(26, 26, 26, 0.04)',
        'lux-hover': '0px 16px 40px rgba(26, 26, 26, 0.07)',
      }
    },
  },
  plugins: [],
}
