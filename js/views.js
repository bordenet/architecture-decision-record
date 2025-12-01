/**
 * Views Module
 * Handles view rendering
 */

function renderPhase1(project) {
  return `
    <div class="phase-1">
      <h2>Phase 1: Initial Draft</h2>
      <p>${project.context || "No context provided"}</p>
    </div>
  `;
}

function renderPhase2(project) {
  return `
    <div class="phase-2">
      <h2>Phase 2: Review & Critique</h2>
      <p>${project.decision || "No decision provided"}</p>
    </div>
  `;
}

function renderPhase3(project) {
  return `
    <div class="phase-3">
      <h2>Phase 3: Final Synthesis</h2>
      <p>${project.rationale || "No rationale provided"}</p>
    </div>
  `;
}

module.exports = { renderPhase1, renderPhase2, renderPhase3 };
