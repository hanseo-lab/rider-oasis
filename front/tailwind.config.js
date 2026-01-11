/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 다크모드 class 기반 활성화
  theme: {
    extend: {
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
      colors: {
        gray: {
          750: '#2d3549',
        },
      },
    },
  },
  plugins: [],
}
