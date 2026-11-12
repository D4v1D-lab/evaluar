import { test, expect } from '@playwright/test';

test('candidate registers through the controlled registration form', async ({ page }) => {
  const url =
    'https://candidato.evaluar.com/auth/autoregister/controlled/572ff080-da01-4a64-9858-897f5a8d1be9';

  await page.goto(url);

  const firstName = page.getByRole('textbox', { name: /Nombre/ });
  const lastName = page.getByRole('textbox', { name: /Apellido/ });
  const location = page.getByRole('combobox', { name: /Ubicación/ });
  const email = page.getByRole('textbox', { name: /Correo electrónico/ });
  const phoneCountryCode = page.getByRole('combobox').nth(1);
  const phoneNumber = page.getByRole('textbox', { name: /^\d+$/ });
  const privacyCheckbox = page.getByRole('checkbox', { name: /Acepto el uso/ });
  const submitButton = page.getByRole('button', { name: 'Ingresar', exact: true });
  // Unique, validation-safe data so the test can run repeatedly.
  const uniqueDigits = Date.now().toString().slice(-8);
  const uniqueLetters = uniqueDigits.replace(/\d/g, (d) => 'abcdefghij'[Number(d)]);
  const firstNameValue = `abc${uniqueLetters}`;
  const lastNameValue = `abc${uniqueLetters}`;
  const emailAddress = `abc+${uniqueDigits}@abc.com`;
  const phoneNumberValue = `0979${uniqueDigits.slice(-6)}`;

  // Wait for the client-rendered form to appear before interacting with it.
  await expect(firstName).toBeVisible();

  // Personal data.
  await firstName.fill(firstNameValue);
  await lastName.fill(lastNameValue);

  // Location.
  await location.click();
  await page.getByRole('option', { name: 'Ecuador' }).click();

  // Contact details.
  await email.fill(emailAddress);

  // Use Ecuador as the phone country code (+593).
  await phoneCountryCode.click();
  await page.getByRole('option', { name: /Ecuador/ }).click();
  await phoneNumber.fill(phoneNumberValue);

  // Accept the privacy policy.
  await privacyCheckbox.click();
  await expect(privacyCheckbox).toBeChecked();

  // Submit the registration form.
  await submitButton.click();

  // The candidate should land on their process page after registering.
  await expect(page).toHaveURL(/\/process\//, { timeout: 30000 });

  // Keep the final screen visible for a live demo (HOLD_MS in milliseconds).
  const holdMs = Number(process.env.HOLD_MS ?? 0);
  if (holdMs) await page.waitForTimeout(holdMs);
});
