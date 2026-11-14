/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      colors: {
        nlm: {
          blue: '#1a73e8',
          blueHover: '#1557b0',
          blueDark: '#8ab4f8',
          cardDark: '#14171d',
          cardDarkHover: '#1c212a',
          borderDark: '#232834',
        }
      }
    },
  },
  plugins: [],
}
