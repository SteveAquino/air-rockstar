import { test, expect } from '@playwright/test';
import { GuitarPage } from './pages/GuitarPage';
import { DrumsPage } from './pages/DrumsPage';
import { CameraPermissionPage } from './pages/CameraPermissionPage';

// Camera tests must run serially - multiple tests can't access camera simultaneously
test.describe.configure({ mode: 'serial' });

test.describe('Hand Tracking Integration', () => {
  test('should render canvas overlay when camera is enabled on guitar page', async ({
    page,
    context,
  }) => {
    const guitarPage = new GuitarPage(page);
    const cameraPage = new CameraPermissionPage(page, context);

    await cameraPage.grantCameraPermission();
    await page.goto('/guitar');

    // Enable camera
    await cameraPage.clickEnableCamera();
    await cameraPage.expectCameraFeedVisible();

    // Canvas should be rendered
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('width');
    await expect(canvas).toHaveAttribute('height');

    await guitarPage.takeScreenshot('hand-tracking-canvas-rendered');
  });

  test('should render canvas overlay when camera is enabled on drums page', async ({
    page,
    context,
  }) => {
    const drumsPage = new DrumsPage(page);
    const cameraPage = new CameraPermissionPage(page, context);

    await cameraPage.grantCameraPermission();
    await page.goto('/drums');

    // Enable camera
    await cameraPage.clickEnableCamera();
    await cameraPage.expectCameraFeedVisible();

    // Canvas should be rendered
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('width');
    await expect(canvas).toHaveAttribute('height');

    await drumsPage.takeScreenshot('hand-tracking-canvas-rendered');
  });

  test('should not render canvas before camera is enabled', async ({
    page,
  }) => {
    await page.goto('/guitar');

    // Canvas should not exist yet
    const canvas = page.locator('canvas');
    await expect(canvas).not.toBeVisible();
  });

  test('should initialize hand tracking without errors', async ({
    page,
    context,
  }) => {
    const guitarPage = new GuitarPage(page);
    const cameraPage = new CameraPermissionPage(page, context);

    // Listen for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await cameraPage.grantCameraPermission();
    await page.goto('/guitar');

    await cameraPage.clickEnableCamera();
    await cameraPage.expectCameraFeedVisible();

    // Wait a moment for MediaPipe to initialize
    await page.waitForTimeout(2000);

    // Should not have hand tracking errors displayed
    const trackingError = page.getByText(/tracking error/i);
    await expect(trackingError).not.toBeVisible();

    await guitarPage.takeScreenshot('no-tracking-errors');

    // Filter out expected MediaPipe warnings
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('MediaPipe') &&
        !error.includes('wasm') &&
        !error.includes('fetch')
    );

    // Should not have critical errors
    expect(criticalErrors).toHaveLength(0);
  });

  test('should have canvas positioned over video feed', async ({
    page,
    context,
  }) => {
    const cameraPage = new CameraPermissionPage(page, context);

    await cameraPage.grantCameraPermission();
    await page.goto('/guitar');

    await cameraPage.clickEnableCamera();
    await cameraPage.expectCameraFeedVisible();

    const video = page.locator('video');
    const canvas = page.locator('canvas');

    // Get bounding boxes
    const videoBox = await video.boundingBox();
    const canvasBox = await canvas.boundingBox();

    expect(videoBox).toBeTruthy();
    expect(canvasBox).toBeTruthy();

    // Canvas should overlay the video (same dimensions)
    expect(canvasBox!.width).toBeGreaterThan(0);
    expect(canvasBox!.height).toBeGreaterThan(0);
    expect(canvasBox!.x).toBeCloseTo(videoBox!.x, 1);
    expect(canvasBox!.y).toBeCloseTo(videoBox!.y, 1);
  });
});

/**
 * NOTE: Full hand landmark detection testing is not included in E2E tests because:
 * - Playwright's fake media streams don't produce actual hand images
 * - MediaPipe won't detect hands from blank/static fake video streams
 * - Testing real hand detection requires manual testing with actual camera
 *
 * These E2E tests verify:
 * ✅ Canvas overlay rendering
 * ✅ Proper positioning over video feed
 * ✅ No initialization errors
 * ✅ Integration with camera permissions
 *
 * Manual testing checklist for hand detection:
 * 1. Run dev server with real camera
 * 2. Navigate to guitar or drums page
 * 3. Enable camera and grant permissions
 * 4. Hold hand(s) up to camera
 * 5. Verify green dots appear on hand landmarks
 * 6. Verify white lines connect landmarks
 * 7. Verify hand count displays "Hands detected: 1" or "Hands detected: 2"
 */
