const { expect } = require('@playwright/test');
const { parsePrice } = require('./InventoryPage');

class CheckoutPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    // Step one: customer information
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    // Step two: overview
    this.itemNames = page.getByTestId('inventory-item-name');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    // Complete
    this.completeHeader = page.getByTestId('complete-header');
  }

  async fillInformation({ firstName, lastName, postalCode }) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
    await this.continueButton.click();
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
  }

  async readTotals() {
    return {
      subtotal: parsePrice(await this.subtotal.textContent()),
      tax: parsePrice(await this.tax.textContent()),
      total: parsePrice(await this.total.textContent()),
    };
  }

  async finish() {
    await this.finishButton.click();
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
  }
}

module.exports = { CheckoutPage };
