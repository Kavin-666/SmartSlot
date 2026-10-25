/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // indigo-500
        success: '#10b981', // green-500
        warning: '#f59e0b', // amber-500
        danger: '#ef4444', // red-500
      },
    },
  },
  plugins: [],
};
