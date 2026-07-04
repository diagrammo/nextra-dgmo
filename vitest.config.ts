import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/fixture/**', 'tests/**/fixture-build.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/**/*.d.ts'],
      reporter: ['text-summary'],
      // Floor ~2 pts below the measured baseline (full src/**). The
      // client component and remark re-export are exercised at build
      // time, not by the unit suite, so overall src/** coverage is
      // dominated by config.ts (the only file with branching logic).
      // Baseline: lines 83.3, statements 81.5, branches 90.9, functions 60.
      thresholds: {
        lines: 81,
        statements: 79,
        branches: 88,
        functions: 58,
      },
    },
  },
});
