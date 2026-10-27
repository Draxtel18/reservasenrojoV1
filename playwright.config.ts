import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1,
  reporter: 'list', use: { baseURL: process.env.TEST_URL || 'http://127.0.0.1:3000', channel: 'msedge', trace: 'retain-on-failure',
    // Headless Edge otherwise skips native smooth scrolling even with no-preference media emulation.
    launchOptions: { args: ['--enable-smooth-scrolling'] },
  },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
});
