import type { Config } from 'tailwindcss'
import { designTokens } from './src/styles/design-tokens'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Enable production content purging
  safelist: [
    // Core utility patterns that might be dynamically generated
    { pattern: /^(bg|text|border|ring)-(primary|secondary|accent|muted|card)/ },
    { pattern: /^(hover|focus|active):/ },
    { pattern: /^grid-cols-/ },
    { pattern: /^md:grid-cols-/ },
    { pattern: /^lg:grid-cols-/ },
  ],
  theme: {
    extend: {
      // Integrate design tokens
      colors: {
        // Primary - Forest Green
        'nera-primary': {
          50: designTokens.colors.primary[50],
          100: designTokens.colors.primary[100],
          200: designTokens.colors.primary[200],
          300: designTokens.colors.primary[300],
          400: designTokens.colors.primary[400],
          500: designTokens.colors.primary[500],
          600: designTokens.colors.primary[600],
          700: designTokens.colors.primary[700],
          800: designTokens.colors.primary[800],
          900: designTokens.colors.primary[900],
        },
        // Secondary - Teal
        'nera-secondary': {
          50: designTokens.colors.secondary[50],
          100: designTokens.colors.secondary[100],
          200: designTokens.colors.secondary[200],
          300: designTokens.colors.secondary[300],
          400: designTokens.colors.secondary[400],
          500: designTokens.colors.secondary[500],
          600: designTokens.colors.secondary[600],
          700: designTokens.colors.secondary[700],
          800: designTokens.colors.secondary[800],
          900: designTokens.colors.secondary[900],
        },
        // Neutrals
        'nera-neutral': {
          0: designTokens.colors.neutral[0],
          50: designTokens.colors.neutral[50],
          100: designTokens.colors.neutral[100],
          200: designTokens.colors.neutral[200],
          300: designTokens.colors.neutral[300],
          400: designTokens.colors.neutral[400],
          500: designTokens.colors.neutral[500],
          600: designTokens.colors.neutral[600],
          700: designTokens.colors.neutral[700],
          800: designTokens.colors.neutral[800],
          900: designTokens.colors.neutral[900],
        },
        // Semantic colors
        'success': designTokens.colors.success,
        'warning': designTokens.colors.warning,
        'error': designTokens.colors.error,
        'info': designTokens.colors.info,
        
        // Legacy colors for backward compatibility
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
      // Optimize typography
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
        mono: ['"SF Mono"', 'Monaco', '"Cascadia Code"', '"Roboto Mono"', 'Consolas', '"Courier New"', 'monospace'],
      },
      // Optimize spacing
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
      // Optimize shadows
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      // Optimize borders
      borderRadius: {
        none: '0px',
        sm: '4px',
        base: '8px',
        md: '12px',
        lg: '1.5rem', // Legacy support
        xl: '20px',
        full: '9999px',
      },
      // Optimize transitions
      transitionDuration: {
        150: '150ms',
        200: '200ms',
        300: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-in-out',
      },
      // Grid optimization
      gridTemplateColumns: {
        1: 'repeat(1, minmax(0, 1fr))',
        2: 'repeat(2, minmax(0, 1fr))',
        3: 'repeat(3, minmax(0, 1fr))',
        4: 'repeat(4, minmax(0, 1fr))',
        6: 'repeat(6, minmax(0, 1fr))',
      },
    },
  },
  // Disable unused features for faster builds
  corePlugins: {
    aspectRatio: true,
    backdropBlur: true,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
  },
  plugins: [],
}

export default config

