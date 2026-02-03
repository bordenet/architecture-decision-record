/**
 * Project Management Module
 * Handles project CRUD operations and business logic
 * @module projects
 */

import { storage } from './storage.js';

/**
 * Extract title from final document markdown content
 * @param {string} markdown - Document markdown content
 * @returns {string} Extracted title or empty string
 */
function extractTitleFromMarkdown(markdown) {
  if (!markdown) return '';

  // First try: H1 header (# Title)
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) {
    const title = h1Match[1].trim();
    // Skip generic headers like "PRESS RELEASE" or "Press Release"
    if (!/^press\s+release$/i.test(title)) {
      return title;
    }
  }

  // Second try: Bold headline after "# PRESS RELEASE" or "## Press Release"
  // Pattern: **Headline Text**
  const prMatch = markdown.match(/^#\s*PRESS\s*RELEASE\s*$/im);
  if (prMatch) {
    const startIdx = markdown.indexOf(prMatch[0]) + prMatch[0].length;
    const afterPR = markdown.slice(startIdx).trim();
    const boldMatch = afterPR.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      return boldMatch[1].trim();
    }
  }

  // Third try: First bold line in the document
  const firstBoldMatch = markdown.match(/\*\*(.+?)\*\*/);
  if (firstBoldMatch) {
    const title = firstBoldMatch[1].trim();
    // Only use if it looks like a headline (not too long, not a sentence)
    if (title.length > 10 && title.length < 150 && !title.endsWith('.')) {
      return title;
    }
  }

  return '';
}

/**
 * Create a new project
 * @param {string} title - ADR title
 * @param {string} context - ADR context
 * @param {string} [status='Proposed'] - ADR status
 * @returns {Promise<import('./types.js').Project>}
 */
export async function createProject(title, context, status = 'Proposed') {
  const project = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title.trim(),
    context: context.trim(),
    status: status,
    phase: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phases: {
      1: { prompt: '', response: '', completed: false },
      2: { prompt: '', response: '', completed: false },
      3: { prompt: '', response: '', completed: false }
    }
  };

  await storage.saveProject(project);
  return project;
}

/**
 * Get all projects
 * @returns {Promise<import('./types.js').Project[]>}
 */
export async function getAllProjects() {
  return await storage.getAllProjects();
}

/**
 * Get a single project
 * @param {string} id - Project ID
 * @returns {Promise<import('./types.js').Project | undefined>}
 */
export async function getProject(id) {
  return await storage.getProject(id);
}

/**
 * Update project phase data (canonical pattern matching one-pager)
 * @param {string} projectId - Project ID
 * @param {number} phase - Phase number (1, 2, or 3)
 * @param {string} prompt - The prompt used for this phase
 * @param {string} response - The AI response for this phase
 * @param {Object} options - Options object
 * @param {boolean} options.skipAutoAdvance - If true, don't auto-advance to next phase
 * @returns {Promise<Object>} Updated project
 */
export async function updatePhase(projectId, phase, prompt, response, options = {}) {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  const { skipAutoAdvance = false } = options;

  // Initialize phases if needed
  if (!project.phases) project.phases = {};
  if (!project.phases[phase]) {
    project.phases[phase] = { prompt: '', response: '', completed: false };
  }

  project.phases[phase] = {
    prompt: prompt || '',
    response: response || '',
    completed: !!response
  };

  // Keep legacy flat field for backward compatibility (e.g., phase1_output)
  if (response) {
    const phaseKey = `phase${phase}_output`;
    project[phaseKey] = response;
  }

  // Auto-advance to next phase if current phase is completed (unless skipped)
  if (response && phase < 3 && !skipAutoAdvance) {
    project.phase = phase + 1;
  }

  // Phase 3: Extract title from final document and update project title
  if (phase === 3 && response) {
    const extractedTitle = extractTitleFromMarkdown(response);
    if (extractedTitle) {
      project.title = extractedTitle;
    }
  }

  project.updatedAt = new Date().toISOString();
  await storage.saveProject(project);
  return project;
}

/**
 * Update project metadata
 * @param {string} projectId - Project ID
 * @param {Partial<import('./types.js').Project>} updates - Updates to apply
 * @returns {Promise<import('./types.js').Project>}
 */
export async function updateProject(projectId, updates) {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  Object.assign(project, updates);
  project.updatedAt = new Date().toISOString();
  await storage.saveProject(project);
  return project;
}

/**
 * Delete a project
 * @param {string} id - Project ID
 * @returns {Promise<void>}
 */
export async function deleteProject(id) {
  await storage.deleteProject(id);
}

/**
 * Sanitize filename for export
 * @param {string} filename - Filename to sanitize
 * @returns {string}
 */
function sanitizeFilename(filename) {
  return (filename || 'untitled')
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .substring(0, 50);
}

/**
 * Export a single project as JSON
 * @param {string} projectId - Project ID
 * @returns {Promise<void>}
 */
export async function exportProject(projectId) {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(project.title)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export all projects as a backup JSON
 * @returns {Promise<void>}
 */
export async function exportAllProjects() {
  const projects = await storage.getAllProjects();

  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projectCount: projects.length,
    projects: projects
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `adr-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import projects from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<number>} Number of imported projects
 */
export async function importProjects(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = JSON.parse(e.target.result);
        let imported = 0;

        if (content.version && content.projects) {
          for (const project of content.projects) {
            await storage.saveProject(project);
            imported++;
          }
        } else if (content.id && content.title) {
          await storage.saveProject(content);
          imported = 1;
        } else {
          throw new Error('Invalid file format');
        }

        resolve(imported);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
