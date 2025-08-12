/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Primary fonts (Option C - Creative & Distinctive)
        'sans': ['var(--font-ibm-plex)', 'system-ui', 'sans-serif'], // Default body
        'heading': ['var(--font-outfit)', 'system-ui', 'sans-serif'], // Headings
        'mono': ['var(--font-space-mono)', 'monospace'], // Code/data
        
        // Keep others available for FontSwitcher
        'outfit': ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        'ibm-plex': ['var(--font-ibm-plex)', 'system-ui', 'sans-serif'],
        'space-mono': ['var(--font-space-mono)', 'monospace'],
        
        // Alternative options
        'poppins': ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        'inter': ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'jetbrains-mono': ['var(--font-jetbrains-mono)', 'monospace'],
        'plus-jakarta': ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        'source-sans': ['var(--font-source-sans)', 'system-ui', 'sans-serif'],
        'fira-code': ['var(--font-fira-code)', 'monospace'],
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'title': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'heading': ['clamp(1.25rem, 2vw, 1.75rem)', { lineHeight: '1.3' }],
        'body-large': ['1.125rem', { lineHeight: '1.7' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'caption': ['0.875rem', { lineHeight: '1.5' }],
        'micro': ['0.75rem', { lineHeight: '1.4' }],
      },
      colors: {
        // Custom brand colors (alpha-ready for /opacity modifiers)
        'mtg-green': 'rgb(105 189 69 / <alpha-value>)',
        'mde-yellow': 'rgb(247 237 106 / <alpha-value>)',
        'mde-green': 'rgb(105 189 69 / <alpha-value>)',
        'mde-blue': 'rgb(153 217 224 / <alpha-value>)',
        'mde-pink': 'rgb(244 156 211 / <alpha-value>)',
        'mde-red': 'rgb(242 109 109 / <alpha-value>)',
        'ocean': {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        'forest': {
          50: '#f0fdf4',
          500: '#059669',
          600: '#047857',
          700: '#065f46',
        },
        'earth': {
          50: '#fefaf5',
          500: '#92400e',
          600: '#7c2d12',
          700: '#451a03',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}