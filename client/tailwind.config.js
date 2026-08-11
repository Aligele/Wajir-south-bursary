/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sand:   { DEFAULT: "#f3ead9", 2: "#e9dcc4" },
        ink:    { DEFAULT: "#2a2016", soft: "#6b5d49" },
        green:  { DEFAULT: "#1f5c3d", d: "#164229" },
        gold:   { DEFAULT: "#c98a1e", d: "#a06f14" },
        line:   "#d8c9ad",
        paper:  "#fffdf8",
        brick:  "#a3341f",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
