import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/ui/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Coffee-inspired palette
        bean: {
          50: '#faf6f1',
          100: '#f0e6d7',
          200: '#dcc4a0',
          300: '#c69c69',
          400: '#a87a47',
          500: '#8a5e2f',
          600: '#6d4722',
          700: '#503319',
          800: '#3a2410',
          900: '#241408',
        },
        roast: {
          50: '#fff7ed',
          100: '#ffe6c7',
          200: '#fdc888',
          300: '#fba24a',
          400: '#f57e1f',
          500: '#e2610a',
          600: '#bf4a05',
          700: '#923608',
          800: '#6f2b0c',
          900: '#4f200b',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
