/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#0e1013',      // Premium deep charcoal background
          panel: '#16191f',     // Slightly lighter panels
          border: '#242731',    // Fine border lines
          accent: '#6366f1',    // confident electric indigo accent
          accentAmber: '#f59e0b', // warm amber for verdicts
          textMuted: '#8e9aa8', // readable muted text
          textLight: '#f8fafc',
        }
      }
    },
  },
  plugins: [],
}
