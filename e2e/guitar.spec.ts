import { test } from '@playwright/test';
import { GuitarPage } from './pages/GuitarPage';
import { CameraPermissionPage } from './pages/CameraPermissionPage';

test.describe.configure({ mode: 'serial' });

test.describe('Guitar Mode', () => {
  test('should render string overlay and controls when camera is enabled', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName === 'firefox', 'MediaPipe Hands not fully supported in Firefox fake streams');
    test.skip(browserName === 'webkit', 'MediaPipe Hands not fully supported in WebKit fake streams');

    const guitarPage = new GuitarPage(page);
    const cameraPage = new CameraPermissionPage(page, context);

    await cameraPage.grantCameraPermission();
    await page.goto('/guitar');

    await cameraPage.clickEnableCamera();
    const hasFeed = await cameraPage.waitForCameraFeedOrError();
    if (!hasFeed) {
      await cameraPage.expectErrorMessage(/camera|connect|enable/i);
      await guitarPage.takeScreenshot('camera-error');
      return;
    }

    await guitarPage.expectStringsVisible();
    await guitarPage.expectControlsVisible();
    await guitarPage.takeScreenshot('strings-and-controls');

    await page.getByRole('button', { name: /^stop camera$/i }).click();
  });
});
