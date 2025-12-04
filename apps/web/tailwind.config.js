/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple's refined blue as primary accent
        'primary': '#0071E3',
        'primary-hover': '#005BB5',
        // Subtle soft grays for light theme
        'gray-light': {
          50: '#F9F9F9',
          100: '#F2F2F2',
          200: '#E5E5E7',
          300: '#D1D1D6',
          400: '#AEAEB2',
          500: '#86868B',
          600: '#636366',
        },
      },
      fontFamily: {
        // Clean, modern sans-serif stack inspired by SF Pro
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'HelveticaNeue-Thin', '"Helvetica Neue"', 'sans-serif'],
      },
      spacing: {
        // Generous white space
        'container': '1200px',
      },
      borderRadius: {
        'large': '0.625rem', // 10px for softer corners
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.1)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
      fontSize: {
        'headline-xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'headline-lg': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'headline-md': ['1.875rem', { lineHeight: '1.2' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
      },
    },
  },
  plugins: [],
}
