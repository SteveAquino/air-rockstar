import { test } from '@playwright/test';
import { WelcomePage } from './pages/WelcomePage';
import { GuitarPage } from './pages/GuitarPage';
import { DrumsPage } from './pages/DrumsPage';

test.describe('Welcome Screen', () => {
  test('should display the welcome screen with instrument options', async ({
    page,
  }) => {
    const welcomePage = new WelcomePage(page);

    // Navigate to the home page
    await welcomePage.goto();
    await welcomePage.takeScreenshot('initial');

    // Verify page elements
    await welcomePage.expectPageTitle();
    await welcomePage.expectToBeVisible();
    await welcomePage.expectDescriptionToBeVisible();

    // Take screenshot showing full welcome screen
    await welcomePage.takeScreenshot('full-screen');
  });

  test('should navigate to guitar page when Play Air Guitar is clicked', async ({
    page,
  }) => {
    const welcomePage = new WelcomePage(page);
    const guitarPage = new GuitarPage(page);

    await welcomePage.goto();

    // Verify guitar button is visible and enabled
    await welcomePage.expectGuitarButtonToBeVisible();
    await welcomePage.expectGuitarButtonToBeEnabled();
    await welcomePage.takeScreenshot('before-guitar-click');

    // Click guitar button and verify navigation
    await welcomePage.clickGuitarButton();
    await guitarPage.expectToBeOnPage();
    await guitarPage.takeScreenshot('page-loaded');
  });

  test('should navigate to drums page when Play Air Drums is clicked', async ({
    page,
  }) => {
    const welcomePage = new WelcomePage(page);
    const drumsPage = new DrumsPage(page);

    await welcomePage.goto();

    // Verify drums button is visible and enabled
    await welcomePage.expectDrumsButtonToBeVisible();
    await welcomePage.expectDrumsButtonToBeEnabled();
    await welcomePage.takeScreenshot('before-drums-click');

    // Click drums button and verify navigation
    await welcomePage.clickDrumsButton();
    await drumsPage.expectToBeOnPage();
    await drumsPage.takeScreenshot('page-loaded');
  });

  test('should be keyboard accessible', async ({ page }) => {
    const welcomePage = new WelcomePage(page);
    const drumsPage = new DrumsPage(page);

    await welcomePage.goto();

    // Focus guitar button and verify
    await welcomePage.focusGuitarButton();
    await welcomePage.expectGuitarButtonToBeFocused();
    await welcomePage.takeScreenshot('guitar-focused');

    // Focus drums button and verify
    await welcomePage.focusDrumsButton();
    await welcomePage.expectDrumsButtonToBeFocused();
    await welcomePage.takeScreenshot('drums-focused');

    // Activate drums button with Enter key
    await welcomePage.pressEnter();
    await drumsPage.expectToBeOnPage();
  });
});
