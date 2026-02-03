/**
 * Project View Module
 * Handles rendering project workflow view and phase interactions
 * @module project-view
 */

import { getProject, updatePhase, updateProject, deleteProject } from './projects.js';
import { getPhaseMetadata, generatePromptForPhase, getFinalMarkdown, getExportFilename, WORKFLOW_CONFIG } from './workflow.js';
import { escapeHtml, showToast, copyToClipboardAsync, confirm, showPromptModal, showDocumentPreviewModal } from './ui.js';
import { navigateTo } from './router.js';
import { preloadPromptTemplates } from './prompts.js';

/**
 * Render the project detail view
 * @param {string} projectId - Project ID
 * @returns {Promise<void>}
 */
export async function renderProjectView(projectId) {
  // Preload prompt templates to avoid network delay on first clipboard operation
  // Fire-and-forget: don't await, let it run in parallel with project load
  preloadPromptTemplates().catch(() => {});

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
                    📄 Preview & Copy
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
    exportBtn.addEventListener('click', () => {
      const markdown = getFinalMarkdown(project);
      if (markdown) {
        showDocumentPreviewModal(markdown, 'Your ADR is Ready', getExportFilename(project));
      } else {
        showToast('No ADR content to export', 'warning');
      }
    });
  }

  // Phase tabs - re-fetch project to ensure fresh data
  document.querySelectorAll('.phase-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      const targetPhase = parseInt(tab.dataset.phase);

      // Re-fetch project from storage to get fresh data
      const freshProject = await getProject(project.id);

      // Guard: Can only navigate to a phase if all prior phases are complete
      // Phase 1 is always accessible
      if (targetPhase > 1) {
        const priorPhase = targetPhase - 1;
        const priorPhaseComplete = freshProject.phases?.[priorPhase]?.completed;
        if (!priorPhaseComplete) {
          showToast(`Complete Phase ${priorPhase} before proceeding to Phase ${targetPhase}`, 'warning');
          return;
        }
      }

      freshProject.phase = targetPhase;
      updatePhaseTabStyles(targetPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, targetPhase);
      attachPhaseEventListeners(freshProject, targetPhase);
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

  // Completion banner shown above Phase 3 content when phase is complete
  const completionBanner = phase === 3 && hasResponse ? `
        <div class="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h4 class="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center">
                        <span class="mr-2">🎉</span> Your ADR is Complete!
                    </h4>
                    <p class="text-green-700 dark:text-green-400 mt-1">
                        <strong>Next steps:</strong> Preview & copy, then validate your document.
                    </p>
                </div>
                <div class="flex gap-3 flex-wrap items-center">
                    <button id="export-complete-btn" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg">
                        📄 Preview & Copy
                    </button>
                    <span class="text-gray-500 dark:text-gray-400">then</span>
                    <a href="https://bordenet.github.io/architecture-decision-record/validator/" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline font-medium text-lg">
                        Validate & Score ↗
                    </a>
                </div>
            </div>
            <!-- Expandable Help Section -->
            <details class="mt-4">
                <summary class="text-sm text-green-700 dark:text-green-400 cursor-pointer hover:text-green-800 dark:hover:text-green-300">
                    Need help using your document?
                </summary>
                <div class="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    <ol class="list-decimal list-inside space-y-2">
                        <li>Click <strong>"Preview & Copy"</strong> to see your formatted document</li>
                        <li>Click <strong>"Copy Formatted Text"</strong> in the preview</li>
                        <li>Open <strong>Microsoft Word</strong> or <strong>Google Docs</strong> and paste</li>
                        <li>Use <strong><a href="https://bordenet.github.io/architecture-decision-record/validator/" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">ADR Validator</a></strong> to score and improve your document</li>
                    </ol>
                    <p class="mt-3 text-gray-500 dark:text-gray-400 text-xs">
                        💡 The validator provides instant feedback and AI-powered suggestions for improvement.
                    </p>
                </div>
            </details>
        </div>
  ` : '';

  return `
        ${completionBanner}

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

  // Previous phase button - re-fetch project to ensure fresh data
  const prevPhaseBtn = document.getElementById('prev-phase-btn');
  if (prevPhaseBtn) {
    prevPhaseBtn.addEventListener('click', async () => {
      const prevPhase = phase - 1;
      if (prevPhase < 1) return;

      // Re-fetch project from storage to get fresh data
      const freshProject = await getProject(project.id);
      freshProject.phase = prevPhase;

      updatePhaseTabStyles(prevPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, prevPhase);
      attachPhaseEventListeners(freshProject, prevPhase);
    });
  }

  // Next phase button - re-fetch project to ensure fresh data
  const nextPhaseBtn = document.getElementById('next-phase-btn');
  if (nextPhaseBtn) {
    nextPhaseBtn.addEventListener('click', async () => {
      const nextPhase = phase + 1;

      // Re-fetch project from storage to get fresh data
      const freshProject = await getProject(project.id);
      freshProject.phase = nextPhase;

      updatePhaseTabStyles(nextPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, nextPhase);
      attachPhaseEventListeners(freshProject, nextPhase);
    });
  }

  // Export button in phase content (Preview & Copy)
  const exportPhaseBtn = document.getElementById('export-complete-btn');
  if (exportPhaseBtn) {
    exportPhaseBtn.addEventListener('click', () => {
      const markdown = getFinalMarkdown(project);
      if (markdown) {
        showDocumentPreviewModal(markdown, 'Your ADR is Ready', getExportFilename(project));
      } else {
        showToast('No ADR content to export', 'warning');
      }
    });
  }

  // Copy prompt button
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', () => {
      // CRITICAL: Safari transient activation fix
      // We must call copyToClipboardAsync SYNCHRONOUSLY within the click handler
      // Pass a Promise that resolves to the prompt text - the clipboard write happens
      // immediately, preserving Safari's transient activation window
      const promptPromise = (async () => {
        const prompt = await generatePromptForPhase(project, phase);

        // Initialize phases object if needed
        if (!project.phases) project.phases = {};
        if (!project.phases[phase]) project.phases[phase] = {};

        project.phases[phase].prompt = prompt;
        await updatePhase(project.id, phase, { prompt });

        return prompt;
      })();

      // Call clipboard API synchronously with Promise - preserves transient activation
      copyToClipboardAsync(promptPromise)
        .then(() => {
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
        })
        .catch((error) => {
          console.error('Error generating prompt:', error);
          showToast('Failed to generate prompt', 'error');
        });
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

  // Save response button - auto-advance to next phase
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

        // Re-fetch project from storage to get fresh data after saving
        const freshProject = await getProject(project.id);

        // Update tab to show checkmark
        const tab = document.querySelector(`.phase-tab[data-phase="${phase}"]`);
        if (tab && !tab.innerHTML.includes('✓')) {
          tab.innerHTML += '<span class="ml-2 text-green-500">✓</span>';
        }

        // Auto-advance to next phase if not on final phase
        if (phase < WORKFLOW_CONFIG.phaseCount) {
          const nextPhase = phase + 1;
          freshProject.phase = nextPhase;
          showToast('Response saved! Moving to next phase...', 'success');
          updatePhaseTabStyles(nextPhase);
          document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, nextPhase);
          attachPhaseEventListeners(freshProject, nextPhase);
        } else {
          // Final phase - show completion message
          showToast('ADR Complete! You can now export your document.', 'success');
          document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, phase);
          attachPhaseEventListeners(freshProject, phase);
        }
      }
    });
  }
}
