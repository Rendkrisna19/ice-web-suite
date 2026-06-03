import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A534B', 
          50:  '#F2F7F6',
          100: '#E1EBE9',
          200: '#C2D6D3',
          300: '#9FBDB8',
          400: '#7DA39D',
          500: '#1A534B', 
          600: '#15423C',
          700: '#10322D',
          800: '#0B211E',
          900: '#05110F',
          foreground: '#ffffff',
        },

        
        secondary: {
          DEFAULT: '#C7B198',
          50:  '#FCFAF8',
          100: '#F9F5F1',
          200: '#EFE6DE',
          300: '#E5D8CA',
          400: '#DBC9B6',
          500: '#C7B198', 
          600: '#9F8E7A',
          700: '#776A5B',
          800: '#50473D',
          900: '#28231E',
          foreground: '#1A534B',
        },
        
        surface: {
          DEFAULT: '#F0ECE4',
          50:  '#FFFFFF',
          100: '#FFFFFF', // <--- UNTUK CARD (WHITE)
          200: '#F8F6F2',
          300: '#F0ECE4', // <--- UNTUK BACKGROUND APP (Alabaster)
          400: '#DCD6C8',
          500: '#C8C0B0',
          600: '#A09680',
          700: '#787060',
          800: '#504840',
          900: '#282420',
        },

        // --- NEUTRAL: Slate Gray (#4B5563) ---
        neutral: {
          DEFAULT: '#4B5563',
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563', // <--- WARNA UTAMA TEKS
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },

        // --- FUNCTIONAL COLORS (Sesuai Color Guide) ---
        success: {
          DEFAULT: '#22C55E', // Vibrant Green
          100: '#DCFCE7',     // Background soft
          500: '#22C55E',
          700: '#15803D',
        },
        danger: {
          DEFAULT: '#EF4444', // Tomato Red
          100: '#FEE2E2',
          500: '#EF4444',
          700: '#B91C1C',
        },
        warning: {
          DEFAULT: '#F59E0B', // Amber
          100: '#FEF3C7',
          500: '#F59E0B',
          700: '#B45309',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;