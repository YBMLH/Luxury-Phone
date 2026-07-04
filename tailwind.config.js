/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF7EA',
          100: '#F5EBCB',
          200: '#EBD99A',
          300: '#E2C86C',
          400: '#D8B646',
          500: '#C9A227',
          600: '#A98A1E',
          700: '#8A7018',
          800: '#6B5713',
          900: '#4C3E0D',
          DEFAULT: '#C9A227',
        },
        marble: {
          DEFAULT: '#0C0C0E',
          light: '#17171A',
          lighter: '#222226',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.14)',
        gold: '0 4px 20px rgba(201, 162, 39, 0.35)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
