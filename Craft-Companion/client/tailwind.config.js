/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        oled: {
          canvas: '#141415',
          card: '#1c1c20',
          cardInner: '#151518',
          pill: '#202024',
          pillHover: '#29292f',
          wire: '#38383e',
          muted: '#8b8b93',
          950: '#141415',
          900: '#18181c',
          850: '#1c1c20',
          800: '#232328',
          panel: 'rgba(28, 28, 32, 0.75)',
          input: '#151518',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.18)',
        },
        game: {
          blue: '#38bdf8',
          green: '#4ade80',
          purple: '#818cf8',
          orange: '#f97316',
          pink: '#f472b6',
          red: '#ef4444',
          yellow: '#facc15',
        },
      },
      fontFamily: {
        main: ['Outfit', 'sans-serif'],
        title: ['"Press Start 2P"', 'monospace'],
        pixel: ['"Pixelify Sans"', 'sans-serif'],
        impostor: ['"TheImpostor"', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'lg': '16px',
        'xl': '16px',
        '2xl': '16px',
        '3xl': '16px',
        'md': '14px',
        'sm': '10px',
      },
      boxShadow: {
        'oled-card': '0 4px 24px -1px rgba(0, 0, 0, 0.35)',
        'oled-glow': '0 0 20px -3px rgba(56, 189, 248, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
