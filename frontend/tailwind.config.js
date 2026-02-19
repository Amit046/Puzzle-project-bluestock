/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 900: '#1e3a8a' },
        dark: { 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' }
      },
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif']
      },
      animation: {
        'cell-pop': 'cellPop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        'shake': 'shake 0.4s ease-in-out',
        'fire': 'fire 1s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite'
      },
      keyframes: {
        cellPop: { '0%': { transform: 'scale(0.7)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        bounceIn: { '0%': { transform: 'scale(0.5)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '20%,60%': { transform: 'translateX(-8px)' }, '40%,80%': { transform: 'translateX(8px)' } },
        fire: { '0%,100%': { transform: 'scale(1) rotate(-3deg)' }, '50%': { transform: 'scale(1.2) rotate(3deg)' } },
        glow: { '0%,100%': { boxShadow: '0 0 5px #3b82f6' }, '50%': { boxShadow: '0 0 20px #3b82f6, 0 0 40px #3b82f640' } }
      }
    }
  },
  plugins: []
}
