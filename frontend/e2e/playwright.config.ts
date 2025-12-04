import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './specs',

  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'cd ../backend && npm run start:dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
    }
  ],

  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
});
