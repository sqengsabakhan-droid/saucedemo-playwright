# SauceDemo Checkout – Playwright E2E Test

Automated end-to-end test of the most business-critical flow on [saucedemo.com](https://www.saucedemo.com/):

**Login → add 2 products → verify cart → checkout → verify order summary → finish → verify confirmation**

## Prerequisites

- Node.js 18 or newer (`node -v` to check)
- Git

## Setup

```bash
git clone <your-repo-url>
cd saucedemo-playwright
npm install
npx playwright install chromium
```

## Run

```bash
npm test               # headless run
npm run test:headed    # watch the browser
npm run report         # open the HTML report after a run
```

Credentials default to `standard_user` / `secret_sauce`. They can be overridden:

```bash
SAUCE_USERNAME=standard_user SAUCE_PASSWORD=secret_sauce npm test
```

## Project structure

```
pages/            Page Objects (one class per screen)
  LoginPage.js
  InventoryPage.js
  CartPage.js
  CheckoutPage.js
test-data/        Users, products and customer details
tests/            Test specs
  checkout.spec.js
playwright.config.js
```

## What the test verifies

| Step | Assertion |
| --- | --- |
| Login | Redirects to inventory, page title is "Products" |
| Add to cart | Each button changes to "Remove"; cart badge shows 2 |
| Cart | Contains exactly the selected products, by name |
| Checkout info | Valid details move the user to the Overview step |
| Overview | Same products listed; subtotal = sum of the prices shown on the product page; total = subtotal + tax |
| Finish | "Thank you for your order!" is shown and the cart badge disappears |

## Design decisions

- **Stable selectors:** SauceDemo exposes `data-test` attributes, so all locators use `getByTestId()` (configured via `testIdAttribute`). No CSS classes, XPath or element positions.
- **Products found by name, not position:** sorting or catalogue changes will not silently pick the wrong item.
- **No hard-coded waits:** no `waitForTimeout()`. Playwright auto-waits, and every navigation is confirmed with a URL assertion.
- **Money compared in cents:** avoids floating-point rounding errors (e.g., 9.99 + 29.99).
- **Expected subtotal is calculated from the prices read on the product page**, not hard-coded, so the test survives price changes.
- **Test isolation:** each test gets a fresh browser context, so no cart state leaks between runs.
- **Readable reports:** `test.step()` blocks name each stage; traces and screenshots are kept on failure.

## AI usage

AI (Claude) assisted with test design, Page Object structure, locator strategy, and the README.

**Validated or corrected:**

- The AI's knowledge of SauceDemo was outdated (it did not know about the newer Dynamic Catalog menu). Selectors were therefore not taken from memory but checked against the live page's `data-test` attributes before use.


**Stability check:** the test passed 5 out of 5 repeated runs (`npx playwright test --repeat-each=5`).

## Limitations and risks

- Depends on a public demo site; outages or UI changes outside our control can fail the test.
- The tax **rate** is not asserted (only that tax is positive and the total adds up), because the rate is not documented by the app.
- Runs on Chromium only; Firefox/WebKit can be enabled in `playwright.config.js`.
- Covers the happy path only. Known defects (empty-cart checkout, whitespace-only form input) are documented in the defect report but not automated here.
- Relies on `data-test` attributes remaining stable.
