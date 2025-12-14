/**
 * Main Application Module
 * Architecture Decision Record Assistant with 3-phase workflow
 */

import { initializeTheme, setupThemeToggle, showToast } from "./ui.js";
import { loadPrompt } from "./workflow.js";
import { storage } from "./storage.js";
import { exportAsMarkdown } from "./phase3-synthesis.js";
import { renderPhase1Form, renderPhase2Form, renderPhase3Form } from "./views.js";
import { setupKeyboardShortcuts } from "./keyboard-shortcuts.js";

class App {
  constructor() {
    this.currentProject = null;
    this.projects = [];
  }

  async init() {
    // Guard against test environment without proper DOM
    if (typeof document === "undefined" || !document.getElementById) {
      return;
    }

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
    // Guard against test environment without proper DOM
    if (typeof document === "undefined" || !document.body) {
      return;
    }

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

    container.innerHTML = `
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          My ADRs
        </h2>
        <button id="new-project-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          + New ADR
        </button>
      </div>

      ${this.projects.length === 0 ? `
        <div class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <span class="text-6xl mb-4 block">🏗️</span>
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
          ${this.projects.map(p => {
    const phase = p.phase || 1;
    const completedPhases = this.countCompletedPhases(p);
    return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" data-project-id="${p.id}">
              <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    ${this.escapeHtml(p.title || p.name) || "Untitled"}
                  </h3>
                  <button class="delete-project-btn text-gray-400 hover:text-red-600 transition-colors" data-project-id="${p.id}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>

                <div class="mb-4">
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Phase ${phase}/3</span>
                    <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${(phase / 3) * 100}%"></div>
                    </div>
                  </div>
                  <div class="flex space-x-1">
                    ${[1, 2, 3].map(phaseNum => `
                      <div class="flex-1 h-1 rounded ${phaseNum <= completedPhases ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}"></div>
                    `).join("")}
                  </div>
                </div>

                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  ${this.escapeHtml(p.context) || "No context"}
                </p>

                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Updated ${this.formatDate(p.updatedAt)}</span>
                  <span>${completedPhases}/3 complete</span>
                </div>
              </div>
            </div>
            `;
  }).join("")}
        </div>
      `}
    `;

    // Add event listeners for new project buttons
    const newProjectBtns = container.querySelectorAll("#new-project-btn, #new-project-btn-empty");
    newProjectBtns.forEach(btn => {
      btn.addEventListener("click", () => this.createNewProject());
    });

    // Add event listeners for project cards
    const projectCards = container.querySelectorAll("[data-project-id]");
    projectCards.forEach(card => {
      card.addEventListener("click", (e) => {
        if (!e.target.closest(".delete-project-btn")) {
          this.openProject(card.dataset.projectId);
        }
      });
    });

    // Add event listeners for delete buttons
    const deleteBtns = container.querySelectorAll(".delete-project-btn");
    deleteBtns.forEach(btn => {
      btn.addEventListener("click", async(e) => {
        e.stopPropagation();
        const projectId = btn.dataset.projectId;
        await this.deleteProject(projectId);
      });
    });

    // Update footer stats
    await this.updateStorageInfo();
  }

  /**
   * Update footer storage info - called after every route/view change
   */
  async updateStorageInfo() {
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
      phase: 1,
      phase2Prompt: "",
      phase2Review: "",
      phase3Prompt: "",
      finalADR: "",
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
      this.renderCurrentPhase();
    }
  }

  async renderCurrentPhase() {
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

    // Update footer stats after every view render
    await this.updateStorageInfo();
  }

  setupPhase1Handlers() {
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
      saveBtn.addEventListener("click", () => this.savePhase1Data());
    }

    // Next phase button
    const nextBtn = document.getElementById("next-phase-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.advanceToPhase2());
    }

    // Delete button
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
      updatedAt: new Date().toISOString()
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

    // Save current data
    await this.savePhase1Data();

    // Advance to Phase 2
    this.currentProject.phase = 2;
    await storage.saveProject(this.currentProject);

    // Render Phase 2
    this.renderCurrentPhase();
  }

  setupPhase2Handlers() {
    // Back button
    const backBtn = document.getElementById("back-to-phase1-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.currentProject.phase = 1;
        this.renderCurrentPhase();
      });
    }

    // Generate prompt button
    const generateBtn = document.getElementById("generate-phase2-prompt-btn");
    if (generateBtn) {
      generateBtn.addEventListener("click", () => this.generatePhase2Prompt());
    }

    // Response textarea - update button state as user types
    const responseTextarea = document.getElementById("phase2-response-textarea");
    const saveBtn = document.getElementById("save-phase2-btn");
    const nextBtn = document.getElementById("next-phase3-btn");

    if (responseTextarea && saveBtn) {
      responseTextarea.addEventListener("input", () => {
        const hasEnoughContent = responseTextarea.value.trim().length >= 3;
        saveBtn.disabled = !hasEnoughContent;
        if (nextBtn) {
          nextBtn.disabled = !hasEnoughContent;
          if (hasEnoughContent) {
            nextBtn.classList.remove("opacity-50", "cursor-not-allowed");
          } else {
            nextBtn.classList.add("opacity-50", "cursor-not-allowed");
          }
        }
      });

      saveBtn.addEventListener("click", () => this.savePhase2Data());
    }

    // Next phase button (auto-advance is already handled by savePhase2Data)
    if (nextBtn) {
      nextBtn.addEventListener("click", async() => {
        await this.savePhase2Data();
      });
    }

    // Skip button
    const skipBtn = document.getElementById("skip-phase2-btn");
    if (skipBtn) {
      skipBtn.addEventListener("click", async() => {
        this.currentProject.phase = 3;
        await storage.saveProject(this.currentProject);
        this.renderCurrentPhase();
      });
    }

    // View prompt button
    const viewBtn = document.getElementById("view-phase2-prompt-btn");
    if (viewBtn) {
      viewBtn.addEventListener("click", () => {
        const modal = document.getElementById("phase2-prompt-modal");
        if (modal) modal.classList.remove("hidden");
      });
    }

    // Close modal button
    const closeBtn = document.getElementById("close-phase2-modal-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        const modal = document.getElementById("phase2-prompt-modal");
        if (modal) modal.classList.add("hidden");
      });
    }

    // Copy prompt button (from modal)
    const copyBtn = document.getElementById("copy-phase2-prompt-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", async() => {
        if (this.currentProject.phase2Prompt) {
          await navigator.clipboard.writeText(this.currentProject.phase2Prompt);
          showToast("Copied to clipboard!", "success");
        }
      });
    }

    // Quick copy button (from preview)
    const quickCopyBtn = document.getElementById("copy-phase2-prompt-quick-btn");
    if (quickCopyBtn) {
      quickCopyBtn.addEventListener("click", async() => {
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

      // Build complete ADR from Phase 1 data
      const phase1Output = `# ${this.currentProject.title}\n\n## Status\n${this.currentProject.status}\n\n## Context\n${this.currentProject.context}\n\n## Decision\n${this.currentProject.decision}\n\n## Consequences\n${this.currentProject.consequences}${this.currentProject.rationale ? `\n\n## Rationale\n${this.currentProject.rationale}` : ""}`;

      promptTemplate = promptTemplate.replace(/{phase1_output}/g, phase1Output);

      this.currentProject.phase2Prompt = promptTemplate;
      await storage.saveProject(this.currentProject);

      // Copy to clipboard
      await navigator.clipboard.writeText(promptTemplate);
      showToast("Prompt copied to clipboard! Paste it to Claude", "success");

      // Enable the "Open AI" button now that prompt is copied
      const openAiBtn = document.getElementById("open-ai-phase2-btn");
      if (openAiBtn) {
        openAiBtn.classList.remove("opacity-50", "cursor-not-allowed", "pointer-events-none");
        openAiBtn.classList.add("hover:bg-green-700");
        openAiBtn.removeAttribute("aria-disabled");
      }

      // Enable the response textarea now that prompt is copied
      const responseTextarea = document.getElementById("phase2-response-textarea");
      if (responseTextarea) {
        responseTextarea.disabled = false;
        responseTextarea.classList.remove("opacity-50", "cursor-not-allowed");
        responseTextarea.focus();
      }

      // Re-render to show prompt preview (but don't lose textarea state)
      this.renderCurrentPhase();
    } catch (error) {
      console.error("Failed to generate prompt:", error);
      showToast("Failed to generate prompt", "error");
    }
  }

  async savePhase2Data() {
    const review = document.getElementById("phase2-response-textarea").value.trim();

    if (!review || review.length < 3) {
      showToast("Please enter at least 3 characters", "warning");
      return;
    }

    const updatedProject = {
      ...this.currentProject,
      phase2Review: review,
      updatedAt: new Date().toISOString()
    };

    try {
      await storage.saveProject(updatedProject);
      this.currentProject = updatedProject;

      // Auto-advance to Phase 3
      showToast("Response saved! Moving to Phase 3...", "success");
      this.currentProject.phase = 3;
      await storage.saveProject(this.currentProject);
      this.renderCurrentPhase();
    } catch (error) {
      console.error("Save failed:", error);
      showToast("Failed to save", "error");
    }
  }

  setupPhase3Handlers() {
    // Back button
    const backBtn = document.getElementById("back-to-phase2-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.currentProject.phase = 2;
        this.renderCurrentPhase();
      });
    }

    // Generate prompt button
    const generateBtn = document.getElementById("generate-phase3-prompt-btn");
    if (generateBtn) {
      generateBtn.addEventListener("click", () => this.generatePhase3Prompt());
    }

    // Response textarea - update button state as user types
    const responseTextarea = document.getElementById("phase3-response-textarea");
    const saveBtn = document.getElementById("save-phase3-btn");
    const exportBtn = document.getElementById("export-adr-btn");

    if (responseTextarea && saveBtn) {
      responseTextarea.addEventListener("input", () => {
        const hasEnoughContent = responseTextarea.value.trim().length >= 3;
        saveBtn.disabled = !hasEnoughContent;
        if (exportBtn) {
          exportBtn.disabled = !hasEnoughContent;
          if (hasEnoughContent) {
            exportBtn.classList.remove("opacity-50", "cursor-not-allowed");
          } else {
            exportBtn.classList.add("opacity-50", "cursor-not-allowed");
          }
        }
      });

      saveBtn.addEventListener("click", () => this.savePhase3Data());
    }

    // Export button
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportADR());
    }

    // Back to list button
    const backToListBtn = document.getElementById("back-to-list-btn");
    if (backToListBtn) {
      backToListBtn.addEventListener("click", () => {
        this.currentProject = null;
        this.renderProjectList();
      });
    }

    // View prompt button
    const viewBtn = document.getElementById("view-phase3-prompt-btn");
    if (viewBtn) {
      viewBtn.addEventListener("click", () => {
        const modal = document.getElementById("phase3-prompt-modal");
        if (modal) modal.classList.remove("hidden");
      });
    }

    // Close modal button
    const closeBtn = document.getElementById("close-phase3-modal-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        const modal = document.getElementById("phase3-prompt-modal");
        if (modal) modal.classList.add("hidden");
      });
    }

    // Copy prompt button (from modal)
    const copyBtn = document.getElementById("copy-phase3-prompt-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", async() => {
        if (this.currentProject.phase3Prompt) {
          await navigator.clipboard.writeText(this.currentProject.phase3Prompt);
          showToast("Copied to clipboard!", "success");
        }
      });
    }

    // Quick copy button (from preview)
    const quickCopyBtn = document.getElementById("copy-phase3-prompt-quick-btn");
    if (quickCopyBtn) {
      quickCopyBtn.addEventListener("click", async() => {
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

      // Build complete ADR from Phase 1 data
      const phase1Output = `# ${this.currentProject.title}\n\n## Status\n${this.currentProject.status}\n\n## Context\n${this.currentProject.context}\n\n## Decision\n${this.currentProject.decision}\n\n## Consequences\n${this.currentProject.consequences}${this.currentProject.rationale ? `\n\n## Rationale\n${this.currentProject.rationale}` : ""}`;

      const phase2Review = this.currentProject.phase2Review || "[No Phase 2 feedback provided]";

      promptTemplate = promptTemplate.replace(/{phase1_output}/g, phase1Output);
      promptTemplate = promptTemplate.replace(/{phase2_review}/g, phase2Review);

      this.currentProject.phase3Prompt = promptTemplate;
      await storage.saveProject(this.currentProject);

      // Copy to clipboard
      await navigator.clipboard.writeText(promptTemplate);
      showToast("Prompt copied to clipboard! Paste it to Claude", "success");

      // Enable the "Open AI" button now that prompt is copied
      const openAiBtn = document.getElementById("open-ai-phase3-btn");
      if (openAiBtn) {
        openAiBtn.classList.remove("opacity-50", "cursor-not-allowed", "pointer-events-none");
        openAiBtn.classList.add("hover:bg-green-700");
        openAiBtn.removeAttribute("aria-disabled");
      }

      // Enable the response textarea now that prompt is copied
      const responseTextarea = document.getElementById("phase3-response-textarea");
      if (responseTextarea) {
        responseTextarea.disabled = false;
        responseTextarea.classList.remove("opacity-50", "cursor-not-allowed");
        responseTextarea.focus();
      }

      // Re-render to show prompt preview
      this.renderCurrentPhase();
    } catch (error) {
      console.error("Failed to generate prompt:", error);
      showToast("Failed to generate prompt", "error");
    }
  }

  /**
   * Extract title from markdown content (looks for # Title at the beginning)
   * @param {string} markdown - The markdown content
   * @returns {string|null} - The extracted title or null if not found
   */
  extractTitleFromMarkdown(markdown) {
    if (!markdown) return null;

    // Look for first H1 heading (# Title)
    const match = markdown.match(/^#\s+(.+?)$/m);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  }

  async savePhase3Data() {
    const finalADR = document.getElementById("phase3-response-textarea").value.trim();

    if (!finalADR || finalADR.length < 3) {
      showToast("Please enter at least 3 characters", "warning");
      return;
    }

    // Extract title from markdown if present
    const extractedTitle = this.extractTitleFromMarkdown(finalADR);

    const updatedProject = {
      ...this.currentProject,
      finalADR,
      updatedAt: new Date().toISOString()
    };

    // Update title if we extracted one and it's different
    if (extractedTitle && extractedTitle !== this.currentProject.title) {
      updatedProject.title = extractedTitle;
      updatedProject.name = extractedTitle; // Legacy compatibility
    }

    try {
      await storage.saveProject(updatedProject);
      this.currentProject = updatedProject;

      if (extractedTitle && extractedTitle !== this.currentProject.title) {
        showToast(`ADR saved! Title updated to "${extractedTitle}"`, "success");
      } else {
        showToast("Phase 3 complete! Your ADR is ready for export.", "success");
      }

      // Re-render to update UI with new title and enable export
      this.renderCurrentPhase();
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

  /**
   * Delete a project by ID (called from project list)
   * @param {string} projectId - Project ID to delete
   */
  async deleteProject(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    const title = project?.title || project?.name || "Untitled";

    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await storage.deleteProject(projectId);
      showToast("ADR deleted", "success");
      await this.loadProjects();
      await this.renderProjectList();
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("Failed to delete ADR", "error");
    }
  }

  /**
   * Count completed phases for a project
   * @param {Object} project - Project object
   * @returns {number} Number of completed phases
   */
  countCompletedPhases(project) {
    let count = 0;
    // Phase 1 is complete if we have title and context
    if (project.title && project.context) count++;
    // Phase 2 is complete if we have review content
    if (project.phase2Review) count++;
    // Phase 3 is complete if we have final ADR
    if (project.finalADR) count++;
    return count;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Format date for display
   * @param {string} dateStr - ISO date string
   * @returns {string} Formatted date string
   */
  formatDate(dateStr) {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}

// Only initialize if running in real browser (not Jest JSDOM)
// Check for Jest by looking for process.env.JEST_WORKER_ID or typical test indicators
const isTestEnvironment = typeof process !== "undefined" &&
  (process.env?.JEST_WORKER_ID !== undefined || process.env?.NODE_ENV === "test");

let app = null;
if (!isTestEnvironment && typeof window !== "undefined" && typeof document !== "undefined") {
  // Use DOMContentLoaded to ensure DOM is ready
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

export { App, app };
