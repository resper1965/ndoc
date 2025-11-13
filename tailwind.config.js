/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './docs/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ness Design System - Slate palette
        slate: {
          950: '#0f172a',
          900: '#1e293b',
          800: '#334155',
          700: '#475569',
          600: '#64748b',
          500: '#94a3b8',
          400: '#cbd5e1',
          300: '#e2e8f0',
          200: '#f1f5f9',
          100: '#f8fafc',
        },
        // ness Primary accent
        primary: {
          600: '#0088b8',
          500: '#00ade8',
          400: '#33bdec',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      spacing: {
        // Base 4px spacing system
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '4': '16px',
        '8': '32px',
        '16': '64px',
      },
      lineHeight: {
        tight: '1.25',
        relaxed: '1.625',
      },
    },
  },
  screens: {
    xs: '100px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  plugins: [],
};
