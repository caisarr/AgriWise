/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          primary: '#0c1117',
          secondary: '#131a24',
          card: '#171f2b',
          elevated: '#1c2635',
        },
        accent: {
          DEFAULT: '#34d399',
          soft: 'rgba(52, 211, 153, 0.12)',
          hover: '#6ee7b7',
          muted: 'rgba(52, 211, 153, 0.2)',
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'float': 'float 3s ease-in-out infinite',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
}
