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
            Get adversarial feedback from Gemini
          </p>
        </div>
        <button id="back-to-phase1-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          ← Back
        </button>
      </div>

      <!-- Phase 1 ADR Preview -->
      <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phase 1 ADR (from Claude)</h3>
        <div class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-32 overflow-y-auto font-mono">
          ${escapeHtml((project.phase1Response || 'No Phase 1 response yet').substring(0, 500))}${project.phase1Response && project.phase1Response.length > 500 ? '...' : ''}
        </div>
      </div>

      <!-- Step 1: Generate Prompt for Gemini -->
      <div class="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step 1: Copy Prompt to Gemini
        </h3>
        <button id="generate-phase2-prompt-btn" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          📋 Copy Prompt to Clipboard
        </button>
        ${project.phase2Prompt ? `
          <div class="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Prompt:</span>
              <button id="view-phase2-prompt-btn" class="text-purple-600 dark:text-purple-400 hover:underline text-sm">
                View Full Prompt
              </button>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              ${escapeHtml(project.phase2Prompt.substring(0, 200))}...
            </p>
          </div>
        ` : ''}
      </div>

      <!-- Step 2: Paste Gemini's Response -->
      <div class="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step 2: Paste Gemini's Response
        </h3>
        <textarea
          id="phase2-response-textarea"
          rows="12"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
          placeholder="Paste Gemini's entire critique here..."
        >${escapeHtml(project.phase2Review || '')}</textarea>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          💡 Paste Gemini's entire response here - the critical feedback on your ADR
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex gap-3">
          <button id="save-phase2-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            💾 Save & Continue
          </button>
          <button id="next-phase3-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            → Phase 3
          </button>
        </div>
        <button id="skip-phase2-btn" class="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          Skip
        </button>
      </div>

      <!-- Prompt Modal -->
      <div id="phase2-prompt-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Phase 2 Prompt</h3>
            <button id="close-phase2-modal-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              ✕
            </button>
          </div>
          <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">${escapeHtml(project.phase2Prompt || 'No prompt generated yet')}</pre>
          <div class="mt-4 flex justify-end">
            <button id="copy-phase2-prompt-btn" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              📋 Copy to Clipboard
            </button>
          </div>
        </div>
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
            Synthesize the final ADR with Claude
          </p>
        </div>
        <button id="back-to-phase2-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          ← Back
        </button>
      </div>

      <!-- Summary of Previous Phases -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Phase 1 ADR Preview -->
        <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phase 1: Original ADR</h3>
          <div class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-24 overflow-y-auto font-mono">
            ${escapeHtml((project.phase1Response || 'No Phase 1 response').substring(0, 300))}${project.phase1Response && project.phase1Response.length > 300 ? '...' : ''}
          </div>
        </div>

        <!-- Phase 2 Review Preview -->
        <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">Phase 2: Gemini's Critique</h3>
          <div class="text-sm text-yellow-700 dark:text-yellow-400 whitespace-pre-wrap max-h-24 overflow-y-auto font-mono">
            ${escapeHtml((project.phase2Review || 'No Phase 2 review').substring(0, 300))}${project.phase2Review && project.phase2Review.length > 300 ? '...' : ''}
          </div>
        </div>
      </div>

      <!-- Step 1: Generate Prompt for Claude -->
      <div class="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step 1: Copy Prompt to Claude
        </h3>
        <button id="generate-phase3-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          📋 Copy Prompt to Clipboard
        </button>
        ${project.phase3Prompt ? `
          <div class="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Prompt:</span>
              <button id="view-phase3-prompt-btn" class="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                View Full Prompt
              </button>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              ${escapeHtml(project.phase3Prompt.substring(0, 200))}...
            </p>
          </div>
        ` : ''}
      </div>

      <!-- Step 2: Paste Claude's Final ADR -->
      <div class="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step 2: Paste Claude's Final ADR
        </h3>
        <textarea
          id="phase3-response-textarea"
          rows="16"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
          placeholder="Paste Claude's final synthesized ADR here..."
        >${escapeHtml(project.finalADR || '')}</textarea>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          💡 Paste Claude's entire response here - the final, polished ADR
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex gap-3">
          <button id="save-phase3-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            💾 Save
          </button>
          <button id="export-adr-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            📥 Export ADR
          </button>
        </div>
        <button id="back-to-list-btn" class="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          Back to Projects
        </button>
      </div>

      <!-- Prompt Modal -->
      <div id="phase3-prompt-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Phase 3 Prompt</h3>
            <button id="close-phase3-modal-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              ✕
            </button>
          </div>
          <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">${escapeHtml(project.phase3Prompt || 'No prompt generated yet')}</pre>
          <div class="mt-4 flex justify-end">
            <button id="copy-phase3-prompt-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              📋 Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export { renderPhase1Form, renderPhase2Form, renderPhase3Form };
