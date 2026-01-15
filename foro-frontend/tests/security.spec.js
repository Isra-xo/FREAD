const { test, expect } = require('@playwright/test');

// Helper: create a minimal JWT with the given role claim (no signature validation is required by jwt-decode)
function createFakeJwt(role = 'Usuario') {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ nameid: '1', unique_name: 'test-user', role, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  const signature = 'sig';
  return `${header}.${payload}.${signature}`;
}

// Base app URL (change if your dev server runs on a different port)
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

test.describe('Security / Permission Bouncer', () => {
  test('Acceso Denegado - usuario sin permiso es redirigido y ve toast', async ({ browser }) => {
    // 1) Create a context that sets a valid token before any script runs
    const token = createFakeJwt('Usuario');
    const context = await browser.newContext();
    await context.addInitScript(token => {
      localStorage.setItem('token', token);
    }, token);

    const page = await context.newPage();

    // 2) Mock the menu API to return NO permiso to /crear-hilo
    await page.route('**/api/Auth/menu', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // 3) Navigate directly to the protected page
    await page.goto(`${APP_URL}/crear-hilo`);

    // 4) Expect to be redirected to home and a toast is displayed
    await expect(page).toHaveURL(`${APP_URL}/`);
    await expect(page.locator('text=No tienes permiso para acceder a esta sección')).toBeVisible({ timeout: 3000 });

    await context.close();
  });

  test('Acceso Concedido - admin sees link and can navigate to crear-hilo', async ({ browser }) => {
    const token = createFakeJwt('Administrador');
    const context = await browser.newContext();
    await context.addInitScript(token => {
      localStorage.setItem('token', token);
    }, token);

    const page = await context.newPage();

    // Mock the menu API to include /crear-hilo for this user
    await page.route('**/api/Auth/menu', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, titulo: 'Foros', url: '/foros' },
          { id: 2, titulo: 'Crear Hilo', url: '/crear-hilo' }
        ])
      });
    });

    // Visit home and verify the Navbar shows the Create Hilo link
    await page.goto(`${APP_URL}/`);

    const createLink = page.getByRole('link', { name: 'Crear Hilo' });
    await expect(createLink).toBeVisible();

    // Click the link and verify we can reach /crear-hilo and the page header exists
    await createLink.click();
    await expect(page).toHaveURL(`${APP_URL}/crear-hilo`);
    await expect(page.locator('text=Crear un Nuevo Hilo')).toBeVisible();

    await context.close();
  });
});