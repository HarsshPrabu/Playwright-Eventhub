import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { baseUrl } from "../config/env.config";

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input[type="email"], input[name="username"], #username');
    this.passwordInput = page.locator('input[type="password"], #password');
    this.loginButton = page.locator('button[type="submit"], #sign-on, #login-button');
    this.errorMessage = page.locator('.error-message, [role="alert"]');
  }

  async navigate(): Promise<void> {
    await this.navigateTo(baseUrl);
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.click(this.loginButton);
    await this.waitForLoadState("domcontentloaded");
  }

  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }
}
