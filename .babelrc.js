const plugins = [
  '@babel/plugin-transform-flow-comments',
  ['@babel/plugin-proposal-class-properties', { loose: true }],
  '@babel/plugin-proposal-json-strings',
  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-transform-template-literals',
  '@babel/plugin-transform-literals',
  '@babel/plugin-transform-function-name',
  '@babel/plugin-transform-arrow-functions',
  '@babel/plugin-transform-block-scoping',
  '@babel/plugin-transform-classes',
  '@babel/plugin-transform-destructuring',
  '@babel/plugin-transform-spread',
]

module.exports = {
  plugins,
  env: {
    test: {
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    },
  },
}
