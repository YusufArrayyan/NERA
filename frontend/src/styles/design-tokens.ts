/**
 * NERA Design Tokens
 * Centralized design system for consistent UI across the platform
 */

export const designTokens = {
  // Color Palette
  colors: {
    // Primary - Forest Green (Science/Trust)
    primary: {
      50: '#f0faf5',
      100: '#dff5e8',
      200: '#b8e6d1',
      300: '#90d8ba',
      400: '#5bc89f',
      500: '#2db87f', // Main brand color
      600: '#1f9863',
      700: '#1a7f52',
      800: '#156542',
      900: '#0f4c32',
    },
    // Secondary - Teal (Technology/Innovation)
    secondary: {
      50: '#f0fdfa',
      100: '#cffaf2',
      200: '#a0f3e8',
      300: '#8FAD8E',
      400: '#7A9B79',
      500: '#5B7B5A', // Secondary brand - Forest Green
      600: '#4A6349',
      700: '#08766c',
      800: '#04433e',
      900: '#021010',
    },
    // Neutrals
    neutral: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    // Semantic
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Gradients
    gradients: {
      primary: 'linear-gradient(135deg, #5B7B5A 0%, #7A9B79 100%)',
      dark: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    },
    fontSize: {
      xs: { size: '12px', lineHeight: '16px' },
      sm: { size: '14px', lineHeight: '20px' },
      base: { size: '16px', lineHeight: '24px' },
      lg: { size: '18px', lineHeight: '28px' },
      xl: { size: '20px', lineHeight: '28px' },
      '2xl': { size: '24px', lineHeight: '32px' },
      '3xl': { size: '30px', lineHeight: '36px' },
      '4xl': { size: '36px', lineHeight: '44px' },
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing
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

  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Breakpoints (Mobile First)
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-Index
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    offcanvas: 1050,
    modal: 1060,
    popover: 1070,
    tooltip: 1080,
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
};

export type DesignTokens = typeof designTokens;
