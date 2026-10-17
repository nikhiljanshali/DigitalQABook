/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fdfbf7',
          100: '#f9f6ee',
          200: '#f2ece0',
          300: '#e5dcce',
          400: '#d1c3b1',
          500: '#b7a28e',
          900: '#2c2520',
        },
        book: {
          leather: '#3e2723',
          spine: '#2b1b17',
          gold: '#c5a059',
          goldLight: '#e4cd95',
          pageBorder: '#e6ded3',
          ink: '#1e293b',
          muted: '#64748b'
        }
      },
      boxShadow: {
        'book': '0 20px 45px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08)',
        'page-left': 'inset -15px 0 25px -10px rgba(0, 0, 0, 0.12), -2px 0 5px rgba(0, 0, 0, 0.05)',
        'page-right': 'inset 15px 0 25px -10px rgba(0, 0, 0, 0.12), 2px 0 5px rgba(0, 0, 0, 0.05)',
        'spine-crease': '0 0 15px rgba(0,0,0,0.25)',
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
