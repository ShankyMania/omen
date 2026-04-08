/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        critical: '#dc2626',
        high: '#ea580c',
        medium: '#ca8a04',
        low: '#16a34a',
      },
    },
  },
  plugins: [],
}
