/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "brand-green": "#00C853",
        "brand-red": "#D50000",
        "brand-blue": "#2962FF",
        "brand-yellow": "#FFD600",
        "brand-background": "#E0F2F7", // Novo tom de azul claro
        "brand-text": "#212121",
      },
      fontFamily: {
        spartan: "var(--font-league-spartan)",
      },
    },
  },
  plugins: [],
};