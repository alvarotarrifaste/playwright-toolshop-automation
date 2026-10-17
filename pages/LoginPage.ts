import { Locator, Page } from '@playwright/test';

export class LoginPage {    
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly loginErrorMessage: Locator;
    readonly userMenu: Locator;
    readonly signOutLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.getByLabel('Email address *');
        this.passwordInput = page.getByLabel('Password *');
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.loginErrorMessage = page.getByText('Invalid email or password', { exact: true });
        this.userMenu = page.locator('[data-test="nav-menu"]');
        this.signOutLink = page.locator('[data-test="nav-sign-out"]');
    }

async goto(): Promise<void> {
    await this.page.goto('/auth/login');
    }

async login(email: string, password: string): Promise<void> {
  await this.emailInput.fill(email);
  await this.passwordInput.fill(password);
  await this.loginButton.click();
    }

async logout(): Promise<void> {
    await this.userMenu.click();
    await this.signOutLink.click();
    }
}
