import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF5F5',
          100: '#FED7D7',
          200: '#FEB2B2',
          300: '#FC8181',
          400: '#F56565',
          500: '#E53E3E',
          600: '#C53030',
          700: '#9B2C2C',
          800: '#822727',
          900: '#63171B',
        },
        coral: {
          50: '#FFF5F0',
          100: '#FFEDE4',
          200: '#FFDBC9',
          300: '#FFC4A3',
          400: '#FFA67A',
          500: '#FF7F50',
          600: '#E5663D',
          700: '#CC4D2A',
          800: '#993A20',
          900: '#662815',
        },
        warm: {
          50: '#FAFAF8',
          100: '#F5F5F0',
          200: '#EEEDE6',
          300: '#E0DFDA',
          400: '#C5C4BF',
          500: '#A3A29E',
          600: '#78776F',
          700: '#5C5B53',
          800: '#3D3C36',
          900: '#1E1D1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
