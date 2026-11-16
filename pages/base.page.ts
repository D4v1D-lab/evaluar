import { expect, type Locator, type Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async expectVisible(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  async clickAndVerify(clickLocator: Locator, expectedLocator: Locator): Promise<void> {
    await clickLocator.click();
    await expect(expectedLocator).toBeVisible();
  }
}
