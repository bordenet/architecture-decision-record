/**
 * Simple Router Module
 * Handles client-side routing and navigation
 */

import { renderProjectsList, renderNewProjectForm } from './views.js';
import { renderProjectView } from './project-view.js';
import { storage } from './storage.js';

let currentRoute = null;

/**
 * Initialize the router
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
 */
function handlePopState(event) {
  const route = event.state?.route || 'home';
  navigateTo(route, false);
}

/**
 * Update storage info in footer
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
 */
export function getCurrentRoute() {
  return currentRoute;
}
