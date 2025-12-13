/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'inventivy-blue': '#2563EB',
        'inventivy-dark-blue': '#1E3A8A',
        'soft-slate': '#F1F5F9',
        'text-dark': '#0F172A',
        'action-green': '#22C55E',
        'warning-amber': '#F59E0B',
        'error-red': '#EF4444',
        'info-cyan': '#06B6D4',
        // Sidebar specific
        'sidebar-bg': '#1E3A8A',
        'sidebar-text': '#E0E7FF',
        'sidebar-active': '#2563EB',
        'sidebar-hover': '#1D4ED8',
        'sidebar-icon': '#93C5FD',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
