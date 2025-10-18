/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-green": "#05A00A",
        "brand-red": "#FF0000",
        "brand-blue": "#0B55A4",
        "brand-yellow": "#FFD600",
        "brand-background": "#F0F6FF",
        "brand-text": "#212121",
      },
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
