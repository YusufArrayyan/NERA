import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        secondary: 'var(--secondary)',
        'secondary-light': 'var(--secondary-light)',
        'secondary-dark': 'var(--secondary-dark)',
        
        // Accents
        'accent-success': 'var(--accent-success)',
        'accent-warning': 'var(--accent-warning)',
        'accent-error': 'var(--accent-error)',
        'accent-info': 'var(--accent-info)',
        
        // Neutrals
        'neutral': {
          0: 'var(--neutral-0)',
          50: 'var(--neutral-50)',
          100: 'var(--neutral-100)',
          200: 'var(--neutral-200)',
          300: 'var(--neutral-300)',
          400: 'var(--neutral-400)',
          500: 'var(--neutral-500)',
          600: 'var(--neutral-600)',
          700: 'var(--neutral-700)',
          800: 'var(--neutral-800)',
          900: 'var(--neutral-900)',
        },
        
        // Background
        'bg': {
          default: 'var(--bg-default)',
          elevated: 'var(--bg-elevated)',
          surface: 'var(--bg-surface)',
          hover: 'var(--bg-hover)',
        },
        
        // Text
        'text': {
          default: 'var(--text-default)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        
        // Borders
        'border-color': 'var(--border-color)',
        'divider-color': 'var(--divider-color)',
      },
      
      backgroundColor: {
        'bg-default': 'var(--bg-default)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-surface': 'var(--bg-surface)',
        'bg-hover': 'var(--bg-hover)',
      },
      
      textColor: {
        'text-default': 'var(--text-default)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
      },
      
      borderColor: {
        'border-color': 'var(--border-color)',
      },
      
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '44px' }],
      },
      
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"SF Mono"', 'Monaco', '"Cascadia Code"', '"Roboto Mono"', 'monospace'],
      },
      
      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
      },
      
      borderRadius: {
        none: '0px',
        sm: '4px',
        base: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        full: '9999px',
      },
      
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
}

export default config
