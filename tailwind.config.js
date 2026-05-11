/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Your custom animations for voice waveform
      keyframes: {
        wave1: {
          '0%, 100%': { transform: 'scaleY(0.6)', opacity: '0.6' },
          '50%': { transform: 'scaleY(1)', opacity: '1' },
        },
        wave2: {
          '0%, 100%': { transform: 'scaleY(0.4)', opacity: '0.5' },
          '50%': { transform: 'scaleY(0.95)', opacity: '1' },
        },
        wave3: {
          '0%, 100%': { transform: 'scaleY(0.3)', opacity: '0.45' },
          '50%': { transform: 'scaleY(0.9)', opacity: '0.95' },
        },
      },
      animation: {
        'wave-1': 'wave1 600ms infinite ease-in-out',
        'wave-2': 'wave2 780ms infinite ease-in-out',
        'wave-3': 'wave3 520ms infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
