(() => {
  // js/ui.js
  function initializeTheme() {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }
  function showToast(message, type = "info") {
    console.log(`Toast [${type}]: ${message}`);
  }
  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", isDark);
  }
  function setupThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }
  }

  // js/storage.js
  var DB_NAME = "adr-assistant";
  var DB_VERSION = 1;
  var STORE_NAME = "projects";
  var Storage = class {
    constructor() {
      this.db = null;
    }
    /**
     * Initialize the database
     */
    async init() {
      return new Promise((resolve, reject) => {
        try {
          const request = indexedDB.open(DB_NAME, DB_VERSION);
          request.onerror = () => {
            console.error("IndexedDB open error:", request.error);
            reject(request.error);
          };
          request.onsuccess = () => {
            this.db = request.result;
            console.log("IndexedDB initialized successfully");
            resolve();
          };
          request.onupgradeneeded = (event) => {
            console.log("IndexedDB upgrade needed");
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              const projectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
              projectStore.createIndex("updatedAt", "updatedAt", { unique: false });
              projectStore.createIndex("title", "title", { unique: false });
            }
            if (!db.objectStoreNames.contains("prompts")) {
              db.createObjectStore("prompts", { keyPath: "phase" });
            }
            if (!db.objectStoreNames.contains("settings")) {
              db.createObjectStore("settings", { keyPath: "key" });
            }
          };
        } catch (error) {
          console.error("IndexedDB init error:", error);
          reject(error);
        }
      });
    }
    /**
     * Save a project
     */
    async saveProject(project) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({
          ...project,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    }
    /**
     * Get all projects
     */
    async getAllProjects() {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    }
    /**
     * Get project by ID
     */
    async getProject(id) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    }
    /**
     * Delete project
     */
    async deleteProject(id) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }
    /**
     * Get storage size
     */
    async getStorageSize() {
      if (!navigator.storage || !navigator.storage.estimate) {
        return { usage: 0, quota: 0 };
      }
      return navigator.storage.estimate();
    }
  };
  var storage = new Storage();

  // js/phase3-synthesis.js
  function exportAsMarkdown(adr, filename = "adr.md") {
    const blob = new Blob([adr], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // js/views.js
  function renderPhase1Form(project) {
    return `
    <div class="phase-1-form space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Architecture Decision Record</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Complete the ADR following the GitHub standard template
          </p>
        </div>
        <button id="back-to-list-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          Back
        </button>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <!-- Title -->
        <div>
          <label for="title-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title <span class="text-red-600">*</span>
          </label>
          <input 
            type="text" 
            id="title-input" 
            placeholder="e.g., Use microservices architecture for scalability"
            value="${project.title || ""}"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>

        <!-- Status -->
        <div>
          <label for="status-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status <span class="text-red-600">*</span>
          </label>
          <select 
            id="status-select"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Proposed" ${project.status === "Proposed" ? "selected" : ""}>Proposed</option>
            <option value="Accepted" ${project.status === "Accepted" ? "selected" : ""}>Accepted</option>
            <option value="Deprecated" ${project.status === "Deprecated" ? "selected" : ""}>Deprecated</option>
            <option value="Superseded" ${project.status === "Superseded" ? "selected" : ""}>Superseded</option>
          </select>
        </div>

        <!-- Context -->
        <div>
          <label for="context-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Context <span class="text-red-600">*</span>
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">What circumstances led to this decision?</p>
          <textarea 
            id="context-textarea"
            rows="5"
            placeholder="Include background, constraints, current system state, and why the decision was necessary..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.context || ""}</textarea>
        </div>

        <!-- Decision -->
        <div>
          <label for="decision-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Decision <span class="text-red-600">*</span>
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">What decision have you made? Be specific and actionable.</p>
          <textarea 
            id="decision-textarea"
            rows="5"
            placeholder="Be clear about what is being decided, implementation-focused, and realistic given constraints..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.decision || ""}</textarea>
        </div>

        <!-- Consequences -->
        <div>
          <label for="consequences-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Consequences <span class="text-red-600">*</span>
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">What follows from this decision? Include positive, negative, and impact.</p>
          <textarea 
            id="consequences-textarea"
            rows="5"
            placeholder="Benefits, costs, trade-offs, risks, and effects on the system and team..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.consequences || ""}</textarea>
        </div>

        <!-- Rationale (Optional) -->
        <div>
          <label for="rationale-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rationale <span class="text-gray-500">(Optional)</span>
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Why this decision over alternatives?</p>
          <textarea 
            id="rationale-textarea"
            rows="4"
            placeholder="Comparison with rejected options, technical justification, business alignment, risk mitigation..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.rationale || ""}</textarea>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex gap-3">
          <button id="save-phase1-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            Save
          </button>
          <button id="export-adr-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export as Markdown
          </button>
        </div>
        <button id="delete-project-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Delete
        </button>
      </div>
    </div>
  `;
  }

  // js/keyboard-shortcuts.js
  function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      const isMeta = event.metaKey || event.ctrlKey;
      if (isMeta && event.key === "s") {
        event.preventDefault();
        const saveBtn = document.querySelector("[id*='save']");
        if (saveBtn) {
          saveBtn.click();
        }
      }
      if (isMeta && event.key === "e") {
        event.preventDefault();
        const exportBtn = document.getElementById("export-all-btn");
        if (exportBtn) {
          exportBtn.click();
        }
      }
      if (event.key === "Escape") {
        const privacyNotice = document.getElementById("privacy-notice");
        const closeBtn = document.getElementById("close-privacy-notice");
        if (privacyNotice && !privacyNotice.classList.contains("hidden")) {
          closeBtn?.click();
        }
        const dropdownMenu = document.getElementById("related-projects-menu");
        if (dropdownMenu && !dropdownMenu.classList.contains("hidden")) {
          dropdownMenu.classList.add("hidden");
        }
      }
    });
  }

  // js/app.js
  var App = class {
    constructor() {
      this.currentProject = null;
      this.projects = [];
    }
    async init() {
      try {
        console.log("App initialization started");
        initializeTheme();
        setupThemeToggle();
        console.log("Theme initialized");
        setupKeyboardShortcuts();
        console.log("Keyboard shortcuts configured");
        await this.loadProjects();
        console.log("Projects loaded:", this.projects.length);
        this.setupEventListeners();
        console.log("Event listeners set up");
        await this.renderProjectList();
        console.log("Project list rendered");
        showToast("Application loaded successfully", "success");
      } catch (error) {
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
      const exportBtn = document.getElementById("export-all-btn");
      if (exportBtn) {
        exportBtn.addEventListener("click", () => this.exportAll());
      }
      const importBtn = document.getElementById("import-btn");
      if (importBtn) {
        importBtn.addEventListener("click", () => {
          document.getElementById("import-file-input").click();
        });
      }
      const fileInput = document.getElementById("import-file-input");
      if (fileInput) {
        fileInput.addEventListener("change", (e) => this.importFile(e));
      }
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
          ${this.projects.map((p) => `
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
      const estimate = await storage.getStorageSize();
      const used = (estimate.usage / (1024 * 1024)).toFixed(2);
      const total = (estimate.quota / (1024 * 1024)).toFixed(2);
      const storageInfo = document.getElementById("storage-info");
      if (storageInfo) {
        storageInfo.textContent = `${this.projects.length} ADRs \u2022 ${used}MB used of ${total}MB`;
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
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
      this.setupHandlers();
    }
    setupHandlers() {
      const backBtn = document.getElementById("back-to-list-btn");
      if (backBtn) {
        backBtn.addEventListener("click", () => {
          this.currentProject = null;
          this.renderProjectList();
        });
      }
      const saveBtn = document.getElementById("save-phase1-btn");
      if (saveBtn) {
        saveBtn.addEventListener("click", () => this.saveData());
      }
      const exportBtn = document.getElementById("export-adr-btn");
      if (exportBtn) {
        exportBtn.addEventListener("click", () => this.exportADR());
      }
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
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
      let markdown = `# ${title}

`;
      markdown += `## Status

${status}

`;
      markdown += `## Context

${context}

`;
      markdown += `## Decision

${decision}

`;
      markdown += `## Consequences

${consequences}

`;
      if (rationale) {
        markdown += `## Rationale

${rationale}

`;
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
        exportDate: (/* @__PURE__ */ new Date()).toISOString(),
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
  };
  var app = new App();
  app.init();
  window.app = app;
})();
