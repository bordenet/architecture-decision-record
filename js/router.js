/**
 * Simple Router Module
 * Handles client-side routing and navigation
 * @module router
 */

import { renderProjectsList, renderNewProjectForm } from './views.js';
import { renderProjectView } from './project-view.js';
import { storage } from './storage.js';

/** @type {string | null} */
let currentRoute = null;

/**
 * Initialize the router
 * @returns {void}
 */
export function initRouter() {
  // Handle browser back/forward buttons
  window.addEventListener('popstate', handlePopState);

  // Handle initial route
  const path = window.location.hash.slice(1) || 'home';
  navigateTo(path, false);
}

/**
 * Navigate to a route
 * @param {string} route - Route path (e.g., 'home', 'project/123')
 * @param {boolean} [pushState=true] - Whether to push to browser history
 * @returns {void}
 */
export function navigateTo(route, pushState = true) {
  const [path, param] = route.split('/');

  if (pushState) {
    window.history.pushState({ route }, '', `#${route}`);
  }

  currentRoute = route;
  renderRoute(path, param);
}

/**
 * Handle browser back/forward
 * @param {PopStateEvent} event - PopState event
 * @returns {void}
 */
function handlePopState(event) {
  const route = event.state?.route || 'home';
  navigateTo(route, false);
}

/**
 * Update storage info in footer
 * @returns {Promise<void>}
 */
export async function updateStorageInfo() {
  try {
    const estimate = await storage.getStorageEstimate();
    const projects = await storage.getAllProjects();

    const storageInfo = document.getElementById('storage-info');
    if (storageInfo) {
      if (estimate) {
        const usedMB = (estimate.usage / (1024 * 1024)).toFixed(1);
        const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(0);
        storageInfo.textContent = `${projects.length} ADRs • ${usedMB}MB used of ${quotaMB}MB`;
      } else {
        storageInfo.textContent = `${projects.length} ADRs stored locally`;
      }
    }
  } catch (error) {
    console.error('Failed to update storage info:', error);
  }
}

/**
 * Render the current route
 * @param {string} path - Route path
 * @param {string} [param] - Route parameter (e.g., project ID)
 * @returns {Promise<void>}
 */
async function renderRoute(path, param) {
  try {
    switch (path) {
    case 'home':
    case '':
      await renderProjectsList();
      break;

    case 'new-project':
      renderNewProjectForm();
      break;

    case 'edit-project':
      if (param) {
        const project = await storage.getProject(param);
        if (project) {
          const { renderNewProjectForm } = await import('./views.js');
          renderNewProjectForm(project);
        } else {
          navigateTo('home');
        }
      } else {
        navigateTo('home');
      }
      break;

    case 'project':
      if (param) {
        await renderProjectView(param);
      } else {
        navigateTo('home');
      }
      break;

    default:
      navigateTo('home');
      break;
    }

    // Always update footer after route render
    await updateStorageInfo();
  } catch (error) {
    console.error('Route rendering error:', error);
    navigateTo('home');
  }
}

/**
 * Get current route
 * @returns {string | null}
 */
export function getCurrentRoute() {
  return currentRoute;
}
