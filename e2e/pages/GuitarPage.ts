import { Page, expect } from '@playwright/test';

export class GuitarPage {
  constructor(private page: Page) {}

  // Assertions
  async expectToBeOnPage() {
    await expect(this.page).toHaveURL(/\/guitar/);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `e2e-screenshots/guitar-${name}.png` });
  }
}
