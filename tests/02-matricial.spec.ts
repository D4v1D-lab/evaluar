import { test, expect } from './fixtures';
import { AssessmentsPage } from '../pages/assessments.page';
import { QuestionPage } from '../pages/question.page';

const processUrl =
  'https://candidato.evaluar.com/es/process/572ff080-da01-4a64-9858-897f5a8d1be9';

test('completes the Personalidad assessment from the Evaluaciones page', async ({ sharedPage: page }) => {
  // Allow time for all questions.
  test.setTimeout(180_000);

  const assessments = new AssessmentsPage(page);
  const questions = new QuestionPage(page);

  // Continue in the same window, on the Evaluaciones page.
  await assessments.open(processUrl);

  await expect(assessments.card('Personalidad')).toBeVisible({ timeout: 15000 });
  await assessments.continueCard('Personalidad');

  // Start the assessment and confirm resuming the attempt.
  await assessments.startAssessment();
  await expect(page).toHaveURL(/\/evaluation\//, { timeout: 30000 });

  // Wait for the assessment to finish preparing, then read the question counter.
  await expect(questions.preparingText).toBeHidden({ timeout: 60000 });
  await expect(questions.questionCounter).toBeVisible({ timeout: 10000 });
  const total = await questions.getTotalQuestions();
  expect(total).toBeGreaterThan(0);

  // For each question, rank the behaviors on the diagonal, then go to the next one.
  for (let question = 1; question <= total; question++) {
    await expect(questions.questionLabel(question, total)).toBeVisible();

    await questions.answerDiagonal();
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(5);

    if (question < total) {
      await questions.goNext();
    } else {
      await questions.finish();
    }
  }

  // Finish the assessment and continue from the completion screen.
  await expect(questions.goodJobText).toBeVisible({ timeout: 30000 });
  await questions.continueAfterComplete();
});
