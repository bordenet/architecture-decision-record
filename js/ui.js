/**
 * UI Module
 * Handles theme, toasts, and UI utilities
 */

function initializeTheme() {
  // Initialize dark mode
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) {
    document.documentElement.classList.add("dark");
  }
}

function showToast(message, type = "info") {
  // Implementation for showing toast notifications
  // eslint-disable-next-line no-console
  console.log(`Toast [${type}]: ${message}`);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("darkMode", isDark);
}

module.exports = { initializeTheme, showToast, toggleTheme };
