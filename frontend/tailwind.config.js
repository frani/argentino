/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'retro-bg': '#dfd0dc', // Vaporwave pinkish grey for window borders
        'retro-bg-tint': '#7983c2', // Vaporwave lavender blue desktop
        'retro-blue': '#6aa6a6', // Vaporwave muted teal for titlebars
        'retro-pink': '#ffb0d9', // Bright vaporwave pink
        'retro-yellow': '#fff9a6', // Softer sunset yellow
        'retro-green': '#5ad6d6', // Cyan/Aqua green
        'pastel-pink': '#fcd2e6',
        'pastel-pink-dark': '#f9a8d4',
        'pastel-yellow': '#fff4b3',
        'pastel-yellow-dark': '#fde047',
        'pastel-blue': '#c1dffd',
        'pastel-blue-dark': '#93c5fd',
        'pastel-green': '#bef5e4',
        'pastel-green-dark': '#86efac',
        'pastel-purple': '#eac2fd',
        'pastel-purple-dark': '#d8b4fe',
        'window-bg': '#fcf9fc', // Slightly warm white
      },
      boxShadow: {
        'window': 'inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px #808080, inset 2px 2px #ffffff',
        'button': 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf',
        'button-pressed': 'inset -1px -1px #ffffff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px #808080',
      },
    },
  },
  plugins: [],
}
