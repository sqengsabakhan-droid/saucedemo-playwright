const { expect } = require('@playwright/test');

class InventoryPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  /** The product card that contains the given product name. */
  item(name) {
    return this.page
      .getByTestId('inventory-item')
      .filter({ has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }) });
  }

  /** Adds a product by name and returns its listed price as a number. */
  async addToCart(name) {
    const card = this.item(name);
    const priceText = await card.getByTestId('inventory-item-price').textContent();
    await card.getByRole('button', { name: 'Add to cart' }).click();
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();
    return parsePrice(priceText);
  }

  async openCart() {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/cart\.html/);
  }
}

function parsePrice(text) {
  return Number(String(text).replace(/[^0-9.]/g, ''));
}

module.exports = { InventoryPage, parsePrice };
