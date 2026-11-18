import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class QuestionPage extends BasePage {
  readonly preparingText: Locator;
  readonly questionCounter: Locator;
  readonly radios: Locator;
  readonly nextButton: Locator;
  readonly finishButton: Locator;
  readonly completionFinishButton: Locator;
  readonly goodJobText: Locator;
  readonly completionText: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.preparingText = page.getByText(
      'Estamos preparando todo para empezar tu evaluación',
    );
    this.questionCounter = page
      .getByText(/Pregunta\s*\d+\s*\/\s*\d+/)
      .filter({ visible: true });
    this.radios = page.getByRole('radio');
    this.nextButton = page.getByRole('button', { name: 'Siguiente' });
    this.finishButton = page.getByRole('button', { name: 'Finalizar' });
    this.completionFinishButton = page.getByRole('button', { name: 'Finalizar', exact: true });
    this.goodJobText = page.getByText('¡Buen trabajo!');
    this.completionText = page.getByText(
      /¡Buen trabajo!|¡Todas las evaluaciones completadas!/,
    );
    this.continueButton = page.getByRole('button', { name: 'Continuar', exact: true });
  }

  questionLabel(question: number, total: number): Locator {
    return this.page
      .getByText(new RegExp(`Pregunta\\s*${question}\\s*/\\s*${total}`))
      .filter({ visible: true });
  }

  async getTotalQuestions(): Promise<number> {
    const text = await this.questionCounter.innerText();
    return Number(text.match(/\/\s*(\d+)/)?.[1]);
  }

  async answerDiagonal(): Promise<void> {
    await expect(this.radios).toHaveCount(25);
    for (let i = 0; i < 5; i++) {
      await this.radios.nth(i * 5 + i).click();
    }
  }

  async answerFirstOption(): Promise<void> {
    await this.radios.first().click({ timeout: 10000 });
  }

  async goNext(): Promise<void> {
    await this.nextButton.click({ timeout: 10000 });
  }

  async finish(): Promise<void> {
    await this.finishButton.click({ timeout: 10000 });
  }

  async continueAfterComplete(): Promise<void> {
    await this.continueButton.click({ timeout: 10000 });
  }
}
