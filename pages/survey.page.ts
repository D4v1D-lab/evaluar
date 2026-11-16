import { type FrameLocator, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SurveyPage extends BasePage {
  private readonly frame: FrameLocator;
  readonly title: Locator;
  readonly rating10: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.frame = page.frameLocator('iframe[src*="tally.so"]');
    this.title = this.frame.getByText('¿Qué te pareció el proceso de evaluación?');
    this.rating10 = this.frame.locator('input[type="radio"][value="10"]');
    this.submitButton = this.frame.getByRole('button', { name: 'Enviar', exact: true });
  }

  async selectRating10(): Promise<void> {
    await this.rating10.check({ timeout: 10000, force: true });
  }

  async submit(): Promise<void> {
    await this.submitButton.click({ timeout: 10000 });
  }
}
