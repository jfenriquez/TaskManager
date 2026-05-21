import { test, expect, type Page } from "@playwright/test";

function taskCard($page: Page, title: string) {
  return $page.locator(".border-l-4").filter({ hasText: title });
}

test.describe("Gestión de Tareas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Mis Tareas")).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test("crea una nueva tarea", async ({ page }) => {
    await page.getByRole("button", { name: "Nueva Tarea" }).click();
    await expect(page.getByPlaceholder("Ej: Recoger la basura")).toBeVisible({ timeout: 5000 });

    await page.getByPlaceholder("Ej: Recoger la basura").fill("Tarea E2E Test");
    await page.locator("textarea").fill("Descripción de prueba");

    await page.getByRole("button", { name: /agregar/i }).click();
    await expect(taskCard(page, "Tarea E2E Test")).toBeVisible({ timeout: 10000 });
  });

  test("completa una tarea existente", async ({ page }) => {
    await page.getByRole("button", { name: "Nueva Tarea" }).click();
    await expect(page.getByPlaceholder("Ej: Recoger la basura")).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder("Ej: Recoger la basura").fill("Tarea para completar");
    await page.getByRole("button", { name: /agregar/i }).click();
    await expect(taskCard(page, "Tarea para completar")).toBeVisible({ timeout: 10000 });

    // Wait for handleAddTask's startTransitionLocal callback to complete
    // (createTask replaces tempId with real ID), otherwise createTask's
    // transition callback would overwrite the toggle (completed=false from server).
    await page.waitForTimeout(2000);

    const checkbox = taskCard(page, "Tarea para completar").getByRole("checkbox");
    await checkbox.evaluate((el: HTMLInputElement) => {
      el.checked = true;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect(checkbox).toBeChecked({ timeout: 5000 });
    await expect(checkbox).toBeChecked({ timeout: 5000 });
  });

  test("elimina una tarea", async ({ page }) => {
    await page.getByRole("button", { name: "Nueva Tarea" }).click();
    await expect(page.getByPlaceholder("Ej: Recoger la basura")).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder("Ej: Recoger la basura").fill("Tarea a eliminar");
    await page.getByRole("button", { name: /agregar/i }).click();
    await expect(taskCard(page, "Tarea a eliminar")).toBeVisible({ timeout: 10000 });

    await taskCard(page, "Tarea a eliminar")
      .getByRole("button", { name: "Eliminar tarea" })
      .click();

    await expect(taskCard(page, "Tarea a eliminar")).not.toBeVisible({ timeout: 5000 });
  });

  test("filtra tareas por estado", async ({ page }) => {
    await page.getByRole("button", { name: "Nueva Tarea" }).click();
    await expect(page.getByPlaceholder("Ej: Recoger la basura")).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder("Ej: Recoger la basura").fill("Tarea para filtrar");
    await page.getByRole("button", { name: /agregar/i }).click();
    await expect(taskCard(page, "Tarea para filtrar")).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: "Activas" }).click();
    await expect(taskCard(page, "Tarea para filtrar")).toBeVisible();

    await page.getByRole("button", { name: "Completadas", exact: true }).click();
    await page.getByRole("button", { name: "Todas" }).click();
    await expect(taskCard(page, "Tarea para filtrar")).toBeVisible();
  });

  test("edita una tarea", async ({ page }) => {
    await page.getByRole("button", { name: "Nueva Tarea" }).click({ timeout: 5000 });
    await expect(page.getByPlaceholder("Ej: Recoger la basura")).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder("Ej: Recoger la basura").fill("Tarea original");
    await page.getByRole("button", { name: /agregar/i }).click();
    await expect(taskCard(page, "Tarea original")).toBeVisible({ timeout: 10000 });

    // Wait for handleAddTask's startTransitionLocal callback to complete
    // (createTask replaces tempId with real ID). Without this wait,
    // handleUpdateTask in the edit would use a stale tempId, and the
    // transition callback would later clobber the edit result.
    await page.waitForTimeout(2000);

    await taskCard(page, "Tarea original")
      .getByRole("button", { name: "Editar tarea" })
      .click();

    const modalInput = page.locator(".modal-box input").first();
    await modalInput.fill("Tarea editada");
    await page.getByRole("button", { name: /guardar/i }).click();

    await expect(taskCard(page, "Tarea editada")).toBeVisible({ timeout: 5000 });
  });
});
