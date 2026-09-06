import { Locator, Page } from '@playwright/test';
import { NotificationToast } from '../../components/feedback/NotificationToast';
import { ApiWaitHelper } from '../../../helpers/ApiWaitHelper';
import { BasePage } from '../BasePage';

export interface RegistrationDetails {
  email: string;
  password: string;
  confirmPassword: string;
}

/** Page object for the EventHub account registration page. */
export class RegisterPage extends BasePage {
  readonly pageHeading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly createAccountButton: Locator;
  readonly signInLink: Locator;
  readonly notificationToast: NotificationToast;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly confirmPasswordError: Locator;
  private readonly apiWaitHelper: ApiWaitHelper;

  constructor(page: Page) {
    super(page);

    this.pageHeading = page.getByRole('heading', { name: 'Create your account', exact: true });
    this.emailInput = page.getByPlaceholder('you@email.com', { exact: true });
    this.passwordInput = page.getByPlaceholder('Min 8 chars, uppercase, number & symbol', { exact: true });
    this.confirmPasswordInput = page.getByPlaceholder('Repeat your password', { exact: true });
    this.createAccountButton = page.getByRole('button', { name: 'Create Account', exact: true });
    this.signInLink = page.getByRole('link', { name: 'Sign in', exact: true });
    this.notificationToast = new NotificationToast(page);
    this.emailError = page.getByTestId('register-email-error');
    this.passwordError = page.getByTestId('register-password-error');
    this.confirmPasswordError = page.getByTestId('register-confirm-password-error');
    this.apiWaitHelper = new ApiWaitHelper(page);
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/register');
  }

  async fillRegistrationDetails(details: RegistrationDetails): Promise<void> {
    await this.emailInput.fill(details.email);
    await this.passwordInput.fill(details.password);
    await this.confirmPasswordInput.fill(details.confirmPassword);
  }

  async createAccount(): Promise<number> {
    const responsePromise = this.apiWaitHelper.forResponse(response =>
      response.url().endsWith('/api/auth/register') &&
      response.request().method() === 'POST'
    );

    await this.createAccountButton.click();
    return (await responsePromise).status();
  }

  passwordRequirement(text: string): Locator {
    return this.page.getByRole('listitem', { name: text, exact: true });
  }

  async getEmailValidationMessage(): Promise<string> {
    return (await this.emailInput.evaluate((input: HTMLInputElement) => input.validationMessage)).trim();
  }

  async getPasswordValidationMessage(): Promise<string> {
    return (await this.passwordInput.evaluate((input: HTMLInputElement) => input.validationMessage)).trim();
  }

  async getConfirmPasswordValidationMessage(): Promise<string> {
    return (await this.confirmPasswordInput.evaluate((input: HTMLInputElement) => input.validationMessage)).trim();
  }

  async openSignIn(): Promise<void> {
    await this.signInLink.click();
  }
}
