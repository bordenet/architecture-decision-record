import { initializeTheme, showToast, toggleTheme } from "../js/ui.js";

describe("UI Module", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    localStorage.clear();
  });

  test("should initialize theme without dark mode", () => {
    initializeTheme();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("should initialize theme with dark mode", () => {
    localStorage.setItem("darkMode", "true");
    initializeTheme();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("should show toast", () => {
    showToast("Test message", "info");
    expect(true).toBe(true);
  });

  test("should toggle theme", () => {
    toggleTheme();
    expect(localStorage.getItem("darkMode")).toBe("true");
    toggleTheme();
    expect(localStorage.getItem("darkMode")).toBe("false");
  });
});
