/**
 * Views Module
 * Handles rendering different views/screens
 * @module views
 */

import { getAllProjects, createProject, deleteProject } from './projects.js';
import { formatDate, escapeHtml, confirm, showToast, showDocumentPreviewModal } from './ui.js';
import { navigateTo } from './router.js';
import { getFinalMarkdown, getExportFilename } from './workflow.js';

/** @constant {string} ADR documentation URL */
const ADR_DOCS_URL = 'https://adr.github.io/';

/**
 * Render the projects list view
 * @returns {Promise<void>}
 */
export async function renderProjectsList() {
  const projects = await getAllProjects();

  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
                My <a href="${ADR_DOCS_URL}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300">ADRs</a>
            </h2>
            <button id="new-project-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + New ADR
            </button>
        </div>

        ${projects.length === 0 ? `
            <div class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <span class="text-6xl mb-4 block">📋</span>
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
                ${projects.map(project => {
    // Check if all phases are complete
    const isComplete = project.phases &&
                        project.phases[1]?.completed &&
                        project.phases[2]?.completed &&
                        project.phases[3]?.completed;
    return `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" data-project-id="${project.id}">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-3">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                    ${escapeHtml(project.title || 'Untitled ADR')}
                                </h3>
                                <div class="flex items-center space-x-2">
                                    ${isComplete ? `
                                    <button class="preview-project-btn text-gray-400 hover:text-blue-600 transition-colors" data-project-id="${project.id}" title="Preview & Copy">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                    ` : ''}
                                    <button class="delete-project-btn text-gray-400 hover:text-red-600 transition-colors" data-project-id="${project.id}" title="Delete">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="flex items-center space-x-2 mb-2">
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Phase ${Math.min(project.phase || 1, 3)}/3</span>
                                    <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${Math.min(((project.phase || 1) / 3) * 100, 100)}%"></div>
                                    </div>
                                </div>
                                <div class="flex space-x-1">
                                    ${[1, 2, 3].map(phase => `
                                        <div class="flex-1 h-1 rounded ${project.phases && project.phases[phase] && project.phases[phase].completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}"></div>
                                    `).join('')}
                                </div>
                            </div>

                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                ${escapeHtml(project.context || '')}
                            </p>

                            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Updated ${formatDate(project.updatedAt)}</span>
                                <span class="px-2 py-1 rounded text-xs ${project.status === 'Accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}">${escapeHtml(project.status || 'Proposed')}</span>
                            </div>
                        </div>
                    </div>
                `;}).join('')}
            </div>
        `}
    `;

  // Event listeners
  const newProjectBtns = container.querySelectorAll('#new-project-btn, #new-project-btn-empty');
  newProjectBtns.forEach(btn => {
    btn.addEventListener('click', () => navigateTo('new-project'));
  });

  const projectCards = container.querySelectorAll('[data-project-id]');
  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-project-btn') && !e.target.closest('.preview-project-btn')) {
        navigateTo('project/' + card.dataset.projectId);
      }
    });
  });

  // Preview buttons (for completed projects)
  const previewBtns = container.querySelectorAll('.preview-project-btn');
  previewBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const markdown = getFinalMarkdown(project);
        if (markdown) {
          showDocumentPreviewModal(markdown, 'Your ADR is Ready', getExportFilename(project));
        } else {
          showToast('No content to preview', 'warning');
        }
      }
    });
  });

  const deleteBtns = container.querySelectorAll('.delete-project-btn');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = projects.find(p => p.id === projectId);

      if (await confirm(`Are you sure you want to delete "${project.title}"?`, 'Delete ADR')) {
        await deleteProject(projectId);
        showToast('ADR deleted', 'success');
        renderProjectsList();
      }
    });
  });
}

/**
 * Render the new project form (edit details)
 * @param {import('./types.js').Project | null} [existingProject=null] - Existing project for editing
 * @returns {void}
 */
export function renderNewProjectForm(existingProject = null) {
  const isEditing = !!existingProject;
  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="max-w-5xl mx-auto">
            <div class="mb-6">
                <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    ${isEditing ? 'Back to ADR' : 'Back to ADRs'}
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    ${isEditing ? 'Edit ADR Details' : 'Create New ADR'}
                </h2>
                ${isEditing ? `
                    <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p class="text-sm text-blue-800 dark:text-blue-300">
                            💡 Update your ADR details below. Changes will be saved when you continue to Phase 1.
                        </p>
                    </div>
                ` : ''}

                <form id="new-project-form" class="space-y-6">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            value="${escapeHtml(existingProject?.title || '')}"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Use microservices architecture for scalability"
                        >
                    </div>

                    <div>
                        <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="Proposed" ${(existingProject?.status || 'Proposed') === 'Proposed' ? 'selected' : ''}>Proposed</option>
                            <option value="Accepted" ${existingProject?.status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                            <option value="Deprecated" ${existingProject?.status === 'Deprecated' ? 'selected' : ''}>Deprecated</option>
                            <option value="Superseded" ${existingProject?.status === 'Superseded' ? 'selected' : ''}>Superseded</option>
                        </select>
                    </div>

                    <div>
                        <label for="context" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Context <span class="text-red-500">*</span>
                        </label>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">What circumstances led to this decision? Include background, constraints, and current system state.</p>
                        <textarea
                            id="context"
                            name="context"
                            required
                            rows="6"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Describe the background, constraints, and why this decision was necessary..."
                        >${escapeHtml(existingProject?.context || '')}</textarea>
                    </div>
                </form>
            </div>

            <!-- Footer buttons -->
            <div class="mt-6 flex justify-between items-center">
                <button type="button" id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    ${isEditing ? 'Continue to Phase 1 →' : 'Create & Start Phase 1 →'}
                </button>
                <button type="button" id="delete-btn" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    ${isEditing ? 'Delete' : 'Cancel'}
                </button>
            </div>
        </div>
    `;

  // Helper function to get form data
  const getFormData = () => {
    const form = document.getElementById('new-project-form');
    const formDataObj = new FormData(form);
    return {
      title: formDataObj.get('title'),
      status: formDataObj.get('status'),
      context: formDataObj.get('context')
    };
  };

  // Helper function to save project
  const saveProject = async (navigateAfter = false) => {
    const formData = getFormData();

    if (!formData.title || !formData.context) {
      showToast('Please fill in required fields', 'error');
      return null;
    }

    if (isEditing) {
      const { updateProject } = await import('./projects.js');
      await updateProject(existingProject.id, {
        title: formData.title,
        status: formData.status,
        context: formData.context
      });
      showToast('ADR saved!', 'success');
      if (navigateAfter) {
        navigateTo('project/' + existingProject.id);
      }
      return existingProject;
    } else {
      const project = await createProject(formData);
      showToast('ADR created!', 'success');
      if (navigateAfter) {
        navigateTo('project/' + project.id);
      }
      return project;
    }
  };

  // Event listeners
  document.getElementById('back-btn').addEventListener('click', () => {
    if (isEditing) {
      navigateTo('project/' + existingProject.id);
    } else {
      navigateTo('home');
    }
  });

  // Next Phase button - saves and navigates to Phase 1
  document.getElementById('next-phase-btn').addEventListener('click', async () => {
    await saveProject(true);
  });

  // Delete button
  document.getElementById('delete-btn').addEventListener('click', async () => {
    if (isEditing) {
      if (await confirm(`Are you sure you want to delete "${existingProject.title}"?`, 'Delete ADR')) {
        await deleteProject(existingProject.id);
        showToast('ADR deleted', 'success');
        navigateTo('home');
      }
    } else {
      // For new projects, just go back home
      navigateTo('home');
    }
  });
}
