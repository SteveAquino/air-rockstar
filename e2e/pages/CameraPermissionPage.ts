import { Page, expect, BrowserContext } from '@playwright/test';

export class CameraPermissionPage {
  constructor(
    private page: Page,
    private context: BrowserContext
  ) {}

  // Actions
  async grantCameraPermission() {
    try {
      // Camera permission only supported in Chromium-based browsers
      await this.context.grantPermissions(['camera']);
    } catch (error) {
      // Silently ignore - camera permissions not supported in this browser/environment
    }
  }

  async denyCameraPermission() {
    await this.context.grantPermissions([]);
  }

  async clickEnableCamera() {
    await this.page.getByRole('button', { name: /enable camera/i }).click();
  }

  async takeScreenshot(name: string, pageName: string) {
    await this.page.screenshot({
      path: `e2e-screenshots/${pageName}-camera-${name}.png`,
    });
  }

  // Getters
  getEnableCameraButton() {
    return this.page.getByRole('button', { name: /enable camera/i });
  }

  getCameraFeed() {
    return this.page.locator('video[aria-label*="Camera feed"]');
  }

  getErrorMessage() {
    // Use more specific selector to avoid Next.js route announcer
    return this.page.locator('[role="alert"]').filter({ hasText: /camera|denied|enable/i });
  }

  getLoadingIndicator() {
    return this.page.getByText(/loading|initializing/i);
  }

  // Assertions
  async expectEnableCameraButtonVisible() {
    await expect(this.getEnableCameraButton()).toBeVisible();
  }

  async expectCameraFeedVisible() {
    // Wait for video element and for it to have loaded content
    await expect(this.getCameraFeed()).toBeVisible({ timeout: 10000 });
    // Wait for video to actually have content (stream connected)
    await this.page.waitForFunction(() => {
      const video = document.querySelector('video[aria-label*="Camera feed"]') as HTMLVideoElement;
      return video && video.readyState >= 2; // HAVE_CURRENT_DATA or higher
    }, { timeout: 10000 });
  }

  async waitForCameraFeedOrError(timeoutMs = 10000): Promise<boolean> {
    try {
      await expect(this.getCameraFeed()).toBeVisible({ timeout: timeoutMs });
      await this.page.waitForFunction(() => {
        const video = document.querySelector('video[aria-label*="Camera feed"]') as HTMLVideoElement;
        return video && video.readyState >= 2;
      }, { timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  }

  async expectErrorMessage(message: RegExp) {
    await expect(this.getErrorMessage()).toBeVisible();
    await expect(this.getErrorMessage()).toContainText(message);
  }

  async expectLoadingState() {
    await expect(this.getLoadingIndicator()).toBeVisible();
  }

  async expectEnableCameraButtonNotVisible() {
    await expect(this.getEnableCameraButton()).not.toBeVisible();
  }
}
