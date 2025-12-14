/**
 * Views Module
 * Handles view rendering for 3-phase ADR workflow
 */

function renderPhase1Form(project) {
  return `
    <div class="phase-1-form space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Phase 1: Create ADR</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Fill in the ADR form following GitHub standard
          </p>
        </div>
        <button id="back-to-list-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          Back
        </button>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <!-- Title -->
        <div>
          <label for="title-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title <span class="text-red-600">*</span>
          </label>
          <input 
            type="text" 
            id="title-input" 
            placeholder="e.g., Use microservices architecture for scalability"
            value="${project.title || ""}"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>

        <!-- Status -->
        <div>
          <label for="status-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status <span class="text-red-600">*</span>
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
            Context <span class="text-red-600">*</span>
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">What circumstances led to this decision?</p>
          <textarea 
            id="context-textarea"
            rows="5"
            placeholder="Include background, constraints, current system state, and why the decision was necessary..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.context || ""}</textarea>
        </div>

        <!-- Decision -->
        <div>
          <label for="decision-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Decision <span class="text-red-600">*</span>
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">What decision have you made? Be specific and actionable.</p>
          <textarea 
            id="decision-textarea"
            rows="5"
            placeholder="Be clear about what is being decided, implementation-focused, and realistic given constraints..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.decision || ""}</textarea>
        </div>

        <!-- Consequences -->
        <div>
          <label for="consequences-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Consequences <span class="text-red-600">*</span>
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">What follows from this decision? Include positive, negative, and impact.</p>
          <textarea 
            id="consequences-textarea"
            rows="5"
            placeholder="Benefits, costs, trade-offs, risks, and effects on the system and team..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.consequences || ""}</textarea>
        </div>

        <!-- Rationale (Optional) -->
        <div>
          <label for="rationale-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rationale <span class="text-gray-500">(Optional)</span>
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Why this decision over alternatives?</p>
          <textarea 
            id="rationale-textarea"
            rows="4"
            placeholder="Comparison with rejected options, technical justification, business alignment, risk mitigation..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.rationale || ""}</textarea>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex gap-3">
          <button id="save-phase1-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            Save
          </button>
          <button id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Next: Phase 2
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
  const hasPrompt = !!project.phase2Prompt;
  const hasResponse = !!(project.phase2Review && project.phase2Review.trim());

  return `
    <div class="phase-2-form space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Phase 2: Review with Claude</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Get adversarial feedback from Claude
          </p>
        </div>
        <button id="back-to-phase1-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          Back
        </button>
      </div>

      <!-- Step A: Copy Prompt -->
      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step A: Copy Prompt to AI
        </h3>
        <div class="flex gap-3 flex-wrap">
          <button id="generate-phase2-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            📋 Copy Prompt to Clipboard
          </button>
          <a
            id="open-ai-phase2-btn"
            href="https://claude.ai"
            target="ai-assistant-tab"
            rel="noopener noreferrer"
            class="px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium ${hasPrompt ? "hover:bg-green-700" : "opacity-50 cursor-not-allowed pointer-events-none"}"
            ${hasPrompt ? "" : "aria-disabled=\"true\""}
          >
            🔗 Open Claude
          </a>
        </div>
        ${project.phase2Prompt ? `
          <div class="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Prompt:</span>
              <div class="flex gap-2">
                <button id="copy-phase2-prompt-quick-btn" class="text-green-600 dark:text-green-400 hover:underline text-sm font-medium">
                  Copy
                </button>
                <button id="view-phase2-prompt-btn" class="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  View Full
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              ${(project.phase2Prompt || "").substring(0, 200)}...
            </p>
          </div>
        ` : ""}
      </div>

      <!-- Step B: Paste Response -->
      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step B: Paste Claude's Response
        </h3>
        <textarea
          id="phase2-response-textarea"
          rows="12"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
          placeholder="Paste Claude's entire critique here..."
          ${!hasPrompt && !hasResponse ? "disabled" : ""}
        >${project.phase2Review || ""}</textarea>
        <div class="mt-3 flex justify-between items-center">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            ${hasResponse ? "✓ Response saved" : "Paste response to complete this phase"}
          </span>
          <button id="save-phase2-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600" ${!hasResponse ? "disabled" : ""}>
            Save Response
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex gap-3">
          <button id="next-phase3-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${hasResponse ? "" : "opacity-50 cursor-not-allowed"}" ${hasResponse ? "" : "disabled"}>
            Next: Phase 3 →
          </button>
        </div>
        <button id="skip-phase2-btn" class="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          Skip to Phase 3
        </button>
      </div>

      <!-- Prompt Modal -->
      <div id="phase2-prompt-modal" class="modal-overlay hidden fixed inset-0 bg-black bg-opacity-50 z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Phase 2 Prompt</h3>
              <button id="close-phase2-modal-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                X
              </button>
            </div>
            <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">${project.phase2Prompt || "No prompt generated yet"}</pre>
            <div class="mt-4 flex justify-end">
              <button id="copy-phase2-prompt-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPhase3Form(project) {
  const hasPrompt = !!project.phase3Prompt;
  const hasResponse = !!(project.finalADR && project.finalADR.trim());

  return `
    <div class="phase-3-form space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Phase 3: Final Synthesis</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Synthesize final ADR with Claude
          </p>
        </div>
        <button id="back-to-phase2-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          Back
        </button>
      </div>

      <!-- Step A: Copy Prompt -->
      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step A: Copy Synthesis Prompt to AI
        </h3>
        <div class="flex gap-3 flex-wrap">
          <button id="generate-phase3-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            📋 Copy Prompt to Clipboard
          </button>
          <a
            id="open-ai-phase3-btn"
            href="https://claude.ai"
            target="ai-assistant-tab"
            rel="noopener noreferrer"
            class="px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium ${hasPrompt ? "hover:bg-green-700" : "opacity-50 cursor-not-allowed pointer-events-none"}"
            ${hasPrompt ? "" : "aria-disabled=\"true\""}
          >
            🔗 Open Claude
          </a>
        </div>
        ${project.phase3Prompt ? `
          <div class="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Prompt:</span>
              <div class="flex gap-2">
                <button id="copy-phase3-prompt-quick-btn" class="text-green-600 dark:text-green-400 hover:underline text-sm font-medium">
                  Copy
                </button>
                <button id="view-phase3-prompt-btn" class="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  View Full
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              ${(project.phase3Prompt || "").substring(0, 200)}...
            </p>
          </div>
        ` : ""}
      </div>

      <!-- Step B: Paste Response -->
      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step B: Paste Claude's Final ADR
        </h3>
        <textarea
          id="phase3-response-textarea"
          rows="16"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
          placeholder="Paste Claude's final synthesized ADR here..."
          ${!hasPrompt && !hasResponse ? "disabled" : ""}
        >${project.finalADR || ""}</textarea>
        <div class="mt-3 flex justify-between items-center">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            ${hasResponse ? "✓ Final ADR saved" : "Paste response to complete your ADR"}
          </span>
          <button id="save-phase3-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600" ${!hasResponse ? "disabled" : ""}>
            Save Response
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex gap-3">
          <button id="export-adr-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${hasResponse ? "" : "opacity-50 cursor-not-allowed"}" ${hasResponse ? "" : "disabled"}>
            ✓ Export as Markdown
          </button>
        </div>
        <button id="back-to-list-btn" class="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          Back to Projects
        </button>
      </div>

      <!-- Prompt Modal -->
      <div id="phase3-prompt-modal" class="modal-overlay hidden fixed inset-0 bg-black bg-opacity-50 z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Phase 3 Prompt</h3>
              <button id="close-phase3-modal-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                X
              </button>
            </div>
            <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">${project.phase3Prompt || "No prompt generated yet"}</pre>
            <div class="mt-4 flex justify-end">
              <button id="copy-phase3-prompt-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export { renderPhase1Form, renderPhase2Form, renderPhase3Form };
