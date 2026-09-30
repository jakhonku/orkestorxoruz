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
        // Brend ranglari (PDF "Orkestr va Xor" — logotip qo'llanmasi)
        // Chuqur ko'k — asosiy: #05203A (CMYK 95/69/27/67)
        navy: {
          DEFAULT: '#05203A',
          50: '#edf2f8',
          100: '#d6e2ef',
          200: '#b1c8df',
          300: '#7ea1c6',
          400: '#4a7baa',
          500: '#1f5588',
          600: '#123e6a',
          700: '#0a2d50',
          800: '#05203a',
          900: '#03162a',
          950: '#020c17',
        },
        // Oltin: #D7B56D
        gold: {
          DEFAULT: '#D7B56D',
          50: '#fbf7ec',
          100: '#f5ebd2',
          200: '#ebd8a8',
          300: '#e1c688',
          400: '#dbbb78',
          500: '#d7b56d',
          600: '#b8954d',
          700: '#8f7238',
          800: '#6f5830',
          900: '#594729',
        },
        // Zumrad: #09523E
        emerald: {
          DEFAULT: '#09523E',
          50: '#eaf5f0',
          100: '#cfe8de',
          200: '#a2d1bf',
          300: '#6db19a',
          400: '#3a8c72',
          500: '#1a6e56',
          600: '#0f5f49',
          700: '#09523e',
          800: '#074231',
          900: '#053225',
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
        brand: ['"Tactic Sans Exd"', 'var(--font-brand)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(5, 32, 58, 0.18)',
        'soft-lg': '0 24px 60px -20px rgba(5, 32, 58, 0.28)',
        gold: '0 10px 30px -10px rgba(215, 181, 109, 0.4)',
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
