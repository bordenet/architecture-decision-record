/**
 * Project View Module
 * Handles rendering project workflow view and phase interactions
 * @module project-view
 */

import { getProject, updatePhase, updateProject, deleteProject } from './projects.js';
import { getPhaseMetadata, generatePromptForPhase, exportFinalADR } from './workflow.js';
import { escapeHtml, showToast, copyToClipboard, confirm, showPromptModal } from './ui.js';
import { navigateTo } from './router.js';

/**
 * Render the project detail view
 * @param {string} projectId - Project ID
 * @returns {Promise<void>}
 */
export async function renderProjectView(projectId) {
  const project = await getProject(projectId);

  if (!project) {
    showToast('ADR not found', 'error');
    navigateTo('home');
    return;
  }

  // Check if project has basic details filled in
  // If not, redirect to edit form
  if (!project.title || !project.context) {
    navigateTo('edit-project/' + projectId);
    return;
  }

  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
            <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to ADRs
            </button>
            ${project.phases && project.phases[3] && project.phases[3].completed ? `
                <button id="export-adr-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    ✓ Export as Markdown
                </button>
            ` : ''}
        </div>

        <!-- Phase Tabs -->
        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex space-x-1">
                ${[1, 2, 3].map(phase => {
    const meta = getPhaseMetadata(phase);
    const isActive = (project.phase || 1) === phase;
    const isCompleted = project.phases && project.phases[phase] && project.phases[phase].completed;

    return `
                        <button
                            class="phase-tab px-6 py-3 font-medium transition-colors ${
  isActive
    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
}"
                            data-phase="${phase}"
                        >
                            <span class="mr-2">${meta.icon}</span>
                            Phase ${phase}
                            ${isCompleted ? '<span class="ml-2 text-green-500">✓</span>' : ''}
                        </button>
                    `;
  }).join('')}
            </div>
        </div>

        <!-- Phase Content -->
        <div id="phase-content">
            ${renderPhaseContent(project, project.phase || 1)}
        </div>
    `;

  // Event listeners
  document.getElementById('back-btn').addEventListener('click', () => navigateTo('home'));
  const exportBtn = document.getElementById('export-adr-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => exportFinalADR(project));
  }

  document.querySelectorAll('.phase-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const phase = parseInt(tab.dataset.phase);
      project.phase = phase;
      updatePhaseTabStyles(phase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(project, phase);
      attachPhaseEventListeners(project, phase);
    });
  });

  attachPhaseEventListeners(project, project.phase || 1);
}

/**
 * Update phase tab styles to reflect the active phase
 * @param {import('./types.js').PhaseNumber} activePhase - Active phase number
 * @returns {void}
 */
function updatePhaseTabStyles(activePhase) {
  document.querySelectorAll('.phase-tab').forEach(tab => {
    const tabPhase = parseInt(tab.dataset.phase);
    if (tabPhase === activePhase) {
      tab.classList.remove('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-200');
      tab.classList.add('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
    } else {
      tab.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
      tab.classList.add('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-200');
    }
  });
}


/**
 * Render phase content based on phase number
 * @param {import('./types.js').Project} project - Project data
 * @param {import('./types.js').PhaseNumber} phase - Phase number
 * @returns {string} HTML content
 */
function renderPhaseContent(project, phase) {
  const meta = getPhaseMetadata(phase);
  const phaseData = project.phases && project.phases[phase] ? project.phases[phase] : {};
  const hasPrompt = !!phaseData.prompt;
  const hasResponse = !!(phaseData.response && phaseData.response.trim());

  // Get AI info based on phase
  const aiInfo = phase === 2
    ? { name: 'Gemini', url: 'https://gemini.google.com', color: 'green' }
    : { name: 'Claude', url: 'https://claude.ai', color: 'blue' };

  return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    ${meta.icon} ${meta.title}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-2">${meta.description}</p>
                <div class="inline-flex items-center px-3 py-1 bg-${aiInfo.color}-100 dark:bg-${aiInfo.color}-900/20 text-${aiInfo.color}-800 dark:text-${aiInfo.color}-300 rounded-full text-sm">
                    <span class="mr-2">🤖</span>
                    Use with ${aiInfo.name}
                </div>
            </div>

            <!-- Step A: Copy Prompt -->
            <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step A: Copy Prompt to AI
                </h4>
                <div class="flex items-center justify-between flex-wrap gap-3">
                    <div class="flex gap-3 flex-wrap">
                        <button id="copy-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            📋 ${hasPrompt ? 'Copy Prompt Again' : 'Generate & Copy Prompt'}
                        </button>
                        <a
                            id="open-ai-btn"
                            href="${aiInfo.url}"
                            target="ai-assistant-tab"
                            rel="noopener noreferrer"
                            class="px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium ${hasPrompt ? 'hover:bg-green-700' : 'opacity-50 cursor-not-allowed pointer-events-none'}"
                            ${hasPrompt ? '' : 'aria-disabled="true"'}
                        >
                            🔗 Open ${aiInfo.name}
                        </a>
                    </div>
                    <button id="view-prompt-btn" class="px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium ${hasPrompt ? '' : 'hidden'}">
                        👁️ View Prompt
                    </button>
                </div>
            </div>

            <!-- Step B: Paste Response -->
            <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step B: Paste ${aiInfo.name}'s Response
                </h4>
                <textarea
                    id="response-textarea"
                    rows="12"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    placeholder="Paste ${aiInfo.name}'s response here..."
                    ${!hasResponse && !hasPrompt ? 'disabled' : ''}
                >${escapeHtml(phaseData.response || '')}</textarea>
                <div class="mt-3 flex justify-between items-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                        ${hasResponse ? '✓ Phase completed' : 'Paste response to complete this phase'}
                    </span>
                    <button id="save-response-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" ${!hasResponse ? 'disabled' : ''}>
                        Save Response
                    </button>
                </div>
            </div>

            ${phase === 3 && hasResponse ? `
                <!-- Phase 3 Complete: Export Call-to-Action -->
                <div class="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div class="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h4 class="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center">
                                <span class="mr-2">🎉</span> Your ADR is Complete!
                            </h4>
                            <p class="text-green-700 dark:text-green-400 mt-1">
                                Download your finished architecture decision record as a Markdown (.md) file.
                            </p>
                        </div>
                        <button id="export-phase-btn" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg">
                            📄 Export as Markdown
                        </button>
                    </div>
                </div>
            ` : ''}

            <!-- Navigation -->
            <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                <div class="flex gap-3">
                    ${phase === 1 ? `
                        <button id="edit-details-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            ← Edit Details
                        </button>
                    ` : `
                        <button id="prev-phase-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            ← Previous Phase
                        </button>
                    `}
                    ${hasResponse && phase < 3 ? `
                        <button id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Next Phase →
                        </button>
                    ` : ''}
                </div>
                <button id="delete-project-btn" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    Delete
                </button>
            </div>
        </div>
    `;
}

/**
 * Attach event listeners for phase interactions
 * @param {import('./types.js').Project} project - Project data
 * @param {import('./types.js').PhaseNumber} phase - Phase number
 * @returns {void}
 */
function attachPhaseEventListeners(project, phase) {
  const meta = getPhaseMetadata(phase);

  // Delete button
  const deleteBtn = document.getElementById('delete-project-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (await confirm(`Are you sure you want to delete "${project.title}"?`, 'Delete ADR')) {
        await deleteProject(project.id);
        showToast('ADR deleted', 'success');
        navigateTo('home');
      }
    });
  }

  // Edit details button (Phase 1 only)
  const editDetailsBtn = document.getElementById('edit-details-btn');
  if (editDetailsBtn) {
    editDetailsBtn.addEventListener('click', () => {
      navigateTo('edit-project/' + project.id);
    });
  }

  // Previous phase button
  const prevPhaseBtn = document.getElementById('prev-phase-btn');
  if (prevPhaseBtn) {
    prevPhaseBtn.addEventListener('click', () => {
      project.phase = phase - 1;
      updatePhaseTabStyles(phase - 1);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(project, phase - 1);
      attachPhaseEventListeners(project, phase - 1);
    });
  }

  // Next phase button
  const nextPhaseBtn = document.getElementById('next-phase-btn');
  if (nextPhaseBtn) {
    nextPhaseBtn.addEventListener('click', () => {
      project.phase = phase + 1;
      updatePhaseTabStyles(phase + 1);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(project, phase + 1);
      attachPhaseEventListeners(project, phase + 1);
    });
  }

  // Export button in phase content
  const exportPhaseBtn = document.getElementById('export-phase-btn');
  if (exportPhaseBtn) {
    exportPhaseBtn.addEventListener('click', () => exportFinalADR(project));
  }

  // Copy prompt button
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', async () => {
      try {
        const prompt = await generatePromptForPhase(project, phase);

        // Initialize phases object if needed
        if (!project.phases) project.phases = {};
        if (!project.phases[phase]) project.phases[phase] = {};

        project.phases[phase].prompt = prompt;
        await updatePhase(project.id, phase, { prompt });

        await copyToClipboard(prompt);
        showToast('Prompt copied to clipboard!', 'success');

        // Enable the Open AI button and textarea
        const openAiBtn = document.getElementById('open-ai-btn');
        if (openAiBtn) {
          openAiBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
          openAiBtn.classList.add('hover:bg-green-700');
          openAiBtn.removeAttribute('aria-disabled');
        }

        // Show and enable the View Prompt button now that prompt is generated
        const viewPromptBtn = document.getElementById('view-prompt-btn');
        if (viewPromptBtn) {
          viewPromptBtn.classList.remove('hidden', 'opacity-50', 'cursor-not-allowed');
          viewPromptBtn.disabled = false;
        }

        const responseTextarea = document.getElementById('response-textarea');
        if (responseTextarea) {
          responseTextarea.disabled = false;
        }
      } catch (error) {
        console.error('Error generating prompt:', error);
        showToast('Failed to generate prompt', 'error');
      }
    });
  }

  // View prompt button
  const viewPromptBtn = document.getElementById('view-prompt-btn');
  if (viewPromptBtn) {
    viewPromptBtn.addEventListener('click', () => {
      const phaseData = project.phases && project.phases[phase] ? project.phases[phase] : {};
      if (phaseData.prompt) {
        showPromptModal(phaseData.prompt, `Phase ${phase}: ${meta.title} Prompt`);
      }
    });
  }

  // Response textarea input handler
  const responseTextarea = document.getElementById('response-textarea');
  const saveResponseBtn = document.getElementById('save-response-btn');
  if (responseTextarea) {
    responseTextarea.addEventListener('input', () => {
      const hasContent = responseTextarea.value.trim().length > 0;
      if (saveResponseBtn) saveResponseBtn.disabled = !hasContent;
    });
  }

  // Save response button
  if (saveResponseBtn) {
    saveResponseBtn.addEventListener('click', async () => {
      const response = responseTextarea?.value.trim();
      if (response) {
        // Initialize phases object if needed
        if (!project.phases) project.phases = {};
        if (!project.phases[phase]) project.phases[phase] = {};

        project.phases[phase].response = response;
        project.phases[phase].completed = true;
        await updatePhase(project.id, phase, { response, completed: true });

        showToast('Response saved!', 'success');

        // Re-render to show completion status and next button
        document.getElementById('phase-content').innerHTML = renderPhaseContent(project, phase);
        attachPhaseEventListeners(project, phase);

        // Update tab to show checkmark
        const tab = document.querySelector(`.phase-tab[data-phase="${phase}"]`);
        if (tab && !tab.innerHTML.includes('✓')) {
          tab.innerHTML += '<span class="ml-2 text-green-500">✓</span>';
        }
      }
    });
  }
}
