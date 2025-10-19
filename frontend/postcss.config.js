// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // <-- Linha nova/correta
    autoprefixer: {},
  },
};