import type { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly cartLink: Locator;
  readonly productNames: Locator;
  readonly productQuantities: Locator;

  constructor(page: Page) {
    this.cartLink = page.locator('[data-test="nav-cart"]');
    this.productNames = page.locator('[data-test="product-title"]');
    this.productQuantities = page.locator('[data-test="product-quantity"]');
  }

  async open(): Promise<void> {
    await this.cartLink.click();
  }
}
