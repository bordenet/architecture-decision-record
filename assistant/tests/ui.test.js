import { initializeTheme, showToast, toggleTheme, escapeHtml, formatDate, confirm, showPromptModal, copyToClipboard, showDocumentPreviewModal } from "../js/ui.js";

describe("UI Module", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    document.body.innerHTML = "";
    localStorage.clear();
    jest.clearAllTimers();
  });

  describe("initializeTheme", () => {
    test("should initialize theme without dark mode", () => {
      initializeTheme();
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    test("should initialize theme with dark mode", () => {
      localStorage.setItem("darkMode", "true");
      initializeTheme();
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("toggleTheme", () => {
    test("should toggle theme on", () => {
      toggleTheme();
      expect(localStorage.getItem("darkMode")).toBe("true");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    test("should toggle theme off", () => {
      toggleTheme();
      toggleTheme();
      expect(localStorage.getItem("darkMode")).toBe("false");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("showToast", () => {
    beforeEach(() => {
      // Set up toast container
      document.body.innerHTML = '<div id="toast-container"></div>';
    });

    test("should show toast with message", () => {
      showToast("Test message", "info");
      const container = document.getElementById("toast-container");
      expect(container.innerHTML).toContain("Test message");
    });

    test("should default to info type", () => {
      showToast("Test message");
      const container = document.getElementById("toast-container");
      expect(container.children.length).toBe(1);
    });

    test("should handle success type", () => {
      showToast("Success!", "success");
      const container = document.getElementById("toast-container");
      expect(container.innerHTML).toContain("Success!");
    });

    test("should handle error type", () => {
      showToast("Error!", "error");
      const container = document.getElementById("toast-container");
      expect(container.innerHTML).toContain("Error!");
    });
  });

  describe("formatDate", () => {
    test("should return 'Today' for today's date", () => {
      const today = new Date().toISOString();
      expect(formatDate(today)).toBe("Today");
    });

    test("should return 'Yesterday' for yesterday's date", () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      expect(formatDate(yesterday)).toBe("Yesterday");
    });

    test("should return 'X days ago' for dates within a week", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatDate(threeDaysAgo)).toBe("3 days ago");
    });

    test("should return formatted date for dates older than a week", () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const result = formatDate(tenDaysAgo);
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    test("should handle invalid dates gracefully", () => {
      // formatDate returns toLocaleDateString for invalid dates
      const result = formatDate(null);
      expect(result).toBeTruthy();
    });
  });

  describe("escapeHtml", () => {
    test("should escape HTML special characters", () => {
      expect(escapeHtml("<script>alert('xss')</script>")).toBe("&lt;script&gt;alert('xss')&lt;/script&gt;");
    });

    test("should escape ampersands", () => {
      expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
    });

    test("should handle normal text", () => {
      expect(escapeHtml("Hello World")).toBe("Hello World");
    });
  });

  describe("confirm", () => {
    test("should resolve true when confirm button is clicked", async () => {
      const confirmPromise = confirm("Are you sure?", "Delete");

      await new Promise(resolve => setTimeout(resolve, 0));

      const confirmBtn = document.querySelector("#confirm-btn");
      expect(confirmBtn).toBeTruthy();
      confirmBtn.click();

      const result = await confirmPromise;
      expect(result).toBe(true);
    });

    test("should resolve false when cancel button is clicked", async () => {
      const confirmPromise = confirm("Are you sure?");

      await new Promise(resolve => setTimeout(resolve, 0));

      const cancelBtn = document.querySelector("#cancel-btn");
      expect(cancelBtn).toBeTruthy();
      cancelBtn.click();

      const result = await confirmPromise;
      expect(result).toBe(false);
    });

    test("should resolve false when backdrop is clicked", async () => {
      const confirmPromise = confirm("Are you sure?");

      await new Promise(resolve => setTimeout(resolve, 0));

      const modal = document.querySelector(".fixed");
      expect(modal).toBeTruthy();

      const event = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(event, "target", { value: modal, enumerable: true });
      modal.dispatchEvent(event);

      const result = await confirmPromise;
      expect(result).toBe(false);
    });

    test("should display custom title and message", async () => {
      const confirmPromise = confirm("Delete this item?", "Confirm Delete");

      await new Promise(resolve => setTimeout(resolve, 0));

      const modal = document.querySelector(".fixed");
      expect(modal.innerHTML).toContain("Confirm Delete");
      expect(modal.innerHTML).toContain("Delete this item?");

      document.querySelector("#cancel-btn").click();
      await confirmPromise;
    });
  });

  describe("showPromptModal", () => {
    test("should display modal with prompt text", () => {
      showPromptModal("Test prompt content", "Test Title");

      const modal = document.querySelector(".fixed");
      expect(modal).toBeTruthy();
      expect(modal.innerHTML).toContain("Test Title");
      expect(modal.innerHTML).toContain("Test prompt content");

      document.querySelector("#close-prompt-modal").click();
    });

    test("should close modal when X button is clicked", () => {
      showPromptModal("Test prompt", "Title");

      const closeBtn = document.querySelector("#close-prompt-modal");
      expect(closeBtn).toBeTruthy();
      closeBtn.click();

      const modal = document.querySelector(".fixed");
      expect(modal).toBeNull();
    });

    test("should close modal when backdrop is clicked", () => {
      showPromptModal("Test prompt", "Title");

      const modal = document.querySelector(".fixed");
      expect(modal).toBeTruthy();

      const event = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(event, "target", { value: modal, enumerable: true });
      modal.dispatchEvent(event);

      const modalAfter = document.querySelector(".fixed");
      expect(modalAfter).toBeNull();
    });

    test("should close modal on Escape key", () => {
      showPromptModal("Test prompt", "Title");

      const modal = document.querySelector(".fixed");
      expect(modal).toBeTruthy();

      const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(escapeEvent);

      const modalAfter = document.querySelector(".fixed");
      expect(modalAfter).toBeNull();
    });

    test("should escape HTML in prompt text", () => {
      showPromptModal("<script>alert('xss')</script>", "Title");

      const modal = document.querySelector(".fixed");
      expect(modal.innerHTML).not.toContain("<script>");
      expect(modal.innerHTML).toContain("&lt;script&gt;");

      document.querySelector("#close-prompt-modal").click();
    });
  });

  describe("copyToClipboard", () => {
    test("should copy text to clipboard using ClipboardItem", async () => {
      const writeMock = jest.fn().mockResolvedValue();
      navigator.clipboard.write = writeMock;

      await copyToClipboard("Test text");

      expect(writeMock).toHaveBeenCalledTimes(1);
      expect(writeMock).toHaveBeenCalledWith(expect.any(Array));
    });

    test("should complete successfully on successful copy", async () => {
      const writeMock = jest.fn().mockResolvedValue();
      navigator.clipboard.write = writeMock;

      await expect(copyToClipboard("Test text")).resolves.not.toThrow();
    });

    test("should fallback to execCommand when Clipboard API fails", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      navigator.clipboard.write = jest.fn().mockRejectedValue(new Error("Not allowed"));
      document.execCommand = jest.fn().mockReturnValue(true);

      await copyToClipboard("Test text");
      expect(document.execCommand).toHaveBeenCalledWith("copy");

      consoleWarnSpy.mockRestore();
    });
  });

  describe("showDocumentPreviewModal", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
      // Mock window.getSelection
      window.getSelection = jest.fn(() => ({
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      }));
      // Mock document.createRange
      document.createRange = jest.fn(() => ({
        selectNodeContents: jest.fn()
      }));
    });

    test("should display modal with rendered markdown content", () => {
      // Mock marked library
      global.marked = { parse: (md) => `<p>${md}</p>` };

      showDocumentPreviewModal("# Test Content", "Preview Title", "test.md");

      const modal = document.querySelector(".fixed");
      expect(modal).toBeTruthy();
      expect(modal.innerHTML).toContain("Preview Title");
      expect(modal.innerHTML).toContain("Test Content");

      document.querySelector("#close-preview-modal").click();
      delete global.marked;
    });

    test("should fallback to escaped HTML when marked is unavailable", () => {
      delete global.marked;

      showDocumentPreviewModal("Test **content**", "Title", "doc.md");

      const modal = document.querySelector(".fixed");
      expect(modal).toBeTruthy();
      expect(modal.innerHTML).toContain("Test **content**");

      modal.querySelector("#close-modal-btn").click();
    });

    test("should close modal when X button is clicked", () => {
      showDocumentPreviewModal("Content", "Title");

      const closeBtn = document.querySelector("#close-preview-modal");
      expect(closeBtn).toBeTruthy();
      closeBtn.click();

      expect(document.querySelector(".fixed")).toBeNull();
    });

    test("should close modal when Close button is clicked", () => {
      showDocumentPreviewModal("Content", "Title");

      const closeBtn = document.querySelector("#close-modal-btn");
      closeBtn.click();

      expect(document.querySelector(".fixed")).toBeNull();
    });

    test("should close modal when backdrop is clicked", () => {
      showDocumentPreviewModal("Content", "Title");

      const modal = document.querySelector(".fixed");
      const event = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(event, "target", { value: modal, enumerable: true });
      modal.dispatchEvent(event);

      expect(document.querySelector(".fixed")).toBeNull();
    });

    test("should close modal on Escape key", () => {
      showDocumentPreviewModal("Content", "Title");

      const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(escapeEvent);

      expect(document.querySelector(".fixed")).toBeNull();
    });

    test("should copy formatted text when copy button is clicked", async () => {
      document.execCommand = jest.fn().mockReturnValue(true);
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      showDocumentPreviewModal("Content", "Title");

      const copyBtn = document.querySelector("#copy-formatted-btn");
      await copyBtn.click();

      expect(document.execCommand).toHaveBeenCalledWith("copy");
      consoleSpy.mockRestore();
    });

    test("should download markdown file when download button is clicked", () => {
      const mockUrl = "blob:test-url";
      const mockAnchor = { href: "", download: "", click: jest.fn() };
      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;
      const originalCreateElement = document.createElement.bind(document);

      URL.createObjectURL = jest.fn(() => mockUrl);
      URL.revokeObjectURL = jest.fn();
      document.createElement = jest.fn((tag) => {
        if (tag === "a") return mockAnchor;
        return originalCreateElement(tag);
      });

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const onDownload = jest.fn();

      showDocumentPreviewModal("Content", "Title", "test-doc.md", onDownload);

      const downloadBtn = document.querySelector("#download-md-btn");
      downloadBtn.click();

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.download).toBe("test-doc.md");
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
      expect(onDownload).toHaveBeenCalled();

      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      document.createElement = originalCreateElement;
      consoleSpy.mockRestore();
    });

    test("should use marked function directly if marked.parse is unavailable", () => {
      global.marked = (md) => `<strong>${md}</strong>`;

      showDocumentPreviewModal("Bold text", "Title");

      const modal = document.querySelector(".fixed");
      expect(modal.innerHTML).toContain("<strong>");

      modal.querySelector("#close-modal-btn").click();
      delete global.marked;
    });
  });
});
