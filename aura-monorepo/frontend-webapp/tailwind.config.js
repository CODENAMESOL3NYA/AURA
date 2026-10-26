/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        oled: {
          black: '#000000',
          base: '#050505',
          surface: '#0f0f11',
          card: '#18181b',
          border: '#27272a',
          muted: '#71717a',
          subtle: '#a1a1aa',
          text: '#fafafa',
        },
        sos: {
          red: '#ef4444',
          crimson: '#dc2626',
          rose: '#f43f5e',
          glow: 'rgba(239, 68, 68, 0.4)',
        },
        stealth: {
          bg: '#f8fafc',
          surface: '#ffffff',
          border: '#e2e8f0',
          text: '#0f172a',
          muted: '#64748b',
          primary: '#2563eb',
          accent: '#3b82f6',
        },
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
        tight: '-0.02em',
      },
    },
  },
  plugins: [],
}
