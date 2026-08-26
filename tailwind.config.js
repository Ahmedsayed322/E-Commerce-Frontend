/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#111111',
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#111111',
        },
        ivory: {
          DEFAULT: '#F7F4EE',
          50: '#fdfcfb',
          100: '#faf7f3',
          200: '#F7F4EE',
          300: '#ebe4d8',
          400: '#ded2c0',
        },
        stone: {
          DEFAULT: '#D8D2C7',
          50: '#f9f8f6',
          100: '#f2f0eb',
          200: '#e5e1d9',
          300: '#D8D2C7',
          400: '#beada0',
          500: '#a79587',
        },
        terracotta: {
          DEFAULT: '#C96F4A',
          50: '#fbf4f1',
          100: '#f6e6df',
          200: '#edd0c3',
          300: '#dfb29e',
          400: '#d18b70',
          500: '#C96F4A',
          600: '#b85834',
          700: '#994429',
          800: '#7c3825',
          900: '#673123',
        },
        primary: {
          50: '#fbf4f1',
          100: '#f6e6df',
          200: '#edd0c3',
          300: '#dfb29e',
          400: '#d18b70',
          500: '#C96F4A',
          600: '#b85834',
          700: '#994429',
          800: '#7c3825',
          900: '#673123',
          950: '#111111',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        secondary: ['Inter', 'sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        luxury: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 24px -2px rgba(17, 17, 17, 0.04)',
        'card': '0 12px 32px -4px rgba(17, 17, 17, 0.07)',
        'elevated': '0 24px 48px -12px rgba(17, 17, 17, 0.12)',
      }
    },
  },
  plugins: [],
}
