import ts from '@wessberg/rollup-plugin-ts';

export default {
  input: './sources/advanced/index.ts',
  output: [
    {
      file: 'lib/index.mjs',
      format: 'es'
    },
    {
      file: 'lib/index.js',
      format: 'cjs'
    },
  ],
  external: ['lodash/merge', 'omelette'],
  plugins: [
    ts({
      tsconfig: 'tsconfig.dist.json'
    }),
  ]
}
