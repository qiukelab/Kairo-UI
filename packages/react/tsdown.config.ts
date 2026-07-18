import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/avatar/index.ts',
    'src/badge/index.ts',
    'src/button/index.ts',
    'src/card/index.ts',
    'src/checkbox/index.ts',
    'src/dialog/index.ts',
    'src/input/index.ts',
    'src/spinner/index.ts',
    'src/switch/index.ts',
    'src/tabs/index.ts',
    'src/tooltip/index.ts',
  ],
  format: ['esm'],
  unbundle: true,
  dts: true,
});
