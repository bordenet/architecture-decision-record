"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

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
    localStorage.setItem("darkMode", String(isDark));
  }
  function setupThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }
  }
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  function formatDate(dateString) {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
  function confirm(message, title = "Confirm") {
    return new Promise((resolve) => {
      const modal = document.createElement("div");
      modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${escapeHtml(title)}</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">${escapeHtml(message)}</p>
                <div class="flex justify-end gap-3">
                    <button id="confirm-cancel" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button id="confirm-ok" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Confirm
                    </button>
                </div>
            </div>
        `;
      document.body.appendChild(modal);
      const closeModal = (result) => {
        if (document.body.contains(modal)) document.body.removeChild(modal);
        resolve(result);
      };
      modal.querySelector("#confirm-cancel").addEventListener("click", () => closeModal(false));
      modal.querySelector("#confirm-ok").addEventListener("click", () => closeModal(true));
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal(false);
      });
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", handleEscape);
          closeModal(false);
        }
      };
      document.addEventListener("keydown", handleEscape);
    });
  }
  function showPromptModal(promptText, title = "Full Prompt", onCopySuccess = null) {
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${escapeHtml(title)}</h3>
                <button id="close-prompt-modal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
            </div>
            <div class="overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <pre class="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">${escapeHtml(promptText)}</pre>
            </div>
            <div class="mt-4 flex justify-end gap-2">
                <button id="copy-prompt-modal-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    \u{1F4CB} Copy to Clipboard
                </button>
                <button id="close-prompt-modal-btn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const handleEscape = (e) => {
      if (e.key === "Escape") closeModal();
    };
    const closeModal = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
      document.removeEventListener("keydown", handleEscape);
    };
    modal.querySelector("#close-prompt-modal").addEventListener("click", closeModal);
    modal.querySelector("#close-prompt-modal-btn").addEventListener("click", closeModal);
    modal.querySelector("#copy-prompt-modal-btn").addEventListener("click", async () => {
      try {
        await copyToClipboard(promptText);
        showToast("Prompt copied to clipboard!", "success");
        if (onCopySuccess) onCopySuccess();
      } catch {
        showToast("Failed to copy to clipboard", "error");
      }
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", handleEscape);
  }
  async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
      }
    }
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.setAttribute("contenteditable", "true");
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.style.fontSize = "16px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.setSelectionRange(0, text.length);
    try {
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (!successful) {
        throw new Error("Copy command failed");
      }
    } catch {
      document.body.removeChild(textArea);
      throw new Error("Failed to copy to clipboard");
    }
  }
  function showDocumentPreviewModal(markdown, title = "Your Document is Ready", filename = "document.md", onDownload = null) {
    const renderedHtml = typeof marked !== "undefined" ? marked.parse(markdown) : escapeHtml(markdown).replace(/\n/g, "<br>");
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">${escapeHtml(title)}</h3>
                <button id="close-preview-modal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="flex-1 overflow-auto p-6">
                <div id="preview-content" class="prose prose-sm dark:prose-invert max-w-none
                    prose-headings:text-gray-900 dark:prose-headings:text-white
                    prose-p:text-gray-700 dark:prose-p:text-gray-300
                    prose-strong:text-gray-900 dark:prose-strong:text-white
                    prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                    prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                    prose-li:text-gray-700 dark:prose-li:text-gray-300">
                    ${renderedHtml}
                </div>
            </div>
            <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    \u{1F4A1} <strong>Tip:</strong> Click "Copy Formatted Text", then paste into Word or Google Docs \u2014 the formatting transfers automatically.
                </p>
                <div class="flex flex-wrap justify-end gap-3">
                    <button id="copy-formatted-btn" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        \u{1F4CB} Copy Formatted Text
                    </button>
                    <button id="download-md-btn" class="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        \u{1F4C4} Download .md File
                    </button>
                    <button id="close-modal-btn" class="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const closeModal = () => modal.remove();
    modal.querySelector("#close-preview-modal").addEventListener("click", closeModal);
    modal.querySelector("#close-modal-btn").addEventListener("click", closeModal);
    modal.querySelector("#copy-formatted-btn").addEventListener("click", async () => {
      try {
        const previewContent = modal.querySelector("#preview-content");
        const range = document.createRange();
        range.selectNodeContents(previewContent);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        const successful = document.execCommand("copy");
        selection.removeAllRanges();
        if (successful) {
          showToast("Formatted text copied! Paste into Word or Google Docs.", "success");
        } else {
          await copyToClipboard(markdown);
          showToast("Text copied! Paste into Word or Google Docs.", "success");
        }
      } catch {
        try {
          await copyToClipboard(markdown);
          showToast("Text copied to clipboard.", "success");
        } catch {
          showToast("Failed to copy. Please select and copy manually.", "error");
        }
      }
    });
    modal.querySelector("#download-md-btn").addEventListener("click", () => {
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast("File downloaded!", "success");
      if (onDownload) {
        onDownload();
      }
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  }
  var init_ui = __esm({
    "js/ui.js"() {
      "use strict";
    }
  });

  // js/storage.js
  var DB_NAME, DB_VERSION, STORE_NAME, Storage, storage;
  var init_storage = __esm({
    "js/storage.js"() {
      "use strict";
      DB_NAME = "adr-assistant";
      DB_VERSION = 1;
      STORE_NAME = "projects";
      Storage = class {
        constructor() {
          this.db = null;
        }
        /**
         * Initialize the database
         * @returns {Promise<void>}
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
         * @param {import('./types.js').Project} project - Project to save
         * @returns {Promise<IDBValidKey>}
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
         * @returns {Promise<import('./types.js').Project[]>}
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
         * @param {string} id - Project ID
         * @returns {Promise<import('./types.js').Project | undefined>}
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
         * @param {string} id - Project ID
         * @returns {Promise<void>}
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
         * Get storage size estimate
         * @returns {Promise<import('./types.js').StorageEstimate>}
         */
        async getStorageSize() {
          if (!navigator.storage || !navigator.storage.estimate) {
            return { usage: 0, quota: 0 };
          }
          return navigator.storage.estimate();
        }
        /**
         * Alias for getStorageSize for API consistency
         * @returns {Promise<import('./types.js').StorageEstimate>}
         */
        async getStorageEstimate() {
          return this.getStorageSize();
        }
      };
      storage = new Storage();
    }
  });

  // js/projects.js
  var projects_exports = {};
  __export(projects_exports, {
    createProject: () => createProject,
    deleteProject: () => deleteProject,
    exportAllProjects: () => exportAllProjects,
    exportProject: () => exportProject,
    getAllProjects: () => getAllProjects,
    getProject: () => getProject,
    importProjects: () => importProjects,
    updatePhase: () => updatePhase,
    updateProject: () => updateProject
  });
  async function createProject(title, context, status = "Proposed") {
    const project = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      context: context.trim(),
      status,
      phase: 1,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      phases: {
        1: { prompt: "", response: "", completed: false },
        2: { prompt: "", response: "", completed: false },
        3: { prompt: "", response: "", completed: false }
      }
    };
    await storage.saveProject(project);
    return project;
  }
  async function getAllProjects() {
    return await storage.getAllProjects();
  }
  async function getProject(id) {
    return await storage.getProject(id);
  }
  async function updatePhase(projectId, phase, updates = {}) {
    const project = await storage.getProject(projectId);
    if (!project) throw new Error("Project not found");
    if (!project.phases) project.phases = {};
    if (!project.phases[phase]) {
      project.phases[phase] = { prompt: "", response: "", completed: false };
    }
    if (updates.prompt !== void 0) {
      project.phases[phase].prompt = updates.prompt;
    }
    if (updates.response !== void 0) {
      project.phases[phase].response = updates.response;
    }
    if (updates.completed !== void 0) {
      project.phases[phase].completed = updates.completed;
    }
    project.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await storage.saveProject(project);
    return project;
  }
  async function updateProject(projectId, updates) {
    const project = await storage.getProject(projectId);
    if (!project) throw new Error("Project not found");
    Object.assign(project, updates);
    project.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await storage.saveProject(project);
    return project;
  }
  async function deleteProject(id) {
    await storage.deleteProject(id);
  }
  function sanitizeFilename(filename) {
    return (filename || "untitled").replace(/[^a-z0-9]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase().substring(0, 50);
  }
  async function exportProject(projectId) {
    const project = await storage.getProject(projectId);
    if (!project) throw new Error("Project not found");
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(project.title)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function exportAllProjects() {
    const projects = await storage.getAllProjects();
    const backup = {
      version: "1.0",
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      projectCount: projects.length,
      projects
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adr-backup-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function importProjects(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = JSON.parse(e.target.result);
          let imported = 0;
          if (content.version && content.projects) {
            for (const project of content.projects) {
              await storage.saveProject(project);
              imported++;
            }
          } else if (content.id && content.title) {
            await storage.saveProject(content);
            imported = 1;
          } else {
            throw new Error("Invalid file format");
          }
          resolve(imported);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
  var init_projects = __esm({
    "js/projects.js"() {
      "use strict";
      init_storage();
    }
  });

  // js/workflow.js
  async function loadPromptTemplate(phaseNumber) {
    try {
      const response = await fetch(`prompts/phase${phaseNumber}.md`);
      if (!response.ok) {
        throw new Error(`Failed to load prompt template for phase ${phaseNumber}`);
      }
      return await response.text();
    } catch (error) {
      console.error("Error loading prompt template:", error);
      return "";
    }
  }
  function replaceTemplateVars(template, vars) {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      result = result.replace(regex, value || "[Not provided]");
    }
    return result;
  }
  function getPhaseMetadata(phase) {
    const phases = {
      1: {
        title: "Initial Draft",
        description: "Generate the first draft of your ADR using Claude",
        ai: "Claude",
        icon: "\u{1F4DD}",
        color: "blue"
      },
      2: {
        title: "Alternative Perspective",
        description: "Get a different perspective and improvements from Gemini",
        ai: "Gemini",
        icon: "\u{1F504}",
        color: "green"
      },
      3: {
        title: "Final Synthesis",
        description: "Combine the best elements into a polished final ADR",
        ai: "Claude",
        icon: "\u2728",
        color: "purple"
      }
    };
    return phases[phase] || phases[1];
  }
  async function generatePromptForPhase(project, phaseNumber) {
    const phase = phaseNumber || project.phase || 1;
    const template = await loadPromptTemplate(phase);
    const getPhaseResponse = (phaseNum) => {
      if (project.phases && project.phases[phaseNum]) {
        return project.phases[phaseNum].response || "";
      }
      return "";
    };
    if (phase === 1) {
      const vars = {
        title: project.title || "",
        status: project.status || "Proposed",
        context: project.context || ""
      };
      return replaceTemplateVars(template, vars);
    } else if (phase === 2) {
      const vars = {
        phase1Output: getPhaseResponse(1) || "[No Phase 1 output yet]"
      };
      return replaceTemplateVars(template, vars);
    } else if (phase === 3) {
      const vars = {
        phase1Output: getPhaseResponse(1) || "[No Phase 1 output yet]",
        phase2Output: getPhaseResponse(2) || "[No Phase 2 output yet]"
      };
      return replaceTemplateVars(template, vars);
    }
    return template;
  }
  function getFinalMarkdown(project) {
    if (project.phases && project.phases[3] && project.phases[3].response) {
      return project.phases[3].response;
    } else if (project.phases && project.phases[1] && project.phases[1].response) {
      return project.phases[1].response;
    }
    return null;
  }
  function getExportFilename(project) {
    return `${(project.title || "adr").replace(/[^a-z0-9]/gi, "-").toLowerCase()}-adr.md`;
  }
  var init_workflow = __esm({
    "js/workflow.js"() {
      "use strict";
    }
  });

  // js/views.js
  var views_exports = {};
  __export(views_exports, {
    renderNewProjectForm: () => renderNewProjectForm,
    renderProjectsList: () => renderProjectsList
  });
  async function renderProjectsList() {
    const projects = await getAllProjects();
    const container = document.getElementById("app-container");
    container.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
                My ADRs
            </h2>
            <button id="new-project-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + New ADR
            </button>
        </div>

        ${projects.length === 0 ? `
            <div class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <span class="text-6xl mb-4 block">\u{1F4CB}</span>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No ADRs yet
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first Architecture Decision Record
                </p>
                <button id="new-project-btn-empty" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    + Create Your First ADR
                </button>
            </div>
        ` : `
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                ${projects.map((project) => `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" data-project-id="${project.id}">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-3">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                    ${escapeHtml(project.title || "Untitled ADR")}
                                </h3>
                                <div class="flex items-center space-x-2">
                                    ${project.phases && project.phases[3] && project.phases[3].completed ? `
                                    <button class="preview-project-btn text-gray-400 hover:text-blue-600 transition-colors" data-project-id="${project.id}" title="Preview & Copy">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                    ` : ""}
                                    <button class="delete-project-btn text-gray-400 hover:text-red-600 transition-colors" data-project-id="${project.id}" title="Delete">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="flex items-center space-x-2 mb-2">
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Phase ${project.phase || 1}/3</span>
                                    <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${(project.phase || 1) / 3 * 100}%"></div>
                                    </div>
                                </div>
                                <div class="flex space-x-1">
                                    ${[1, 2, 3].map((phase) => `
                                        <div class="flex-1 h-1 rounded ${project.phases && project.phases[phase] && project.phases[phase].completed ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}"></div>
                                    `).join("")}
                                </div>
                            </div>

                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                ${escapeHtml(project.context || "")}
                            </p>

                            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Updated ${formatDate(project.updatedAt)}</span>
                                <span class="px-2 py-1 rounded text-xs ${project.status === "Accepted" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}">${escapeHtml(project.status || "Proposed")}</span>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `}
    `;
    const newProjectBtns = container.querySelectorAll("#new-project-btn, #new-project-btn-empty");
    newProjectBtns.forEach((btn) => {
      btn.addEventListener("click", () => navigateTo("new-project"));
    });
    const projectCards = container.querySelectorAll("[data-project-id]");
    projectCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (!e.target.closest(".delete-project-btn") && !e.target.closest(".preview-project-btn")) {
          navigateTo("project/" + card.dataset.projectId);
        }
      });
    });
    const previewBtns = container.querySelectorAll(".preview-project-btn");
    previewBtns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const projectId = btn.dataset.projectId;
        const project = projects.find((p) => p.id === projectId);
        if (project) {
          const markdown = getFinalMarkdown(project);
          if (markdown) {
            showDocumentPreviewModal(markdown, "Your ADR is Ready", getExportFilename(project));
          } else {
            showToast("No content to preview", "warning");
          }
        }
      });
    });
    const deleteBtns = container.querySelectorAll(".delete-project-btn");
    deleteBtns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const projectId = btn.dataset.projectId;
        const project = projects.find((p) => p.id === projectId);
        if (await confirm(`Are you sure you want to delete "${project.title}"?`, "Delete ADR")) {
          await deleteProject(projectId);
          showToast("ADR deleted", "success");
          renderProjectsList();
        }
      });
    });
  }
  function renderNewProjectForm(existingProject = null) {
    const isEditing = !!existingProject;
    const container = document.getElementById("app-container");
    container.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <div class="mb-6">
                <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    ${isEditing ? "Back to ADR" : "Back to ADRs"}
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    ${isEditing ? "Edit ADR Details" : "Create New ADR"}
                </h2>
                ${isEditing ? `
                    <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p class="text-sm text-blue-800 dark:text-blue-300">
                            \u{1F4A1} Update your ADR details below. Changes will be saved when you continue to Phase 1.
                        </p>
                    </div>
                ` : ""}

                <form id="new-project-form" class="space-y-6">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            value="${escapeHtml(existingProject?.title || "")}"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Use microservices architecture for scalability"
                        >
                    </div>

                    <div>
                        <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="Proposed" ${(existingProject?.status || "Proposed") === "Proposed" ? "selected" : ""}>Proposed</option>
                            <option value="Accepted" ${existingProject?.status === "Accepted" ? "selected" : ""}>Accepted</option>
                            <option value="Deprecated" ${existingProject?.status === "Deprecated" ? "selected" : ""}>Deprecated</option>
                            <option value="Superseded" ${existingProject?.status === "Superseded" ? "selected" : ""}>Superseded</option>
                        </select>
                    </div>

                    <div>
                        <label for="context" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Context <span class="text-red-500">*</span>
                        </label>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">What circumstances led to this decision? Include background, constraints, and current system state.</p>
                        <textarea
                            id="context"
                            name="context"
                            required
                            rows="6"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Describe the background, constraints, and why this decision was necessary..."
                        >${escapeHtml(existingProject?.context || "")}</textarea>
                    </div>
                </form>
            </div>

            <!-- Footer buttons -->
            <div class="mt-6 flex justify-between items-center">
                <button type="button" id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    ${isEditing ? "Continue to Phase 1 \u2192" : "Create & Start Phase 1 \u2192"}
                </button>
                <button type="button" id="delete-btn" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    ${isEditing ? "Delete" : "Cancel"}
                </button>
            </div>
        </div>
    `;
    const getFormData = () => {
      const form = document.getElementById("new-project-form");
      const formDataObj = new FormData(form);
      return {
        title: formDataObj.get("title"),
        status: formDataObj.get("status"),
        context: formDataObj.get("context")
      };
    };
    const saveProject = async (navigateAfter = false) => {
      const formData = getFormData();
      if (!formData.title || !formData.context) {
        showToast("Please fill in required fields", "error");
        return null;
      }
      if (isEditing) {
        const { updateProject: updateProject2 } = await Promise.resolve().then(() => (init_projects(), projects_exports));
        await updateProject2(existingProject.id, {
          title: formData.title,
          status: formData.status,
          context: formData.context
        });
        showToast("ADR saved!", "success");
        if (navigateAfter) {
          navigateTo("project/" + existingProject.id);
        }
        return existingProject;
      } else {
        const project = await createProject(formData.title, formData.context, formData.status);
        showToast("ADR created!", "success");
        if (navigateAfter) {
          navigateTo("project/" + project.id);
        }
        return project;
      }
    };
    document.getElementById("back-btn").addEventListener("click", () => {
      if (isEditing) {
        navigateTo("project/" + existingProject.id);
      } else {
        navigateTo("home");
      }
    });
    document.getElementById("next-phase-btn").addEventListener("click", async () => {
      await saveProject(true);
    });
    document.getElementById("delete-btn").addEventListener("click", async () => {
      if (isEditing) {
        if (await confirm(`Are you sure you want to delete "${existingProject.title}"?`, "Delete ADR")) {
          await deleteProject(existingProject.id);
          showToast("ADR deleted", "success");
          navigateTo("home");
        }
      } else {
        navigateTo("home");
      }
    });
  }
  var init_views = __esm({
    "js/views.js"() {
      "use strict";
      init_projects();
      init_ui();
      init_router();
      init_workflow();
    }
  });

  // js/project-view.js
  async function renderProjectView(projectId) {
    const project = await getProject(projectId);
    if (!project) {
      showToast("ADR not found", "error");
      navigateTo("home");
      return;
    }
    if (!project.title || !project.context) {
      navigateTo("edit-project/" + projectId);
      return;
    }
    const container = document.getElementById("app-container");
    container.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
            <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to ADRs
            </button>
            ${project.phases && project.phases[3] && project.phases[3].completed ? `
                <button id="export-adr-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    \u{1F4C4} Preview & Copy
                </button>
            ` : ""}
        </div>

        <!-- Phase Tabs -->
        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex space-x-1">
                ${[1, 2, 3].map((phase) => {
      const meta = getPhaseMetadata(phase);
      const isActive = (project.phase || 1) === phase;
      const isCompleted = project.phases && project.phases[phase] && project.phases[phase].completed;
      return `
                        <button
                            class="phase-tab px-6 py-3 font-medium transition-colors ${isActive ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}"
                            data-phase="${phase}"
                        >
                            <span class="mr-2">${meta.icon}</span>
                            Phase ${phase}
                            ${isCompleted ? '<span class="ml-2 text-green-500">\u2713</span>' : ""}
                        </button>
                    `;
    }).join("")}
            </div>
        </div>

        <!-- Phase Content -->
        <div id="phase-content">
            ${renderPhaseContent(project, project.phase || 1)}
        </div>
    `;
    document.getElementById("back-btn").addEventListener("click", () => navigateTo("home"));
    const exportBtn = document.getElementById("export-adr-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const markdown = getFinalMarkdown(project);
        if (markdown) {
          showDocumentPreviewModal(markdown, "Your ADR is Ready", getExportFilename(project));
        } else {
          showToast("No ADR content to export", "warning");
        }
      });
    }
    document.querySelectorAll(".phase-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const phase = parseInt(tab.dataset.phase);
        project.phase = phase;
        updatePhaseTabStyles(phase);
        document.getElementById("phase-content").innerHTML = renderPhaseContent(project, phase);
        attachPhaseEventListeners(project, phase);
      });
    });
    attachPhaseEventListeners(project, project.phase || 1);
  }
  function updatePhaseTabStyles(activePhase) {
    document.querySelectorAll(".phase-tab").forEach((tab) => {
      const tabPhase = parseInt(tab.dataset.phase);
      if (tabPhase === activePhase) {
        tab.classList.remove("text-gray-600", "dark:text-gray-400", "hover:text-gray-900", "dark:hover:text-gray-200");
        tab.classList.add("border-b-2", "border-blue-600", "text-blue-600", "dark:text-blue-400");
      } else {
        tab.classList.remove("border-b-2", "border-blue-600", "text-blue-600", "dark:text-blue-400");
        tab.classList.add("text-gray-600", "dark:text-gray-400", "hover:text-gray-900", "dark:hover:text-gray-200");
      }
    });
  }
  function renderPhaseContent(project, phase) {
    const meta = getPhaseMetadata(phase);
    const phaseData = project.phases && project.phases[phase] ? project.phases[phase] : {};
    const hasPrompt = !!phaseData.prompt;
    const hasResponse = !!(phaseData.response && phaseData.response.trim());
    const aiInfo = phase === 2 ? { name: "Gemini", url: "https://gemini.google.com", color: "green" } : { name: "Claude", url: "https://claude.ai", color: "blue" };
    return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    ${meta.icon} ${meta.title}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-2">${meta.description}</p>
                <div class="inline-flex items-center px-3 py-1 bg-${aiInfo.color}-100 dark:bg-${aiInfo.color}-900/20 text-${aiInfo.color}-800 dark:text-${aiInfo.color}-300 rounded-full text-sm">
                    <span class="mr-2">\u{1F916}</span>
                    Use with ${aiInfo.name}
                </div>
            </div>

            <!-- Step A: Copy Prompt -->
            <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step A: Copy Prompt to AI
                </h4>
                <div class="flex items-center justify-between flex-wrap gap-3">
                    <div class="flex gap-3 flex-wrap">
                        <button id="copy-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            \u{1F4CB} ${hasPrompt ? "Copy Prompt Again" : "Generate & Copy Prompt"}
                        </button>
                        <a
                            id="open-ai-btn"
                            href="${aiInfo.url}"
                            target="ai-assistant-tab"
                            rel="noopener noreferrer"
                            class="px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium ${hasPrompt ? "hover:bg-green-700" : "opacity-50 cursor-not-allowed pointer-events-none"}"
                            ${hasPrompt ? "" : 'aria-disabled="true"'}
                        >
                            \u{1F517} Open ${aiInfo.name}
                        </a>
                    </div>
                    <button id="view-prompt-btn" class="px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium ${hasPrompt ? "" : "hidden"}">
                        \u{1F441}\uFE0F View Prompt
                    </button>
                </div>
            </div>

            <!-- Step B: Paste Response -->
            <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step B: Paste ${aiInfo.name}'s Response
                </h4>
                <textarea
                    id="response-textarea"
                    rows="12"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    placeholder="Paste ${aiInfo.name}'s response here..."
                    ${!hasResponse && !hasPrompt ? "disabled" : ""}
                >${escapeHtml(phaseData.response || "")}</textarea>
                <div class="mt-3 flex justify-between items-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                        ${hasResponse ? "\u2713 Phase completed" : "Paste response to complete this phase"}
                    </span>
                    <button id="save-response-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" ${!hasResponse ? "disabled" : ""}>
                        Save Response
                    </button>
                </div>
            </div>

            ${phase === 3 && hasResponse ? `
                <!-- Phase 3 Complete: Export Call-to-Action -->
                <div class="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div class="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h4 class="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center">
                                <span class="mr-2">\u{1F389}</span> Your ADR is Complete!
                            </h4>
                            <p class="text-green-700 dark:text-green-400 mt-1">
                                <strong>Next step:</strong> Copy this into Word or Google Docs so you can edit and share it.
                            </p>
                        </div>
                        <button id="export-phase-btn" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg">
                            \u{1F4C4} Preview & Copy
                        </button>
                    </div>
                    <!-- Expandable Help Section -->
                    <details class="mt-4">
                        <summary class="text-sm text-green-700 dark:text-green-400 cursor-pointer hover:text-green-800 dark:hover:text-green-300">
                            Need help using your document?
                        </summary>
                        <div class="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                            <ol class="list-decimal list-inside space-y-2">
                                <li>Click <strong>"Preview & Copy"</strong> above to see your formatted document</li>
                                <li>Click <strong>"Copy Formatted Text"</strong> in the preview</li>
                                <li>Open <strong>Microsoft Word</strong> or <strong>Google Docs</strong></li>
                                <li>Paste (Ctrl+V / \u2318V) \u2014 your headings and bullets will appear automatically</li>
                            </ol>
                            <p class="mt-3 text-gray-500 dark:text-gray-400 text-xs">
                                \u{1F4A1} You can also download the raw file (.md format) if needed.
                            </p>
                        </div>
                    </details>
                </div>
            ` : ""}

            <!-- Navigation -->
            <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                <div class="flex gap-3">
                    ${phase === 1 ? `
                        <button id="edit-details-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            \u2190 Edit Details
                        </button>
                    ` : `
                        <button id="prev-phase-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            \u2190 Previous Phase
                        </button>
                    `}
                    ${hasResponse && phase < 3 ? `
                        <button id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Next Phase \u2192
                        </button>
                    ` : ""}
                </div>
                <button id="delete-project-btn" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    Delete
                </button>
            </div>
        </div>
    `;
  }
  function attachPhaseEventListeners(project, phase) {
    const meta = getPhaseMetadata(phase);
    const deleteBtn = document.getElementById("delete-project-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (await confirm(`Are you sure you want to delete "${project.title}"?`, "Delete ADR")) {
          await deleteProject(project.id);
          showToast("ADR deleted", "success");
          navigateTo("home");
        }
      });
    }
    const editDetailsBtn = document.getElementById("edit-details-btn");
    if (editDetailsBtn) {
      editDetailsBtn.addEventListener("click", () => {
        navigateTo("edit-project/" + project.id);
      });
    }
    const prevPhaseBtn = document.getElementById("prev-phase-btn");
    if (prevPhaseBtn) {
      prevPhaseBtn.addEventListener("click", () => {
        project.phase = phase - 1;
        updatePhaseTabStyles(phase - 1);
        document.getElementById("phase-content").innerHTML = renderPhaseContent(project, phase - 1);
        attachPhaseEventListeners(project, phase - 1);
      });
    }
    const nextPhaseBtn = document.getElementById("next-phase-btn");
    if (nextPhaseBtn) {
      nextPhaseBtn.addEventListener("click", () => {
        project.phase = phase + 1;
        updatePhaseTabStyles(phase + 1);
        document.getElementById("phase-content").innerHTML = renderPhaseContent(project, phase + 1);
        attachPhaseEventListeners(project, phase + 1);
      });
    }
    const exportPhaseBtn = document.getElementById("export-phase-btn");
    if (exportPhaseBtn) {
      exportPhaseBtn.addEventListener("click", () => {
        const markdown = getFinalMarkdown(project);
        if (markdown) {
          showDocumentPreviewModal(markdown, "Your ADR is Ready", getExportFilename(project));
        } else {
          showToast("No ADR content to export", "warning");
        }
      });
    }
    const copyPromptBtn = document.getElementById("copy-prompt-btn");
    if (copyPromptBtn) {
      copyPromptBtn.addEventListener("click", async () => {
        try {
          const prompt = await generatePromptForPhase(project, phase);
          if (!project.phases) project.phases = {};
          if (!project.phases[phase]) project.phases[phase] = {};
          project.phases[phase].prompt = prompt;
          await updatePhase(project.id, phase, { prompt });
          await copyToClipboard(prompt);
          showToast("Prompt copied to clipboard!", "success");
          const openAiBtn = document.getElementById("open-ai-btn");
          if (openAiBtn) {
            openAiBtn.classList.remove("opacity-50", "cursor-not-allowed", "pointer-events-none");
            openAiBtn.classList.add("hover:bg-green-700");
            openAiBtn.removeAttribute("aria-disabled");
          }
          const viewPromptBtn2 = document.getElementById("view-prompt-btn");
          if (viewPromptBtn2) {
            viewPromptBtn2.classList.remove("hidden", "opacity-50", "cursor-not-allowed");
            viewPromptBtn2.disabled = false;
          }
          const responseTextarea2 = document.getElementById("response-textarea");
          if (responseTextarea2) {
            responseTextarea2.disabled = false;
          }
        } catch (error) {
          console.error("Error generating prompt:", error);
          showToast("Failed to generate prompt", "error");
        }
      });
    }
    const viewPromptBtn = document.getElementById("view-prompt-btn");
    if (viewPromptBtn) {
      viewPromptBtn.addEventListener("click", () => {
        const phaseData = project.phases && project.phases[phase] ? project.phases[phase] : {};
        if (phaseData.prompt) {
          showPromptModal(phaseData.prompt, `Phase ${phase}: ${meta.title} Prompt`);
        }
      });
    }
    const responseTextarea = document.getElementById("response-textarea");
    const saveResponseBtn = document.getElementById("save-response-btn");
    if (responseTextarea) {
      responseTextarea.addEventListener("input", () => {
        const hasContent = responseTextarea.value.trim().length > 0;
        if (saveResponseBtn) saveResponseBtn.disabled = !hasContent;
      });
    }
    if (saveResponseBtn) {
      saveResponseBtn.addEventListener("click", async () => {
        const response = responseTextarea?.value.trim();
        if (response) {
          if (!project.phases) project.phases = {};
          if (!project.phases[phase]) project.phases[phase] = {};
          project.phases[phase].response = response;
          project.phases[phase].completed = true;
          await updatePhase(project.id, phase, { response, completed: true });
          showToast("Response saved!", "success");
          document.getElementById("phase-content").innerHTML = renderPhaseContent(project, phase);
          attachPhaseEventListeners(project, phase);
          const tab = document.querySelector(`.phase-tab[data-phase="${phase}"]`);
          if (tab && !tab.innerHTML.includes("\u2713")) {
            tab.innerHTML += '<span class="ml-2 text-green-500">\u2713</span>';
          }
        }
      });
    }
  }
  var init_project_view = __esm({
    "js/project-view.js"() {
      "use strict";
      init_projects();
      init_workflow();
      init_ui();
      init_router();
    }
  });

  // js/router.js
  function initRouter() {
    window.addEventListener("popstate", handlePopState);
    const path = window.location.hash.slice(1) || "home";
    navigateTo(path, false);
  }
  function navigateTo(route, pushState = true) {
    const [path, param] = route.split("/");
    if (pushState) {
      window.history.pushState({ route }, "", `#${route}`);
    }
    currentRoute = route;
    renderRoute(path, param);
  }
  function handlePopState(event) {
    const route = event.state?.route || "home";
    navigateTo(route, false);
  }
  async function updateStorageInfo() {
    try {
      const estimate = await storage.getStorageEstimate();
      const projects = await storage.getAllProjects();
      const storageInfo = document.getElementById("storage-info");
      if (storageInfo) {
        if (estimate) {
          const usedMB = (estimate.usage / (1024 * 1024)).toFixed(1);
          const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(0);
          storageInfo.textContent = `${projects.length} ADRs \u2022 ${usedMB}MB used of ${quotaMB}MB`;
        } else {
          storageInfo.textContent = `${projects.length} ADRs stored locally`;
        }
      }
    } catch (error) {
      console.error("Failed to update storage info:", error);
    }
  }
  async function renderRoute(path, param) {
    try {
      switch (path) {
        case "home":
        case "":
          await renderProjectsList();
          break;
        case "new-project":
          renderNewProjectForm();
          break;
        case "edit-project":
          if (param) {
            const project = await storage.getProject(param);
            if (project) {
              const { renderNewProjectForm: renderNewProjectForm2 } = await Promise.resolve().then(() => (init_views(), views_exports));
              renderNewProjectForm2(project);
            } else {
              navigateTo("home");
            }
          } else {
            navigateTo("home");
          }
          break;
        case "project":
          if (param) {
            await renderProjectView(param);
          } else {
            navigateTo("home");
          }
          break;
        default:
          navigateTo("home");
          break;
      }
      await updateStorageInfo();
    } catch (error) {
      console.error("Route rendering error:", error);
      navigateTo("home");
    }
  }
  var currentRoute;
  var init_router = __esm({
    "js/router.js"() {
      "use strict";
      init_views();
      init_project_view();
      init_storage();
      currentRoute = null;
    }
  });

  // js/app.js
  init_ui();
  init_router();

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
  init_storage();
  init_projects();
  var App = class {
    constructor() {
      this.currentProject = null;
      this.projects = [];
    }
    /**
     * Initialize the application
     * @returns {Promise<void>}
     */
    async init() {
      if (typeof document === "undefined" || !document.getElementById) {
        return;
      }
      try {
        console.log("App initialization started");
        initializeTheme();
        setupThemeToggle();
        console.log("Theme initialized");
        setupKeyboardShortcuts();
        console.log("Keyboard shortcuts configured");
        this.setupEventListeners();
        console.log("Event listeners set up");
        initRouter();
        console.log("Router initialized");
        showToast("Application loaded successfully", "success");
      } catch (error) {
        console.error("App initialization error:", error);
        showToast("Failed to initialize application", "error");
      }
    }
    /**
     * Set up global event listeners
     * @returns {void}
     */
    setupEventListeners() {
      if (typeof document === "undefined" || !document.body) {
        return;
      }
      const exportBtn = document.getElementById("export-all-btn");
      if (exportBtn) {
        exportBtn.addEventListener("click", async () => {
          await exportAllProjects();
          showToast("All ADRs exported", "success");
        });
      }
      const importBtn = document.getElementById("import-btn");
      if (importBtn) {
        importBtn.addEventListener("click", () => {
          document.getElementById("import-file-input").click();
        });
      }
      const fileInput = document.getElementById("import-file-input");
      if (fileInput) {
        fileInput.addEventListener("change", async (e) => {
          const file = e.target.files[0];
          if (file) {
            try {
              const count = await importProjects(file);
              showToast(`Imported ${count} ADR(s)`, "success");
              window.location.reload();
            } catch (error) {
              console.error("Import failed:", error);
              showToast("Failed to import ADRs", "error");
            }
          }
          e.target.value = "";
        });
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
      const aboutLink = document.getElementById("about-link");
      if (aboutLink) {
        aboutLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.showAboutModal();
        });
      }
    }
    /**
     * Show about modal with application information
     */
    showAboutModal() {
      const modal = document.createElement("div");
      modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">About ADR Assistant</h3>
        <div class="text-gray-600 dark:text-gray-400 space-y-3">
          <p>A privacy-first tool for creating high-quality Architecture Decision Records using AI assistance.</p>
          <p><strong>Features:</strong></p>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>100% client-side processing</li>
            <li>No data sent to servers</li>
            <li>3-phase AI workflow</li>
            <li>Multiple project management</li>
            <li>Import/export capabilities</li>
          </ul>
          <p class="text-sm">All your data stays in your browser's local storage.</p>
        </div>
        <div class="flex justify-end mt-6">
          <button id="close-about" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    `;
      document.body.appendChild(modal);
      const closeAbout = () => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      };
      modal.querySelector("#close-about").addEventListener("click", closeAbout);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeAbout();
        }
      });
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          closeAbout();
          document.removeEventListener("keydown", handleEscape);
        }
      };
      document.addEventListener("keydown", handleEscape);
    }
  };
  var isTestEnvironment = typeof process !== "undefined" && (process.env?.JEST_WORKER_ID !== void 0 || false);
  var app = null;
  if (!isTestEnvironment && typeof window !== "undefined" && typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        app = new App();
        app.init();
        window.app = app;
      });
    } else {
      app = new App();
      app.init();
      window.app = app;
    }
  }
})();
