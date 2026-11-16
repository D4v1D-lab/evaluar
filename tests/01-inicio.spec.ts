import { test, expect } from './fixtures';
import { env } from '../config/env';
import { RegistrationPage } from '../pages/registration.page';

test('candidate registers through the controlled registration form', async ({ sharedPage: page }) => {
  // Allow time for the registration flow.
  test.setTimeout(60_000);

  const registration = new RegistrationPage(page);
  const url = env.PROCESS_URL;

  // Unique, validation-safe data so the test can run repeatedly.
  const uniqueDigits = Date.now().toString().slice(-8);
  const uniqueLetters = uniqueDigits.replace(/\d/g, (d) => 'abcdefghij'[Number(d)]);
  const firstNameValue = `abc${uniqueLetters}`;
  const lastNameValue = `abc${uniqueLetters}`;
  const emailAddress = `abc+${uniqueDigits}@abc.com`;
  const phoneNumberValue = `0979${uniqueDigits.slice(-6)}`;

  await registration.open(url);

  // Wait for the client-rendered form to appear before interacting with it.
  await expect(registration.firstName).toBeVisible();

  await registration.fillForm({
    firstName: firstNameValue,
    lastName: lastNameValue,
    email: emailAddress,
    phoneNumber: phoneNumberValue,
  });
  await registration.selectLocation('Ecuador');
  await registration.selectPhoneCountry(/Ecuador/);

  // Accept the privacy policy.
  await registration.privacyCheckbox.click();
  await expect(registration.privacyCheckbox).toBeChecked();

  // Submit the registration form.
  await registration.submit();

  // The candidate should land on their process page after registering.
  await expect(page).toHaveURL(/\/process\//, { timeout: 30000 });
});
