import { test, expect } from "@playwright/test";

function userMenu(page: import("@playwright/test").Page) {
  return page.getByLabel("Menú de usuario");
}

test.describe("Navegación", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByText("Mis Tareas")).toBeVisible({ timeout: 10000 });
  });

  test("el menú de usuario se abre cierra", async ({ page }) => {
    await expect(userMenu(page)).toBeVisible({ timeout: 10000 });

    await userMenu(page).click();
    await expect(page.getByText("Mi Perfil")).toBeVisible();
    await expect(page.getByText("Categorías")).toBeVisible();
    await expect(page.getByText("Programar Mes")).toBeVisible();
    await expect(page.getByText("Cerrar Sesión")).toBeVisible();
  });

  test("navega a Mi Perfil", async ({ page }) => {
    await userMenu(page).click({ timeout: 10000 });
    await page.getByText("Mi Perfil").click();
    await expect(page).toHaveURL("/profile");
  });

  test("navega a Categorías", async ({ page }) => {
    await userMenu(page).click({ timeout: 10000 });
    await page.getByText("Categorías").click();
    await expect(page).toHaveURL("/categories");
  });

  test("navega a Programar Mes (TasksTable)", async ({ page }) => {
    await userMenu(page).click({ timeout: 10000 });
    await page.getByText("Programar Mes").click();
    await expect(page).toHaveURL("/TasksTable");
    await expect(page.getByText("Mis Tareas")).toBeVisible();
  });
});
