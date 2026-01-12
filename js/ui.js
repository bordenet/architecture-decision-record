/**
 * UI Module
 * Handles theme, toasts, and UI utilities
 * @module ui
 */

/**
 * Initialize theme from localStorage
 * @returns {void}
 */
function initializeTheme() {
  // Initialize dark mode
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {import('./types.js').ToastType} [type='info'] - Toast type
 * @returns {void}
 */
function showToast(message, type = 'info') {
  // Implementation for showing toast notifications
  console.log(`Toast [${type}]: ${message}`);
}

/**
 * Toggle between light and dark themes
 * @returns {void}
 */
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', String(isDark));
}

/**
 * Set up theme toggle button listener
 * @returns {void}
 */
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format a date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Show a confirmation dialog
 * @param {string} message - The confirmation message
 * @param {string} title - Dialog title
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise
 */
function confirm(message, title = 'Confirm') {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
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

    modal.querySelector('#confirm-cancel').addEventListener('click', () => closeModal(false));
    modal.querySelector('#confirm-ok').addEventListener('click', () => closeModal(true));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(false);
    });

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleEscape);
        closeModal(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
  });
}

/**
 * Show prompt modal - displays full prompt text in a scrollable modal
 * @param {string} promptText - The prompt text to display
 * @param {string} title - Modal title
 * @param {Function} [onCopySuccess] - Optional callback to run after successful copy
 */
function showPromptModal(promptText, title = 'Full Prompt', onCopySuccess = null) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
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
                    📋 Copy to Clipboard
                </button>
                <button id="close-prompt-modal-btn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    Close
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  const handleEscape = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  const closeModal = () => {
    if (document.body.contains(modal)) document.body.removeChild(modal);
    document.removeEventListener('keydown', handleEscape);
  };

  modal.querySelector('#close-prompt-modal').addEventListener('click', closeModal);
  modal.querySelector('#close-prompt-modal-btn').addEventListener('click', closeModal);

  modal.querySelector('#copy-prompt-modal-btn').addEventListener('click', async () => {
    try {
      await copyToClipboard(promptText);
      showToast('Prompt copied to clipboard!', 'success');
      if (onCopySuccess) onCopySuccess();
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', handleEscape);
}

/**
 * Copy text to clipboard
 *
 * Uses a fallback chain for maximum compatibility:
 * 1. Modern Clipboard API (navigator.clipboard.writeText)
 * 2. Legacy execCommand('copy') for older browsers and iPad/mobile
 *
 * @param {string} text - Text to copy
 * @returns {Promise<void>} Resolves if successful, throws if failed
 * @throws {Error} If copy fails
 */
async function copyToClipboard(text) {
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to legacy method (iPad/mobile often fails here)
    }
  }

  // Fallback for iOS Safari, older browsers, or when Clipboard API fails
  const textArea = document.createElement('textarea');
  textArea.value = text;
  // Prevent iOS keyboard from appearing
  textArea.setAttribute('readonly', '');
  textArea.setAttribute('contenteditable', 'true');
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  // Prevent zoom on iOS (font-size < 16px triggers zoom)
  textArea.style.fontSize = '16px';
  document.body.appendChild(textArea);
  textArea.focus();
  // iOS requires setSelectionRange instead of select()
  textArea.setSelectionRange(0, text.length);

  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (!successful) {
      throw new Error('Copy command failed');
    }
  } catch {
    document.body.removeChild(textArea);
    throw new Error('Failed to copy to clipboard');
  }
}

export { initializeTheme, showToast, toggleTheme, setupThemeToggle, escapeHtml, copyToClipboard, showPromptModal, confirm, formatDate };
