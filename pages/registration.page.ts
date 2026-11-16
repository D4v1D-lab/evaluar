import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

type RegistrationData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export class RegistrationPage extends BasePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly location: Locator;
  readonly email: Locator;
  readonly phoneCountryCode: Locator;
  readonly phoneNumber: Locator;
  readonly privacyCheckbox: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByRole('textbox', { name: /Nombre/ });
    this.lastName = page.getByRole('textbox', { name: /Apellido/ });
    this.location = page.getByRole('combobox', { name: /Ubicación/ });
    this.email = page.getByRole('textbox', { name: /Correo electrónico/ });
    this.phoneCountryCode = page.getByRole('combobox').nth(1);
    this.phoneNumber = page.getByRole('textbox', { name: /^\d+$/ });
    this.privacyCheckbox = page.getByRole('checkbox', { name: /Acepto el uso/ });
    this.submitButton = page.getByRole('button', { name: 'Ingresar', exact: true });
  }

  async open(url: string): Promise<void> {
    await this.goto(url);
  }

  async selectLocation(name: string): Promise<void> {
    await this.location.click();
    await this.page.getByRole('option', { name, exact: true }).click();
  }

  async selectPhoneCountry(name: string | RegExp): Promise<void> {
    await this.phoneCountryCode.click();
    await this.page.getByRole('option', { name }).click();
  }

  async fillForm(data: RegistrationData): Promise<void> {
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    await this.email.fill(data.email);
    await this.phoneNumber.fill(data.phoneNumber);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
