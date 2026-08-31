/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cube: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          accent: '#38bdf8',
          u: '#ffffff',
          d: '#facc15',
          f: '#22c55e',
          b: '#3b82f6',
          l: '#f97316',
          r: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
