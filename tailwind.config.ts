import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bone: "#F5F0EB",
        cream: "#FAF8F5",
        sand: "#E8E2DA",
        warm: {
          50: "#FDFCFA",
          100: "#FAF8F5",
          200: "#F5F0EB",
          300: "#E8E2DA",
          400: "#D4CBC0",
          500: "#B8ADA0",
          600: "#9A8E80",
          700: "#7A6E60",
          800: "#5C5248",
          900: "#3D3630",
        },
        charcoal: {
          50: "#F7F7F7",
          100: "#E3E3E3",
          200: "#C8C8C8",
          300: "#A4A4A4",
          400: "#818181",
          500: "#666666",
          600: "#515151",
          700: "#434343",
          800: "#383838",
          900: "#1A1A1A",
          950: "#0D0D0D",
        },
        accent: {
          terracotta: "#C67B5C",
          sage: "#8FA68A",
          indigo: "#5C6BC0",
          ochre: "#D4A853",
        },
      },
      fontFamily: {
        display: ['"Clash Display"', '"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'hero': ['clamp(3rem, 8vw, 7.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'title': ['clamp(1.75rem, 3vw, 2.75rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'subtitle': ['clamp(1.125rem, 1.5vw, 1.375rem)', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body': ['1rem', { lineHeight: '1.7' }],
        'caption': ['0.875rem', { lineHeight: '1.5' }],
        'micro': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
      },
      maxWidth: {
        'prose-narrow': '55ch',
        'prose-wide': '75ch',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'fade-in': 'fade-in 0.5s ease forwards',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
