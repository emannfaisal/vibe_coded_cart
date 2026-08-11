/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#FDF7F5',
          100: '#FBF0EC',
          200: '#F5DDD5',
          300: '#EABFB2',
          400: '#E09F8E',
          500: '#D48370',
          600: '#C26550',
          700: '#A14F3D',
          800: '#844234',
          900: '#6E3A30',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E5EBE5',
          200: '#CCD7CC',
          300: '#A9BCA9',
          400: '#839C83',
          500: '#678167',
          600: '#506750',
          700: '#415241',
          800: '#374337',
          900: '#2F392F',
        },
        cream: {
          50: '#FFFDF9',
          100: '#FDFBF5',
          200: '#F8F3E8',
          300: '#F2E9D8',
          400: '#E8DBC5',
          500: '#D9C8B0',
        },
        obsidian: {
          50: '#F6F5F5',
          100: '#E7E5E4',
          800: '#2A2624',
          900: '#1C1917',
          950: '#0F0E0D',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(42, 38, 36, 0.05)',
        'elevated': '0 20px 40px -15px rgba(42, 38, 36, 0.08)',
        'glass': '0 8px 32px 0 rgba(197, 139, 126, 0.07)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
