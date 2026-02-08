import { test } from '@playwright/test';
import { DrumsPage } from './pages/DrumsPage';
import { CameraPermissionPage } from './pages/CameraPermissionPage';

test.describe.configure({ mode: 'serial' });

test.describe('Drums Controls', () => {
  test('should toggle performance mode to hide and show controls', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'MediaPipe Hands not fully supported in Firefox fake streams'
    );
    test.skip(
      browserName === 'webkit',
      'MediaPipe Hands not fully supported in WebKit fake streams'
    );

    const drumsPage = new DrumsPage(page);
    const cameraPage = new CameraPermissionPage(page, context);

    await cameraPage.grantCameraPermission();
    await page.goto('/drums');

    await cameraPage.clickEnableCamera();
    const hasFeed = await cameraPage.waitForCameraFeedOrError();
    if (!hasFeed) {
      await cameraPage.expectErrorMessage(/camera|connect|enable/i);
      await drumsPage.takeScreenshot('camera-error');
      return;
    }

    await drumsPage.expectControlPanelVisible();
    await drumsPage.takeScreenshot('controls-visible');

    await drumsPage.togglePerformanceMode();
    await drumsPage.expectControlPanelHidden();
    await drumsPage.takeScreenshot('performance-mode-on');

    await drumsPage.togglePerformanceMode();
    await drumsPage.expectControlPanelVisible();
    await drumsPage.takeScreenshot('performance-mode-off');

    await page.getByRole('button', { name: /^stop camera$/i }).click();
  });
});
