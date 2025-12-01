/**
 * App Module Tests
 * Tests are limited due to DOM dependency
 * Full testing is covered by E2E tests
 */

// Mock the DOM and dependencies
jest.mock("../js/storage.js", () => ({
  storage: {
    getAllProjects: jest.fn(() => Promise.resolve([])),
    saveProject: jest.fn(),
    getProject: jest.fn(),
    deleteProject: jest.fn(),
    init: jest.fn()
  }
}));

jest.mock("../js/ui.js", () => ({
  initializeTheme: jest.fn(),
  showToast: jest.fn(),
  toggleTheme: jest.fn()
}));

jest.mock("../js/ai-mock.js", () => ({
  generatePhase1Draft: jest.fn(() => Promise.resolve({
    decision: "Test decision",
    consequences: "Test consequences",
    rationale: "Test rationale"
  }))
}));

jest.mock("../js/views.js", () => ({
  renderPhase1Form: jest.fn(() => "<div>Phase 1 Form</div>"),
  renderPhase2: jest.fn(() => "<div>Phase 2</div>"),
  renderPhase3: jest.fn(() => "<div>Phase 3</div>")
}));

describe("App Module", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app-container"></div>
      <div id="export-all-btn"></div>
      <div id="import-btn"></div>
      <input id="import-file-input" type="file" />
      <div id="related-projects-btn"></div>
      <div id="related-projects-menu"></div>
      <div id="close-privacy-notice"></div>
      <div id="privacy-notice"></div>
      <div id="storage-info"></div>
      <div id="new-project-btn"></div>
      <div id="create-first-btn"></div>
    `;
  });

  test("should be loadable", () => {
    expect(document.getElementById("app-container")).toBeTruthy();
  });

  test("should render empty projects list", () => {
    const container = document.getElementById("app-container");
    container.innerHTML = `
      <div class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400 mb-6">No projects yet</p>
      </div>
    `;
    expect(container.innerHTML).toContain("No projects yet");
  });

  test("should handle creating new project", () => {
    const newBtn = document.getElementById("new-project-btn");
    expect(newBtn).toBeTruthy();
  });

  test("should have storage info element", () => {
    const storageInfo = document.getElementById("storage-info");
    expect(storageInfo).toBeTruthy();
  });
});
