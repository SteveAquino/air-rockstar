import { Page, expect, BrowserContext } from '@playwright/test';

export class CameraPermissionPage {
  constructor(
    private page: Page,
    private context: BrowserContext
  ) {}

  // Actions
  async grantCameraPermission() {
    await this.context.grantPermissions(['camera']);
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
    return this.page.getByRole('img', { name: /camera feed/i });
  }

  getErrorMessage() {
    return this.page.getByRole('alert');
  }

  getLoadingIndicator() {
    return this.page.getByText(/loading|initializing/i);
  }

  // Assertions
  async expectEnableCameraButtonVisible() {
    await expect(this.getEnableCameraButton()).toBeVisible();
  }

  async expectCameraFeedVisible() {
    await expect(this.getCameraFeed()).toBeVisible();
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
