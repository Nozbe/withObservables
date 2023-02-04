const plugins = [
  '@babel/plugin-transform-flow-strip-types',
  ['@babel/plugin-proposal-class-properties', { loose: true }],
  '@babel/plugin-proposal-json-strings',
  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-transform-template-literals',
  '@babel/plugin-transform-literals',
  '@babel/plugin-transform-function-name',
  '@babel/plugin-transform-arrow-functions',
  '@babel/plugin-transform-block-scoping',
  [
    '@babel/plugin-transform-classes',
    {
      loose: true, // spits out cleaner and faster output
    },
  ],
  '@babel/plugin-transform-destructuring',
  '@babel/plugin-transform-spread',
]

module.exports = {
  plugins,
  env: {
    development: {
      plugins,
    },
    production: {
      plugins: [
        ...plugins,
        // 'minify-flip-comparisons',
        // 'minify-guarded-expressions',
        // 'minify-dead-code-elimination',
      ],
    },
    test: {
      plugins: [...plugins, '@babel/plugin-transform-modules-commonjs'],
    },
  },
}
