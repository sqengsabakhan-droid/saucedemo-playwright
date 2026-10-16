const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { user, products, customer } = require('../test-data/checkout-data');

// Money is compared in cents to avoid floating-point rounding errors.
const cents = (amount) => Math.round(amount * 100);

test.describe('Checkout end-to-end', () => {
  test('standard user can buy two products and sees a correct order summary', async ({ page }) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await test.step('Log in', async () => {
      await login.goto();
      await login.login(user.username, user.password);
      await expect(inventory.title).toHaveText('Products');
    });

    const prices = [];
    await test.step('Add products to the cart', async () => {
      for (const name of products) {
        prices.push(await inventory.addToCart(name));
      }
      await expect(inventory.cartBadge).toHaveText(String(products.length));
    });

    await test.step('Cart contains exactly the selected products', async () => {
      await inventory.openCart();
      await expect(cart.itemNames).toHaveText(products);
      await cart.checkout();
    });

    await test.step('Enter customer information', async () => {
      await checkout.fillInformation(customer);
    });

    await test.step('Overview shows the right items and consistent totals', async () => {
      await expect(checkout.itemNames).toHaveText(products);

      const { subtotal, tax, total } = await checkout.readTotals();
      const expectedSubtotal = prices.reduce((sum, p) => sum + p, 0);

      expect(cents(subtotal)).toBe(cents(expectedSubtotal));
      expect(cents(tax)).toBeGreaterThan(0);
      expect(cents(total)).toBe(cents(subtotal) + cents(tax));
    });

    await test.step('Finish the order', async () => {
      await checkout.finish();
      await expect(checkout.completeHeader).toHaveText('Thank you for your order!');
      // After a completed order the cart must be empty.
      await expect(inventory.cartBadge).toBeHidden();
    });
  });
});
