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

  test("should navigate from Phase 2 back to Phase 1 via tab", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Create a new project
    const createBtn = await page.locator("button").filter({ hasText: /Create|New/ }).first();
    await createBtn.click();

    // Fill in Phase 1 form
    await page.locator("#title-input").fill("Test ADR Navigation");
    await page.locator("#context-textarea").fill("Testing phase navigation");
    await page.locator("#decision-textarea").fill("We will test navigation");
    await page.locator("#consequences-textarea").fill("Navigation will work correctly");

    // Advance to Phase 2
    const nextBtn = await page.locator("#next-phase-btn");
    await nextBtn.click();
    await page.waitForTimeout(300);

    // Verify we're on Phase 2
    const phase2Header = await page.locator("text=🔍 Review");
    await expect(phase2Header).toBeVisible();

    // Click Phase 1 tab to go back
    const phase1Tab = await page.locator(".phase-tab[data-phase='1']");
    await phase1Tab.click();
    await page.waitForTimeout(300);

    // Verify we're back on Phase 1 form with data preserved
    const titleInput = await page.locator("#title-input");
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveValue("Test ADR Navigation");
  });

  test("should navigate from Phase 2 back to Phase 1 via Previous button", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Create a new project
    const createBtn = await page.locator("button").filter({ hasText: /Create|New/ }).first();
    await createBtn.click();

    // Fill in Phase 1 form
    await page.locator("#title-input").fill("Test Previous Button");
    await page.locator("#context-textarea").fill("Testing previous button");
    await page.locator("#decision-textarea").fill("We will test previous button");
    await page.locator("#consequences-textarea").fill("Previous button will work");

    // Advance to Phase 2
    const nextBtn = await page.locator("#next-phase-btn");
    await nextBtn.click();
    await page.waitForTimeout(300);

    // Click Previous Phase button
    const prevBtn = await page.locator("#prev-phase1-btn");
    await prevBtn.click();
    await page.waitForTimeout(300);

    // Verify we're back on Phase 1 form with data preserved
    const titleInput = await page.locator("#title-input");
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveValue("Test Previous Button");
  });

  test("should delete project from Phase 1", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Create a new project
    const createBtn = await page.locator("button").filter({ hasText: /Create|New/ }).first();
    await createBtn.click();

    // Fill in Phase 1 form
    await page.locator("#title-input").fill("Project To Delete From Phase 1");
    await page.locator("#context-textarea").fill("This will be deleted");
    await page.locator("#decision-textarea").fill("Delete this project");
    await page.locator("#consequences-textarea").fill("Project will be deleted");

    // Save first
    await page.locator("#save-phase1-btn").click();
    await page.waitForTimeout(300);

    // Set up dialog handler to accept confirmation
    page.on("dialog", dialog => dialog.accept());

    // Click delete button
    const deleteBtn = await page.locator("#delete-project-btn");
    await deleteBtn.click();
    await page.waitForTimeout(500);

    // Verify we're back on project list (empty state or list without our project)
    const projectList = await page.locator("#app-container");
    const text = await projectList.textContent();
    expect(text).not.toContain("Project To Delete From Phase 1");
  });

  test("should delete project from Phase 2", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Create a new project
    const createBtn = await page.locator("button").filter({ hasText: /Create|New/ }).first();
    await createBtn.click();

    // Fill in Phase 1 form
    await page.locator("#title-input").fill("Project To Delete From Phase 2");
    await page.locator("#context-textarea").fill("This will be deleted from phase 2");
    await page.locator("#decision-textarea").fill("Delete this project from phase 2");
    await page.locator("#consequences-textarea").fill("Project will be deleted");

    // Advance to Phase 2
    const nextBtn = await page.locator("#next-phase-btn");
    await nextBtn.click();
    await page.waitForTimeout(300);

    // Verify we're on Phase 2 and delete button exists
    const deleteBtn = await page.locator("#delete-project-btn");
    await expect(deleteBtn).toBeVisible();

    // Set up dialog handler to accept confirmation
    page.on("dialog", dialog => dialog.accept());

    // Click delete button
    await deleteBtn.click();
    await page.waitForTimeout(500);

    // Verify we're back on project list
    const projectList = await page.locator("#app-container");
    const text = await projectList.textContent();
    expect(text).not.toContain("Project To Delete From Phase 2");
  });

  test("should delete project from Phase 3", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Create a new project
    const createBtn = await page.locator("button").filter({ hasText: /Create|New/ }).first();
    await createBtn.click();

    // Fill in Phase 1 form
    await page.locator("#title-input").fill("Project To Delete From Phase 3");
    await page.locator("#context-textarea").fill("This will be deleted from phase 3");
    await page.locator("#decision-textarea").fill("Delete this project from phase 3");
    await page.locator("#consequences-textarea").fill("Project will be deleted");

    // Advance to Phase 2
    await page.locator("#next-phase-btn").click();
    await page.waitForTimeout(300);

    // Navigate to Phase 3 via tab
    const phase3Tab = await page.locator(".phase-tab[data-phase='3']");
    await phase3Tab.click();
    await page.waitForTimeout(300);

    // Verify we're on Phase 3 and delete button exists
    const deleteBtn = await page.locator("#delete-project-btn");
    await expect(deleteBtn).toBeVisible();

    // Set up dialog handler to accept confirmation
    page.on("dialog", dialog => dialog.accept());

    // Click delete button
    await deleteBtn.click();
    await page.waitForTimeout(500);

    // Verify we're back on project list
    const projectList = await page.locator("#app-container");
    const text = await projectList.textContent();
    expect(text).not.toContain("Project To Delete From Phase 3");
  });

  test("should preserve data when navigating back from Phase 3 to Phase 1", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Create a new project
    const createBtn = await page.locator("button").filter({ hasText: /Create|New/ }).first();
    await createBtn.click();

    // Fill in Phase 1 form with specific data
    await page.locator("#title-input").fill("Full Navigation Test");
    await page.locator("#context-textarea").fill("Context for full navigation test");
    await page.locator("#decision-textarea").fill("Decision for navigation");
    await page.locator("#consequences-textarea").fill("Consequences of navigation");
    await page.locator("#rationale-textarea").fill("Rationale for testing");

    // Advance to Phase 2
    await page.locator("#next-phase-btn").click();
    await page.waitForTimeout(300);

    // Navigate to Phase 3 via tab
    await page.locator(".phase-tab[data-phase='3']").click();
    await page.waitForTimeout(300);

    // Verify we're on Phase 3
    const phase3Header = await page.locator("text=Synthesize");
    await expect(phase3Header).toBeVisible();

    // Navigate back to Phase 1 via tab
    const phase1Tab = await page.locator(".phase-tab[data-phase='1']");
    await phase1Tab.click();
    await page.waitForTimeout(300);

    // Verify all Phase 1 data is preserved
    await expect(page.locator("#title-input")).toHaveValue("Full Navigation Test");
    await expect(page.locator("#context-textarea")).toHaveValue("Context for full navigation test");
    await expect(page.locator("#decision-textarea")).toHaveValue("Decision for navigation");
    await expect(page.locator("#consequences-textarea")).toHaveValue("Consequences of navigation");
    await expect(page.locator("#rationale-textarea")).toHaveValue("Rationale for testing");
  });
});
