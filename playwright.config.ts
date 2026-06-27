import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5178',
    headless: true,
  },
  webServer: {
    command: 'npx vite --port 5178',
    port: 5178,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
