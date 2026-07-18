import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/transitions/index.ts',
    'src/variants/index.ts',
    'src/animated-number/index.ts',
    'src/reveal/index.ts',
  ],
  format: ['esm'],
  unbundle: true,
  dts: true,
});
