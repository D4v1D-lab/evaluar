import { test, expect } from './fixtures';

const processUrl =
  'https://candidato.evaluar.com/es/process/572ff080-da01-4a64-9858-897f5a8d1be9';

test('completes the Teletrabajo assessment from the Evaluaciones page', async ({ sharedPage: page }) => {
  // Allow time for all questions plus the optional demo hold at the end.
  test.setTimeout(120_000 + Number(process.env.HOLD_MS ?? 0));

  // Continue in the same window, on the Evaluaciones page.
  await page.goto(processUrl);

  const teleworkCard = page
    .getByRole('button')
    .filter({ has: page.getByText('Teletrabajo', { exact: true }) });
  await expect(teleworkCard).toBeVisible({ timeout: 15000 });
  await teleworkCard.getByRole('button', { name: 'Continuar', exact: true }).click();

  // Start the assessment and confirm resuming the attempt.
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(page).toHaveURL(/\/evaluation\//, { timeout: 30000 });

  // Total questions come from the "Pregunta X / N" counter (mobile + desktop copies exist).
  const counter = page.getByText(/Pregunta\s*\d+\s*\/\s*\d+/).filter({ visible: true });
  await expect(counter).toBeVisible({ timeout: 15000 });
  const total = Number((await counter.innerText()).match(/\/\s*(\d+)/)?.[1]);
  expect(total).toBeGreaterThan(0);

  // For each multiple-choice question, select one option and move to the next one.
  for (let question = 1; question <= total; question++) {
    await test.step(`Question ${question}/${total}`, async () => {
      await expect(
        page
          .getByText(new RegExp(`Pregunta\\s*${question}\\s*/\\s*${total}`))
          .filter({ visible: true }),
      ).toBeVisible({ timeout: 15000 });

      const option = page.getByRole('radio').first();
      await option.click({ timeout: 10000 });
      await expect(option).toBeChecked({ timeout: 5000 });

      if (question < total) {
        const next = page.getByRole('button', { name: 'Siguiente' });
        await expect(next).toBeEnabled({ timeout: 10000 });
        await next.click({ timeout: 10000 });
      } else if (await page.getByRole('button', { name: 'Finalizar' }).isVisible()) {
        const finish = page.getByRole('button', { name: 'Finalizar' });
        await expect(finish).toBeEnabled({ timeout: 10000 });
        await finish.click({ timeout: 10000 });
      }
    });
  }

  // The app may show the assessment-complete screen or the all-completed screen.
  await expect(
    page.getByText(/¡Buen trabajo!|¡Todas las evaluaciones completadas!/),
  ).toBeVisible({ timeout: 30000 });

  const continueButton = page.getByRole('button', { name: 'Continuar', exact: true });
  if (await continueButton.isVisible()) {
    await continueButton.click({ timeout: 10000 });
  } else {
    await page.getByRole('button', { name: 'Finalizar', exact: true }).click({ timeout: 10000 });
  }

  // The completion button returns to the Evaluaciones page; wait for that navigation,
  // then reload so the Tally feedback survey popup opens.
  await expect(page).toHaveURL(/\/process\//, { timeout: 15000 });
  await page.reload({ waitUntil: 'load' });

  const survey = page.frameLocator('iframe[src*="tally.so"]');
  await expect(survey.getByText('¿Qué te pareció el proceso de evaluación?')).toBeVisible({
    timeout: 15000,
  });

  const rating = survey.locator('input[type="radio"][value="10"]');
  await rating.check({ timeout: 10000, force: true });
  await expect(rating).toBeChecked({ timeout: 5000 });
  await survey.getByRole('button', { name: 'Enviar', exact: true }).click({ timeout: 10000 });

  // Keep the screen visible for the demo / to inspect the next step.
  const holdMs = Number(process.env.HOLD_MS ?? 0);
  if (holdMs) await page.waitForTimeout(holdMs);
});
