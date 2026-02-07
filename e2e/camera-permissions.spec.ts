import { test, expect } from '@playwright/test';
import { GuitarPage } from './pages/GuitarPage';
import { CameraPermissionPage } from './pages/CameraPermissionPage';

test.describe('Camera Permissions - Guitar Page', () => {
  test('should display enable camera button on initial load', async ({
    page,
  }) => {
    const guitarPage = new GuitarPage(page);
    const cameraPage = new CameraPermissionPage(page, page.context());

    await page.goto('/guitar');
    await guitarPage.takeScreenshot('initial-load');

    await cameraPage.expectEnableCameraButtonVisible();
    await cameraPage.takeScreenshot('enable-button-visible', 'guitar');
  });

  test('should request camera permission when enable button is clicked', async ({
    page,
    context,
  }) => {
    const guitarPage = new GuitarPage(page);
    const cameraPage = new CameraPermissionPage(page, context);

    // Grant camera permission before navigation
    await cameraPage.grantCameraPermission();

    await page.goto('/guitar');
    await cameraPage.takeScreenshot('before-enable', 'guitar');

    // Click enable camera button
    await cameraPage.clickEnableCamera();

    // Should show loading state briefly
    await cameraPage.takeScreenshot('after-click', 'guitar');

    // Should show camera feed after permission granted
    await cameraPage.expectCameraFeedVisible();
    await cameraPage.takeScreenshot('camera-enabled', 'guitar');
  });

  test('should show error message when camera permission is denied', async ({
    page,
    context,
  }) => {
    const cameraPage = new CameraPermissionPage(page, context);

    // Deny camera permission
    await cameraPage.denyCameraPermission();

    await page.goto('/guitar');
    await cameraPage.takeScreenshot('before-deny', 'guitar');

    // Click enable camera button
    await cameraPage.clickEnableCamera();

    // Should show error message
    await cameraPage.expectErrorMessage(/denied|enable/i);
    await cameraPage.takeScreenshot('permission-denied', 'guitar');

    // Enable button should still be visible for retry
    await cameraPage.expectEnableCameraButtonVisible();
  });

  test('should be keyboard accessible', async ({ page, context }) => {
    const cameraPage = new CameraPermissionPage(page, context);

    await page.goto('/guitar');

    // Tab to enable camera button
    await page.keyboard.press('Tab');
    await expect(cameraPage.getEnableCameraButton()).toBeFocused();

    await cameraPage.takeScreenshot('button-focused', 'guitar');

    // Should activate with Enter or Space
    await page.keyboard.press('Enter');
    await cameraPage.takeScreenshot('after-keyboard-activate', 'guitar');
  });

  test('should handle already granted permission', async ({
    page,
    context,
  }) => {
    const cameraPage = new CameraPermissionPage(page, context);

    // Grant camera permission first
    await cameraPage.grantCameraPermission();

    await page.goto('/guitar');

    // Should still show enable button (not auto-start camera)
    await cameraPage.expectEnableCameraButtonVisible();
    await cameraPage.takeScreenshot('pre-granted-permission', 'guitar');

    // Click to enable
    await cameraPage.clickEnableCamera();

    // Should show camera feed without additional prompts
    await cameraPage.expectCameraFeedVisible();
    await cameraPage.takeScreenshot('camera-auto-enabled', 'guitar');
  });
});

test.describe('Camera Permissions - Drums Page', () => {
  test('should display enable camera button on initial load', async ({
    page,
  }) => {
    const cameraPage = new CameraPermissionPage(page, page.context());

    await page.goto('/drums');

    await cameraPage.expectEnableCameraButtonVisible();
    await cameraPage.takeScreenshot('enable-button-visible', 'drums');
  });

  test('should request camera permission when enable button is clicked', async ({
    page,
    context,
  }) => {
    const cameraPage = new CameraPermissionPage(page, context);

    await cameraPage.grantCameraPermission();

    await page.goto('/drums');
    await cameraPage.clickEnableCamera();

    await cameraPage.expectCameraFeedVisible();
    await cameraPage.takeScreenshot('camera-enabled', 'drums');
  });
});
