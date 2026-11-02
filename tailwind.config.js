/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        rm: {
          bg: '#f8f3ec',
          'bg-alt': '#f1e8dc',
          card: '#fffcf7',
          ink: '#2b1b12',
          muted: '#6f5a4c',
          line: '#e4d6c6',
          gold: '#c5a059',
          'gold-hover': '#b4904b',
          'gold-subtle': '#fdfaf2',
          mocha: '#7a5242',
          tan: '#b98b6a',
          sand: '#d8c09e',
          cream: '#fbf6ef',
          success: '#5d7a4f',
          dark: '#0c131a',
          'dark-card': '#111c26'
        }
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Fraunces', 'Georgia', 'serif'],
        sans: ['var(--font-instrument)', '"Instrument Sans"', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        editorial: '0 4px 20px -2px rgba(43, 27, 18, 0.05), 0 2px 6px -1px rgba(43, 27, 18, 0.03)',
        card: '0 1px 3px 0 rgba(43, 27, 18, 0.04), 0 1px 2px -1px rgba(43, 27, 18, 0.03)',
        popover: '0 12px 32px -4px rgba(43, 27, 18, 0.08), 0 4px 12px -2px rgba(43, 27, 18, 0.04)'
      }
    }
  },
  plugins: []
};
