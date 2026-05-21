import { test, expect } from "@playwright/test";

test.describe("Landing Page (no autenticado)", () => {
  test("muestra la landing page con Hero, Features y CTA", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toBeVisible();

    await expect(
      page.getByRole("link", { name: /iniciar sesión/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /registrarse/i })
    ).toBeVisible();
  });

  test("navega a /login desde la landing", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL("/login");
    await expect(page.getByText("Bienvenido")).toBeVisible();
  });

  test("navega a /register desde la landing", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /registrarse/i }).click();
    await expect(page).toHaveURL("/register");
    await expect(page.getByText("Crear Cuenta")).toBeVisible();
  });
});

test.describe("Login Page", () => {
  test("muestra el formulario de login", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Bienvenido")).toBeVisible();
    await expect(page.getByText("Inicia sesión para continuar")).toBeVisible();
    await expect(page.getByText("¿Olvidaste tu contraseña?")).toBeVisible();
    await expect(page.getByText("O continúa con")).toBeVisible();

    await expect(page.getByText("Continuar con GitHub")).toBeVisible();
    await expect(page.getByText("Continuar con Google")).toBeVisible();

    await expect(page.getByText("Regístrate aquí")).toBeVisible();

    await expect(page.locator("input[name='email']")).toBeVisible();
    await expect(page.locator("input[name='password']")).toBeVisible();
  });

  test("enlace a registro funciona", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Regístrate aquí").click();
    await expect(page).toHaveURL("/register");
  });
});

test.describe("Register Page", () => {
  test("muestra el formulario de registro", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByText("Crear Cuenta")).toBeVisible();
    await expect(page.locator("input[name='name']")).toBeVisible();
    await expect(page.locator("input[name='email']")).toBeVisible();
    await expect(page.locator("input[name='password']")).toBeVisible();
    await expect(page.getByText("Registrarse")).toBeVisible();
  });
});
