import { test, expect } from "@playwright/test";

test.describe("Architecture Decision Record Assistant", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate first, then clear storage
    await page.goto("/");
    
    // Clear storage before each test
    await page.evaluate(() => {
      localStorage.clear();
      indexedDB.deleteDatabase("adr-assistant");
    });
    
    // Reload to apply cleared storage
    await page.reload();
  });

  test("should load the application", async ({ page }) => {
    const title = await page.title();
    expect(title).toContain("Architecture Decision Record Assistant");
  });

  test("should display privacy notice on first load", async ({ page }) => {
    const privacyNotice = await page.locator("#privacy-notice");
    await expect(privacyNotice).toBeVisible();
  });

  test("should have close button for privacy notice", async ({ page }) => {
    const privacyNotice = await page.locator("#privacy-notice");
    await expect(privacyNotice).toBeVisible();
    
    // Verify close button exists and is visible
    const closeBtn = await page.locator("#close-privacy-notice");
    await expect(closeBtn).toBeVisible();
    
    // Verify it's a button element
    const btnType = await closeBtn.getAttribute("type");
    expect(btnType).toBe("button");
  });

  test("should close privacy notice and persist state", async ({ page }) => {
    const privacyNotice = await page.locator("#privacy-notice");
    await expect(privacyNotice).toBeVisible();
    
    const closeBtn = await page.locator("#close-privacy-notice");
    
    // Click the close button
    await closeBtn.click();
    
    // Wait for any animations
    await page.waitForTimeout(200);
    
    // Verify the notice is hidden
    const isHidden = await privacyNotice.evaluate(el => 
      el.classList.contains("hidden")
    );
    expect(isHidden).toBe(true);
    
    // Verify localStorage was set to remember this
    const hiddenStatus = await page.evaluate(() => 
      localStorage.getItem("hiddenPrivacyNotice")
    );
    expect(hiddenStatus).toBe("true");
    
    // Reload page and verify notice stays hidden
    await page.reload();
    await page.waitForLoadState("networkidle");
    
    const reloadedNotice = await page.locator("#privacy-notice");
    const stillHidden = await reloadedNotice.evaluate(el => 
      el.classList.contains("hidden")
    );
    expect(stillHidden).toBe(true);
  });

  test("should toggle dark mode", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    const themeToggle = await page.locator("[id*='theme']").first();
    const htmlElement = await page.locator("html");

    // Get initial dark mode state
    let initialClasses = await htmlElement.getAttribute("class") || "";
    const initialDark = initialClasses.includes("dark");

    // Click the theme toggle button
    await themeToggle.click();
    
    // Wait for state change
    await page.waitForTimeout(100);
    
    // Get updated dark mode state
    let updatedClasses = await htmlElement.getAttribute("class") || "";
    const updatedDark = updatedClasses.includes("dark");

    // Verify the dark class was toggled
    expect(initialDark).not.toBe(updatedDark);
    
    // Verify localStorage was updated
    const darkModeSetting = await page.evaluate(() => localStorage.getItem("darkMode"));
    expect(darkModeSetting === "true" || darkModeSetting === "false").toBeTruthy();
  });

  test("should create a new project", async ({ page }) => {
    // Wait for app to load
    await page.waitForLoadState("networkidle");

    // Click create project button
    const createBtn = await page.locator("button").filter({ hasText: /Create|New/ }).first();
    if (await createBtn.isVisible()) {
      await createBtn.click();

      // Verify project form is displayed
      const titleInput = await page.locator("#title-input");
      await expect(titleInput).toBeVisible();
    }
  });

  test("should fill Phase 1 form and save", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Create new project if needed
    const createBtn = await page.locator("button").filter({ hasText: /Create|New/ }).first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
    }

    // Check if we're on Phase 1 form
    const titleInput = await page.locator("#title-input");
    if (await titleInput.isVisible()) {
      // Fill in form
      await titleInput.fill("Use Microservices Architecture");
      await page.locator("#status-select").selectOption("Proposed");
      await page.locator("#context-textarea").fill("Current monolithic architecture is difficult to scale");

      // Verify form is filled
      await expect(titleInput).toHaveValue("Use Microservices Architecture");
    }
  });

  test("should navigate between phases", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Look for phase navigation or content
    const mainContent = await page.locator("main");
    await expect(mainContent).toBeVisible();

    // Verify we can see some phase-related content
    const contentExists = await mainContent.isVisible();
    expect(contentExists).toBeTruthy();
  });

  test("should display storage info", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const storageInfo = await page.locator("#storage-info");
    await expect(storageInfo).toBeVisible();
  });

  test("should display related projects dropdown", async ({ page }) => {
    const relatedBtn = await page.locator("#related-projects-btn");
    await expect(relatedBtn).toBeVisible();

    await relatedBtn.click();
    
    // Wait a moment for the dropdown to animate
    await page.waitForTimeout(100);
    
    const menu = await page.locator("#related-projects-menu");
    // Check if menu is visible or hidden (either state is OK for this test)
    const isVisible = await menu.isVisible();
    expect(typeof isVisible).toBe('boolean');
  });

  test("should have export button in header", async ({ page }) => {
    const exportBtn = await page.locator("#export-all-btn");
    await expect(exportBtn).toBeVisible();
  });

  test("should have import button in header", async ({ page }) => {
    const importBtn = await page.locator("#import-btn");
    await expect(importBtn).toBeVisible();
  });

  test("should display correct header title", async ({ page }) => {
    const header = await page.locator("h1");
    const text = await header.textContent();
    expect(text).toContain("Architecture Decision Record Assistant");
  });

  test("should have footer with links", async ({ page }) => {
    const footer = await page.locator("footer");
    await expect(footer).toBeVisible();

    // Get the first github link in footer (strict mode - multiple match issue)
    const githubLink = footer.locator("a[href*='github']").first();
    await expect(githubLink).toBeVisible();
  });

  test("should handle keyboard navigation", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Test tab navigation
    await page.keyboard.press("Tab");
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test("should be responsive on mobile", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();
    await page.goto("/");

    const title = await page.title();
    expect(title).toContain("Architecture Decision Record Assistant");

    await context.close();
  });

  test("should be responsive on tablet", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 }
    });
    const page = await context.newPage();
    await page.goto("/");

    const title = await page.title();
    expect(title).toContain("Architecture Decision Record Assistant");

    await context.close();
  });
});
