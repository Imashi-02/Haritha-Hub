/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'haritha-green': '#2E5E4E',
        'haritha-light': '#E9F5E9',
      },
    },
  },
  plugins: [],
}