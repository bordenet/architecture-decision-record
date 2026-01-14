/**
 * Workflow Module
 * Manages the 3-phase ADR creation workflow
 * @module workflow
 */

import { WORKFLOW_CONFIG, generatePhase1Prompt, generatePhase2Prompt, generatePhase3Prompt } from './prompts.js';

// Re-export WORKFLOW_CONFIG for backward compatibility
export { WORKFLOW_CONFIG };

/**
 * @typedef {Object} PhaseMetadata
 * @property {string} title - Phase title
 * @property {string} description - Phase description
 * @property {string} ai - AI model name
 * @property {string} icon - Emoji icon
 * @property {string} color - Color theme
 */

/**
 * Get phase metadata for UI display
 * @param {import('./types.js').PhaseNumber} phase - Phase number
 * @returns {PhaseMetadata}
 */
export function getPhaseMetadata(phase) {
  const phases = {
    1: {
      title: 'Initial Draft',
      description: 'Generate the first draft of your ADR using Claude',
      ai: 'Claude',
      icon: '📝',
      color: 'blue'
    },
    2: {
      title: 'Alternative Perspective',
      description: 'Get a different perspective and improvements from Gemini',
      ai: 'Gemini',
      icon: '🔄',
      color: 'green'
    },
    3: {
      title: 'Final Synthesis',
      description: 'Combine the best elements into a polished final ADR',
      ai: 'Claude',
      icon: '✨',
      color: 'purple'
    }
  };

  return phases[phase] || phases[1];
}

/**
 * Helper to get phase data, handling both object and array formats
 * @param {Object} project - Project object
 * @param {number} phaseNum - 1-based phase number
 * @returns {Object} Phase data object with prompt, response, completed
 */
function getPhaseData(project, phaseNum) {
  const defaultPhase = { prompt: '', response: '', completed: false };
  if (!project.phases) return defaultPhase;

  // Array format first (legacy)
  if (Array.isArray(project.phases) && project.phases[phaseNum - 1]) {
    return project.phases[phaseNum - 1];
  }
  // Object format (canonical)
  if (project.phases[phaseNum] && typeof project.phases[phaseNum] === 'object') {
    return project.phases[phaseNum];
  }
  return defaultPhase;
}

/**
 * Generate prompt for a specific phase
 * Uses prompts.js module for template loading and variable replacement
 * @param {import('./types.js').Project} project - The project object
 * @param {import('./types.js').PhaseNumber} phaseNumber - The phase number (1, 2, or 3)
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePromptForPhase(project, phaseNumber) {
  const phase = phaseNumber || project.phase || 1;

  if (phase === 1) {
    // Phase 1: Initial Draft - use project fields
    const formData = {
      title: project.title || '',
      status: project.status || 'Proposed',
      context: project.context || ''
    };
    return generatePhase1Prompt(formData);
  } else if (phase === 2) {
    // Phase 2: Gemini Review - include Phase 1 output
    const phase1Output = getPhaseData(project, 1).response || '[No Phase 1 output yet]';
    return generatePhase2Prompt(phase1Output);
  } else if (phase === 3) {
    // Phase 3: Final Synthesis - include both Phase 1 and Phase 2 outputs
    const phase1Output = getPhaseData(project, 1).response || '[No Phase 1 output yet]';
    const phase2Output = getPhaseData(project, 2).response || '[No Phase 2 output yet]';
    return generatePhase3Prompt(phase1Output, phase2Output);
  }

  return '';
}

/**
 * Export final ADR document
 * @param {import('./types.js').Project} project - Project to export
 * @returns {void}
 */
export function exportFinalADR(project) {
  let content = '';

  if (project.phases && project.phases[3] && project.phases[3].response) {
    content = project.phases[3].response;
  } else if (project.phases && project.phases[1] && project.phases[1].response) {
    content = project.phases[1].response;
  } else {
    content = `# ${project.title || 'Untitled ADR'}\n\n**Status:** ${project.status || 'Proposed'}\n\n## Context\n\n${project.context || ''}`;
  }

  const filename = `${(project.title || 'adr').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-adr.md`;

  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Get the final markdown content from a project
 * @param {import('./types.js').Project} project - Project object
 * @returns {string|null} The markdown content or null if none exists
 */
export function getFinalMarkdown(project) {
  const attribution = '\n\n---\n\n*Generated with [Architecture Decision Record Assistant](https://bordenet.github.io/architecture-decision-record/)*';

  if (project.phases && project.phases[3] && project.phases[3].response) {
    return project.phases[3].response + attribution;
  } else if (project.phases && project.phases[1] && project.phases[1].response) {
    return project.phases[1].response + attribution;
  }
  return null;
}

/**
 * Generate export filename for a project
 * @param {import('./types.js').Project} project - Project object
 * @returns {string} Filename with .md extension
 */
export function getExportFilename(project) {
  return `${(project.title || 'adr').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-adr.md`;
}
