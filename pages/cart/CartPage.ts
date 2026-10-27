import type { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly productNames: Locator;
  readonly productQuantities: Locator;
  readonly productPrices: Locator;
  readonly linePrices: Locator;
  readonly total: Locator;
  readonly quantityUpdatedMessage: Locator;
  readonly proceedButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly cartQuantityBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator('[data-test="nav-cart"]');
    this.productNames = page.locator('[data-test="product-title"]');
    this.productQuantities = page.locator('[data-test="product-quantity"]');
    this.productPrices = page.locator('[data-test="product-price"]');
    this.linePrices = page.locator('[data-test="line-price"]');
    this.total = page.locator('[data-test="cart-total"]');
    this.quantityUpdatedMessage = page.getByText('Product quantity updated.', { exact: true });
    this.proceedButton = page.locator('[data-test="proceed-1"]');
    this.emptyCartMessage = page.getByText('The cart is empty. Nothing to display.', { exact: true });
    this.cartQuantityBadge = page.locator('[data-test="cart-quantity"]');
  }

  async open(): Promise<void> {
    await this.cartLink.click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedButton.click();
  }

  async updateQuantity(quantity: number): Promise<void> {
    await this.productQuantities.fill(String(quantity));
    await this.productQuantities.press('Tab');
  }

  async removeProduct(name: string): Promise<void> {
    const productName = this.productNames.and(this.page.getByText(name, { exact: true }));
    // The pinned UI's delete anchor has no accessible name or data-test attribute.
    await this.page.getByRole('row').filter({ has: productName }).locator('a.btn-danger').click();
  }
}
