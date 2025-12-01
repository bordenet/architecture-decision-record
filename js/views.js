/**
 * Views Module
 * Handles view rendering
 */

import { escapeHtml } from "./ui.js";

function renderPhase1Form(project) {
  return `
    <div class="phase-1-form space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Phase 1: Initial Draft</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Generate ADR draft with Claude's help
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
      </div>

      <!-- Step 1: Generate Prompt -->
      <div class="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step 1: Copy Prompt to Claude
        </h3>
        <button id="generate-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          📋 Copy Prompt to Clipboard
        </button>
        ${project.phase1Prompt ? `
          <div class="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Prompt:</span>
              <button id="view-prompt-btn" class="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                View Full Prompt
              </button>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              ${escapeHtml(project.phase1Prompt.substring(0, 200))}...
            </p>
          </div>
        ` : ""}
      </div>

      <!-- Step 2: Paste Response -->
      <div class="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step 2: Paste Claude's Response
        </h3>
        <textarea
          id="phase1-response-textarea"
          rows="12"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
          placeholder="Paste Claude's entire response here..."
        >${escapeHtml(project.phase1Response || "")}</textarea>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          💡 Paste the entire response from Claude - no need to split it into separate fields
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex gap-3">
          <button id="save-phase1-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            �� Save & Continue
          </button>
          <button id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            → Phase 2
          </button>
        </div>
        <button id="delete-project-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Delete
        </button>
      </div>

      <!-- Prompt Modal (hidden by default) -->
      <div id="prompt-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto m-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">📋 Prompt for Claude</h3>
            <button id="close-modal-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              ✕
            </button>
          </div>
          <pre id="prompt-text" class="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-300 dark:border-gray-600"></pre>
        </div>
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
          <button id="generate-phase2-prompt-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
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
          <button id="generate-phase3-prompt-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            📋 Generate Prompt for Claude
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
