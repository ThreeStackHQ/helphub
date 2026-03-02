import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/helphub.min.js',
    format: 'iife',
    name: 'HelpHubWidget',
    sourcemap: false,
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
    terser({
      compress: {
        drop_console: false,
        passes: 2,
      },
      format: {
        comments: false,
      },
    }),
  ],
};
