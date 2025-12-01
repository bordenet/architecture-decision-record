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
            Save
          </button>
          <button id="generate-ai-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            ✨ Generate with AI
          </button>
          <button id="next-phase-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            → Phase 2
          </button>
        </div>
        <button id="delete-project-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Delete
        </button>
      </div>
    </div>
  `;
}

function renderPhase2Form(project) {
  return `
    <div class="phase-2-form space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Phase 2: Review & Critique</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Get adversarial feedback from external AI review
          </p>
        </div>
        <button id="back-to-phase1-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          ← Back
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Original Decision -->
        <div class="lg:col-span-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Decision</h3>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
              <p class="text-gray-900 dark:text-white font-medium">${project.title || "Untitled"}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Context</label>
              <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">${project.context || "No context"}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Decision</label>
              <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">${project.decision || "No decision"}</p>
            </div>
          </div>
        </div>

        <!-- Adversarial Review -->
        <div class="lg:col-span-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Adversarial Critique</h3>
          <div>
            <label for="review-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Critical Feedback
            </label>
            <textarea 
              id="review-textarea"
              rows="12"
              placeholder="Generate adversarial feedback..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            >${project.phase2Review || ""}</textarea>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="space-x-3">
          <button id="save-phase2-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save & Continue
          </button>
          <button id="generate-review-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            ✨ Generate Critique
          </button>
        </div>
        <button id="skip-phase2-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          Skip to Phase 3
        </button>
      </div>
    </div>
  `;
}

function renderPhase3Form(project) {
  return `
    <div class="phase-3-form space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Phase 3: Final Synthesis</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Synthesize your decision with expert feedback
          </p>
        </div>
        <button id="back-to-phase2-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          ← Back
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column: Original and Feedback -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Original Decision -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Your Original Decision</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">${project.decision || "No decision"}</p>
          </div>

          <!-- Adversarial Feedback -->
          <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h3 class="font-semibold text-yellow-900 dark:text-yellow-200 mb-3">Adversarial Feedback</h3>
            <p class="text-sm text-yellow-800 dark:text-yellow-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
              ${project.phase2Review || "No feedback yet"}
            </p>
          </div>
        </div>

        <!-- Right Column: Final ADR -->
        <div class="lg:col-span-1">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Final ADR Document</h3>
          <textarea 
            id="final-adr-textarea"
            rows="20"
            placeholder="Final synthesized ADR will appear here..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
          >${project.finalADR || ""}</textarea>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="space-x-3">
          <button id="synthesize-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            ✨ Synthesize & Generate
          </button>
          <button id="export-adr-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            📥 Export ADR
          </button>
        </div>
        <button id="save-phase3-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Save
        </button>
      </div>
    </div>
  `;
}

export { renderPhase1Form, renderPhase2Form, renderPhase3Form };
