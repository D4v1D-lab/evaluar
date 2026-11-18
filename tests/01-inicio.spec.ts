import { test, expect } from './fixtures';
import { env } from '../config/env';
import { buildCandidate } from '../fixtures/candidate.factory';

test('candidate registers through the controlled registration form', async ({
  sharedPage: page,
  registrationPage,
}) => {
  // Allow time for the registration flow.
  test.setTimeout(60_000);

  const { firstName, lastName, email, phoneNumber } = buildCandidate();

  await registrationPage.open(env.PROCESS_URL);

  // Wait for the client-rendered form to appear before interacting with it.
  await expect(registrationPage.firstName).toBeVisible();

  await registrationPage.fillForm({ firstName, lastName, email, phoneNumber });
  await registrationPage.selectLocation('Ecuador');
  await registrationPage.selectPhoneCountry(/Ecuador/);

  // Accept the privacy policy.
  await registrationPage.privacyCheckbox.click();
  await expect(registrationPage.privacyCheckbox).toBeChecked();

  // Submit the registration form.
  await registrationPage.submit();

  // The candidate should land on their process page after registering.
  await expect(page).toHaveURL(/\/process\//, { timeout: 30000 });
});
