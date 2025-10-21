/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-green": "#05A00A",
        "brand-red": "#FF0000",
        "brand-blue": "#0B55A4",
        "brand-light-blue": "#007aff",
        "brand-yellow": "#B97207",
        "brand-background": "#F0F6FF",
        "brand-text": "#212121",
      },
      fontFamily: {
        spartan: "var(--font-league-spartan)",
      },
    },
  },
  plugins: [],
};
