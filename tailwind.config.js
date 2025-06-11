/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/products/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/policies/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/api/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{css,scss}", // assuming you're using global styles
    "./public/images/**/*.{svg,png,jpg,jpeg,webp}", // Tailwind won't purge from images, but included if you use classes in inline SVGs
    "./public/**/*.{html,js}", // in case you have some static HTML or JS using Tailwind
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          hover: '#1d4ed8', // blue-700
        },
      },
    },
  },
  plugins: [],
}
