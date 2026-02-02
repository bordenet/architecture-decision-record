/**
 * Workflow Module
 * Manages the 3-phase ADR creation workflow
 * @module workflow
 */

import {
  WORKFLOW_CONFIG,
  generatePhase1Prompt as genPhase1,
  generatePhase2Prompt as genPhase2,
  generatePhase3Prompt as genPhase3
} from './prompts.js';

// Re-export WORKFLOW_CONFIG for backward compatibility
export { WORKFLOW_CONFIG };

/**
 * Helper to get phase output - supports both flat and nested formats for backward compatibility
 * @param {Object} project - Project object
 * @param {number} phaseNum - 1-based phase number
 * @returns {string} Phase output or empty string
 */
function getPhaseOutputInternal(project, phaseNum) {
  // Flat format (canonical) - check first
  const flatKey = `phase${phaseNum}_output`;
  if (project[flatKey]) {
    return project[flatKey];
  }
  // Nested format (legacy) - fallback
  if (project.phases) {
    if (Array.isArray(project.phases) && project.phases[phaseNum - 1]) {
      return project.phases[phaseNum - 1].response || '';
    }
    if (project.phases[phaseNum] && typeof project.phases[phaseNum] === 'object') {
      return project.phases[phaseNum].response || '';
    }
  }
  return '';
}

export class Workflow {
  constructor(project) {
    this.project = project;
    // Clamp phase to valid range (1 to phaseCount)
    const rawPhase = project.phase || 1;
    this.currentPhase = Math.max(1, rawPhase);
  }

  /**
   * Get current phase configuration
   */
  getCurrentPhase() {
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase);
  }

  /**
   * Get next phase configuration
   */
  getNextPhase() {
    if (this.currentPhase >= WORKFLOW_CONFIG.phaseCount) {
      return null;
    }
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase + 1);
  }

  /**
   * Check if workflow is complete
   */
  isComplete() {
    return this.currentPhase > WORKFLOW_CONFIG.phaseCount;
  }

  /**
   * Advance to next phase
   */
  advancePhase() {
    // Allow advancing up to phase 4 (complete state)
    if (this.currentPhase <= WORKFLOW_CONFIG.phaseCount) {
      this.currentPhase++;
      this.project.phase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
   * Go back to previous phase
   */
  previousPhase() {
    if (this.currentPhase > 1) {
      this.currentPhase--;
      this.project.phase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
   * Generate prompt for current phase
   * Uses prompts.js module for template loading and variable replacement
   */
  async generatePrompt() {
    const p = this.project;

    switch (this.currentPhase) {
    case 1: {
      const formData = {
        title: p.title || '',
        status: p.status || 'Proposed',
        context: p.context || ''
      };
      return await genPhase1(formData);
    }
    case 2: {
      const phase1Output = getPhaseOutputInternal(p, 1) || '[Phase 1 output not yet generated]';
      return await genPhase2(phase1Output);
    }
    case 3: {
      const phase1Output = getPhaseOutputInternal(p, 1) || '[Phase 1 output not yet generated]';
      const phase2Output = getPhaseOutputInternal(p, 2) || '[Phase 2 output not yet generated]';
      return await genPhase3(phase1Output, phase2Output);
    }
    default:
      throw new Error(`Invalid phase: ${this.currentPhase}`);
    }
  }

  /**
   * Save phase output (uses flat structure: project.phase1_output, etc.)
   */
  savePhaseOutput(output) {
    const phaseKey = `phase${this.currentPhase}_output`;
    this.project[phaseKey] = output;
    this.project.updatedAt = new Date().toISOString();
  }

  /**
   * Get phase output
   */
  getPhaseOutput(phaseNumber) {
    return getPhaseOutputInternal(this.project, phaseNumber);
  }

  /**
   * Export final output as Markdown
   */
  exportAsMarkdown() {
    const attribution = '\n\n---\n\n*Generated with [Architecture Decision Record Assistant](https://bordenet.github.io/architecture-decision-record/)*';

    // Return Phase 3 output if available, otherwise Phase 1
    const phase3Output = this.getPhaseOutput(3);
    const phase1Output = this.getPhaseOutput(1);

    if (phase3Output) {
      return phase3Output + attribution;
    } else if (phase1Output) {
      return phase1Output + attribution;
    }

    // Fallback to project metadata
    let markdown = `# ${this.project.title || 'Untitled ADR'}\n\n`;
    markdown += `**Status:** ${this.project.status || 'Proposed'}\n\n`;
    markdown += `## Context\n\n${this.project.context || ''}\n`;
    return markdown + attribution;
  }

  /**
   * Get workflow progress percentage
   */
  getProgress() {
    return Math.round((this.currentPhase / WORKFLOW_CONFIG.phaseCount) * 100);
  }
}

/**
 * Standalone helper functions for use in views
 * These provide a simpler API for common workflow operations
 */

/**
 * Get metadata for a specific phase
 * @param {number} phaseNumber - Phase number (1, 2, 3, etc.)
 * @returns {Object} Phase metadata
 */
export function getPhaseMetadata(phaseNumber) {
  return WORKFLOW_CONFIG.phases.find(p => p.number === phaseNumber);
}

/**
 * Generate prompt for a specific phase
 * @param {Object} project - Project object
 * @param {number} phaseNumber - Phase number
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePromptForPhase(project, phaseNumber) {
  const workflow = new Workflow(project);
  workflow.currentPhase = phaseNumber;
  return await workflow.generatePrompt();
}

/**
 * Export final document as Markdown
 * @param {Object} project - Project object
 * @returns {string} Markdown content
 */
export function exportFinalDocument(project) {
  const workflow = new Workflow(project);
  return workflow.exportAsMarkdown();
}

/**
 * Export final ADR document (triggers download)
 * @param {Object} project - Project to export
 * @returns {void}
 */
export function exportFinalADR(project) {
  const content = exportFinalDocument(project);
  const filename = getExportFilename(project);

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
 * @param {Object} project - Project object
 * @returns {string|null} The markdown content or null if none exists
 */
export function getFinalMarkdown(project) {
  if (!project) return null;

  const attribution = '\n\n---\n\n*Generated with [Architecture Decision Record Assistant](https://bordenet.github.io/architecture-decision-record/)*';

  // Check if phase 3 is complete and has output (flat format first, then legacy nested)
  const phase3Output = project.phase3_output ||
    (project.phases && project.phases[3] && project.phases[3].response);
  const phase1Output = project.phase1_output ||
    (project.phases && project.phases[1] && project.phases[1].response);

  if (phase3Output) {
    return phase3Output + attribution;
  } else if (phase1Output) {
    return phase1Output + attribution;
  }

  return null;
}

/**
 * Generate export filename for a project
 * @param {Object} project - Project object
 * @returns {string} Filename with .md extension
 */
export function getExportFilename(project) {
  const title = project.title || project.name || 'adr';
  // Sanitize filename: remove special chars, replace spaces with hyphens
  const sanitized = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  return `${sanitized}-adr.md`;
}
