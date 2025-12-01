/**
 * Views Module
 * Handles view rendering
 */

function renderPhase1Form(project) {
  return `
    <div class="phase-1-form space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Phase 1: Initial Draft</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Fill in your architectural decision details
          </p>
        </div>
        <button id="back-to-list-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          ← Back
        </button>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <!-- Title -->
        <div>
          <label for="title-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ADR Title
          </label>
          <input 
            type="text" 
            id="title-input" 
            placeholder="e.g., Use microservices architecture"
            value="${project.title || ""}"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>

        <!-- Status -->
        <div>
          <label for="status-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select 
            id="status-select"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Proposed" ${project.status === "Proposed" ? "selected" : ""}>Proposed</option>
            <option value="Accepted" ${project.status === "Accepted" ? "selected" : ""}>Accepted</option>
            <option value="Deprecated" ${project.status === "Deprecated" ? "selected" : ""}>Deprecated</option>
            <option value="Superseded" ${project.status === "Superseded" ? "selected" : ""}>Superseded</option>
          </select>
        </div>

        <!-- Context -->
        <div>
          <label for="context-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Context & Problem Statement
          </label>
          <textarea 
            id="context-textarea"
            rows="6"
            placeholder="Describe the issue or problem this decision addresses..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.context || ""}</textarea>
        </div>

        <!-- Decision -->
        <div>
          <label for="decision-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Decision (Optional - AI can help generate this)
          </label>
          <textarea 
            id="decision-textarea"
            rows="6"
            placeholder="Describe the decision made or leave blank for AI to generate..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.decision || ""}</textarea>
        </div>

        <!-- Consequences -->
        <div>
          <label for="consequences-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Consequences (Optional - AI can help generate this)
          </label>
          <textarea 
            id="consequences-textarea"
            rows="4"
            placeholder="What are the consequences of this decision?..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.consequences || ""}</textarea>
        </div>

        <!-- Rationale -->
        <div>
          <label for="rationale-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rationale (Optional - AI can help generate this)
          </label>
          <textarea 
            id="rationale-textarea"
            rows="4"
            placeholder="Why is this the best decision?..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.rationale || ""}</textarea>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="space-x-3">
          <button id="save-phase1-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save & Continue
          </button>
          <button id="generate-ai-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            ✨ Generate with AI
          </button>
        </div>
        <button id="delete-project-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Delete
        </button>
      </div>
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

module.exports = { renderPhase1Form, renderPhase2, renderPhase3 };
