import { Page, expect } from '@playwright/test';

export class WelcomePage {
  constructor(private page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto('/');
  }

  // Getters for elements
  getHeading() {
    return this.page.getByRole('heading', { name: /air rockstar/i });
  }

  getDescription() {
    return this.page.getByText(
      /select an instrument to get started/i
    );
  }

  getGuitarButton() {
    return this.page.getByRole('link', { name: /start air guitar/i });
  }

  getDrumsButton() {
    return this.page.getByRole('link', { name: /start air drums/i });
  }

  // Actions
  async clickGuitarButton() {
    await this.getGuitarButton().click();
  }

  async clickDrumsButton() {
    await this.getDrumsButton().click();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `e2e-screenshots/welcome-${name}.png` });
  }

  async focusGuitarButton() {
    await this.getGuitarButton().focus();
  }

  async focusDrumsButton() {
    await this.getDrumsButton().focus();
  }

  async pressEnter() {
    await this.page.keyboard.press('Enter');
  }

  // Assertions
  async expectToBeVisible() {
    await expect(this.getHeading()).toBeVisible();
  }

  async expectDescriptionToBeVisible() {
    await expect(this.getDescription()).toBeVisible();
  }

  async expectGuitarButtonToBeVisible() {
    await expect(this.getGuitarButton()).toBeVisible();
  }

  async expectGuitarButtonToBeEnabled() {
    await expect(this.getGuitarButton()).toBeEnabled();
  }

  async expectDrumsButtonToBeVisible() {
    await expect(this.getDrumsButton()).toBeVisible();
  }

  async expectDrumsButtonToBeEnabled() {
    await expect(this.getDrumsButton()).toBeEnabled();
  }

  async expectGuitarButtonToBeFocused() {
    await expect(this.getGuitarButton()).toBeFocused();
  }

  async expectDrumsButtonToBeFocused() {
    await expect(this.getDrumsButton()).toBeFocused();
  }

  async expectPageTitle() {
    await expect(this.page).toHaveTitle(/Air Rockstar/);
  }
}
