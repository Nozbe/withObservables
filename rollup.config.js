const babel = require('rollup-plugin-babel')
const { terser } = require('rollup-plugin-terser')

const pkg = require('./package.json')

module.exports = {
  input: 'src/index.js',
  external: [
    'react',
    'rxjs',
    'rxjs/observable/from',
    'rxjs/observable/combineLatest',
    'rxjs/operators',
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    terser(),
  ],
  output: [{ file: pkg.main, format: 'cjs' }, { file: pkg.module, format: 'esm' }],
}
