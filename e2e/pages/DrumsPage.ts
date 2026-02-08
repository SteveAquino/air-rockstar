import { Page, expect } from '@playwright/test';

export class DrumsPage {
  constructor(private page: Page) {}

  // Assertions
  async expectToBeOnPage() {
    await expect(
      this.page.getByRole('heading', { name: /air drums/i })
    ).toBeVisible();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `e2e-screenshots/drums-${name}.png` });
  }
}
