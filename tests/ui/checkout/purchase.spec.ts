import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/authentication/LoginPage';
import { CatalogPage } from '../../../pages/catalog/CatalogPage';
import { ProductDetailsPage } from '../../../pages/catalog/ProductDetailsPage';
import { CartPage } from '../../../pages/cart/CartPage';
import { CheckoutPage } from '../../../pages/checkout/CheckoutPage';

test('authenticated customer completes a cash-on-delivery purchase with a persisted invoice and cleared cart', { tag: ['@ui', '@checkout', '@regression', '@smoke'] }, async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  if (!email?.trim() || !password?.trim()) {
    throw new Error('Purchase requires injected TEST_USER_EMAIL and TEST_USER_PASSWORD');
  }
  const login = new LoginPage(page);
  const catalog = new CatalogPage(page);
  const details = new ProductDetailsPage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);
  let invoiceSubmissions = 0;
  page.on('request', request => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/invoices') invoiceSubmissions++;
  });

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
  const cartCreated = page.waitForResponse(response =>
    response.request().method() === 'POST' && new URL(response.url()).pathname === '/carts');
  await details.addToCart();
  const purchasedCart = await (await cartCreated).json() as { id: string };
  expect(typeof purchasedCart.id === 'string' && purchasedCart.id.length > 0, 'Own cart has a generated identity').toBe(true);
  await cart.open();
  await expect(cart.productNames).toHaveText(['Combination Pliers']);
  await expect(cart.productQuantities).toHaveValue('1');
  await expect(cart.total).toHaveText('$14.15');
  await cart.proceedToCheckout();
  await expect(checkout.signedInNotice).toHaveText('Hello Jane Doe, you are already logged in. You can proceed to checkout.');
  await checkout.proceedToBilling();
  await expect(checkout.billingHeading).toBeVisible();
  await expect(checkout.billingStreet).toHaveValue(/\S/);

  const lookup = page.waitForResponse(response => {
    const url = new URL(response.url());
    return url.pathname === '/postcode-lookup' && url.searchParams.get('country') === 'US'
      && url.searchParams.get('postcode') === '00000' && url.searchParams.get('house_number') === '1';
  });
  // Synthetic location; the pinned local Faker lookup supplies consistent locality.
  await checkout.enterBillingLocation('US', '00000', '1');
  const lookupResponse = await lookup;
  expect(lookupResponse.status()).toBe(200);
  const address = await lookupResponse.json() as { street: string; city: string; state: string };
  await expect(checkout.billingStreet).toHaveValue(address.street);
  await expect(checkout.billingCity).toHaveValue(address.city);
  await expect(checkout.billingState).toHaveValue(address.state);
  await expect(checkout.billingProceedButton).toBeEnabled();
  await checkout.proceedToPayment();
  await expect(checkout.paymentMethod).toBeVisible();
  await checkout.selectCashOnDelivery();

  // This pinned UI validates first, then places the order on the next Confirm.
  const validation = page.waitForResponse(response =>
    response.request().method() === 'POST' && new URL(response.url()).pathname === '/payment/check');
  await expect(checkout.confirmButton).toBeEnabled();
  await checkout.confirm();
  expect((await validation).status()).toBe(200);
  await expect(checkout.paymentSuccess).toHaveText('Payment was successful');
  await expect(checkout.orderConfirmation).not.toBeVisible();
  expect(invoiceSubmissions, 'Validation alone has not submitted an order').toBe(0);

  const created = page.waitForResponse(response =>
    response.request().method() === 'POST' && new URL(response.url()).pathname === '/invoices');
  const deleted = page.waitForResponse(response => response.request().method() === 'DELETE'
    && new URL(response.url()).pathname === `/carts/${purchasedCart.id}`);
  await checkout.confirm();
  const creationResponse = await created;
  expect(creationResponse.status()).toBe(201);
  const invoice = await creationResponse.json() as { id: string; invoice_number: string };
  expect(typeof invoice.id === 'string' && invoice.id.length > 0, 'Created invoice has an identity').toBe(true);
  expect(typeof invoice.invoice_number === 'string' && invoice.invoice_number.length > 0, 'Created invoice has a reference').toBe(true);
  await expect(checkout.orderConfirmation).toHaveText(`Thanks for your order! Your invoice number is ${invoice.invoice_number}.`);
  expect(invoiceSubmissions, 'Exactly one purchase was submitted').toBe(1);
  expect((await deleted).status(), 'Purchased cart was deleted').toBe(204);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('cart_id') === null
    && sessionStorage.getItem('cart_quantity') === null), { message: 'Purchased cart client state is cleared' }).toBe(true);

  // Read the exact new resource through the existing authenticated app route.
  // The app supplies its own auth header; no token extraction/client is needed.
  const read = page.waitForResponse(response => response.request().method() === 'GET'
    && new URL(response.url()).pathname === `/invoices/${invoice.id}`);
  await page.goto(`/account/invoices/${encodeURIComponent(invoice.id)}`);
  const persistedResponse = await read;
  expect(persistedResponse.status()).toBe(200);
  const persisted = await persistedResponse.json() as {
    id: string; invoice_number: string; status: string; total: number;
    invoicelines: { quantity: number; product: { name: string } }[];
    payment: { payment_method: string };
  };
  expect(persisted.id === invoice.id && persisted.invoice_number === invoice.invoice_number,
    'Readback is the exact purchase just created').toBe(true);
  expect(persisted.invoicelines.map(line => ({ product: line.product.name, quantity: line.quantity })))
    .toEqual([{ product: 'Combination Pliers', quantity: 1 }]);
  expect(persisted.total).toBe(14.15);
  expect(persisted.payment.payment_method).toBe('cash-on-delivery');
  expect(persisted.status).toBe('AWAITING_FULFILLMENT');
  await expect(page.locator('[data-test="invoice-number"]')).toHaveValue(invoice.invoice_number);
  await expect(login.userMenu).toBeVisible();
});
