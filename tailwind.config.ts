import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
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
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'fade-in-down': {
          'from': { opacity: '0', transform: 'translateY(-20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow': {
          '0%, 100%': { 'text-shadow': '0 0 5px hsl(var(--primary)), 0 0 10px hsl(var(--primary) / 0.5)' },
          '50%': { 'text-shadow': '0 0 20px hsl(var(--primary)), 0 0 30px hsl(var(--primary) / 0.5)' },
        },
        'slide-in-from-bottom': {
          'from': { transform: 'translateY(100%)' },
          'to': { transform: 'translateY(0)' },
        },
        'background-pan': {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        'infinite-scroll': {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(-100%)' },
        },
        'rat-speak': {
          '0%, 100%': { transform: 'scaleY(1)', 'transform-origin': 'bottom' },
          '50%': { transform: 'scaleY(1.05)', 'transform-origin': 'bottom'  },
        },
        'rat-listen': {
          '0%, 100%': { transform: 'rotate(-2deg)', 'transform-origin': 'bottom' },
          '50%': { transform: 'rotate(2deg)', 'transform-origin': 'bottom' },
        },
        'prompt-pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.8) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'glow': 'glow 3s ease-in-out infinite',
        'background-pan': 'background-pan 15s ease-in-out infinite',
        'infinite-scroll': 'infinite-scroll 120s linear infinite',
        'rat-speak': 'rat-speak 0.5s ease-in-out infinite',
        'rat-listen': 'rat-listen 1.2s ease-in-out infinite',
        'prompt-pop-in': 'prompt-pop-in 0.3s ease-out 1.5s forwards',

        // New staggered animations
        'startup-fade-in-down': 'fade-in-down 0.5s ease-out forwards',
        'startup-fade-in-up-1': 'fade-in-up 0.5s ease-out 0.2s forwards',
        'startup-fade-in-up-2': 'fade-in-up 0.5s ease-out 0.4s forwards',
        'startup-fade-in-up-3': 'fade-in-up 0.5s ease-out 0.6s forwards',
        'startup-fade-in-up-4': 'fade-in-up 0.5s ease-out 0.8s forwards',
        'startup-slide-in-bottom': 'slide-in-from-bottom 0.5s ease-out 1.0s forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
