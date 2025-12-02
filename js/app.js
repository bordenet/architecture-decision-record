/**
 * Main Application Module
 * Architecture Decision Record Assistant
 */

import { initializeTheme, setupThemeToggle, showToast } from "./ui.js";
import { storage } from "./storage.js";
import { exportAsMarkdown } from "./phase3-synthesis.js";
import { renderPhase1Form } from "./views.js";
import { setupKeyboardShortcuts } from "./keyboard-shortcuts.js";

class App {
  constructor() {
    this.currentProject = null;
    this.projects = [];
  }

  async init() {
    try {
      // eslint-disable-next-line no-console
      console.log("App initialization started");

      // Initialize theme
      initializeTheme();
      setupThemeToggle();
      // eslint-disable-next-line no-console
      console.log("Theme initialized");

      // Setup keyboard shortcuts
      setupKeyboardShortcuts();
      // eslint-disable-next-line no-console
      console.log("Keyboard shortcuts configured");

      // Load projects
      await this.loadProjects();
      // eslint-disable-next-line no-console
      console.log("Projects loaded:", this.projects.length);

      // Setup event listeners
      this.setupEventListeners();
      // eslint-disable-next-line no-console
      console.log("Event listeners set up");

      // Render initial view
      await this.renderProjectList();
      // eslint-disable-next-line no-console
      console.log("Project list rendered");

      showToast("Application loaded successfully", "success");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("App initialization error:", error);
      showToast("Failed to initialize application", "error");
    }
  }

  async loadProjects() {
    try {
      this.projects = await storage.getAllProjects();
    } catch (error) {
      console.error("Failed to load projects:", error);
      showToast("Failed to load projects", "error");
    }
  }

  setupEventListeners() {
    // Theme toggle is handled by ui.js

    // Export all button
    const exportBtn = document.getElementById("export-all-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportAll());
    }

    // Import button
    const importBtn = document.getElementById("import-btn");
    if (importBtn) {
      importBtn.addEventListener("click", () => {
        document.getElementById("import-file-input").click();
      });
    }

    // Import file input
    const fileInput = document.getElementById("import-file-input");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.importFile(e));
    }

    // Related projects dropdown
    const relatedBtn = document.getElementById("related-projects-btn");
    const relatedMenu = document.getElementById("related-projects-menu");
    if (relatedBtn && relatedMenu) {
      relatedBtn.addEventListener("click", () => {
        relatedMenu.classList.toggle("hidden");
      });
      document.addEventListener("click", (e) => {
        if (!relatedBtn.contains(e.target) && !relatedMenu.contains(e.target)) {
          relatedMenu.classList.add("hidden");
        }
      });
    }

    // Privacy notice close
    const closeBtn = document.getElementById("close-privacy-notice");
    const notice = document.getElementById("privacy-notice");
    if (closeBtn && notice) {
      closeBtn.addEventListener("click", () => {
        notice.classList.add("hidden");
        localStorage.setItem("hiddenPrivacyNotice", "true");
      });

      if (localStorage.getItem("hiddenPrivacyNotice")) {
        notice.classList.add("hidden");
      }
    }
  }

  async renderProjectList() {
    const container = document.getElementById("app-container");

    if (this.projects.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400 mb-6">No ADRs yet</p>
          <button id="create-first-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Create Your First ADR
          </button>
        </div>
      `;

      const createBtn = document.getElementById("create-first-btn");
      if (createBtn) {
        createBtn.addEventListener("click", () => this.createNewProject());
      }
    } else {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${this.projects.map(p => `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
                 onclick="app.openProject('${p.id}')">
              <h3 class="font-bold text-lg text-gray-900 dark:text-white truncate">${p.title || "Untitled"}</h3>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                <span class="inline-block px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">${p.status || "Proposed"}</span>
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">${p.context || "No context"}</p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-3">
                Updated: ${new Date(p.updatedAt).toLocaleDateString()}
              </p>
            </div>
          `).join("")}
        </div>
        <button id="new-project-btn" class="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
          + New ADR
        </button>
      `;

      const newBtn = document.getElementById("new-project-btn");
      if (newBtn) {
        newBtn.addEventListener("click", () => this.createNewProject());
      }
    }

    // Update storage info
    const estimate = await storage.getStorageSize();
    const used = (estimate.usage / (1024 * 1024)).toFixed(2);
    const total = (estimate.quota / (1024 * 1024)).toFixed(2);
    const storageInfo = document.getElementById("storage-info");
    if (storageInfo) {
      storageInfo.textContent = `${this.projects.length} ADRs • ${used}MB used of ${total}MB`;
    }
  }

  async createNewProject() {
    const project = {
      id: Date.now().toString(),
      title: "",
      status: "Proposed",
      context: "",
      decision: "",
      consequences: "",
      rationale: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await storage.saveProject(project);
    await this.loadProjects();
    await this.renderProjectList();
    this.openProject(project.id);
  }

  async openProject(id) {
    this.currentProject = await storage.getProject(id);
    if (this.currentProject) {
      await this.renderForm();
    }
  }

  async renderForm() {
    const container = document.getElementById("app-container");
    container.innerHTML = renderPhase1Form(this.currentProject);

    // Attach event listeners
    this.setupHandlers();
  }

  setupHandlers() {
    // Back button
    const backBtn = document.getElementById("back-to-list-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.currentProject = null;
        this.renderProjectList();
      });
    }

    // Save button
    const saveBtn = document.getElementById("save-phase1-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveData());
    }

    // Export button
    const exportBtn = document.getElementById("export-adr-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportADR());
    }

    // Delete button
    const deleteBtn = document.getElementById("delete-project-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => this.deleteCurrentProject());
    }
  }

  async saveData() {
    const title = document.getElementById("title-input").value.trim();
    const status = document.getElementById("status-select").value;
    const context = document.getElementById("context-textarea").value.trim();
    const decision = document.getElementById("decision-textarea").value.trim();
    const consequences = document.getElementById("consequences-textarea").value.trim();
    const rationale = document.getElementById("rationale-textarea").value.trim();

    if (!title || !context || !decision || !consequences) {
      showToast("Title, Context, Decision, and Consequences are required", "error");
      return;
    }

    const updatedProject = {
      ...this.currentProject,
      title,
      status,
      context,
      decision,
      consequences,
      rationale,
      updatedAt: new Date().toISOString()
    };

    try {
      await storage.saveProject(updatedProject);
      this.currentProject = updatedProject;
      showToast("ADR saved successfully", "success");
    } catch (error) {
      console.error("Save failed:", error);
      showToast("Failed to save ADR", "error");
    }
  }

  async exportADR() {
    const title = document.getElementById("title-input").value.trim();
    const status = document.getElementById("status-select").value;
    const context = document.getElementById("context-textarea").value.trim();
    const decision = document.getElementById("decision-textarea").value.trim();
    const consequences = document.getElementById("consequences-textarea").value.trim();
    const rationale = document.getElementById("rationale-textarea").value.trim();

    if (!title || !context || !decision || !consequences) {
      showToast("Please fill in all required fields first", "error");
      return;
    }

    // Build markdown content
    let markdown = `# ${title}\n\n`;
    markdown += `## Status\n\n${status}\n\n`;
    markdown += `## Context\n\n${context}\n\n`;
    markdown += `## Decision\n\n${decision}\n\n`;
    markdown += `## Consequences\n\n${consequences}\n\n`;
    if (rationale) {
      markdown += `## Rationale\n\n${rationale}\n\n`;
    }

    try {
      const filename = `${title.replace(/\s+/g, "-")}.md`;
      exportAsMarkdown(markdown, filename);
      showToast("ADR exported as Markdown", "success");
    } catch (error) {
      console.error("Export failed:", error);
      showToast("Failed to export ADR", "error");
    }
  }

  async deleteCurrentProject() {
    if (!window.confirm("Are you sure you want to delete this ADR?")) {
      return;
    }

    try {
      await storage.deleteProject(this.currentProject.id);
      showToast("ADR deleted", "success");
      await this.loadProjects();
      await this.renderProjectList();
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("Failed to delete ADR", "error");
    }
  }

  async exportAll() {
    const data = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      projects: this.projects
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adr-projects-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`Exported ${this.projects.length} ADRs`, "success");
  }

  async importFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const content = await file.text();
      const data = JSON.parse(content);

      if (Array.isArray(data.projects)) {
        for (const project of data.projects) {
          await storage.saveProject(project);
        }
        await this.loadProjects();
        await this.renderProjectList();
        showToast(`Imported ${data.projects.length} ADRs`, "success");
      }
    } catch (error) {
      console.error("Import failed:", error);
      showToast("Failed to import ADRs", "error");
    }

    event.target.value = "";
  }
}

const app = new App();
app.init();
window.app = app;

export { App, app };
