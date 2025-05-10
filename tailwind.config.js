/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'gray': {
          '50': 'rgb(var(--color-gray-50))',
          '100': 'rgb(var(--color-gray-100))',
          '200': 'rgb(var(--color-gray-200))',
          '300': 'rgb(var(--color-gray-300))',
          '400': 'rgb(var(--color-gray-400))',
          '500': 'rgb(var(--color-gray-500))',
          '600': 'rgb(var(--color-gray-600))',
          '700': 'rgb(var(--color-gray-700))',
          '800': 'rgb(var(--color-gray-800))',
          '900': 'rgb(var(--color-gray-900))',
        },
      },
    },
  },
  plugins: [],
};