/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aurora-bg': '#111827',
        'aurora-surface': '#1f2937',
        'aurora-border': 'rgba(255, 255, 255, 0.1)',
        'aurora-primary': '#2dd4bf', // Teal
        'aurora-accent': '#a78bfa',  // Violet
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
}