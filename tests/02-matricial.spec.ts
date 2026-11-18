import { test, expect } from './fixtures';
import { env } from '../config/env';

test('completes the Personalidad assessment from the Evaluaciones page', async ({
  sharedPage: page,
  assessmentsPage,
  questionPage,
}) => {
  // Allow time for all questions.
  test.setTimeout(180_000);

  // Continue in the same window, on the Evaluaciones page.
  await assessmentsPage.open(env.PROCESS_PAGE_URL);

  await expect(assessmentsPage.card('Personalidad')).toBeVisible({ timeout: 15000 });
  await assessmentsPage.continueCard('Personalidad');

  // Start the assessment and confirm resuming the attempt.
  await assessmentsPage.startAssessment();
  await expect(page).toHaveURL(/\/evaluation\//, { timeout: 30000 });

  // Wait for the assessment to finish preparing, then read the question counter.
  await expect(questionPage.preparingText).toBeHidden({ timeout: 60000 });
  await expect(questionPage.questionCounter).toBeVisible({ timeout: 10000 });
  const total = await questionPage.getTotalQuestions();
  expect(total).toBeGreaterThan(0);

  // For each question, rank the behaviors on the diagonal, then go to the next one.
  for (let question = 1; question <= total; question++) {
    await expect(questionPage.questionLabel(question, total)).toBeVisible();

    await questionPage.answerDiagonal();
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(5);

    if (question < total) {
      await questionPage.goNext();
    } else {
      await questionPage.finish();
    }
  }

  // Finish the assessment and continue from the completion screen.
  await expect(questionPage.goodJobText).toBeVisible({ timeout: 30000 });
  await questionPage.continueAfterComplete();
});
