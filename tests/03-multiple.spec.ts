import { test, expect } from './fixtures';
import { AssessmentsPage } from '../pages/assessments.page';
import { QuestionPage } from '../pages/question.page';
import { SurveyPage } from '../pages/survey.page';

const processUrl =
  'https://candidato.evaluar.com/es/process/572ff080-da01-4a64-9858-897f5a8d1be9';

test('completes the Teletrabajo assessment from the Evaluaciones page', async ({ sharedPage: page }) => {
  // Allow time for all questions plus the optional demo hold at the end.
  test.setTimeout(120_000 + Number(process.env.HOLD_MS ?? 0));

  const assessments = new AssessmentsPage(page);
  const questions = new QuestionPage(page);
  const survey = new SurveyPage(page);

  // Continue in the same window, on the Evaluaciones page.
  await assessments.open(processUrl);

  await expect(assessments.card('Teletrabajo')).toBeVisible({ timeout: 15000 });
  await assessments.continueCard('Teletrabajo');

  // Start the assessment and confirm resuming the attempt.
  await assessments.startAssessment();
  await expect(page).toHaveURL(/\/evaluation\//, { timeout: 30000 });

  // Total questions come from the "Pregunta X / N" counter (mobile + desktop copies exist).
  await expect(questions.questionCounter).toBeVisible({ timeout: 15000 });
  const total = await questions.getTotalQuestions();
  expect(total).toBeGreaterThan(0);

  // For each multiple-choice question, select one option and move to the next one.
  for (let question = 1; question <= total; question++) {
    await test.step(`Question ${question}/${total}`, async () => {
      await expect(questions.questionLabel(question, total)).toBeVisible({ timeout: 15000 });

      await questions.answerFirstOption();
      await expect(questions.radios.first()).toBeChecked({ timeout: 5000 });

      if (question < total) {
        await expect(questions.nextButton).toBeEnabled({ timeout: 10000 });
        await questions.goNext();
      } else if (await questions.finishButton.isVisible()) {
        await expect(questions.finishButton).toBeEnabled({ timeout: 10000 });
        await questions.finish();
      }
    });
  }

  // The app may show the assessment-complete screen or the all-completed screen.
  await expect(questions.completionText).toBeVisible({ timeout: 30000 });

  if (await questions.continueButton.isVisible()) {
    await questions.continueAfterComplete();
  } else {
    await questions.completionFinishButton.click({ timeout: 10000 });
  }

  // The completion button returns to the Evaluaciones page; wait for that navigation,
  // then reload so the Tally feedback survey popup opens.
  await expect(page).toHaveURL(/\/process\//, { timeout: 15000 });
  await page.reload({ waitUntil: 'load' });

  await expect(survey.title).toBeVisible({ timeout: 15000 });
  await survey.selectRating10();
  await expect(survey.rating10).toBeChecked({ timeout: 5000 });
  await survey.submit();

  // Keep the screen visible for the demo / to inspect the next step.
  const holdMs = Number(process.env.HOLD_MS ?? 0);
  if (holdMs) await page.waitForTimeout(holdMs);
});
