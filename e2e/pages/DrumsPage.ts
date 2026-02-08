import { Page, expect } from '@playwright/test';

export class DrumsPage {
  constructor(private page: Page) {}

  // Assertions
  async expectToBeOnPage() {
    await expect(
      this.page.getByRole('heading', { name: /air drums/i })
    ).toBeVisible();
  }

  async togglePerformanceMode() {
    const button = this.page.getByRole('button', {
      name: /^(full screen|exit full screen)$/i,
    });
    await button.first().waitFor();
    await button.first().click();
  }

  async expectControlPanelHidden() {
    await expect(
      this.page.getByRole('slider', { name: /sensitivity/i })
    ).toHaveCount(0);
    await expect(
      this.page.getByRole('radiogroup', { name: /sound variant/i })
    ).toHaveCount(0);
    await expect(this.page.getByText(/combo/i)).toHaveCount(0);
  }

  async expectControlPanelVisible() {
    await expect(
      this.page.getByRole('slider', { name: /sensitivity/i })
    ).toBeVisible();
    await expect(
      this.page.getByRole('radiogroup', { name: /sound variant/i })
    ).toBeVisible();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `e2e-screenshots/drums-${name}.png` });
  }
}
