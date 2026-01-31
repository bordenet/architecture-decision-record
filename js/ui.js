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
  // Clipboard API fallback chain for cross-browser compatibility
  // Order: writeText (Safari MacOS) → ClipboardItem (iOS Safari) → execCommand (legacy)
  if (navigator.clipboard && window.isSecureContext) {
    // Method 1: writeText - simplest, works on Safari MacOS and most browsers
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (err) {
      console.warn('writeText failed, trying ClipboardItem:', err?.message);
    }

    // Method 2: ClipboardItem with direct Blob - for iOS Safari
    // iOS Safari may reject writeText but accept ClipboardItem
    try {
      const blob = new Blob([text], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/plain': blob });
      await navigator.clipboard.write([item]);
      return;
    } catch (err) {
      console.warn('ClipboardItem failed, trying execCommand:', err?.message);
    }
  }

  // Method 3: Legacy execCommand fallback
  // CRITICAL: Position IN viewport - iOS Safari rejects off-screen elements
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.setAttribute('contenteditable', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '0';
  textarea.style.top = '0';
  textarea.style.width = '1px';
  textarea.style.height = '1px';
  textarea.style.padding = '0';
  textarea.style.border = 'none';
  textarea.style.outline = 'none';
  textarea.style.boxShadow = 'none';
  textarea.style.background = 'transparent';
  textarea.style.opacity = '0.01';
  textarea.style.fontSize = '16px'; // Prevent iOS zoom

  document.body.appendChild(textarea);

  try {
    textarea.focus();
    textarea.setSelectionRange(0, text.length);
    const successful = document.execCommand('copy');
    if (!successful) {
      throw new Error('execCommand copy returned false');
    }
  } catch (err) {
    throw new Error('Failed to copy to clipboard: ' + (err?.message || 'unknown error'));
  } finally {
    if (document.body.contains(textarea)) {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * Show formatted document preview modal
 * @module ui
 * Displays markdown rendered as HTML with copy and download options
 * @param {string} markdown - Markdown content to display
 * @param {string} title - Modal title (default: 'Your Document is Ready')
 * @param {string} filename - Filename for download (default: 'document.md')
 * @param {Function} [onDownload] - Optional callback after download
 */
function showDocumentPreviewModal(markdown, title = 'Your Document is Ready', filename = 'document.md', onDownload = null) {
  // Render markdown to HTML using marked.js
  // @ts-ignore - marked is loaded via CDN
  let renderedHtml;
  if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
    renderedHtml = marked.parse(markdown);
  } else if (typeof marked !== 'undefined' && typeof marked === 'function') {
    renderedHtml = marked(markdown);
  } else {
    // Fallback: escape HTML and convert newlines
    renderedHtml = escapeHtml(markdown).replace(/\n/g, '<br>');
  }

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
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
                    💡 <strong>Tip:</strong> Click "Copy Formatted Text", then paste into Word or Google Docs — the formatting transfers automatically.
                </p>
                <div class="flex flex-wrap justify-end gap-3">
                    <button id="copy-formatted-btn" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        📋 Copy Formatted Text
                    </button>
                    <button id="download-md-btn" class="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        📄 Download .md File
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

  modal.querySelector('#close-preview-modal').addEventListener('click', closeModal);
  modal.querySelector('#close-modal-btn').addEventListener('click', closeModal);

  // Copy formatted text (selects the rendered HTML content)
  modal.querySelector('#copy-formatted-btn').addEventListener('click', async () => {
    try {
      const previewContent = modal.querySelector('#preview-content');

      // Create a range and select the content
      const range = document.createRange();
      range.selectNodeContents(previewContent);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      // Try to copy using execCommand for rich text
      const successful = document.execCommand('copy');
      selection.removeAllRanges();

      if (successful) {
        showToast('Formatted text copied! Paste into Word or Google Docs.', 'success');
      } else {
        // Fallback to plain text
        await copyToClipboard(markdown);
        showToast('Text copied! Paste into Word or Google Docs.', 'success');
      }
    } catch {
      // Ultimate fallback
      try {
        await copyToClipboard(markdown);
        showToast('Text copied to clipboard.', 'success');
      } catch {
        showToast('Failed to copy. Please select and copy manually.', 'error');
      }
    }
  });

  // Download as .md file
  modal.querySelector('#download-md-btn').addEventListener('click', () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File downloaded!', 'success');
    if (onDownload) {
      onDownload();
    }
  });

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

export { initializeTheme, showToast, toggleTheme, setupThemeToggle, escapeHtml, copyToClipboard, showPromptModal, confirm, formatDate, showDocumentPreviewModal };
