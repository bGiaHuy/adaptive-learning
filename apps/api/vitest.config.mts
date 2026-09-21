import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    target: 'node20',
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        useDefineForClassFields: false
      }
    }
  },
  test: {
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    fileParallelism: false,
    hookTimeout: 30_000,
    testTimeout: 30_000
  }
});
