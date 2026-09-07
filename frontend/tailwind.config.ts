import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      border: 'rgb(var(--color-border) / <alpha-value>)',
      input: 'rgb(var(--color-input) / <alpha-value>)',
      ring: 'rgb(var(--color-ring) / <alpha-value>)',
      background: 'rgb(var(--color-background) / <alpha-value>)',
      foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
      primary: {
        DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
        foreground: 'rgb(var(--color-primary-foreground) / <alpha-value>)',
      },
      secondary: {
        DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
        foreground: 'rgb(var(--color-secondary-foreground) / <alpha-value>)',
      },
      accent: {
        DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
        foreground: 'rgb(var(--color-accent-foreground) / <alpha-value>)',
      },
      muted: {
        DEFAULT: 'rgb(var(--color-muted) / <alpha-value>)',
        foreground: 'rgb(var(--color-muted-foreground) / <alpha-value>)',
      },
      card: {
        DEFAULT: 'rgb(var(--color-card) / <alpha-value>)',
        foreground: 'rgb(var(--color-card-foreground) / <alpha-value>)',
      },
    },
    extend: {
      borderRadius: {
        lg: '1.5rem',
        md: '1rem',
        sm: '0.5rem',
      },
    },
  },
  plugins: [],
}

export default config

