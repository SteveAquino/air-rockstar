import { Page, expect } from '@playwright/test';

export class GuitarPage {
  constructor(private page: Page) {}

  // Assertions
  async expectToBeOnPage() {
    await expect(
      this.page.getByRole('heading', { name: /air guitar/i })
    ).toBeVisible();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `e2e-screenshots/guitar-${name}.png` });
  }
}
