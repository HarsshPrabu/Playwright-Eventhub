import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  readonly header: Locator;
  readonly navMenu: Locator;
  readonly userProfile: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator("header, h1, .navbar");
    this.navMenu = page.locator("nav, .sidebar");
    this.userProfile = page.locator('[data-testid="user-profile"], .profile-icon');
    this.logoutButton = page.locator('button:has-text("Logout"), a:has-text("Sign Out")');
  }

  async logout(): Promise<void> {
    await this.click(this.userProfile);
    await this.click(this.logoutButton);
  }

  async isHeaderVisible(): Promise<boolean> {
    return await this.isVisible(this.header);
  }
}
