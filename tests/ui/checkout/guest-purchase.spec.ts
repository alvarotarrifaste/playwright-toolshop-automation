import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../../pages/catalog/CatalogPage';
import { ProductDetailsPage } from '../../../pages/catalog/ProductDetailsPage';
import { CartPage } from '../../../pages/cart/CartPage';
import { CheckoutPage } from '../../../pages/checkout/CheckoutPage';

test('anonymous guest completes one cash-on-delivery order with matching confirmation and a deleted cart', { tag: ['@ui', '@checkout', '@regression'] }, async ({ page }) => {
  const catalog = new CatalogPage(page);
  const details = new ProductDetailsPage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);
  let guestOrders = 0;
  let authenticatedOrders = 0;
  let logins = 0;
  page.on('request', request => {
    if (request.method() !== 'POST') return;
    const path = new URL(request.url()).pathname;
    if (path === '/invoices/guest') guestOrders++;
    if (path === '/invoices') authenticatedOrders++;
    if (path === '/users/login') logins++;
  });

  await catalog.goto();
  await catalog.search('Combination Pliers');
  await expect(catalog.searchCompleted).toBeVisible();
  await catalog.openProduct('Combination Pliers');
  await expect(details.productName).toHaveText('Combination Pliers');
  await expect(details.quantity).toHaveValue('1');
  const createdCart = page.waitForResponse(response => response.request().method() === 'POST'
    && new URL(response.url()).pathname === '/carts');
  await details.addToCart();
  const cartCreation = await createdCart;
  const ownedCart = await cartCreation.json() as { id: string };
  expect(typeof ownedCart.id === 'string' && ownedCart.id.length > 0, 'Own cart has a generated identity').toBe(true);
  await cart.open();
  await expect(cart.productNames).toHaveText(['Combination Pliers']);
  await expect(cart.productQuantities).toHaveValue('1');
  await expect(cart.total).toHaveText('$14.15');
  await cart.proceedToCheckout();
  // Reserved invalid domain and fictional names; no real identity or SMTP delivery.
  await checkout.enterGuestIdentity('portfolio.guest@example.invalid', 'Portfolio', 'Guest');
  await expect(checkout.guestContinueToBillingButton).toBeEnabled();
  await checkout.continueAsGuest();
  await expect(checkout.billingHeading).toBeVisible();

  const lookup = page.waitForResponse(response => {
    const url = new URL(response.url());
    return url.pathname === '/postcode-lookup' && url.searchParams.get('country') === 'US'
      && url.searchParams.get('postcode') === '00000' && url.searchParams.get('house_number') === '1';
  });
  await checkout.enterBillingLocation('US', '00000', '1');
  const lookupResponse = await lookup;
  expect(lookupResponse.status()).toBe(200);
  const address = await lookupResponse.json() as { street: string; city: string; state: string };
  await expect(checkout.billingStreet).toHaveValue(address.street);
  await expect(checkout.billingCity).toHaveValue(address.city);
  await expect(checkout.billingState).toHaveValue(address.state);
  await expect(checkout.billingProceedButton).toBeEnabled();
  await checkout.proceedToPayment();
  await checkout.selectCashOnDelivery();

  const validation = page.waitForResponse(response => response.request().method() === 'POST'
    && new URL(response.url()).pathname === '/payment/check');
  await checkout.confirm();
  expect((await validation).status()).toBe(200);
  await expect(checkout.paymentSuccess).toHaveText('Payment was successful');
  expect(guestOrders, 'Payment validation has not created an order').toBe(0);
  await expect(checkout.orderConfirmation).not.toBeVisible();

  const created = page.waitForResponse(response => response.request().method() === 'POST'
    && new URL(response.url()).pathname === '/invoices/guest');
  const deleted = page.waitForResponse(response => response.request().method() === 'DELETE'
    && new URL(response.url()).pathname === `/carts/${ownedCart.id}`);
  await checkout.confirm();
  const creation = await created;
  expect(creation.status()).toBe(201);
  const invoice = await creation.json() as { id: string; invoice_number: string; user_id: unknown; subtotal: number; total: number };
  expect(typeof invoice.id === 'string' && invoice.id.length > 0, 'Guest order has a generated identity').toBe(true);
  expect(typeof invoice.invoice_number === 'string' && invoice.invoice_number.length > 0, 'Guest order has a generated reference').toBe(true);
  expect(invoice.user_id === null, 'Guest order is not attached to an authenticated customer').toBe(true);
  expect(invoice.subtotal).toBe(14.15);
  expect(invoice.total).toBe(14.15);
  const payload = creation.request().postDataJSON() as { cart_id: string; guest_email: string; guest_first_name: string; guest_last_name: string; payment_method: string };
  expect(payload.cart_id === ownedCart.id && payload.guest_email === 'portfolio.guest@example.invalid'
    && payload.guest_first_name === 'Portfolio' && payload.guest_last_name === 'Guest'
    && payload.payment_method === 'cash-on-delivery', 'Order submission uses this cart and the synthetic guest COD identity').toBe(true);
  await expect(checkout.orderConfirmation).toHaveText(`Thanks for your order! Your invoice number is ${invoice.invoice_number}.`);
  expect(guestOrders, 'Exactly one guest order was submitted').toBe(1);
  expect(authenticatedOrders, 'Guest flow did not submit an authenticated order').toBe(0);
  expect(logins, 'Guest flow did not log in').toBe(0);
  expect((await deleted).status()).toBe(204);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('cart_id') === null
    && sessionStorage.getItem('cart_quantity') === null && localStorage.getItem('auth-token') === null),
    { message: 'Purchased cart is cleared and guest remains anonymous' }).toBe(true);
  // Independent persisted-cart read; guest invoice GET requires auth and is not used.
  const removed = await page.request.get(new URL(`/carts/${ownedCart.id}`, cartCreation.url()).href);
  expect(removed.status(), 'Purchased cart no longer exists on the backend').toBe(404);
});
