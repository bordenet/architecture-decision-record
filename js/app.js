/**
 * Main Application Module
 * Architecture Decision Record Assistant with 3-phase workflow
 */

import { initializeTheme, setupThemeToggle, showToast, copyToClipboard } from './ui.js';
import { loadPrompt } from './workflow.js';
import { storage } from './storage.js';
import { exportAsMarkdown } from './phase3-synthesis.js';
import { renderFormEntry, renderPhase1Form, renderPhase2Form, renderPhase3Form } from './views.js';
import { setupKeyboardShortcuts } from './keyboard-shortcuts.js';

class App {
  constructor() {
    this.currentProject = null;
    this.projects = [];
  }

  async init() {
    // Guard against test environment without proper DOM
    if (typeof document === 'undefined' || !document.getElementById) {
      return;
    }

    try {
      // eslint-disable-next-line no-console
      console.log('App initialization started');

      // Initialize theme
      initializeTheme();
      setupThemeToggle();
      // eslint-disable-next-line no-console
      console.log('Theme initialized');

      // Setup keyboard shortcuts
      setupKeyboardShortcuts();
      // eslint-disable-next-line no-console
      console.log('Keyboard shortcuts configured');

      // Load projects
      await this.loadProjects();
      // eslint-disable-next-line no-console
      console.log('Projects loaded:', this.projects.length);

      // Setup event listeners
      this.setupEventListeners();
      // eslint-disable-next-line no-console
      console.log('Event listeners set up');

      // Render initial view
      await this.renderProjectList();
      // eslint-disable-next-line no-console
      console.log('Project list rendered');

      showToast('Application loaded successfully', 'success');
    } catch (error) {
       
      console.error('App initialization error:', error);
      showToast('Failed to initialize application', 'error');
    }
  }

  async loadProjects() {
    try {
      this.projects = await storage.getAllProjects();
    } catch (error) {
      console.error('Failed to load projects:', error);
      showToast('Failed to load projects', 'error');
    }
  }

  setupEventListeners() {
    // Guard against test environment without proper DOM
    if (typeof document === 'undefined' || !document.body) {
      return;
    }

    // Theme toggle is handled by ui.js

    // Export all button
    const exportBtn = document.getElementById('export-all-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportAll());
    }

    // Import button
    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        document.getElementById('import-file-input').click();
      });
    }

    // Import file input
    const fileInput = document.getElementById('import-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.importFile(e));
    }

    // Related projects dropdown
    const relatedBtn = document.getElementById('related-projects-btn');
    const relatedMenu = document.getElementById('related-projects-menu');
    if (relatedBtn && relatedMenu) {
      relatedBtn.addEventListener('click', () => {
        relatedMenu.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!relatedBtn.contains(e.target) && !relatedMenu.contains(e.target)) {
          relatedMenu.classList.add('hidden');
        }
      });
    }

    // Privacy notice close
    const closeBtn = document.getElementById('close-privacy-notice');
    const notice = document.getElementById('privacy-notice');
    if (closeBtn && notice) {
      closeBtn.addEventListener('click', () => {
        notice.classList.add('hidden');
        localStorage.setItem('hiddenPrivacyNotice', 'true');
      });

      if (localStorage.getItem('hiddenPrivacyNotice')) {
        notice.classList.add('hidden');
      }
    }

    // About link
    const aboutLink = document.getElementById('about-link');
    if (aboutLink) {
      aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showAboutModal();
      });
    }
  }

  /**
   * Show about modal with application information
   */
  showAboutModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
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

    modal.querySelector('#close-about').addEventListener('click', closeAbout);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAbout();
      }
    });

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeAbout();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  async renderProjectList() {
    const container = document.getElementById('app-container');

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
                    ${this.escapeHtml(p.title || p.name) || 'Untitled'}
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
                      <div class="flex-1 h-1 rounded ${phaseNum <= completedPhases ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}"></div>
                    `).join('')}
                  </div>
                </div>

                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  ${this.escapeHtml(p.context) || 'No context'}
                </p>

                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Updated ${this.formatDate(p.updatedAt)}</span>
                  <span>${completedPhases}/3 complete</span>
                </div>
              </div>
            </div>
            `;
  }).join('')}
        </div>
      `}
    `;

    // Add event listeners for new project buttons
    const newProjectBtns = container.querySelectorAll('#new-project-btn, #new-project-btn-empty');
    newProjectBtns.forEach(btn => {
      btn.addEventListener('click', () => this.createNewProject());
    });

    // Add event listeners for project cards
    const projectCards = container.querySelectorAll('[data-project-id]');
    projectCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-project-btn')) {
          this.openProject(card.dataset.projectId);
        }
      });
    });

    // Add event listeners for delete buttons
    const deleteBtns = container.querySelectorAll('.delete-project-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', async(e) => {
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
    const storageInfo = document.getElementById('storage-info');
    if (storageInfo) {
      storageInfo.textContent = `${this.projects.length} ADRs • ${used}MB used of ${total}MB`;
    }
  }

  async createNewProject() {
    const project = {
      id: Date.now().toString(),
      title: '',
      status: 'Proposed',
      context: '',
      // Phase 0 is form entry, phases 1-3 are AI round-trips
      phase: 0,
      // Phase 1: Claude initial draft
      phase1Prompt: '',
      phase1Response: '',
      // Phase 2: Gemini review
      phase2Prompt: '',
      phase2Review: '',
      // Phase 3: Claude synthesis
      phase3Prompt: '',
      finalADR: '',
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
    const phase = this.currentProject.phase || 0;
    const container = document.getElementById('app-container');

    if (phase === 0) {
      // Form entry (before AI workflow)
      container.innerHTML = renderFormEntry(this.currentProject);
      this.setupFormEntryHandlers();
    } else if (phase === 1) {
      container.innerHTML = renderPhase1Form(this.currentProject);
      this.setupPhase1Handlers();
    } else if (phase === 2) {
      container.innerHTML = renderPhase2Form(this.currentProject);
      this.setupPhase2Handlers();
    } else {
      container.innerHTML = renderPhase3Form(this.currentProject);
      this.setupPhase3Handlers();
    }

    // Setup phase tab handlers (shared across phases 1-3)
    if (phase >= 1) {
      this.setupPhaseTabHandlers();
    }

    // Update footer stats after every view render
    await this.updateStorageInfo();
  }

  /**
   * Setup shared phase handlers - back button and export button
   * Phase tabs are now display-only (no click navigation)
   */
  setupPhaseTabHandlers() {
    // Back to list button (appears in phase tabs header)
    const backBtn = document.getElementById('back-to-list-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.currentProject = null;
        this.renderProjectList();
      });
    }

    // Top export button (appears when phase 3 is complete)
    const exportTopBtn = document.getElementById('export-adr-top-btn');
    if (exportTopBtn) {
      exportTopBtn.addEventListener('click', () => this.exportADR());
    }
  }

  /**
   * Setup form entry handlers (phase 0 - before AI workflow)
   */
  setupFormEntryHandlers() {
    // Back to list button
    const backBtn = document.getElementById('back-to-list-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.currentProject = null;
        this.renderProjectList();
      });
    }

    // Save button
    const saveBtn = document.getElementById('save-form-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveFormData());
    }

    // Start workflow button
    const startBtn = document.getElementById('start-workflow-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startAIWorkflow());
    }

    // Delete button
    const deleteBtn = document.getElementById('delete-project-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteCurrentProject());
    }

    // Form validation - enable/disable buttons based on required fields
    const titleInput = document.getElementById('title-input');
    const contextTextarea = document.getElementById('context-textarea');

    const updateButtonStates = () => {
      const hasTitle = titleInput && titleInput.value.trim().length > 0;
      const hasContext = contextTextarea && contextTextarea.value.trim().length > 0;
      const isValid = hasTitle && hasContext;

      if (saveBtn) saveBtn.disabled = !isValid;
      if (startBtn) startBtn.disabled = !isValid;
    };

    if (titleInput) {
      titleInput.addEventListener('input', updateButtonStates);
    }
    if (contextTextarea) {
      contextTextarea.addEventListener('input', updateButtonStates);
    }
  }

  /**
   * Save form data (phase 0)
   */
  async saveFormData() {
    const title = document.getElementById('title-input').value.trim();
    const status = document.getElementById('status-select').value;
    const context = document.getElementById('context-textarea').value.trim();

    if (!title || !context) {
      showToast('Title and Context are required', 'error');
      return;
    }

    const updatedProject = {
      ...this.currentProject,
      title,
      status,
      context,
      updatedAt: new Date().toISOString()
    };

    try {
      await storage.saveProject(updatedProject);
      this.currentProject = updatedProject;
      showToast('Saved successfully', 'success');
    } catch (error) {
      console.error('Save failed:', error);
      showToast('Failed to save', 'error');
    }
  }

  /**
   * Start AI workflow - advance from form entry to Phase 1
   */
  async startAIWorkflow() {
    const title = document.getElementById('title-input').value.trim();
    const context = document.getElementById('context-textarea').value.trim();

    if (!title || !context) {
      showToast('Please fill in Title and Context first', 'error');
      return;
    }

    // Save form data first
    await this.saveFormData();

    // Advance to Phase 1 (AI workflow)
    this.currentProject.phase = 1;
    await storage.saveProject(this.currentProject);

    // Render Phase 1
    this.renderCurrentPhase();
  }

  /**
   * Setup Phase 1 handlers (Claude initial draft - AI round-trip)
   */
  setupPhase1Handlers() {
    // Edit details button (go back to form entry)
    const editBtn = document.getElementById('edit-details-btn');
    if (editBtn) {
      editBtn.addEventListener('click', async() => {
        this.currentProject.phase = 0;
        await storage.saveProject(this.currentProject);
        this.renderCurrentPhase();
      });
    }

    // Generate prompt button
    const generateBtn = document.getElementById('generate-phase1-prompt-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generatePhase1Prompt());
    }

    // Response textarea - update button state as user types
    const responseTextarea = document.getElementById('phase1-response-textarea');
    const saveBtn = document.getElementById('save-phase1-btn');
    const nextBtn = document.getElementById('next-phase2-btn');

    if (responseTextarea && saveBtn) {
      responseTextarea.addEventListener('input', () => {
        const hasEnoughContent = responseTextarea.value.trim().length >= 3;
        saveBtn.disabled = !hasEnoughContent;
      });

      saveBtn.addEventListener('click', () => this.savePhase1Response());
    }

    // Next phase button
    if (nextBtn) {
      nextBtn.addEventListener('click', async() => {
        await this.savePhase1Response();
      });
    }

    // View prompt button
    const viewBtn = document.getElementById('view-phase1-prompt-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        const modal = document.getElementById('phase1-prompt-modal');
        if (modal) modal.classList.remove('hidden');
      });
    }

    // Close modal button
    const closeBtn = document.getElementById('close-phase1-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const modal = document.getElementById('phase1-prompt-modal');
        if (modal) modal.classList.add('hidden');
      });
    }

    // Copy prompt button (from modal) - enables workflow when copied
    const copyBtn = document.getElementById('copy-phase1-prompt-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async() => {
        if (this.currentProject.phase1Prompt) {
          try {
            await copyToClipboard(this.currentProject.phase1Prompt);
            showToast('Copied to clipboard!', 'success');
            this.enablePhase1Workflow();
          } catch {
            showToast('Failed to copy to clipboard', 'error');
          }
        }
      });
    }

    // Delete button
    const deleteBtn = document.getElementById('delete-project-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteCurrentProject());
    }
  }

  /**
   * Enable Phase 1 workflow progression (Open AI button, textarea)
   * Called from both main copy button and modal copy button
   */
  enablePhase1Workflow() {
    const openAiBtn = document.getElementById('open-ai-phase1-btn');
    if (openAiBtn) {
      openAiBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
      openAiBtn.classList.add('hover:bg-green-700');
      openAiBtn.removeAttribute('aria-disabled');
    }

    const responseTextarea = document.getElementById('phase1-response-textarea');
    if (responseTextarea) {
      responseTextarea.disabled = false;
      responseTextarea.classList.remove('opacity-50', 'cursor-not-allowed');
      responseTextarea.focus();
    }
  }

  /**
   * Generate Phase 1 prompt (Claude initial draft)
   */
  async generatePhase1Prompt() {
    try {
      let promptTemplate = await loadPrompt(1);

      // Replace template variables with form data
      promptTemplate = promptTemplate.replace(/{title}/g, this.currentProject.title || '[No title]');
      promptTemplate = promptTemplate.replace(/{status}/g, this.currentProject.status || 'Proposed');
      promptTemplate = promptTemplate.replace(/{context}/g, this.currentProject.context || '[No context]');

      this.currentProject.phase1Prompt = promptTemplate;
      await storage.saveProject(this.currentProject);

      // Copy to clipboard with fallback for iPad/mobile
      try {
        await copyToClipboard(promptTemplate);
        showToast('Prompt copied to clipboard! Paste it to Claude', 'success');
        this.enablePhase1Workflow();
      } catch {
        showToast('Failed to copy to clipboard', 'error');
      }

      // Re-render to show prompt preview
      this.renderCurrentPhase();
    } catch (error) {
      console.error('Failed to generate prompt:', error);
      showToast('Failed to generate prompt', 'error');
    }
  }

  /**
   * Save Phase 1 response (Claude's initial draft)
   */
  async savePhase1Response() {
    const response = document.getElementById('phase1-response-textarea').value.trim();

    if (!response || response.length < 3) {
      showToast('Please enter at least 3 characters', 'warning');
      return;
    }

    const updatedProject = {
      ...this.currentProject,
      phase1Response: response,
      updatedAt: new Date().toISOString()
    };

    try {
      await storage.saveProject(updatedProject);
      this.currentProject = updatedProject;

      // Auto-advance to Phase 2
      showToast('Response saved! Moving to Phase 2...', 'success');
      this.currentProject.phase = 2;
      await storage.saveProject(this.currentProject);
      this.renderCurrentPhase();
    } catch (error) {
      console.error('Save failed:', error);
      showToast('Failed to save', 'error');
    }
  }

  setupPhase2Handlers() {
    // Previous phase button
    const prevBtn = document.getElementById('prev-phase1-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', async() => {
        this.currentProject.phase = 1;
        await storage.saveProject(this.currentProject);
        this.renderCurrentPhase();
      });
    }

    // Generate prompt button
    const generateBtn = document.getElementById('generate-phase2-prompt-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generatePhase2Prompt());
    }

    // Response textarea - update button state as user types
    const responseTextarea = document.getElementById('phase2-response-textarea');
    const saveBtn = document.getElementById('save-phase2-btn');
    const nextBtn = document.getElementById('next-phase3-btn');

    if (responseTextarea && saveBtn) {
      responseTextarea.addEventListener('input', () => {
        const hasEnoughContent = responseTextarea.value.trim().length >= 3;
        saveBtn.disabled = !hasEnoughContent;
      });

      saveBtn.addEventListener('click', () => this.savePhase2Data());
    }

    // Next phase button (auto-advance is already handled by savePhase2Data)
    if (nextBtn) {
      nextBtn.addEventListener('click', async() => {
        await this.savePhase2Data();
      });
    }

    // View prompt button
    const viewBtn = document.getElementById('view-phase2-prompt-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        const modal = document.getElementById('phase2-prompt-modal');
        if (modal) modal.classList.remove('hidden');
      });
    }

    // Close modal button
    const closeBtn = document.getElementById('close-phase2-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const modal = document.getElementById('phase2-prompt-modal');
        if (modal) modal.classList.add('hidden');
      });
    }

    // Copy prompt button (from modal) - enables workflow when copied
    const copyBtn = document.getElementById('copy-phase2-prompt-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async() => {
        if (this.currentProject.phase2Prompt) {
          try {
            await copyToClipboard(this.currentProject.phase2Prompt);
            showToast('Copied to clipboard!', 'success');
            this.enablePhase2Workflow();
          } catch {
            showToast('Failed to copy to clipboard', 'error');
          }
        }
      });
    }

    // Delete button
    const deleteBtn = document.getElementById('delete-project-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteCurrentProject());
    }
  }

  /**
   * Enable Phase 2 workflow progression (Open AI button, textarea)
   * Called from both main copy button and modal copy button
   */
  enablePhase2Workflow() {
    const openAiBtn = document.getElementById('open-ai-phase2-btn');
    if (openAiBtn) {
      openAiBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
      openAiBtn.classList.add('hover:bg-green-700');
      openAiBtn.removeAttribute('aria-disabled');
    }

    const responseTextarea = document.getElementById('phase2-response-textarea');
    if (responseTextarea) {
      responseTextarea.disabled = false;
      responseTextarea.classList.remove('opacity-50', 'cursor-not-allowed');
      responseTextarea.focus();
    }
  }

  async generatePhase2Prompt() {
    try {
      let promptTemplate = await loadPrompt(2);

      // Use Claude's Phase 1 response (initial draft)
      const phase1Output = this.currentProject.phase1Response || '[No Phase 1 response]';

      promptTemplate = promptTemplate.replace(/{phase1_output}/g, phase1Output);

      this.currentProject.phase2Prompt = promptTemplate;
      await storage.saveProject(this.currentProject);

      // Copy to clipboard with fallback for iPad/mobile
      try {
        await copyToClipboard(promptTemplate);
        showToast('Prompt copied to clipboard! Paste it to Gemini', 'success');
        this.enablePhase2Workflow();
      } catch {
        showToast('Failed to copy to clipboard', 'error');
      }

      // Re-render to show prompt preview (but don't lose textarea state)
      this.renderCurrentPhase();
    } catch (error) {
      console.error('Failed to generate prompt:', error);
      showToast('Failed to generate prompt', 'error');
    }
  }

  async savePhase2Data() {
    const review = document.getElementById('phase2-response-textarea').value.trim();

    if (!review || review.length < 3) {
      showToast('Please enter at least 3 characters', 'warning');
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

      // Auto-advance to Phase 3 (Pattern 4: Auto-Advance on Save)
      showToast('Response saved! Moving to Phase 3...', 'success');
      this.currentProject.phase = 3;
      await storage.saveProject(this.currentProject);
      this.renderCurrentPhase();
    } catch (error) {
      console.error('Save failed:', error);
      showToast('Failed to save', 'error');
    }
  }

  setupPhase3Handlers() {
    // Previous phase button
    const prevBtn = document.getElementById('prev-phase2-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', async() => {
        this.currentProject.phase = 2;
        await storage.saveProject(this.currentProject);
        this.renderCurrentPhase();
      });
    }

    // Generate prompt button
    const generateBtn = document.getElementById('generate-phase3-prompt-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generatePhase3Prompt());
    }

    // Response textarea - update button state as user types
    const responseTextarea = document.getElementById('phase3-response-textarea');
    const saveBtn = document.getElementById('save-phase3-btn');

    if (responseTextarea && saveBtn) {
      responseTextarea.addEventListener('input', () => {
        const hasEnoughContent = responseTextarea.value.trim().length >= 3;
        saveBtn.disabled = !hasEnoughContent;
      });

      saveBtn.addEventListener('click', () => this.savePhase3Data());
    }

    // Export button
    const exportBtn = document.getElementById('export-adr-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportADR());
    }

    // View prompt button
    const viewBtn = document.getElementById('view-phase3-prompt-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        const modal = document.getElementById('phase3-prompt-modal');
        if (modal) modal.classList.remove('hidden');
      });
    }

    // Close modal button
    const closeBtn = document.getElementById('close-phase3-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const modal = document.getElementById('phase3-prompt-modal');
        if (modal) modal.classList.add('hidden');
      });
    }

    // Copy prompt button (from modal) - enables workflow when copied
    const copyBtn = document.getElementById('copy-phase3-prompt-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async() => {
        if (this.currentProject.phase3Prompt) {
          try {
            await copyToClipboard(this.currentProject.phase3Prompt);
            showToast('Copied to clipboard!', 'success');
            this.enablePhase3Workflow();
          } catch {
            showToast('Failed to copy to clipboard', 'error');
          }
        }
      });
    }

    // Delete button
    const deleteBtn = document.getElementById('delete-project-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteCurrentProject());
    }
  }

  /**
   * Enable Phase 3 workflow progression (Open AI button, textarea)
   * Called from both main copy button and modal copy button
   */
  enablePhase3Workflow() {
    const openAiBtn = document.getElementById('open-ai-phase3-btn');
    if (openAiBtn) {
      openAiBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
      openAiBtn.classList.add('hover:bg-green-700');
      openAiBtn.removeAttribute('aria-disabled');
    }

    const responseTextarea = document.getElementById('phase3-response-textarea');
    if (responseTextarea) {
      responseTextarea.disabled = false;
      responseTextarea.classList.remove('opacity-50', 'cursor-not-allowed');
      responseTextarea.focus();
    }
  }

  async generatePhase3Prompt() {
    try {
      let promptTemplate = await loadPrompt(3);

      // Use Claude's Phase 1 response (initial draft)
      const phase1Output = this.currentProject.phase1Response || '[No Phase 1 response]';
      // Use Gemini's Phase 2 review
      const phase2Review = this.currentProject.phase2Review || '[No Phase 2 feedback provided]';

      promptTemplate = promptTemplate.replace(/{phase1_output}/g, phase1Output);
      promptTemplate = promptTemplate.replace(/{phase2_review}/g, phase2Review);

      this.currentProject.phase3Prompt = promptTemplate;
      await storage.saveProject(this.currentProject);

      // Copy to clipboard with fallback for iPad/mobile
      try {
        await copyToClipboard(promptTemplate);
        showToast('Prompt copied to clipboard! Paste it to Claude', 'success');
        this.enablePhase3Workflow();
      } catch {
        showToast('Failed to copy to clipboard', 'error');
      }

      // Re-render to show prompt preview
      this.renderCurrentPhase();
    } catch (error) {
      console.error('Failed to generate prompt:', error);
      showToast('Failed to generate prompt', 'error');
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
    const finalADR = document.getElementById('phase3-response-textarea').value.trim();

    if (!finalADR || finalADR.length < 3) {
      showToast('Please enter at least 3 characters', 'warning');
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
        showToast(`ADR saved! Title updated to "${extractedTitle}"`, 'success');
      } else {
        showToast('Phase 3 complete! Your ADR is ready for export.', 'success');
      }

      // Re-render to update UI with new title and enable export
      this.renderCurrentPhase();
    } catch (error) {
      console.error('Save failed:', error);
      showToast('Failed to save', 'error');
    }
  }

  async exportADR() {
    const adrContent = document.getElementById('phase3-response-textarea').value.trim();

    if (!adrContent) {
      showToast('Please enter the final ADR content first', 'error');
      return;
    }

    try {
      const filename = `${this.currentProject.title.replace(/\s+/g, '-')}.md`;
      exportAsMarkdown(adrContent, filename);
      showToast('ADR exported as Markdown', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Failed to export ADR', 'error');
    }
  }

  async deleteCurrentProject() {
    if (!window.confirm('Are you sure you want to delete this ADR?')) {
      return;
    }

    try {
      await storage.deleteProject(this.currentProject.id);
      showToast('ADR deleted', 'success');
      await this.loadProjects();
      await this.renderProjectList();
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('Failed to delete ADR', 'error');
    }
  }

  async exportAll() {
    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      projects: this.projects
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adr-projects-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`Exported ${this.projects.length} ADRs`, 'success');
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
        showToast(`Imported ${data.projects.length} ADRs`, 'success');
      }
    } catch (error) {
      console.error('Import failed:', error);
      showToast('Failed to import ADRs', 'error');
    }

    event.target.value = '';
  }

  /**
   * Delete a project by ID (called from project list)
   * @param {string} projectId - Project ID to delete
   */
  async deleteProject(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    const title = project?.title || project?.name || 'Untitled';

    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await storage.deleteProject(projectId);
      showToast('ADR deleted', 'success');
      await this.loadProjects();
      await this.renderProjectList();
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('Failed to delete ADR', 'error');
    }
  }

  /**
   * Count completed phases for a project
   * Phase 0 (form entry) is not counted - only AI phases 1-3
   * @param {Object} project - Project object
   * @returns {number} Number of completed phases (0-3)
   */
  countCompletedPhases(project) {
    let count = 0;
    // Phase 1 is complete if we have Claude's initial draft
    if (project.phase1Response) count++;
    // Phase 2 is complete if we have Gemini's review
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
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Format date for display
   * @param {string} dateStr - ISO date string
   * @returns {string} Formatted date string
   */
  formatDate(dateStr) {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}

// Only initialize if running in real browser (not Jest JSDOM)
// Check for Jest by looking for process.env.JEST_WORKER_ID or typical test indicators
const isTestEnvironment = typeof process !== 'undefined' &&
  (process.env?.JEST_WORKER_ID !== undefined || process.env?.NODE_ENV === 'test');

let app = null;
if (!isTestEnvironment && typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Use DOMContentLoaded to ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
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
