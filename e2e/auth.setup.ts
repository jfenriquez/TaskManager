import { test as setup, expect } from "@playwright/test";
import {
  generateTestEmail,
  TEST_PASSWORD,
  verifyUserEmail,
  cleanupAllTestUsers,
  disconnectDb,
} from "./helpers/db";

const AUTH_FILE = "playwright/.auth/user.json";

setup("autenticar usuario de prueba", async ({ page }) => {
  await cleanupAllTestUsers();

  const email = generateTestEmail();
  const password = TEST_PASSWORD;

  // 1. Register via the better-auth API directly
  const signUpRes = await page.request.post("/api/auth/sign-up/email", {
    data: { email, password, name: "E2E Test User" },
  });
  expect(signUpRes.ok()).toBeTruthy();

  // 2. Bypass email verification by setting emailVerified=true directly in DB
  //    (the verification email can't be delivered to @example.com addresses)
  await verifyUserEmail(email);

  // 3. Log in with the form
  await page.goto("/login");
  await expect(page.getByText("Bienvenido")).toBeVisible();

  await page.fill("input[name='email']", email);
  await page.fill("input[name='password']", password);

  // 4. Submit and wait for the API response (better-auth sets the session cookie)
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes("/api/auth/sign-in/email") && res.status() === 200,
      { timeout: 15000 },
    ),
    page.click("button[type='submit']"),
  ]);

  // 5. Navigate manually to "/" — the app's login handler does not redirect after sign-in
  await page.goto("/");
  await expect(page.getByText("Mis Tareas")).toBeVisible({ timeout: 15000 });

  await page.context().storageState({ path: AUTH_FILE });
  await disconnectDb();
});
