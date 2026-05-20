/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          glow: '#00f0ff',
          dark: '#0f172a', // slate-900
        }
      }
    },
  },
  plugins: [],
}
