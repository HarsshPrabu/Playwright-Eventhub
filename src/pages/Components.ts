import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Reusable generic UI components helper for common patterns:
 * navigation bars, modals, toast alerts, data grids, and dropdowns.
 */
export class Components extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Navigation
  getNavItem(title: string): Locator {
    return this.page.locator(`nav, .sidebar, .navbar`).getByRole('link', { name: title }).or(
      this.page.locator(`nav, .sidebar, .navbar`).locator(`text="${title}"`)
    );
  }

  async clickNavItem(title: string): Promise<void> {
    await this.click(this.getNavItem(title));
    await this.waitForLoadState('domcontentloaded');
  }

  // Modals & Dialogs
  getModal(title?: string): Locator {
    return title
      ? this.page.locator('[role="dialog"], .modal').filter({ hasText: title })
      : this.page.locator('[role="dialog"], .modal');
  }

  async closeModal(): Promise<void> {
    const closeBtn = this.page.locator('[role="dialog"] button[aria-label="Close"], .modal .close, [role="dialog"] button:has-text("Close")');
    await this.click(closeBtn);
  }

  // Toast / Notifications
  getToastMessage(): Locator {
    return this.page.locator('[role="alert"], .toast, .notification, .snackbar');
  }

  async getToastText(): Promise<string> {
    const toast = this.getToastMessage().first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    return (await toast.textContent())?.trim() || '';
  }

  // Dropdown Selectors
  async selectCustomDropdownOption(dropdownTrigger: Locator, optionText: string): Promise<void> {
    await this.click(dropdownTrigger);
    const option = this.page.locator('[role="option"], .dropdown-item, li').filter({ hasText: optionText });
    await this.click(option);
  }
}
