import { Page, Locator } from "@playwright/test";
import { NotificationToast } from '../../components/feedback/NotificationToast';
import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  // Primary input fields
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  // Action button
  readonly loginButton: Locator;
  readonly notificationToast: NotificationToast;
  // Login page heading
  readonly loginHeading: Locator;
  // Registration link
  readonly registerLink: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email', { exact: true });
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.loginButton = page.getByRole('button', { name: 'Sign In', exact: true });
    this.notificationToast = new NotificationToast(page);
    this.loginHeading = page.getByRole('heading', {
      name: 'Sign in to EventHub',
      exact: true,
    });
    this.registerLink = page.getByRole('link', { name: 'Register', exact: true });
    this.emailError = page.getByTestId('login-email-error');
    this.passwordError = page.getByTestId('login-password-error');
  }

  /** Navigate directly to the EventHub login page */
  async navigate(): Promise<void> { await this.navigateTo('/login'); }

  /** Fill the email field */
  async enterEmail(email: string): Promise<void> { await this.emailInput.fill(email); }

  /** Fill the password field */
  async enterPassword(password: string): Promise<void> { await this.passwordInput.fill(password); }

  /** Submit credentials and return the login response status */
  async clickLogin(): Promise<number> {
    const responsePromise = this.page.waitForResponse(response =>
      response.url().includes('/api/auth/login') &&
      response.request().method() === 'POST'
    );

    await this.loginButton.click();

    const response = await responsePromise;
    return response.status();
  }

  /** Full login flow */
  async login(username: string, password: string): Promise<number> {
    await this.enterEmail(username);
    await this.enterPassword(password);
    return await this.clickLogin();
  }

  /** Open the account registration page */
  async openRegistration(): Promise<void> {
    await this.registerLink.click();
  }

  /** Dismiss the login error toast */
  async dismissLoginError(): Promise<void> {
    await this.notificationToast.dismiss();
  }

  async getEmailValidationMessage(): Promise<string> {
    return (await this.emailInput.evaluate((input: HTMLInputElement) => input.validationMessage)).trim();
  }

  async getPasswordValidationMessage(): Promise<string> {
    return (await this.passwordInput.evaluate((input: HTMLInputElement) => input.validationMessage)).trim();
  }

  async isLoginButtonEnabled(): Promise<boolean> { return await this.loginButton.isEnabled(); }

  async isLoginPageVisible(): Promise<boolean> {
    return await this.loginHeading.isVisible();
  }
}
