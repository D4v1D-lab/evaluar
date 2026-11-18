import { test, expect } from './fixtures';
import { env } from '../config/env';

test('completes the Teletrabajo assessment from the Evaluaciones page', async ({
  sharedPage: page,
  assessmentsPage,
  questionPage,
  surveyPage,
}) => {
  // Allow time for all questions plus the optional demo hold at the end.
  test.setTimeout(120_000 + Number(process.env.HOLD_MS ?? 0));

  // Continue in the same window, on the Evaluaciones page.
  await assessmentsPage.open(env.PROCESS_PAGE_URL);

  await expect(assessmentsPage.card('Teletrabajo')).toBeVisible({ timeout: 15000 });
  await assessmentsPage.continueCard('Teletrabajo');

  // Start the assessment and confirm resuming the attempt.
  await assessmentsPage.startAssessment();
  await expect(page).toHaveURL(/\/evaluation\//, { timeout: 30000 });

  // Total questions come from the "Pregunta X / N" counter (mobile + desktop copies exist).
  await expect(questionPage.questionCounter).toBeVisible({ timeout: 15000 });
  const total = await questionPage.getTotalQuestions();
  expect(total).toBeGreaterThan(0);

  // For each multiple-choice question, select one option and move to the next one.
  for (let question = 1; question <= total; question++) {
    await test.step(`Question ${question}/${total}`, async () => {
      await expect(questionPage.questionLabel(question, total)).toBeVisible({ timeout: 15000 });

      await questionPage.answerFirstOption();
      await expect(questionPage.radios.first()).toBeChecked({ timeout: 5000 });

      if (question < total) {
        await expect(questionPage.nextButton).toBeEnabled({ timeout: 10000 });
        await questionPage.goNext();
      } else if (await questionPage.finishButton.isVisible()) {
        await expect(questionPage.finishButton).toBeEnabled({ timeout: 10000 });
        await questionPage.finish();
      }
    });
  }

  // The app may show the assessment-complete screen or the all-completed screen.
  await expect(questionPage.completionText).toBeVisible({ timeout: 30000 });

  if (await questionPage.continueButton.isVisible()) {
    await questionPage.continueAfterComplete();
  } else {
    await questionPage.completionFinishButton.click({ timeout: 10000 });
  }

  // The completion button returns to the Evaluaciones page; wait for that navigation,
  // then reload so the Tally feedback survey popup opens.
  await expect(page).toHaveURL(/\/process\//, { timeout: 15000 });
  await page.reload({ waitUntil: 'load' });

  await expect(surveyPage.title).toBeVisible({ timeout: 15000 });
  await surveyPage.selectRating10();
  await expect(surveyPage.rating10).toBeChecked({ timeout: 5000 });
  await surveyPage.submit();

  // Keep the screen visible for the demo / to inspect the next step.
  const holdMs = Number(process.env.HOLD_MS ?? 0);
  if (holdMs) await page.waitForTimeout(holdMs);
});
