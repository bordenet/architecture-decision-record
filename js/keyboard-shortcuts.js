/**
 * Keyboard Shortcuts Module
 * Provides keyboard shortcuts for common actions
 * @module keyboard-shortcuts
 */

/**
 * Setup keyboard shortcuts for the application
 * - Cmd/Ctrl+S: Save current project
 * - Cmd/Ctrl+E: Export current project
 * - Escape: Close modals/dropdowns
 * @returns {void}
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    const isMeta = event.metaKey || event.ctrlKey;

    // Cmd/Ctrl+S: Save (prevent default browser save)
    if (isMeta && event.key === 's') {
      event.preventDefault();
      const saveBtn = document.querySelector('[id*=\'save\']');
      if (saveBtn) {
        saveBtn.click();
      }
    }

    // Cmd/Ctrl+E: Export
    if (isMeta && event.key === 'e') {
      event.preventDefault();
      const exportBtn = document.getElementById('export-all-btn');
      if (exportBtn) {
        exportBtn.click();
      }
    }

    // Escape: Close modals and dropdowns
    if (event.key === 'Escape') {
      // Close privacy notice
      const privacyNotice = document.getElementById('privacy-notice');
      const closeBtn = document.getElementById('close-privacy-notice');
      if (privacyNotice && !privacyNotice.classList.contains('hidden')) {
        closeBtn?.click();
      }

      // Close related projects dropdown
      const dropdownMenu = document.getElementById('related-projects-menu');
      if (dropdownMenu && !dropdownMenu.classList.contains('hidden')) {
        dropdownMenu.classList.add('hidden');
      }
    }
  });
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type: 'success', 'error', 'info'
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type] || 'bg-gray-500';

  toast.className = `${bgColor} text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in`;
  toast.textContent = message;

  container.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

export { setupKeyboardShortcuts, showToast };
