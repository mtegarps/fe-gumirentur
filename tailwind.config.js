/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f4ff',
          100: '#b3dbff',
          200: '#80c3ff',
          300: '#4dabff',
          400: '#1a93ff',
          500: '#0080D8', // Main blue from logo
          600: '#0066ad',
          700: '#004d82',
          800: '#003357',
          900: '#001a2b',
        },
        secondary: {
          50: '#fff9e6',
          100: '#ffecb3',
          200: '#ffe080',
          300: '#ffd44d',
          400: '#ffc71a',
          500: '#F9A825', // Golden yellow from logo
          600: '#c78600',
          700: '#956400',
          800: '#634200',
          900: '#312100',
        },
        accent: {
          50: '#e8f7fc',
          100: '#c2e9f7',
          200: '#9cdbf2',
          300: '#76cded',
          400: '#50bfe8',
          500: '#62BEF3', // Light blue accent
          600: '#4e98c2',
          700: '#3a7291',
          800: '#274c61',
          900: '#132630',
        },
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        }
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
