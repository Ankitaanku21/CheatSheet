/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#4f46e5',
          secondary: '#7c3aed',
          accent: '#f59e0b',
          neutral: '#1f2937',
          'base-100': '#27272a',
          'base-200': '#18181b',
          'base-300': '#09090b',
          'base-content': '#ffffff',
          info: '#3b82f6',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
  },
};
