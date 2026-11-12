import { test, expect } from './fixtures';

const processUrl =
  'https://candidato.evaluar.com/es/process/572ff080-da01-4a64-9858-897f5a8d1be9';

test('completes the Personalidad assessment from the Evaluaciones page', async ({ sharedPage: page }) => {
  // Allow time for all questions plus the optional demo hold at the end.
  test.setTimeout(180_000 + Number(process.env.HOLD_MS ?? 0));

  // Continue in the same window, on the Evaluaciones page.
  await page.goto(processUrl);

  const personalityCard = page
    .getByRole('button')
    .filter({ has: page.getByText('Personalidad', { exact: true }) });
  await expect(personalityCard).toBeVisible({ timeout: 15000 });
  await personalityCard.getByRole('button', { name: 'Continuar', exact: true }).click();

  // Start the assessment and confirm resuming the attempt.
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(page).toHaveURL(/\/evaluation\//, { timeout: 30000 });

  // Total questions come from the "Pregunta X / N" counter (mobile + desktop copies exist).
  const counter = page.getByText(/Pregunta\s*\d+\s*\/\s*\d+/).filter({ visible: true });
  await expect(counter).toBeVisible({ timeout: 15000 });
  const total = Number((await counter.innerText()).match(/\/\s*(\d+)/)?.[1]);
  expect(total).toBeGreaterThan(0);

  // For each question, rank the behaviors on the diagonal, then go to the next one.
  for (let question = 1; question <= total; question++) {
    await expect(
      page
        .getByText(new RegExp(`Pregunta\\s*${question}\\s*/\\s*${total}`))
        .filter({ visible: true }),
    ).toBeVisible();

    const ranks = page.getByRole('radio');
    for (let i = 0; i < 5; i++) {
      await ranks.nth(i * 5 + i).click();
    }
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(5);

    if (question < total) {
      await page.getByRole('button', { name: 'Siguiente' }).click();
    } else {
      await page.getByRole('button', { name: 'Finalizar' }).click();
    }
  }

  // Finish the assessment and continue from the completion screen.
  await expect(page.getByText('¡Buen trabajo!')).toBeVisible({ timeout: 30000 });
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();

  // Keep the screen visible for the demo / to inspect the next step.
  const holdMs = Number(process.env.HOLD_MS ?? 0);
  if (holdMs) await page.waitForTimeout(holdMs);
});
