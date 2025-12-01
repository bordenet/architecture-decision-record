/**
 * Main Application Module
 * Architecture Decision Record Assistant
 */

const { initializeTheme, showToast } = require("./ui.js");
const { storage } = require("./storage.js");

class App {
  constructor() {
    this.currentProject = null;
    this.projects = [];
  }

  async init() {
    // Initialize theme
    initializeTheme();

    // Load projects
    await this.loadProjects();

    // Setup event listeners
    this.setupEventListeners();

    // Render initial view
    await this.renderProjectList();

    showToast("Application loaded successfully", "success");
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
          <p class="text-gray-500 dark:text-gray-400 mb-6">No projects yet</p>
          <button id="create-first-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Create Your First Project
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
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">${p.context || "No context"}</p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-3">
                Updated: ${new Date(p.updatedAt).toLocaleDateString()}
              </p>
            </div>
          `).join("")}
        </div>
        <button id="new-project-btn" class="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
          + New Project
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
      storageInfo.textContent = `${this.projects.length} projects • ${used}MB used of ${total}MB`;
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
      updatedAt: new Date().toISOString(),
      phase: 1
    };

    await storage.saveProject(project);
    await this.loadProjects();
    await this.renderProjectList();
    this.openProject(project.id);
  }

  async openProject(id) {
    this.currentProject = await storage.getProject(id);
    if (this.currentProject) {
      // TODO: Render project editor
      showToast(`Opened: ${this.currentProject.title}`, "success");
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

    showToast(`Exported ${this.projects.length} projects`, "success");
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
        showToast(`Imported ${data.projects.length} projects`, "success");
      }
    } catch (error) {
      console.error("Import failed:", error);
      showToast("Failed to import projects", "error");
    }

    event.target.value = "";
  }
}

const app = new App();
app.init();
window.app = app;

module.exports = { App, app };
