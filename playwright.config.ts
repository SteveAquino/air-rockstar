import { defineConfig, devices } from '@playwright/test';
import { execSync } from 'child_process';

const resolveFreePort = () => {
  if (process.env.PW_SERVER_PORT) {
    const port = Number(process.env.PW_SERVER_PORT);
    if (Number.isFinite(port) && port > 0) {
      return port;
    }
  }
  const output = execSync(
    `node -e "const net=require('net');const s=net.createServer();s.listen(0,()=>{const {port}=s.address();console.log(port);s.close();});"`
  )
    .toString()
    .trim();
  const match = output.match(/(\d+)/);
  const port = match ? Number(match[1]) : Number.NaN;
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`Failed to resolve a free port, got: ${output}`);
  }
  process.env.PW_SERVER_PORT = String(port);
  return port;
};

const webPort = resolveFreePort();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://localhost:${webPort}`,
    /* Run headed by default. */
    headless: false,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshots */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: false,
        // Use fake video stream for camera tests to avoid capturing real camera
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ],
        },
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], headless: false },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], headless: false },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: `npm run dev -- --port ${webPort}`,
    url: `http://localhost:${webPort}`,
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
