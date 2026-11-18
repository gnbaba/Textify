/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F3EFE3',
        ink: {
          DEFAULT: '#20251F',
          muted: 'rgba(32, 37, 31, 0.72)',
          faint: 'rgba(32, 37, 31, 0.40)',
          border: 'rgba(32, 37, 31, 0.18)',
        },
        forest: {
          DEFAULT: '#214C3A',
          hover: '#19392c',
          light: '#2d634d',
        },
        persimmon: {
          DEFAULT: '#E96C3F',
          hover: '#d55a2f',
          faint: 'rgba(233, 108, 63, 0.12)',
        },
        sage: {
          DEFAULT: '#D9E4CB',
          light: '#e7eedf',
          dark: '#c4d2b3',
        },
        'paper-white': '#FFFDF7',
      },
      fontFamily: {
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'drafting': '4px 4px 0px 0px #20251F',
        'drafting-sm': '2px 2px 0px 0px #20251F',
        'drafting-lg': '6px 6px 0px 0px #20251F',
      },
    },
  },
  plugins: [],
};
