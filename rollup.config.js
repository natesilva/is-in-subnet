import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import { uglify } from 'rollup-plugin-uglify';

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.ts',
    output: {
      name: 'isInSubnet',
      file: 'browser/isInSubnet.js',
      format: 'umd',
      noConflict: true,
      sourcemap: true
    },
    plugins: [resolve(), commonjs(), typescript()]
  },

  // browser-friendly UMD build (minified)
  {
    input: 'src/index.ts',
    output: {
      name: 'isInSubnet',
      file: 'browser/isInSubnet.min.js',
      format: 'umd',
      noConflict: true,
      sourcemap: true
    },
    plugins: [resolve(), commonjs(), typescript(), uglify()]
  }
];
