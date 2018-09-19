const babel = require('rollup-plugin-babel')

const pkg = require('./package.json')

module.exports = {
  input: 'src/index.js',
  external: name => /react|rxjs/.test(name),
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
  output: [{ file: pkg.main, format: 'cjs' }, { file: pkg.module, format: 'esm' }],
}
