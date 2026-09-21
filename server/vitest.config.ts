import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    env: { JWT_SECRET: 'test-secret', UPLOAD_DIR: '.test-uploads' },
  },
});
