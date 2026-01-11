/**
 * Main Application Module
 * Architecture Decision Record Assistant with 3-phase workflow
 */

import { initializeTheme, setupThemeToggle, showToast } from './ui.js';
import { initRouter } from './router.js';
import { setupKeyboardShortcuts } from './keyboard-shortcuts.js';
import { storage } from './storage.js';
import { exportAllProjects, importProjects } from './projects.js';

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
      console.log('App initialization started');

      // Initialize theme
      initializeTheme();
      setupThemeToggle();
      console.log('Theme initialized');

      // Setup keyboard shortcuts
      setupKeyboardShortcuts();
      console.log('Keyboard shortcuts configured');

      // Setup global event listeners (header buttons, etc.)
      this.setupEventListeners();
      console.log('Event listeners set up');

      // Initialize router - this handles all view rendering
      initRouter();
      console.log('Router initialized');

      showToast('Application loaded successfully', 'success');
    } catch (error) {
      console.error('App initialization error:', error);
      showToast('Failed to initialize application', 'error');
    }
  }

  setupEventListeners() {
    // Guard against test environment without proper DOM
    if (typeof document === 'undefined' || !document.body) {
      return;
    }

    // Export all button
    const exportBtn = document.getElementById('export-all-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        await exportAllProjects();
        showToast('All ADRs exported', 'success');
      });
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
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const count = await importProjects(file);
            showToast(`Imported ${count} ADR(s)`, 'success');
            // Refresh the current view
            window.location.reload();
          } catch (error) {
            console.error('Import failed:', error);
            showToast('Failed to import ADRs', 'error');
          }
        }
        e.target.value = '';
      });
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
