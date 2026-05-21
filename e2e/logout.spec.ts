import { test, expect } from "@playwright/test";

test.describe("Cierre de sesión", () => {
  test("cierra sesión correctamente", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Mis Tareas")).toBeVisible({ timeout: 10000 });

    await page.getByLabel("Menú de usuario").click();
    await page.getByText("Cerrar Sesión").click();

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
