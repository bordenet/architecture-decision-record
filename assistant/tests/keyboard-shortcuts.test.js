import { setupKeyboardShortcuts, showToast } from "../js/keyboard-shortcuts.js";

describe("Keyboard Shortcuts Module", () => {
  let mockContainer;

  beforeEach(() => {
    // Create mock toast container
    mockContainer = document.createElement("div");
    mockContainer.id = "toast-container";
    document.body.appendChild(mockContainer);
  });

  afterEach(() => {
    if (mockContainer && mockContainer.parentNode) {
      mockContainer.parentNode.removeChild(mockContainer);
    }
  });

  test("should set up keyboard shortcuts", () => {
    expect(() => setupKeyboardShortcuts()).not.toThrow();
  });

  test("should show toast notification", () => {
    showToast("Test message", "success");

    const toast = mockContainer.querySelector("div");
    expect(toast).toBeTruthy();
    expect(toast.textContent).toContain("Test message");
    expect(toast.className).toContain("bg-green-500");
  });

  test("should show error toast", () => {
    showToast("Error message", "error");

    const toast = mockContainer.querySelector("div");
    expect(toast.className).toContain("bg-red-500");
  });

  test("should show info toast", () => {
    showToast("Info message", "info");

    const toast = mockContainer.querySelector("div");
    expect(toast.className).toContain("bg-blue-500");
  });

  test("should have keyboard event listener after setup", () => {
    const spy = jest.spyOn(document, "addEventListener");
    setupKeyboardShortcuts();

    expect(spy).toHaveBeenCalledWith("keydown", expect.any(Function));
    spy.mockRestore();
  });

  test("should trigger save button on Cmd+S", () => {
    const saveBtn = document.createElement("button");
    saveBtn.id = "save-project";
    saveBtn.onclick = jest.fn();
    document.body.appendChild(saveBtn);

    setupKeyboardShortcuts();

    const event = new KeyboardEvent("keydown", {
      key: "s",
      metaKey: true,
      bubbles: true
    });

    document.dispatchEvent(event);
    expect(saveBtn.onclick).toHaveBeenCalled();

    saveBtn.remove();
  });

  test("should trigger export button on Cmd+E", () => {
    const exportBtn = document.createElement("button");
    exportBtn.id = "export-all-btn";
    exportBtn.onclick = jest.fn();
    document.body.appendChild(exportBtn);

    setupKeyboardShortcuts();

    const event = new KeyboardEvent("keydown", {
      key: "e",
      metaKey: true,
      bubbles: true
    });

    document.dispatchEvent(event);
    expect(exportBtn.onclick).toHaveBeenCalled();

    exportBtn.remove();
  });

  test("should close privacy notice on Escape", () => {
    const privacyNotice = document.createElement("div");
    privacyNotice.id = "privacy-notice";
    document.body.appendChild(privacyNotice);

    const closeBtn = document.createElement("button");
    closeBtn.id = "close-privacy-notice";
    closeBtn.onclick = jest.fn();
    document.body.appendChild(closeBtn);

    setupKeyboardShortcuts();

    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true
    });

    document.dispatchEvent(event);
    expect(closeBtn.onclick).toHaveBeenCalled();

    privacyNotice.remove();
    closeBtn.remove();
  });

  test("should close related projects dropdown on Escape", () => {
    const dropdownMenu = document.createElement("div");
    dropdownMenu.id = "related-projects-menu";
    document.body.appendChild(dropdownMenu);

    setupKeyboardShortcuts();

    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true
    });

    document.dispatchEvent(event);
    expect(dropdownMenu.classList.contains("hidden")).toBe(true);

    dropdownMenu.remove();
  });

  test("should auto-remove toast after timeout", () => {
    jest.useFakeTimers();
    showToast("Test message", "success");

    const toast = mockContainer.querySelector("div");
    expect(toast).toBeTruthy();

    jest.advanceTimersByTime(3000);

    expect(mockContainer.querySelector("div")).toBeFalsy();
    jest.useRealTimers();
  });

  test("should handle missing toast container gracefully", () => {
    mockContainer.remove();
    expect(() => showToast("Test message", "success")).not.toThrow();
  });

  test("should use default gray color for unknown toast type", () => {
    showToast("Test message", "unknown");

    const toast = mockContainer.querySelector("div");
    expect(toast.className).toContain("bg-gray-500");
  });
});
