import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['server/index.ts'],
  format: ['esm'],
  outDir: 'dist/server',
  sourcemap: false,
  clean: true,
  bundle: true,
  splitting: false,
  treeshake: true,
  external: [
    '@neondatabase/serverless',
    'dotenv',
    'express',
    'cors',
    'cookie-parser',
    'bcryptjs',
    'jsonwebtoken',
    'drizzle-orm',
    'drizzle-zod',
    'zod'
  ],
  noExternal: [],
});
