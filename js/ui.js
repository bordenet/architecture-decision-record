/**
 * UI Module
 * Handles theme, toasts, and UI utilities
 */

function initializeTheme() {
  // Initialize dark mode
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
}

function showToast(message, type = 'info') {
  // Implementation for showing toast notifications
  // eslint-disable-next-line no-console
  console.log(`Toast [${type}]: ${message}`);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark);
}

function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}


function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

export { initializeTheme, showToast, toggleTheme, setupThemeToggle, escapeHtml, copyToClipboard };
