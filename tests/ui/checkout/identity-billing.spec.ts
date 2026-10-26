import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/authentication/LoginPage';
import { CatalogPage } from '../../../pages/catalog/CatalogPage';
import { ProductDetailsPage } from '../../../pages/catalog/ProductDetailsPage';
import { CartPage } from '../../../pages/cart/CartPage';
import { CheckoutPage } from '../../../pages/checkout/CheckoutPage';

test('anonymous checkout presents the identity choice before billing', { tag: ['@ui', '@checkout', '@regression'] }, async ({ page }) => {
  const catalog = new CatalogPage(page);
  const details = new ProductDetailsPage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);

  await catalog.goto();
  await catalog.search('Combination Pliers');
  await expect(catalog.searchCompleted).toBeVisible();
  await catalog.openProduct('Combination Pliers');
  await expect(details.productName).toHaveText('Combination Pliers');
  await expect(details.quantity).toHaveValue('1');
  await details.addToCart();
  await cart.open();
  await expect(cart.productNames).toHaveText(['Combination Pliers']);
  await expect(cart.productQuantities).toHaveValue('1');
  await expect(cart.proceedButton).toBeEnabled();
  await cart.proceedToCheckout();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(checkout.loginEmail).toBeVisible();
  await expect(checkout.loginPassword).toBeVisible();
  await expect(checkout.loginSubmit).toBeVisible();
  // Guest checkout is a supported alternative; this is not a universal login mandate.
  await expect(checkout.guestOption).toBeVisible();
  await expect(checkout.signedInNotice).not.toBeVisible();
  await expect(checkout.continueToBillingButton).not.toBeVisible();
  await expect(checkout.billingHeading).not.toBeVisible();
  await expect(checkout.billingStreet).not.toBeVisible();
  await expect(checkout.paymentMethod).not.toBeVisible();
});

test('authenticated checkout continues to billing without another login prompt', { tag: ['@ui', '@checkout', '@regression'] }, async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  if (!email?.trim() || !password?.trim()) {
    throw new Error('Checkout requires injected TEST_USER_EMAIL and TEST_USER_PASSWORD');
  }
  const login = new LoginPage(page);
  const catalog = new CatalogPage(page);
  const details = new ProductDetailsPage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);

  await login.goto();
  await login.login(email, password);
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible();

  await catalog.goto();
  await catalog.search('Combination Pliers');
  await expect(catalog.searchCompleted).toBeVisible();
  await catalog.openProduct('Combination Pliers');
  await expect(details.productName).toHaveText('Combination Pliers');
  await expect(details.quantity).toHaveValue('1');
  await details.addToCart();
  await cart.open();
  await expect(cart.productNames).toHaveText(['Combination Pliers']);
  await expect(cart.productQuantities).toHaveValue('1');
  await cart.proceedToCheckout();

  await expect(checkout.signedInNotice).toHaveText('Hello Jane Doe, you are already logged in. You can proceed to checkout.');
  await expect(checkout.loginEmail).not.toBeVisible();
  await expect(checkout.loginPassword).not.toBeVisible();
  await expect(checkout.loginSubmit).not.toBeVisible();
  await expect(checkout.continueToBillingButton).toBeEnabled();
  await checkout.proceedToBilling();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(checkout.billingHeading).toBeVisible();
  await expect(checkout.billingStreet).toBeVisible();
  await expect(checkout.billingProceedButton).toBeVisible();
  await expect(checkout.loginSubmit).not.toBeVisible();
  await expect(login.userMenu).toBeVisible();
  await expect(checkout.paymentMethod).not.toBeVisible();
});
