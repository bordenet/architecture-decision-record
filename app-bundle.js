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

  // js/workflow.js
  async function loadPrompt(phase) {
    try {
      const response = await fetch(`./prompts/phase${phase}.md`);
      if (!response.ok) throw new Error("Prompt not found");
      return await response.text();
    } catch (error) {
      console.error(`Failed to load phase ${phase} prompt:`, error);
      return `# Phase ${phase} Prompt

Prompt loading failed.`;
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
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Phase 1: Create ADR</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Fill in the ADR form following GitHub standard
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
          <button id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Next: Phase 2
          </button>
        </div>
        <button id="delete-project-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Delete
        </button>
      </div>
    </div>
  `;
  }
  function renderPhase2Form(project) {
    return `
    <div class="phase-2-form space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Phase 2: Review with Claude</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Get adversarial feedback from Claude
          </p>
        </div>
        <button id="back-to-phase1-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          Back
        </button>
      </div>

      <!-- Step 1: Generate Prompt -->
      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step 1: Copy Prompt to Claude
        </h3>
        <button id="generate-phase2-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Generate Prompt for Claude
        </button>
        ${project.phase2Prompt ? `
          <div class="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Prompt:</span>
              <div class="flex gap-2">
                <button id="copy-phase2-prompt-quick-btn" class="text-green-600 dark:text-green-400 hover:underline text-sm font-medium">
                  Copy
                </button>
                <button id="view-phase2-prompt-btn" class="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  View Full
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              ${(project.phase2Prompt || "").substring(0, 200)}...
            </p>
          </div>
        ` : ""}
      </div>

      <!-- Step 2: Paste Response -->
      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step 2: Paste Claude's Response
        </h3>
        <textarea
          id="phase2-response-textarea"
          rows="12"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
          placeholder="Paste Claude's entire critique here..."
        >${project.phase2Review || ""}</textarea>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Paste Claude's full response - the critical feedback on your ADR
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex gap-3">
          <button id="save-phase2-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            Save
          </button>
          <button id="next-phase3-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Next: Phase 3
          </button>
        </div>
        <button id="skip-phase2-btn" class="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          Skip to Phase 3
        </button>
      </div>

      <!-- Prompt Modal -->
      <div id="phase2-prompt-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Phase 2 Prompt</h3>
            <button id="close-phase2-modal-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              X
            </button>
          </div>
          <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">${project.phase2Prompt || "No prompt generated yet"}</pre>
          <div class="mt-4 flex justify-end">
            <button id="copy-phase2-prompt-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  }
  function renderPhase3Form(project) {
    return `
    <div class="phase-3-form space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Phase 3: Final Synthesis</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Synthesize final ADR with Claude
          </p>
        </div>
        <button id="back-to-phase2-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          Back
        </button>
      </div>

      <!-- Step 1: Generate Prompt -->
      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step 1: Copy Synthesis Prompt to Claude
        </h3>
        <button id="generate-phase3-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Generate Synthesis Prompt
        </button>
        ${project.phase3Prompt ? `
          <div class="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Prompt:</span>
              <div class="flex gap-2">
                <button id="copy-phase3-prompt-quick-btn" class="text-green-600 dark:text-green-400 hover:underline text-sm font-medium">
                  Copy
                </button>
                <button id="view-phase3-prompt-btn" class="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  View Full
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              ${(project.phase3Prompt || "").substring(0, 200)}...
            </p>
          </div>
        ` : ""}
      </div>

      <!-- Step 2: Paste Response -->
      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step 2: Paste Claude's Final ADR
        </h3>
        <textarea
          id="phase3-response-textarea"
          rows="16"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
          placeholder="Paste Claude's final synthesized ADR here..."
        >${project.finalADR || ""}</textarea>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Paste Claude's complete final ADR
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex gap-3">
          <button id="save-phase3-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            Save
          </button>
          <button id="export-adr-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Export as Markdown
          </button>
        </div>
        <button id="back-to-list-btn" class="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          Back to Projects
        </button>
      </div>

      <!-- Prompt Modal -->
      <div id="phase3-prompt-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Phase 3 Prompt</h3>
            <button id="close-phase3-modal-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              X
            </button>
          </div>
          <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">${project.phase3Prompt || "No prompt generated yet"}</pre>
          <div class="mt-4 flex justify-end">
            <button id="copy-phase3-prompt-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Copy to Clipboard
            </button>
          </div>
        </div>
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
                Phase ${p.phase || 1} - Updated: ${new Date(p.updatedAt).toLocaleDateString()}
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
        phase: 1,
        phase2Prompt: "",
        phase2Review: "",
        phase3Prompt: "",
        finalADR: "",
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
        this.renderCurrentPhase();
      }
    }
    renderCurrentPhase() {
      const phase = this.currentProject.phase || 1;
      const container = document.getElementById("app-container");
      if (phase === 1) {
        container.innerHTML = renderPhase1Form(this.currentProject);
        this.setupPhase1Handlers();
      } else if (phase === 2) {
        container.innerHTML = renderPhase2Form(this.currentProject);
        this.setupPhase2Handlers();
      } else {
        container.innerHTML = renderPhase3Form(this.currentProject);
        this.setupPhase3Handlers();
      }
    }
    setupPhase1Handlers() {
      const backBtn = document.getElementById("back-to-list-btn");
      if (backBtn) {
        backBtn.addEventListener("click", () => {
          this.currentProject = null;
          this.renderProjectList();
        });
      }
      const saveBtn = document.getElementById("save-phase1-btn");
      if (saveBtn) {
        saveBtn.addEventListener("click", () => this.savePhase1Data());
      }
      const nextBtn = document.getElementById("next-phase-btn");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => this.advanceToPhase2());
      }
      const deleteBtn = document.getElementById("delete-project-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => this.deleteCurrentProject());
      }
    }
    async savePhase1Data() {
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
        showToast("Phase 1 saved successfully", "success");
      } catch (error) {
        console.error("Save failed:", error);
        showToast("Failed to save", "error");
      }
    }
    async advanceToPhase2() {
      const title = document.getElementById("title-input").value.trim();
      const context = document.getElementById("context-textarea").value.trim();
      const decision = document.getElementById("decision-textarea").value.trim();
      const consequences = document.getElementById("consequences-textarea").value.trim();
      if (!title || !context || !decision || !consequences) {
        showToast("Please fill in all required fields first", "error");
        return;
      }
      await this.savePhase1Data();
      this.currentProject.phase = 2;
      await storage.saveProject(this.currentProject);
      this.renderCurrentPhase();
    }
    setupPhase2Handlers() {
      const backBtn = document.getElementById("back-to-phase1-btn");
      if (backBtn) {
        backBtn.addEventListener("click", () => {
          this.currentProject.phase = 1;
          this.renderCurrentPhase();
        });
      }
      const generateBtn = document.getElementById("generate-phase2-prompt-btn");
      if (generateBtn) {
        generateBtn.addEventListener("click", () => this.generatePhase2Prompt());
      }
      const saveBtn = document.getElementById("save-phase2-btn");
      if (saveBtn) {
        saveBtn.addEventListener("click", () => this.savePhase2Data());
      }
      const nextBtn = document.getElementById("next-phase3-btn");
      if (nextBtn) {
        nextBtn.addEventListener("click", async () => {
          await this.savePhase2Data();
          this.currentProject.phase = 3;
          await storage.saveProject(this.currentProject);
          this.renderCurrentPhase();
        });
      }
      const skipBtn = document.getElementById("skip-phase2-btn");
      if (skipBtn) {
        skipBtn.addEventListener("click", async () => {
          this.currentProject.phase = 3;
          await storage.saveProject(this.currentProject);
          this.renderCurrentPhase();
        });
      }
      const viewBtn = document.getElementById("view-phase2-prompt-btn");
      if (viewBtn) {
        viewBtn.addEventListener("click", () => {
          const modal = document.getElementById("phase2-prompt-modal");
          if (modal) modal.classList.remove("hidden");
        });
      }
      const closeBtn = document.getElementById("close-phase2-modal-btn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          const modal = document.getElementById("phase2-prompt-modal");
          if (modal) modal.classList.add("hidden");
        });
      }
      const copyBtn = document.getElementById("copy-phase2-prompt-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
          if (this.currentProject.phase2Prompt) {
            await navigator.clipboard.writeText(this.currentProject.phase2Prompt);
            showToast("Copied to clipboard!", "success");
          }
        });
      }
      const quickCopyBtn = document.getElementById("copy-phase2-prompt-quick-btn");
      if (quickCopyBtn) {
        quickCopyBtn.addEventListener("click", async () => {
          if (this.currentProject.phase2Prompt) {
            await navigator.clipboard.writeText(this.currentProject.phase2Prompt);
            showToast("Copied to clipboard!", "success");
          }
        });
      }
    }
    async generatePhase2Prompt() {
      try {
        let promptTemplate = await loadPrompt(2);
        const adr = `# ${this.currentProject.title}

## Status
${this.currentProject.status}

## Context
${this.currentProject.context}

## Decision
${this.currentProject.decision}

## Consequences
${this.currentProject.consequences}${this.currentProject.rationale ? `

## Rationale
${this.currentProject.rationale}` : ""}`;
        promptTemplate = promptTemplate.replace(/{adr}/g, adr);
        this.currentProject.phase2Prompt = promptTemplate;
        await storage.saveProject(this.currentProject);
        await navigator.clipboard.writeText(promptTemplate);
        showToast("Prompt copied to clipboard! Paste it to Claude", "success");
        this.renderCurrentPhase();
      } catch (error) {
        console.error("Failed to generate prompt:", error);
        showToast("Failed to generate prompt", "error");
      }
    }
    async savePhase2Data() {
      const review = document.getElementById("phase2-response-textarea").value.trim();
      const updatedProject = {
        ...this.currentProject,
        phase2Review: review,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      try {
        await storage.saveProject(updatedProject);
        this.currentProject = updatedProject;
        showToast("Phase 2 saved", "success");
      } catch (error) {
        console.error("Save failed:", error);
        showToast("Failed to save", "error");
      }
    }
    setupPhase3Handlers() {
      const backBtn = document.getElementById("back-to-phase2-btn");
      if (backBtn) {
        backBtn.addEventListener("click", () => {
          this.currentProject.phase = 2;
          this.renderCurrentPhase();
        });
      }
      const generateBtn = document.getElementById("generate-phase3-prompt-btn");
      if (generateBtn) {
        generateBtn.addEventListener("click", () => this.generatePhase3Prompt());
      }
      const saveBtn = document.getElementById("save-phase3-btn");
      if (saveBtn) {
        saveBtn.addEventListener("click", () => this.savePhase3Data());
      }
      const exportBtn = document.getElementById("export-adr-btn");
      if (exportBtn) {
        exportBtn.addEventListener("click", () => this.exportADR());
      }
      const backToListBtn = document.getElementById("back-to-list-btn");
      if (backToListBtn) {
        backToListBtn.addEventListener("click", () => {
          this.currentProject = null;
          this.renderProjectList();
        });
      }
      const viewBtn = document.getElementById("view-phase3-prompt-btn");
      if (viewBtn) {
        viewBtn.addEventListener("click", () => {
          const modal = document.getElementById("phase3-prompt-modal");
          if (modal) modal.classList.remove("hidden");
        });
      }
      const closeBtn = document.getElementById("close-phase3-modal-btn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          const modal = document.getElementById("phase3-prompt-modal");
          if (modal) modal.classList.add("hidden");
        });
      }
      const copyBtn = document.getElementById("copy-phase3-prompt-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
          if (this.currentProject.phase3Prompt) {
            await navigator.clipboard.writeText(this.currentProject.phase3Prompt);
            showToast("Copied to clipboard!", "success");
          }
        });
      }
      const quickCopyBtn = document.getElementById("copy-phase3-prompt-quick-btn");
      if (quickCopyBtn) {
        quickCopyBtn.addEventListener("click", async () => {
          if (this.currentProject.phase3Prompt) {
            await navigator.clipboard.writeText(this.currentProject.phase3Prompt);
            showToast("Copied to clipboard!", "success");
          }
        });
      }
    }
    async generatePhase3Prompt() {
      try {
        let promptTemplate = await loadPrompt(3);
        const adr = `# ${this.currentProject.title}

## Status
${this.currentProject.status}

## Context
${this.currentProject.context}

## Decision
${this.currentProject.decision}

## Consequences
${this.currentProject.consequences}${this.currentProject.rationale ? `

## Rationale
${this.currentProject.rationale}` : ""}`;
        const feedback = this.currentProject.phase2Review || "[No Phase 2 feedback provided]";
        promptTemplate = promptTemplate.replace(/{adr}/g, adr);
        promptTemplate = promptTemplate.replace(/{feedback}/g, feedback);
        this.currentProject.phase3Prompt = promptTemplate;
        await storage.saveProject(this.currentProject);
        await navigator.clipboard.writeText(promptTemplate);
        showToast("Prompt copied to clipboard! Paste it to Claude", "success");
        this.renderCurrentPhase();
      } catch (error) {
        console.error("Failed to generate prompt:", error);
        showToast("Failed to generate prompt", "error");
      }
    }
    async savePhase3Data() {
      const finalADR = document.getElementById("phase3-response-textarea").value.trim();
      const updatedProject = {
        ...this.currentProject,
        finalADR,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      try {
        await storage.saveProject(updatedProject);
        this.currentProject = updatedProject;
        showToast("Phase 3 saved", "success");
      } catch (error) {
        console.error("Save failed:", error);
        showToast("Failed to save", "error");
      }
    }
    async exportADR() {
      const adrContent = document.getElementById("phase3-response-textarea").value.trim();
      if (!adrContent) {
        showToast("Please enter the final ADR content first", "error");
        return;
      }
      try {
        const filename = `${this.currentProject.title.replace(/\s+/g, "-")}.md`;
        exportAsMarkdown(adrContent, filename);
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
