import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // Brand palette
        navy: {
          DEFAULT: '#0B3C7D',
          50: '#eef4fb',
          100: '#d5e3f4',
          200: '#adc8e9',
          300: '#7ba6da',
          400: '#4a7fc4',
          500: '#2b60a6',
          600: '#1c4a87',
          700: '#0B3C7D',
          800: '#0a2f61',
          900: '#082445',
        },
        gold: {
          DEFAULT: '#C9A227',
          50: '#faf6e9',
          100: '#f3e9c6',
          200: '#e8d38c',
          300: '#dcbc55',
          400: '#d0a938',
          500: '#C9A227',
          600: '#a5821f',
          700: '#7f631c',
          800: '#6a521e',
          900: '#5a461e',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(11, 60, 125, 0.18)',
        'soft-lg': '0 24px 60px -20px rgba(11, 60, 125, 0.28)',
        gold: '0 10px 30px -10px rgba(201, 162, 39, 0.4)',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
