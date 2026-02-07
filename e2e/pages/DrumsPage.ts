import { Page, expect } from '@playwright/test';

export class DrumsPage {
  constructor(private page: Page) {}

  // Assertions
  async expectToBeOnPage() {
    await expect(this.page).toHaveURL(/\/drums/);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `e2e-screenshots/drums-${name}.png` });
  }
}
