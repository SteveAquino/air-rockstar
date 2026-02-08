import { Page, expect } from '@playwright/test';

export class GuitarPage {
  constructor(private page: Page) {}

  // Assertions
  async expectToBeOnPage() {
    await expect(
      this.page.getByRole('heading', { name: /air guitar/i })
    ).toBeVisible();
  }

  async expectStringsVisible() {
    await expect(
      this.page.getByRole('list', { name: /guitar strings/i })
    ).toBeVisible();
    await expect(
      this.page.getByRole('list', { name: /guitar strings/i }).getByRole('listitem')
    ).toHaveCount(6);
  }

  async expectControlsVisible() {
    await expect(
      this.page.getByRole('slider', { name: /sensitivity/i })
    ).toBeVisible();
    await expect(
      this.page.getByRole('slider', { name: /string spacing/i })
    ).toBeVisible();
    await expect(
      this.page.getByRole('slider', { name: /volume/i })
    ).toBeVisible();
  }

  async toggleFullScreen() {
    await this.page.getByRole('button', { name: /full screen/i }).click();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `e2e-screenshots/guitar-${name}.png` });
  }
}
