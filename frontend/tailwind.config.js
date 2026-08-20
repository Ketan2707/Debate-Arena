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
          dark: '#dbeafe',            // Light sky blue background
          panel: 'rgba(255,255,255,0.55)',  // Frosted white panels
          border: '#bfdbfe',          // Light blue borders
          accent: '#4f46e5',          // Deeper indigo for light bg
          accentAmber: '#d97706',     // Darker amber for readability
          textMuted: '#475569',       // Slate-600 for muted text
          textLight: '#1e293b',       // Dark slate for primary text
        }
      }
    },
  },
  plugins: [],
}
