/**
 * Project Management Module
 * Handles project CRUD operations and business logic
 */

import { storage } from './storage.js';

/**
 * Create a new project
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
 */
export async function getAllProjects() {
  return await storage.getAllProjects();
}

/**
 * Get a single project
 */
export async function getProject(id) {
  return await storage.getProject(id);
}

/**
 * Update project phase data
 * @param {string} projectId - Project ID
 * @param {number} phase - Phase number (1, 2, or 3)
 * @param {object} updates - Object with prompt, response, and/or completed fields
 */
export async function updatePhase(projectId, phase, updates = {}) {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  // Initialize phases if needed
  if (!project.phases) project.phases = {};
  if (!project.phases[phase]) {
    project.phases[phase] = { prompt: '', response: '', completed: false };
  }

  // Apply updates
  if (updates.prompt !== undefined) {
    project.phases[phase].prompt = updates.prompt;
  }
  if (updates.response !== undefined) {
    project.phases[phase].response = updates.response;
  }
  if (updates.completed !== undefined) {
    project.phases[phase].completed = updates.completed;
  }

  project.updatedAt = new Date().toISOString();
  await storage.saveProject(project);
  return project;
}

/**
 * Update project metadata
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
 */
export async function deleteProject(id) {
  await storage.deleteProject(id);
}

/**
 * Sanitize filename for export
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
