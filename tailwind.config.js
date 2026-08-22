/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: 'var(--crimson)',
          dark: 'var(--crimson-dark)',
        },
        'red-dark': 'var(--red-dark)',
        gold: {
          DEFAULT: 'var(--gold)',
          dark: 'var(--gold-dark)',
        },
        ivory: {
          DEFAULT: 'var(--ivory)',
          warm: 'var(--ivory-warm)',
        },
        mahogany: {
          DEFAULT: 'var(--mahogany)',
          soft: 'var(--mahogany-soft)',
        },
        line: 'var(--line)',
        success: 'var(--success)',
        parchment: '#E8E1D3',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        custom: 'var(--radius)',
        'card-lg': '28px',
      },
      fontFamily: {
        display: ['"Noto Serif"', 'serif'],
        cormorant: ['"Noto Serif"', 'serif'],
        sans: ['"Noto Serif"', 'serif'],
        mono: ['"Noto Serif"', 'serif'],
      },
    },
  },
  plugins: [],
}
