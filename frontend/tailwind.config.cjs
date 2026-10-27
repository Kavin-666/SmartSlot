/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          light: '#ffffff',
          dark: '#0c0f17',
          card: '#121722',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        primary: '#4f46e5',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(99, 102, 241, 0.25)',
        'glow-lg': '0 0 60px -15px rgba(99, 102, 241, 0.35)',
        'subtle': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card-dark': '0 4px 24px -2px rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
