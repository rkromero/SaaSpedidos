module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-calc': {
      warnWhenCannotResolve: true,
      precision: 5,
      preserve: true,
      selectors: true,
      mediaQueries: true
    }
  },
} 