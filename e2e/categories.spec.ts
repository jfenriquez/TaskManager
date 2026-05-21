import { test, expect } from "@playwright/test";

test.describe("Gestión de Categorías", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/categories");
    await expect(
      page.getByRole("heading", { name: "Categorías" })
    ).toBeVisible({ timeout: 10000 });
  });

  test("crea una nueva categoría", async ({ page }) => {
    await page.fill('input[placeholder="Nombre de la categoría"]', "Test E2E");
    await page.getByRole("button", { name: "Agregar" }).click();

    await expect(page.getByText("Test E2E")).toBeVisible({ timeout: 5000 });
  });

  test("edita una categoría existente", async ({ page }) => {
    await page.fill('input[placeholder="Nombre de la categoría"]', "Original");
    await page.getByRole("button", { name: "Agregar" }).click();
    await expect(page.getByText("Original")).toBeVisible({ timeout: 5000 });

    const editButton = page.locator("button:has-text('✏️')").first();
    await editButton.click();

    const nameInput = page.locator('input[placeholder="Nombre de la categoría"]');
    await nameInput.fill("Editada");
    await page.getByRole("button", { name: "Guardar" }).click();

    await expect(page.getByText("Editada")).toBeVisible({ timeout: 5000 });
  });

  test("elimina una categoría", async ({ page }) => {
    await page.fill('input[placeholder="Nombre de la categoría"]', "Para borrar");
    await page.getByRole("button", { name: "Agregar" }).click();
    await expect(page.getByText("Para borrar")).toBeVisible({ timeout: 5000 });

    const categoryCard = page.locator(".card", { hasText: "Para borrar" });
    const deleteButton = categoryCard.getByRole("button", { name: "🗑️" });

    page.once("dialog", (dialog) => dialog.accept());
    await deleteButton.click();

    await expect(page.getByText("Para borrar")).not.toBeVisible({ timeout: 5000 });
  });
});
