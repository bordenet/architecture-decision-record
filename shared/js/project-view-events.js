/**
 * Project View Events Module
 * Handles event listeners for phase interactions in ADR workflow
 * @module project-view-events
 */

import { getProject, updatePhase, updateProject, deleteProject } from './projects.js';
import { getPhaseMetadata, generatePromptForPhase, getFinalMarkdown, getExportFilename, WORKFLOW_CONFIG, Workflow, detectPromptPaste } from './workflow.js';
import { showToast, copyToClipboard, copyToClipboardAsync, confirm, confirmWithRemember, showPromptModal, showDocumentPreviewModal, createActionMenu } from './ui.js';
import { navigateTo } from './router.js';
import { renderPhaseContent } from './project-view-phase.js';
import { showDiffModal } from './project-view-diff.js';

// Injected helpers to avoid circular imports
let updatePhaseTabStylesFn = null;

/**
 * Set helper functions from main module (avoids circular imports)
 * @param {Object} helpers - Helper functions object
 */
export function setHelpers(helpers) {
  updatePhaseTabStylesFn = helpers.updatePhaseTabStyles;
}

/**
 * Attach event listeners for phase interactions
 * @param {import('./types.js').Project} project - Project data
 * @param {import('./types.js').PhaseNumber} phase - Phase number
 * @returns {void}
 */
export function attachPhaseEventListeners(project, phase) {
  const meta = getPhaseMetadata(phase);

  // Next phase button - re-fetch project to ensure fresh data
  const nextPhaseBtn = document.getElementById('next-phase-btn');
  if (nextPhaseBtn) {
    nextPhaseBtn.addEventListener('click', async () => {
      const nextPhase = phase + 1;

      // Re-fetch project from storage to get fresh data
      const freshProject = await getProject(project.id);
      freshProject.phase = nextPhase;

      updatePhaseTabStylesFn(nextPhase);
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

  // Compare phases button handler (shows diff with phase selectors)
  const comparePhasesBtn = document.getElementById('compare-phases-btn');
  if (comparePhasesBtn) {
    comparePhasesBtn.addEventListener('click', () => {
      const phases = {
        1: project.phases?.[1]?.response || '',
        2: project.phases?.[2]?.response || '',
        3: project.phases?.[3]?.response || ''
      };

      // Need at least 2 phases completed
      const completedPhases = Object.entries(phases).filter(([, v]) => v).map(([k]) => parseInt(k));
      if (completedPhases.length < 2) {
        showToast('At least 2 phases must be completed to compare', 'warning');
        return;
      }

      showDiffModal(phases, completedPhases);
    });
  }

  // Copy prompt button
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', async () => {
      // Check if warning was previously acknowledged
      const warningAcknowledged = localStorage.getItem('external-ai-warning-acknowledged');

      if (!warningAcknowledged) {
        const result = await confirmWithRemember(
          'You are about to copy a prompt that may contain proprietary data.\n\n' +
                  '• This prompt will be pasted into an external AI service (Claude/Gemini)\n' +
                  '• Data sent to these services is processed on third-party servers\n' +
                  '• For sensitive documents, use an internal tool like LibreGPT instead\n\n' +
                  'Do you want to continue?',
          'External AI Warning',
          { confirmText: 'Copy Prompt', cancelText: 'Cancel' }
        );

        if (!result.confirmed) {
          showToast('Copy cancelled', 'info');
          return;
        }

        // Remember the choice permanently if checkbox was checked
        if (result.remember) {
          localStorage.setItem('external-ai-warning-acknowledged', 'true');
        }
      }

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
        // Save prompt without auto-advancing (skipAutoAdvance: true)
        await updatePhase(project.id, phase, prompt, '', { skipAutoAdvance: true });

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

  // Response textarea input handler
  const responseTextarea = document.getElementById('response-textarea');
  const saveResponseBtn = document.getElementById('save-response-btn');
  if (responseTextarea) {
    responseTextarea.addEventListener('input', () => {
      const hasContent = responseTextarea.value.trim().length > 0;
      if (saveResponseBtn) saveResponseBtn.disabled = !hasContent;
    });
  }

  // Save response button - auto-advance to next phase (canonical pattern matching one-pager)
  if (saveResponseBtn) {
    saveResponseBtn.addEventListener('click', async () => {
      const response = responseTextarea?.value.trim();
      if (response) {
        // Check if user accidentally pasted the prompt instead of the AI response
        const promptCheck = detectPromptPaste(response);
        if (promptCheck.isPrompt) {
          showToast(promptCheck.reason, 'error');
          return;
        }

        // Re-fetch project to get fresh prompt data (not stale closure)
        const freshProject = await getProject(project.id);
        const currentPrompt = freshProject.phases?.[phase]?.prompt || '';

        // Use canonical updatePhase - handles both saving AND auto-advance
        await updatePhase(project.id, phase, currentPrompt, response);

        // Re-fetch updated project (updatePhase already advanced the phase)
        const updatedProject = await getProject(project.id);

        // Update tab to show checkmark
        const tab = document.querySelector(`.phase-tab[data-phase="${phase}"]`);
        if (tab && !tab.innerHTML.includes('✓')) {
          tab.innerHTML += '<span class="ml-2 text-green-500">✓</span>';
        }

        // Auto-advance to next phase if not on final phase
        if (phase < WORKFLOW_CONFIG.phaseCount) {
          const nextPhase = phase + 1;
          showToast('Response saved! Moving to next phase...', 'success');
          updatePhaseTabStylesFn(nextPhase);
          document.getElementById('phase-content').innerHTML = renderPhaseContent(updatedProject, nextPhase);
          attachPhaseEventListeners(updatedProject, nextPhase);
        } else {
          // Final phase - set phase to 4 (complete state)
          await updateProject(project.id, { phase: 4 });
          showToast('ADR Complete! You can now export your document.', 'success');
          const completeProject = await getProject(project.id);
          document.getElementById('phase-content').innerHTML = renderPhaseContent(completeProject, phase);
          attachPhaseEventListeners(completeProject, phase);
        }
      }
    });
  }

  // Setup overflow "More" menu with secondary actions
  const moreActionsBtn = document.getElementById('more-actions-btn');
  if (moreActionsBtn) {
    const phaseData = project.phases?.[phase] || {};
    const hasPrompt = !!phaseData.prompt;

    // Build menu items based on current state
    const menuItems = [];

    // View Prompt (only if prompt exists)
    if (hasPrompt) {
      menuItems.push({
        label: 'View Prompt',
        icon: '👁️',
        onClick: async () => {
          const prompt = await generatePromptForPhase(project, phase);
          showPromptModal(prompt, `Phase ${phase}: ${meta.name} Prompt`);
        }
      });
    }

    // Edit Details (always available)
    menuItems.push({
      label: 'Edit Details',
      icon: '✏️',
      onClick: () => navigateTo('edit-project/' + project.id)
    });

    // Compare Phases (only if 2+ phases completed)
    const workflow = new Workflow(project);
    const completedCount = [1, 2, 3].filter(p => workflow.getPhaseOutput(p)).length;
    if (completedCount >= 2) {
      menuItems.push({
        label: 'Compare Phases',
        icon: '🔄',
        onClick: () => {
          const phases = {
            1: workflow.getPhaseOutput(1),
            2: workflow.getPhaseOutput(2),
            3: workflow.getPhaseOutput(3)
          };
          const completedPhases = Object.entries(phases).filter(([, v]) => v).map(([k]) => parseInt(k));
          showDiffModal(phases, completedPhases);
        }
      });
    }

    // Validate (only if Phase 3 complete)
    if (project.phases?.[3]?.completed) {
      menuItems.push({
        label: 'Copy & Full Validation',
        icon: '📋',
        onClick: async () => {
          const markdown = getFinalMarkdown(project);
          if (markdown) {
            try {
              await copyToClipboard(markdown);
              showToast('Document copied! Opening validator...', 'success');
              setTimeout(() => {
                window.open('https://bordenet.github.io/architecture-decision-record/validator/', '_blank', 'noopener,noreferrer');
              }, 500);
            } catch {
              showToast('Failed to copy. Please try again.', 'error');
            }
          }
        }
      });
    }

    // Separator before destructive action
    menuItems.push({ separator: true });

    // Delete (destructive)
    menuItems.push({
      label: 'Delete...',
      icon: '🗑️',
      destructive: true,
      onClick: async () => {
        if (await confirm(`Are you sure you want to delete "${project.title}"?`, 'Delete ADR')) {
          await deleteProject(project.id);
          showToast('ADR deleted', 'success');
          navigateTo('home');
        }
      }
    });

    createActionMenu({
      triggerElement: moreActionsBtn,
      items: menuItems,
      position: 'bottom-end'
    });
  }
}
