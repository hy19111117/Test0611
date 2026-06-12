/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#F9943B',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FEC37E',
          400: '#F9943B',
          500: '#F57C00',
          600: '#E65100',
          700: '#BF360C',
          800: '#8D2E0C',
          900: '#5D1E0C',
        },
        text: {
          DEFAULT: '#1F2937',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        bg: {
          DEFAULT: '#FFFFFF',
          page: '#F3F4F6',
          card: '#FFFFFF',
          hover: '#F9FAFB',
        },
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
        },
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
        },
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
        },
      },
      maxWidth: {
        'page': '1200px',
      },
      spacing: {
        'section': '32px',
        'card': '16px',
      },
      lineHeight: {
        'body': '1.5',
      },
      fontSize: {
        'heading': '28px',
        'section': '16px',
        'body': '14px',
        'small': '12px',
      },
    },
  },
  plugins: [],
}
