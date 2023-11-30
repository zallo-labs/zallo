import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts', 'src/dapps/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  tsconfig: 'tsconfig.json',
  minify: !options.watch,
  sourcemap: true,
  keepNames: true,
  clean: true,
}));
