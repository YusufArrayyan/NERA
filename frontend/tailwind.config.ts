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
        border: '#E8E2D8',
        input: '#E8E2D8',
        ring: '#7FA05E',
        background: '#FDFBF9',
        foreground: '#3D2F26',
        primary: {
          DEFAULT: '#7FA05E',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#3D2F26',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#E8744F',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F5F1ED',
          foreground: '#8B7F75',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#3D2F26',
        },
      },
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

