import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AssessmentsPage extends BasePage {
  readonly startButton: Locator;
  readonly dialogContinueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.startButton = page.getByRole('button', { name: 'Iniciar' });
    this.dialogContinueButton = page
      .getByRole('dialog')
      .getByRole('button', { name: 'Continuar', exact: true });
  }

  card(name: string): Locator {
    return this.page
      .getByRole('button')
      .filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async open(processUrl: string): Promise<void> {
    await this.goto(processUrl);
  }

  async continueCard(name: string): Promise<void> {
    await this.card(name).getByRole('button', { name: 'Continuar', exact: true }).click();
  }

  async startAssessment(): Promise<void> {
    await this.startButton.click();
    await this.dialogContinueButton.click();
  }
}
