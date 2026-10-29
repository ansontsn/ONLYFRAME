/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#141414',
        paper: '#F7F5F2',
        brand: { DEFAULT: '#C8386C', deep: '#A82A58', soft: '#F9E8EE' },
        dark: {
          900: '#0a0b0e',
          800: '#12141a',
          700: '#1a1d26',
          600: '#262a36'
        },
        accent: {
          pink: '#ff7eb6',
          purple: '#a855f7',
          silver: '#e2e8f0',
          chrome: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Noto Sans TC', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
        korean: ['Pretendard', 'Noto Sans TC', 'sans-serif']
      },
      boxShadow: {
        'acrylic': '0 20px 50px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 -1px 2px rgba(0, 0, 0, 0.2)',
        'acrylic-glow': '0 0 35px rgba(255, 126, 182, 0.25), 0 20px 40px rgba(0, 0, 0, 0.3)'
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
