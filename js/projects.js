/**
 * Projects Module
 * Manages project-related operations
 */

class ProjectManager {
  constructor(storage) {
    this.storage = storage;
  }

  async createProject(data) {
    const project = {
      id: Date.now().toString(),
      title: data.title || "",
      context: data.context || "",
      decision: data.decision || "",
      consequences: data.consequences || "",
      rationale: data.rationale || "",
      status: "Proposed",
      phase: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.storage.saveProject(project);
  }

  async updateProject(id, data) {
    const project = await this.storage.getProject(id);
    if (project) {
      Object.assign(project, data, { updatedAt: new Date().toISOString() });
      return this.storage.saveProject(project);
    }
  }
}

module.exports = { ProjectManager };
