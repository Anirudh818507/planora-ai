/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep navy base
        navy: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#1e1b4b',
          900: '#0f0d2e',
          950: '#07061a',
        },
        // Deep plum
        plum: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#6b1d7f',
          900: '#3b0764',
          950: '#1a0030',
        },
        // Coral accent
        coral: {
          50:  '#fff1ee',
          100: '#ffe0d7',
          200: '#ffbcad',
          300: '#ff8c74',
          400: '#ff6b51',
          500: '#ff4a2a',
          600: '#ed2f10',
          700: '#c8220c',
          800: '#a51f10',
          900: '#881f14',
          950: '#4a0c05',
        },
        // Violet accent
        violet: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Gold accent
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Surface colors
        surface: {
          DEFAULT: '#12103a',
          card: '#1a1752',
          elevated: '#221e66',
          border: '#2d2873',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-celebration': 'linear-gradient(135deg, #0f0d2e 0%, #1a0030 50%, #0f0d2e 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(34,30,102,0.8) 0%, rgba(26,23,82,0.9) 100%)',
        'gradient-accent': 'linear-gradient(135deg, #ff4a2a 0%, #d946ef 50%, #8b5cf6 100%)',
        'gradient-gold': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      },
      boxShadow: {
        'glow-coral': '0 0 20px rgba(255,74,42,0.3)',
        'glow-violet': '0 0 20px rgba(139,92,246,0.3)',
        'glow-gold': '0 0 20px rgba(245,158,11,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
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
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}
