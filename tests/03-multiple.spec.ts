import { test, expect } from './fixtures';

const processUrl =
  'https://candidato.evaluar.com/es/process/572ff080-da01-4a64-9858-897f5a8d1be9';

test('completes the Teletrabajo assessment from the Evaluaciones page', async ({ sharedPage: page }) => {
  // Allow time for all questions plus the optional demo hold at the end.
  test.setTimeout(180_000 + Number(process.env.HOLD_MS ?? 0));

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
    await expect(
      page
        .getByText(new RegExp(`Pregunta\\s*${question}\\s*/\\s*${total}`))
        .filter({ visible: true }),
    ).toBeVisible();

    await page.getByRole('radio').first().click();
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(1);

    if (question < total) {
      await page.getByRole('button', { name: 'Siguiente' }).click();
    } else {
      await page.getByRole('button', { name: 'Finalizar' }).click();
    }
  }

  // The app may show the assessment-complete screen or the all-completed screen.
  await expect(
    page.getByText(/¡Buen trabajo!|¡Todas las evaluaciones completadas!/),
  ).toBeVisible({ timeout: 30000 });

  const continueButton = page.getByRole('button', { name: 'Continuar', exact: true });
  if (await continueButton.isVisible()) {
    await continueButton.click();
  } else {
    await page.getByRole('button', { name: 'Finalizar', exact: true }).click();
  }

  // Reload the Evaluaciones page so the Tally feedback survey popup opens.
  await page.goto(processUrl);

  const survey = page.frameLocator('iframe[src*="tally.so"]');
  await expect(survey.getByText('¿Qué te pareció el proceso de evaluación?')).toBeVisible({
    timeout: 20000,
  });
  await survey.locator('input[type="radio"][value="10"]').check();
  await survey.getByRole('button', { name: 'Enviar', exact: true }).click();

  // Keep the screen visible for the demo / to inspect the next step.
  const holdMs = Number(process.env.HOLD_MS ?? 0);
  if (holdMs) await page.waitForTimeout(holdMs);
});
