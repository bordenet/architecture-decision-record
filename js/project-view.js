/**
 * Project View Module
 * Handles project detail view rendering and editing
 */

class ProjectView {
  constructor(project) {
    this.project = project;
  }

  render() {
    return `
      <div class="project-view">
        <h1>${this.project.title || "Untitled Project"}</h1>
        <p>${this.project.context}</p>
      </div>
    `;
  }

  renderEditor() {
    return `
      <div class="project-editor">
        <input type="text" value="${this.project.title}" placeholder="Project title" />
        <textarea placeholder="Context">${this.project.context}</textarea>
      </div>
    `;
  }
}

module.exports = { ProjectView };
