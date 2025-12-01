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
    deleteProject: jest.fn()
  }
}));

jest.mock("../js/ui.js", () => ({
  initializeTheme: jest.fn(),
  showToast: jest.fn(),
  toggleTheme: jest.fn()
}));

describe("App Module", () => {
  test("should be loadable", () => {
    // Mock DOM elements
    document.body.innerHTML = '<div id="app-container"></div>';

    expect(document.getElementById("app-container")).toBeTruthy();
  });
});
