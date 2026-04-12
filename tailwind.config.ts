import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nt: {
          bg: '#070b18',
          'bg-2': '#0d1425',
          'bg-3': '#111827',
          cyan: '#00f5d4',
          'cyan-dim': '#00c9ae',
          purple: '#7c3aed',
          'purple-dim': '#5b21b6',
          amber: '#f59e0b',
          'amber-dim': '#d97706',
          border: 'rgba(0,245,212,0.15)',
          'border-2': 'rgba(124,58,237,0.2)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'glow-cyan':
          '0 0 20px rgba(0,245,212,0.25), 0 0 60px rgba(0,245,212,0.08)',
        'glow-purple':
          '0 0 20px rgba(124,58,237,0.3), 0 0 60px rgba(124,58,237,0.1)',
        'glow-amber':
          '0 0 20px rgba(245,158,11,0.3), 0 0 60px rgba(245,158,11,0.1)',
        'inner-cyan': 'inset 0 0 30px rgba(0,245,212,0.05)',
      },
      animation: {
        'pulse-ring':
          'pulseRing 1.5s cubic-bezier(0.215,0.61,0.355,1) infinite',
        scan: 'scan 3s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'data-stream': 'dataStream 20s linear infinite',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '70%': { transform: 'scale(1.3)', opacity: '0' },
          '100%': { transform: 'scale(1.3)', opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        dataStream: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0,245,212,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,212,0.03) 1px, transparent 1px)`,
        'radial-glow':
          'radial-gradient(ellipse at center, rgba(0,245,212,0.06) 0%, transparent 70%)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
    },
  },
  plugins: [],
};

export default config;
