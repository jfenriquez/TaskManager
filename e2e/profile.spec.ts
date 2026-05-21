import { test, expect } from "@playwright/test";

test.describe("Perfil de Usuario", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile");
    await expect(
      page.getByRole("heading", { name: "E2E Test User" })
    ).toBeVisible({ timeout: 15000 });
  });

  test("muestra la información del perfil", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "E2E Test User" })
    ).toBeVisible({ timeout: 10000 });
  });

  test("muestra las tarjetas de estadísticas", async ({ page }) => {
    await expect(page.getByText("Totales", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByText("Completadas", { exact: true })
    ).toBeVisible();
    await expect(page.getByText("Activas", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Tiempo total", { exact: true })
    ).toBeVisible();
  });

  test("muestra la racha actual y zona horaria", async ({ page }) => {
    await expect(page.getByText("Racha actual")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Zona horaria")).toBeVisible();
  });

  test("muestra el selector de zona horaria", async ({ page }) => {
    await expect(page.locator("select").first()).toBeVisible({
      timeout: 15000,
    });
  });
});
