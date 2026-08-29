import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { baseUrl } from "../config/env.config";

export class LoginPage extends BasePage {
  // Primary input fields
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  // Action button
  readonly loginButton: Locator;
  // Optional error message container
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-btn');
    this.errorMessage = page.locator('.error-message, [role="alert"]');
  }

  /** Navigate to base URL */
  async navigate(): Promise<void> { await this.navigateTo(baseUrl); }

  /** Fill the email field */
  async enterEmail(email: string): Promise<void> { await this.fillInput(this.emailInput, email); }

  /** Fill the password field */
  async enterPassword(password: string): Promise<void> { await this.fillInput(this.passwordInput, password); }

  /** Click the Sign‑In button */
  async clickLogin(): Promise<void> { await this.click(this.loginButton); await this.waitForLoadState('domcontentloaded'); }

  /** Full login flow */
  async login(username: string, password: string): Promise<void> {
    await this.enterEmail(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async getErrorMessage(): Promise<string> { return await this.getText(this.errorMessage); }

  async isLoginButtonEnabled(): Promise<boolean> { return await this.loginButton.isEnabled(); }

  async isLoginPageVisible(): Promise<boolean> {
    const heading = this.page.locator('h1', { hasText: 'Sign in to EventHub' });
    return await heading.isVisible();
  }
}
