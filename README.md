# Enterprise Playwright Test Automation Framework

A modular, extensible, and production-ready **End-to-End (E2E) & API Test Automation Framework** built with [Playwright](https://playwright.dev/) and TypeScript.

---

## 🌟 Key Features

- **Page Object Model (POM)**: Robust base page abstraction (`BasePage`) with auto-waits, stale element recovery, table/grid helpers, and screenshot handling.
- **Unified Configuration**: Environment-based config (`.env`, `.env.dev`, `.env.qa`, `.env.prod`) with typed TypeScript schema (`src/config/env.config.ts`).
- **Generic REST API Client**: Built-in `ApiClient` wrapping Playwright's `APIRequestContext` for API testing and data setup.
- **Generic Database Connector**: `DatabaseUtil` supporting PostgreSQL query execution and connection pooling.
- **Fixture-Driven DI**: Dependency injection of pages, clients, and helpers via Playwright fixtures.
- **Multi-Browser & Headless Support**: Pre-configured Chromium, Firefox, WebKit execution.
- **Rich Reporting**: Built-in HTML reports, failure traces, screenshots, and JSON result output.

---

## 📁 Directory Structure

```
├── .env                        # Local active configuration
├── .env.example                # Template for environment variables
├── config/
│   └── src/config/env.config.ts # Type-safe environment config loader
├── src/
│   ├── api/
│   │   └── ApiClient.ts        # Generic REST API client
│   ├── fixtures/
│   │   ├── base.fixture.ts     # Main fixture injecting pages & clients
│   │   └── incognito.fixture.ts # Isolated browser context fixture
│   ├── helper/
│   │   └── utils/              # Generic Date, Validation, and DB utils
│   └── pages/
│       ├── BasePage.ts         # Core reusable UI action wrapper
│       ├── Components.ts       # Common UI component helpers (Modals, Nav)
│       ├── LoginPage.ts        # Example Login Page Object
│       └── HomePage.ts         # Example Home/Dashboard Page Object
├── test-data/                  # Static & schema test data
├── tests/
│   ├── e2e/
│   │   └── smoke.spec.ts       # Starter E2E smoke tests
│   └── api/
│       └── apiSample.spec.ts   # Starter API tests
├── playwright.config.js        # Playwright test runner configuration
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### 2. Installation
```bash
npm install
npx playwright install --with-deps
```

### 3. Setup Your Target Website
Copy `.env.example` to `.env` and fill in your target website's base URL and credentials:
```ini
TEST_ENV=dev
BASE_URL=https://your-target-website.com
API_URL=https://api.your-target-website.com
HEADLESS=true
```

---

## 🧪 Running Tests

| Command | Description |
| :--- | :--- |
| `npm run test` | Run all tests across all configured browsers |
| `npm run test:headed` | Run tests in headed (visible) browser mode |
| `npm run test:chromium` | Run tests on Chromium only |
| `npm run test:e2e` | Run only E2E UI test specs |
| `npm run test:api` | Run only API test specs |
| `npm run test:dev` | Run tests against the DEV environment |
| `npm run test:qa` | Run tests against the QA environment |
| `npm run report` | Open the interactive HTML test report |
| `npm run typecheck` | Validate TypeScript types without executing |

---

## 📝 How to Add New Tests for Your Website

### Step 1: Create a Page Object
Create a new file in `src/pages/` extending `BasePage`:
```typescript
// src/pages/ProductsPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly productList: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.productList = page.locator('.product-card');
    this.searchInput = page.locator('input[type="search"]');
  }

  async searchProduct(name: string): Promise<void> {
    await this.fillInput(this.searchInput, name);
    await this.page.keyboard.press('Enter');
  }
}
```

### Step 2: Register in Fixture (Optional but Recommended)
Add your page object to `src/fixtures/base.fixture.ts`:
```typescript
import { ProductsPage } from '../pages/ProductsPage';

// Inside test.extend<{ productsPage: ProductsPage }>()
productsPage: async ({ page }, use) => {
  await use(new ProductsPage(page));
},
```

### Step 3: Write Your Test
Create a spec file in `tests/e2e/`:
```typescript
// tests/e2e/products.spec.ts
import { test, expect } from '../../src/fixtures/base.fixture';

test('Should find product by search', async ({ page, productsPage }) => {
  await page.goto('/products');
  await productsPage.searchProduct('Laptop');
  await expect(productsPage.productList.first()).toBeVisible();
});
```
